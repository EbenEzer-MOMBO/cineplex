import { PaymentModal } from '@/components/payment-modal';
import { PaymentOption } from '@/components/payment-option';
import { PhoneInput } from '@/components/phone-input';
import { Stepper } from '@/components/stepper';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useAuth } from '@/contexts/auth-context';
import { moviesApi } from '@/services/api';
import {
  formatPhoneNumber,
  initiatePayment,
  verifyPaymentWithPolling,
} from '@/services/paymentService';
import { getSessionSeats, Seat } from '@/services/seatService';
import { getSessionById, Session } from '@/services/sessionService';
import { Movie } from '@/types/api';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, View } from 'react-native';

type PaymentMethod = 'airtel' | 'moov' | null;

export default function BookingPaymentScreen() {
  const { id, sessionId, participants, seats: seatIds } = useLocalSearchParams();
  const router = useRouter();
  const { customer } = useAuth();
  
  const [movie, setMovie] = useState<Movie | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [seats, setSeats] = useState<Seat[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>(null);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'initiating' | 'waiting' | 'success' | 'error'>('initiating');
  const [bookingId, setBookingId] = useState<number | null>(null);
  
  const participantCount = participants ? parseInt(participants as string) : 0;
  const selectedSeatIds = seatIds ? (seatIds as string).split(',').map(Number) : [];
  const selectedSeats = seats.filter(s => selectedSeatIds.includes(s.id));
  
  const isPhoneValid = phoneNumber.length === 9 && (
    (selectedMethod === 'airtel' && phoneNumber.startsWith('07')) ||
    (selectedMethod === 'moov' && phoneNumber.startsWith('06'))
  );
  
  const canProceed = selectedMethod && isPhoneValid;
  
  const pricePerTicket = session?.price_per_ticket ? parseFloat(session.price_per_ticket.toString()) : 5000;
  const totalAmount = participantCount * pricePerTicket;
  
  // Charger les données
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // Charger le film
        const movieData = await moviesApi.getMovieById(Number(id));
        setMovie(movieData);
        
        // Charger la séance
        if (sessionId) {
          const sessionData = await getSessionById(Number(sessionId));
          setSession(sessionData.data);
          
          // Charger les sièges
          const seatsData = await getSessionSeats(Number(sessionId));
          setSeats(seatsData.data);
        }
      } catch (error) {
        console.error('Error loading data:', error);
        Alert.alert('Erreur', 'Impossible de charger les données');
      } finally {
        setLoading(false);
      }
    };

    if (id && sessionId) {
      loadData();
    }
  }, [id, sessionId]);

  const handleMethodSelect = (method: PaymentMethod) => {
    setSelectedMethod(method);
    // Réinitialiser le numéro avec le bon préfixe
    if (method === 'airtel') {
      setPhoneNumber('07');
    } else if (method === 'moov') {
      setPhoneNumber('06');
    }
  };

  const handlePayment = async () => {
    if (!canProceed || !customer || !selectedMethod) return;

    // Afficher le modal immédiatement en mode "initiating"
    setPaymentStatus('initiating');
    setShowPaymentModal(true);

    try {
      // Récupérer le token
      const { authService } = await import('@/services/auth');
      const token = await authService.getToken();
      
      if (!token) {
        setShowPaymentModal(false);
        Alert.alert('Erreur', 'Vous devez être connecté pour effectuer un paiement');
        return;
      }

      // TODO: Créer d'abord la réservation via l'API
      // Pour l'instant, on simule un booking_id
      const mockBookingId = 1;
      setBookingId(mockBookingId);

      // Convertir le type de paiement
      const paymentMethod = selectedMethod === 'airtel' ? 'airtel_money' : 'moov_money';
      
      // Le numéro reste au format local (ex: 062648538 ou 074694721)
      const msisdn = formatPhoneNumber(phoneNumber);

      console.log('Paiement:', {
        booking_id: mockBookingId,
        payment_method: paymentMethod,
        msisdn: msisdn,
      });

      // Initier le paiement
      const response = await initiatePayment(token, {
        booking_id: mockBookingId,
        payment_method: paymentMethod,
        msisdn: msisdn,
      });

      if (response.success && response.bill_id) {
        // Passer en mode "waiting" - le modal gère déjà ça automatiquement
        // Commencer la vérification du paiement (60 secondes, toutes les 3 secondes)
        const verifyResult = await verifyPaymentWithPolling(token, response.bill_id, 20, 3000);

        if (verifyResult.status === 'completed') {
          // Paiement réussi
          setPaymentStatus('success');
          handlePaymentSuccess();
        } else {
          // Paiement échoué
          setPaymentStatus('error');
          handlePaymentError(verifyResult.message);
        }
      } else {
        setPaymentStatus('error');
        setShowPaymentModal(false);
        Alert.alert('Erreur', response.message || 'Impossible d\'initier le paiement');
      }
    } catch (error) {
      console.error('Payment error:', error);
      setPaymentStatus('error');
      setShowPaymentModal(false);
      Alert.alert('Erreur', 'Une erreur est survenue lors du paiement');
    }
  };

  const handlePaymentSuccess = () => {
    // Rediriger vers la page de succès
    router.push(`/booking-success/${id}?sessionId=${sessionId}&bookingId=${bookingId}`);
  };

  const handlePaymentError = (errorMessage: string) => {
    setShowPaymentModal(false);
    Alert.alert('Paiement échoué', errorMessage);
  };

  if (loading || !movie || !session) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#5B7FFF" />
          <ThemedText style={styles.loadingText}>Chargement...</ThemedText>
        </View>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <IconSymbol name="chevron.left" size={24} color="#FFFFFF" />
        </Pressable>
      </View>

      {/* Stepper */}
      <Stepper currentStep={3} totalSteps={4} />

      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Title */}
        <View style={styles.titleSection}>
          <ThemedText style={styles.title}>Mode de Paiement</ThemedText>
          <ThemedText style={styles.subtitle}>
            Sélectionnez votre mode de paiement mobile
          </ThemedText>
        </View>

        {/* Payment Options */}
        <View style={styles.optionsSection}>
          <PaymentOption
            label="Airtel Money"
            logo={require('@/assets/images/airtel money.png')}
            selected={selectedMethod === 'airtel'}
            onPress={() => handleMethodSelect('airtel')}
          />
          
          <PaymentOption
            label="Moov Money"
            logo={require('@/assets/images/moov_money.png')}
            selected={selectedMethod === 'moov'}
            onPress={() => handleMethodSelect('moov')}
          />
        </View>

        {/* Phone Input */}
        {selectedMethod && (
          <View style={styles.phoneSection}>
            <PhoneInput
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              prefix={selectedMethod === 'airtel' ? '07' : '06'}
              provider={selectedMethod === 'airtel' ? 'Airtel Money' : 'Moov Money'}
            />
          </View>
        )}

        {/* Summary Card */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <ThemedText style={styles.summaryLabel}>Film:</ThemedText>
            <ThemedText style={styles.summaryValue}>{movie.title}</ThemedText>
          </View>
          
          <View style={styles.summaryRow}>
            <ThemedText style={styles.summaryLabel}>Séance:</ThemedText>
            <ThemedText style={styles.summaryValue}>
              {session.formatted_date} à {session.formatted_time}
            </ThemedText>
          </View>
          
          <View style={styles.summaryRow}>
            <ThemedText style={styles.summaryLabel}>Participants:</ThemedText>
            <ThemedText style={styles.summaryValue}>{participantCount}</ThemedText>
          </View>
          
          <View style={styles.summaryRow}>
            <ThemedText style={styles.summaryLabel}>Sièges:</ThemedText>
            <ThemedText style={styles.summaryValue} numberOfLines={2}>
              {selectedSeats.map(s => s.seat_code).join(', ')}
            </ThemedText>
          </View>
          
          <View style={styles.dividerLine} />
          
          <View style={styles.summaryRow}>
            <ThemedText style={styles.totalLabel}>Total:</ThemedText>
            <ThemedText style={styles.totalValue}>
              {totalAmount.toLocaleString('fr-FR', {
                minimumFractionDigits: 0,
                maximumFractionDigits: 0
              })} F
            </ThemedText>
          </View>
        </View>
      </ScrollView>

      {/* Confirm Button */}
      <View style={styles.bottomContainer}>
        <Pressable 
          style={[styles.confirmButton, !canProceed && styles.confirmButtonDisabled]}
          disabled={!canProceed}
          onPress={handlePayment}
        >
          <ThemedText style={[styles.confirmButtonText, !canProceed && styles.confirmButtonTextDisabled]}>
            Confirmer le Paiement
          </ThemedText>
          <IconSymbol 
            name="checkmark.circle" 
            size={24} 
            color={canProceed ? "#FFFFFF" : "#636366"} 
          />
        </Pressable>
      </View>

      {/* Payment Modal */}
      {selectedMethod && (
        <PaymentModal
          visible={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          paymentMethod={selectedMethod === 'airtel' ? 'airtel_money' : 'moov_money'}
          phoneNumber={phoneNumber}
          amount={totalAmount}
          onSuccess={handlePaymentSuccess}
          onError={handlePaymentError}
          paymentStatus={paymentStatus}
        />
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1C1C1E',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    color: '#8E8E93',
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 120,
  },
  titleSection: {
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#8E8E93',
  },
  optionsSection: {
    marginBottom: 20,
  },
  phoneSection: {
    marginBottom: 30,
  },
  summaryCard: {
    backgroundColor: '#2C2C2E',
    borderRadius: 16,
    padding: 20,
    gap: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 14,
    color: '#8E8E93',
  },
  summaryValue: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '500',
    flex: 1,
    textAlign: 'right',
    marginLeft: 12,
  },
  dividerLine: {
    height: 1,
    backgroundColor: '#48484A',
    marginVertical: 8,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  totalValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#34C759',
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    paddingBottom: 40,
    backgroundColor: '#1C1C1E',
  },
  confirmButton: {
    backgroundColor: '#5B7FFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    paddingHorizontal: 24,
    borderRadius: 16,
    gap: 8,
  },
  confirmButtonDisabled: {
    backgroundColor: '#3A3A3C',
  },
  confirmButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  confirmButtonTextDisabled: {
    color: '#636366',
  },
});
