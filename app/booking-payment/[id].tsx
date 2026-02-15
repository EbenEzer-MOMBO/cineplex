import { PaymentModal } from '@/components/payment-modal';
import { PaymentOption } from '@/components/payment-option';
import { PhoneInput } from '@/components/phone-input';
import { Stepper } from '@/components/stepper';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useAuth } from '@/contexts/auth-context';
import { moviesApi } from '@/services/api';
import { createBooking, getBookingById } from '@/services/bookingService';
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
  const { id, sessionId, participants, seats: seatIds, bookingId: existingBookingId } = useLocalSearchParams();
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
  const [bookingId, setBookingId] = useState<number | null>(existingBookingId ? Number(existingBookingId) : null);
  const [isProcessing, setIsProcessing] = useState(false); // État pour l'animation du bouton
  
  // États pour les données de réservation (mode retry)
  const [retryParticipantCount, setRetryParticipantCount] = useState<number>(0);
  const [retrySelectedSeatIds, setRetrySelectedSeatIds] = useState<number[]>([]);
  const [retryTotalAmount, setRetryTotalAmount] = useState<number>(0);
  
  // Mode: 'new' pour nouvelle réservation, 'retry' pour reprise de paiement
  const isRetryMode = !!existingBookingId;
  
  // Calcul des valeurs selon le mode
  const participantCount = isRetryMode ? retryParticipantCount : (participants ? parseInt(participants as string) : 0);
  const selectedSeatIds = isRetryMode ? retrySelectedSeatIds : (seatIds ? (seatIds as string).split(',').map(Number) : []);
  const selectedSeats = seats.filter(s => selectedSeatIds.includes(s.id));
  
  const isPhoneValid = phoneNumber.length === 9 && (
    (selectedMethod === 'airtel' && phoneNumber.startsWith('07')) ||
    (selectedMethod === 'moov' && phoneNumber.startsWith('06'))
  );
  
  const canProceed = selectedMethod && isPhoneValid;
  
  const pricePerTicket = session?.price_per_ticket ? parseFloat(session.price_per_ticket.toString()) : 5000;
  const totalAmount = isRetryMode ? retryTotalAmount : (participantCount * pricePerTicket);
  
  // Charger les données
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const { authService } = await import('@/services/auth');
        const token = await authService.getToken();

        if (!token) {
          router.replace('/auth/login');
          return;
        }

        if (isRetryMode && existingBookingId) {
          // Mode reprise : charger les données depuis la réservation existante
          const booking = await getBookingById(token, Number(existingBookingId));
          
          setMovie(booking.movie as any);
          setSession(booking.movie_session as any);
          setSeats(booking.seats as any);
          
          // Remplir les données de réservation
          setRetryParticipantCount(booking.seats.length);
          setRetrySelectedSeatIds(booking.seats.map(seat => seat.id));
          setRetryTotalAmount(booking.total_amount);
          
          // Pré-remplir le numéro de téléphone et la méthode de paiement
          const phone = booking.payment_phone;
          setPhoneNumber(phone);
          
          if (booking.payment_method === 'airtel_money') {
            setSelectedMethod('airtel');
          } else if (booking.payment_method === 'moov_money') {
            setSelectedMethod('moov');
          }
        } else {
          // Mode nouvelle réservation : charger les données normalement
          const movieData = await moviesApi.getMovieById(Number(id));
          setMovie(movieData);
          
          if (sessionId) {
            const sessionData = await getSessionById(Number(sessionId));
            setSession(sessionData.data);
            
            const seatsData = await getSessionSeats(Number(sessionId));
            setSeats(seatsData.data);
          }
        }
      } catch (error) {
        console.error('Error loading data:', error);
        Alert.alert('Erreur', 'Impossible de charger les données');
      } finally {
        setLoading(false);
      }
    };

    if ((id && sessionId) || (isRetryMode && existingBookingId)) {
      loadData();
    }
  }, [id, sessionId, isRetryMode, existingBookingId]);

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

    setIsProcessing(true); // Activer l'animation du bouton

    try {
      // Récupérer le token
      const { authService } = await import('@/services/auth');
      const token = await authService.getToken();
      
      if (!token) {
        setIsProcessing(false);
        Alert.alert('Erreur', 'Vous devez être connecté pour effectuer un paiement');
        return;
      }

      // Convertir le type de paiement
      const paymentMethod = selectedMethod === 'airtel' ? 'airtel_money' : 'moov_money';
      const msisdn = formatPhoneNumber(phoneNumber);

      if (isRetryMode && bookingId) {
        // MODE REPRISE : Uniquement initier le paiement pour une réservation existante
        console.log('Reprise du paiement pour la réservation:', bookingId);

        const response = await initiatePayment(token, {
          booking_id: bookingId,
          payment_method: paymentMethod,
          msisdn: msisdn,
        });

        if (response.success && response.bill_id) {
          // Attendre 5 secondes pour laisser le temps au système de paiement de s'initialiser
          console.log('Attente de 5 secondes avant d\'afficher le modal...');
          await new Promise(resolve => setTimeout(resolve, 5000));
          
          // Désactiver l'animation du bouton
          setIsProcessing(false);
          
          // Afficher le modal en mode "waiting"
          setPaymentStatus('waiting');
          setShowPaymentModal(true);
          
          console.log('Début de la vérification du paiement avec bill_id:', response.bill_id);
          
          // Vérifier le paiement (60 secondes, toutes les 3 secondes)
          const verifyResult = await verifyPaymentWithPolling(token, response.bill_id, 20, 3000);

          console.log('Résultat final de la vérification:', verifyResult);

          if (verifyResult.status === 'completed') {
            // Paiement réussi
            console.log('Paiement réussi, redirection...');
            setPaymentStatus('success');
            handlePaymentSuccess();
          } else {
            // Paiement échoué
            console.log('Paiement échoué:', verifyResult.message);
            setPaymentStatus('error');
            handlePaymentError(verifyResult.message);
          }
        } else {
          setIsProcessing(false);
          Alert.alert('Erreur', response.message || 'Impossible d\'initier le paiement');
        }
      } else {
        // MODE NOUVELLE RÉSERVATION : Créer la réservation (paiement automatique)
        if (!session) return;

        console.log('Création de la réservation:', {
          movie_session_id: session.id,
          seat_ids: selectedSeatIds,
          payment_method: paymentMethod,
          payment_phone: phoneNumber,
        });

        const bookingResponse = await createBooking(token, {
          movie_session_id: session.id,
          seat_ids: selectedSeatIds,
          payment_method: paymentMethod,
          payment_phone: phoneNumber,
        });

        console.log('Réservation créée:', bookingResponse);
        const booking = bookingResponse.data;
        const billId = bookingResponse.payment?.bill_id;
        
        setBookingId(booking.id);

        // Vérifier si le paiement a été initié avec succès
        if (booking.payment_status === 'pending') {
          // Paiement en attente - Attendre 5 secondes puis vérifier le statut
          console.log('Attente de 5 secondes avant d\'afficher le modal...');
          await new Promise(resolve => setTimeout(resolve, 5000));
          
          // Désactiver l'animation du bouton
          setIsProcessing(false);
          
          // Afficher le modal en mode "waiting"
          setPaymentStatus('waiting');
          setShowPaymentModal(true);
          
          if (billId) {
            // Si on a un bill_id, utiliser le polling normal avec bill_id
            console.log('Début de la vérification du paiement avec bill_id:', billId);
            const verifyResult = await verifyPaymentWithPolling(token, billId, 20, 3000);

            console.log('Résultat final de la vérification:', verifyResult);

            if (verifyResult.status === 'completed') {
              console.log('Paiement réussi, redirection...');
              setPaymentStatus('success');
              handlePaymentSuccess();
            } else {
              console.log('Paiement échoué:', verifyResult.message);
              setPaymentStatus('error');
              setShowPaymentModal(false);
              Alert.alert(
                'Paiement en attente',
                'Votre réservation a été créée. Si vous avez validé le paiement, il sera traité sous peu. Sinon, vous pouvez réessayer depuis "Mes réservations".',
                [
                  {
                    text: 'Mes réservations',
                    onPress: () => router.push('/bookings'),
                  },
                  {
                    text: 'OK',
                    style: 'cancel',
                  },
                ]
              );
            }
          } else {
            // Pas de bill_id - Polling en vérifiant le statut de la réservation directement
            console.log('Pas de bill_id - Vérification via le statut de la réservation');
            const maxAttempts = 20;
            const intervalMs = 3000;
            let paymentCompleted = false;

            for (let i = 0; i < maxAttempts; i++) {
              console.log(`Tentative ${i + 1}/${maxAttempts} - Vérification du statut de la réservation...`);
              
              try {
                const updatedBooking = await getBookingById(token, booking.id);
                console.log(`Statut paiement tentative ${i + 1}:`, updatedBooking.payment_status);

                if (updatedBooking.payment_status === 'completed') {
                  console.log('Paiement confirmé!');
                  paymentCompleted = true;
                  break;
                } else if (updatedBooking.payment_status === 'failed') {
                  console.log('Paiement échoué');
                  break;
                }
              } catch (error) {
                console.error(`Erreur lors de la vérification (tentative ${i + 1}):`, error);
              }

              if (i < maxAttempts - 1) {
                console.log(`Attente de ${intervalMs}ms avant la prochaine tentative...`);
                await new Promise(resolve => setTimeout(resolve, intervalMs));
              }
            }

            if (paymentCompleted) {
              setPaymentStatus('success');
              handlePaymentSuccess();
            } else {
              setPaymentStatus('error');
              setShowPaymentModal(false);
              Alert.alert(
                'Paiement en attente',
                'Votre réservation a été créée. Si vous avez validé le paiement, il sera traité sous peu. Sinon, vous pouvez réessayer depuis "Mes réservations".',
                [
                  {
                    text: 'Mes réservations',
                    onPress: () => router.push('/bookings'),
                  },
                  {
                    text: 'OK',
                    style: 'cancel',
                  },
                ]
              );
            }
          }
        } else if (booking.payment_status === 'completed') {
          // Paiement déjà réussi (cas rare)
          setIsProcessing(false);
          setPaymentStatus('success');
          setShowPaymentModal(true);
          handlePaymentSuccess();
        } else {
          // Erreur lors de la création ou paiement échoué immédiatement
          setIsProcessing(false);
          Alert.alert(
            'Erreur de paiement',
            'Votre réservation a été créée mais le paiement n\'a pas pu être initié. Vous pouvez réessayer depuis "Mes réservations".',
            [
              {
                text: 'Mes réservations',
                onPress: () => router.push('/bookings'),
              },
              {
                text: 'OK',
                style: 'cancel',
              },
            ]
          );
        }
      }
    } catch (error: any) {
      console.error('Payment error:', error);
      setIsProcessing(false);
      setPaymentStatus('error');
      setShowPaymentModal(false);
      
      if (isRetryMode) {
        Alert.alert('Erreur', error.message || 'Une erreur est survenue lors du paiement');
      } else {
        Alert.alert(
          'Erreur',
          error.message || 'Une erreur est survenue lors de la réservation',
          [
            {
              text: 'Mes réservations',
              onPress: () => router.push('/bookings'),
            },
            {
              text: 'Réessayer',
              style: 'cancel',
            },
          ]
        );
      }
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
          <ThemedText style={styles.title}>
            {isRetryMode ? 'Finaliser le Paiement' : 'Mode de Paiement'}
          </ThemedText>
          <ThemedText style={styles.subtitle}>
            {isRetryMode
              ? 'Complétez le paiement de votre réservation'
              : 'Sélectionnez votre mode de paiement mobile'}
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
              {selectedSeats.map(s => s.seat_code || `${s.row}${s.number}`).join(', ')}
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
          style={[
            styles.confirmButton, 
            (!canProceed || isProcessing) && styles.confirmButtonDisabled
          ]}
          disabled={!canProceed || isProcessing}
          onPress={handlePayment}
        >
          {isProcessing ? (
            <>
              <ActivityIndicator size="small" color="#FFFFFF" />
              <ThemedText style={styles.confirmButtonText}>
                Traitement en cours...
              </ThemedText>
            </>
          ) : (
            <>
              <ThemedText style={[
                styles.confirmButtonText, 
                !canProceed && styles.confirmButtonTextDisabled
              ]}>
                Confirmer le Paiement
              </ThemedText>
              <IconSymbol 
                name="checkmark.circle" 
                size={24} 
                color={canProceed ? "#FFFFFF" : "#636366"} 
              />
            </>
          )}
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
