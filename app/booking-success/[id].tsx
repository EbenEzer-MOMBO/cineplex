import { Stepper } from '@/components/stepper';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { authService } from '@/services/auth';
import { Booking, getBookingById } from '@/services/bookingService';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, View } from 'react-native';

export default function BookingSuccessScreen() {
  const { id, bookingId } = useLocalSearchParams();
  const router = useRouter();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadBooking = async () => {
      try {
        setLoading(true);
        const token = await authService.getToken();

        if (!token) {
          router.replace('/auth/login');
          return;
        }

        if (!bookingId) {
          Alert.alert('Erreur', 'ID de réservation manquant');
          router.back();
          return;
        }

        const bookingData = await getBookingById(token, Number(bookingId));
        setBooking(bookingData);
      } catch (error: any) {
        console.error('Error loading booking:', error);
        Alert.alert('Erreur', error.message || 'Impossible de charger la réservation');
      } finally {
        setLoading(false);
      }
    };

    loadBooking();
  }, [bookingId]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const formatTime = (timeString: string) => {
    return timeString.substring(0, 5); // HH:MM
  };

  if (loading || !booking) {
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
      {/* Stepper */}
      <View style={styles.stepperContainer}>
        <Stepper currentStep={4} totalSteps={4} />
      </View>

      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Success Icon */}
        <View style={styles.successIconContainer}>
          <View style={styles.successIconCircle}>
            <IconSymbol name="checkmark.circle.fill" size={120} color="#34C759" />
          </View>
        </View>

        {/* Success Message */}
        <View style={styles.messageContainer}>
          <ThemedText style={styles.title}>Paiement Réussi !</ThemedText>
          <ThemedText style={styles.subtitle}>
            Votre réservation a été confirmée avec succès
          </ThemedText>
        </View>

        {/* Info Card */}
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <IconSymbol name="ticket.fill" size={24} color="#5B7FFF" />
            <View style={styles.infoTextContainer}>
              <ThemedText style={styles.infoTitle}>Tickets Disponibles</ThemedText>
              <ThemedText style={styles.infoDescription}>
                Vos tickets sont maintenant disponibles dans votre bibliothèque
              </ThemedText>
            </View>
          </View>
        </View>

        {/* Booking Details */}
        <View style={styles.detailsCard}>
          <ThemedText style={styles.detailsTitle}>Détails de la Réservation</ThemedText>
          
          <View style={styles.detailRow}>
            <ThemedText style={styles.detailLabel}>Film</ThemedText>
            <ThemedText style={styles.detailValue}>{booking.movie.title}</ThemedText>
          </View>
          
          <View style={styles.detailRow}>
            <ThemedText style={styles.detailLabel}>Date</ThemedText>
            <ThemedText style={styles.detailValue}>
              {formatDate(booking.movie_session.session_date)}
            </ThemedText>
          </View>
          
          <View style={styles.detailRow}>
            <ThemedText style={styles.detailLabel}>Horaire</ThemedText>
            <ThemedText style={styles.detailValue}>
              {formatTime(booking.movie_session.start_time)} - {formatTime(booking.movie_session.end_time)}
            </ThemedText>
          </View>

          <View style={styles.detailRow}>
            <ThemedText style={styles.detailLabel}>Salle</ThemedText>
            <ThemedText style={styles.detailValue}>{booking.movie_session.hall}</ThemedText>
          </View>
          
          <View style={styles.detailRow}>
            <ThemedText style={styles.detailLabel}>Sièges</ThemedText>
            <ThemedText style={styles.detailValue}>
              {booking.seats.map(s => `${s.row}${s.number}`).join(', ')}
            </ThemedText>
          </View>
          
          <View style={styles.detailRow}>
            <ThemedText style={styles.detailLabel}>Tickets</ThemedText>
            <ThemedText style={styles.detailValue}>
              {booking.seats.length} {booking.seats.length > 1 ? 'Tickets' : 'Ticket'}
            </ThemedText>
          </View>

          {booking.buffet_items && booking.buffet_items.length > 0 && (
            <View style={styles.detailRow}>
              <ThemedText style={styles.detailLabel}>Buffet</ThemedText>
              <View style={styles.buffetList}>
                {booking.buffet_items.map((item, index) => (
                  <ThemedText key={index} style={styles.detailValue}>
                    {item.quantity}x {item.name}
                  </ThemedText>
                ))}
              </View>
            </View>
          )}

          <View style={styles.detailRow}>
            <ThemedText style={styles.detailLabel}>Paiement</ThemedText>
            <ThemedText style={styles.detailValue}>{booking.payment_method_label}</ThemedText>
          </View>
          
          <View style={styles.divider} />
          
          <View style={styles.detailRow}>
            <ThemedText style={styles.totalLabel}>Total Payé</ThemedText>
            <ThemedText style={styles.totalValue}>
              {booking.total_amount.toLocaleString('fr-FR')} F
            </ThemedText>
          </View>
        </View>

        {/* Confirmation Number */}
        <View style={styles.confirmationCard}>
          <ThemedText style={styles.confirmationLabel}>Numéro de Confirmation</ThemedText>
          <ThemedText style={styles.confirmationNumber}>{booking.booking_number}</ThemedText>
        </View>
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.buttonsContainer}>
        <Pressable 
          style={styles.primaryButton}
          onPress={() => {
            router.push('/bookings');
          }}
        >
          <IconSymbol name="ticket.fill" size={24} color="#FFFFFF" />
          <ThemedText style={styles.primaryButtonText}>Voir les Tickets</ThemedText>
        </Pressable>

        <Pressable 
          style={styles.secondaryButton}
          onPress={() => {
            router.push('/(tabs)');
          }}
        >
          <IconSymbol name="house.fill" size={24} color="#5B7FFF" />
          <ThemedText style={styles.secondaryButtonText}>Retour à l'Accueil</ThemedText>
        </Pressable>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1C1C1E',
  },
  stepperContainer: {
    paddingTop: 60,
    paddingBottom: 10,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 200,
  },
  successIconContainer: {
    alignItems: 'center',
    marginVertical: 30,
  },
  successIconCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(52, 199, 89, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  messageContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
    lineHeight: 22,
  },
  infoCard: {
    backgroundColor: 'rgba(91, 127, 255, 0.1)',
    borderWidth: 1,
    borderColor: '#5B7FFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  infoTextContainer: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  infoDescription: {
    fontSize: 14,
    color: '#8E8E93',
    lineHeight: 20,
  },
  detailsCard: {
    backgroundColor: '#2C2C2E',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    gap: 12,
  },
  detailsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 14,
    color: '#8E8E93',
  },
  detailValue: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  divider: {
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
    fontSize: 20,
    fontWeight: 'bold',
    color: '#34C759',
  },
  confirmationCard: {
    backgroundColor: '#2C2C2E',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#48484A',
    borderStyle: 'dashed',
  },
  confirmationLabel: {
    fontSize: 12,
    color: '#8E8E93',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  confirmationNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#5B7FFF',
    letterSpacing: 2,
  },
  buttonsContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    paddingBottom: 40,
    backgroundColor: '#1C1C1E',
    gap: 12,
  },
  primaryButton: {
    backgroundColor: '#5B7FFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    paddingHorizontal: 24,
    borderRadius: 16,
    gap: 12,
  },
  primaryButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  secondaryButton: {
    backgroundColor: 'rgba(91, 127, 255, 0.1)',
    borderWidth: 2,
    borderColor: '#5B7FFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 16,
    gap: 12,
  },
  secondaryButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#5B7FFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#8E8E93',
  },
  buffetList: {
    flex: 1,
    alignItems: 'flex-end',
  },
});

