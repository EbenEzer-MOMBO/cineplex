/**
 * Page de détails des tickets avec QR codes
 */

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { authService } from '@/services/auth';
import { Booking, getBookingById } from '@/services/bookingService';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    Pressable,
    ScrollView,
    StyleSheet,
    View,
} from 'react-native';
import QRCode from 'react-native-qrcode-svg';

const { width, height } = Dimensions.get('window');

export default function TicketDetailsScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBooking();
  }, [id]);

  const loadBooking = async () => {
    try {
      setLoading(true);
      const token = await authService.getToken();

      if (!token) {
        router.replace('/auth/login');
        return;
      }

      if (!id) {
        Alert.alert('Erreur', 'ID de réservation manquant');
        router.back();
        return;
      }

      const bookingData = await getBookingById(token, Number(id));
      setBooking(bookingData);
    } catch (error: any) {
      console.error('Error loading booking:', error);
      Alert.alert('Erreur', error.message || 'Impossible de charger le ticket');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const formatTime = (timeString: string) => {
    return timeString.substring(0, 5); // HH:MM
  };

  // Calculer la taille des cartes en fonction du nombre de tickets
  const getCardDimensions = (ticketCount: number) => {
    const padding = 40; // padding total (20 de chaque côté)
    const gap = 16; // espace entre les cartes
    
    if (ticketCount === 1) {
      // 1 ticket : carte centrée, plus grande
      const cardWidth = Math.min(width - padding, 350);
      return { width: cardWidth, height: cardWidth * 1.4, columns: 1 };
    } else if (ticketCount === 2) {
      // 2 tickets : 2 colonnes
      const cardWidth = (width - padding - gap) / 2;
      return { width: cardWidth, height: cardWidth * 1.4, columns: 2 };
    } else if (ticketCount <= 4) {
      // 3-4 tickets : 2 colonnes
      const cardWidth = (width - padding - gap) / 2;
      return { width: cardWidth, height: cardWidth * 1.4, columns: 2 };
    } else if (ticketCount <= 6) {
      // 5-6 tickets : 2 colonnes
      const cardWidth = (width - padding - gap) / 2;
      return { width: cardWidth, height: cardWidth * 1.3, columns: 2 };
    } else {
      // 7+ tickets : 3 colonnes
      const cardWidth = (width - padding - gap * 2) / 3;
      return { width: cardWidth, height: cardWidth * 1.4, columns: 3 };
    }
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

  const cardDimensions = getCardDimensions(booking.seats.length);

  return (
    <ThemedView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <IconSymbol name="chevron.left" size={24} color="#FFFFFF" />
        </Pressable>
        <View style={styles.headerTextContainer}>
          <ThemedText style={styles.headerTitle} numberOfLines={1}>
            {booking.movie.title}
          </ThemedText>
          <ThemedText style={styles.headerSubtitle}>
            {booking.seats.length} {booking.seats.length > 1 ? 'Tickets' : 'Ticket'}
          </ThemedText>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Session Info */}
        <View style={styles.sessionCard}>
          <View style={styles.sessionRow}>
            <IconSymbol name="calendar" size={20} color="#5B7FFF" />
            <ThemedText style={styles.sessionText}>
              {formatDate(booking.movie_session.session_date)}
            </ThemedText>
          </View>
          <View style={styles.sessionRow}>
            <IconSymbol name="clock" size={20} color="#5B7FFF" />
            <ThemedText style={styles.sessionText}>
              {formatTime(booking.movie_session.start_time)} - {formatTime(booking.movie_session.end_time)}
            </ThemedText>
          </View>
          <View style={styles.sessionRow}>
            <IconSymbol name="location" size={20} color="#5B7FFF" />
            <ThemedText style={styles.sessionText}>{booking.movie_session.hall}</ThemedText>
          </View>
        </View>

        {/* Tickets Grid */}
        <View
          style={[
            styles.ticketsGrid,
            {
              justifyContent: cardDimensions.columns === 1 ? 'center' : 'flex-start',
            },
          ]}
        >
          {booking.seats.map((seat, index) => {
            const qrData = JSON.stringify({
              booking_number: booking.booking_number,
              seat: `${seat.row}${seat.number}`,
              movie: booking.movie.title,
              date: booking.movie_session.session_date,
              time: booking.movie_session.start_time,
            });

            return (
              <View
                key={seat.id}
                style={[
                  styles.ticketCard,
                  {
                    width: cardDimensions.width,
                    height: cardDimensions.height,
                    marginRight: (index + 1) % cardDimensions.columns === 0 ? 0 : 16,
                  },
                ]}
              >
                {/* QR Code */}
                <View style={styles.qrContainer}>
                  <QRCode
                    value={qrData}
                    size={cardDimensions.width * 0.6}
                    backgroundColor="#FFFFFF"
                    color="#000000"
                  />
                </View>

                {/* Seat Info */}
                <View style={styles.seatInfo}>
                  <ThemedText style={styles.seatLabel}>Siège</ThemedText>
                  <ThemedText style={styles.seatNumber}>
                    {seat.row}{seat.number}
                  </ThemedText>
                </View>

                {/* Section Badge */}
                <View style={styles.sectionBadge}>
                  <ThemedText style={styles.sectionText}>
                    {seat.section === 'vip' ? 'VIP' : 'Standard'}
                  </ThemedText>
                </View>

                {/* Booking Number */}
                <ThemedText style={styles.bookingNumber} numberOfLines={1}>
                  {booking.booking_number}
                </ThemedText>
              </View>
            );
          })}
        </View>

        {/* Instructions */}
        <View style={styles.instructionsCard}>
          <IconSymbol name="info.circle.fill" size={24} color="#5B7FFF" />
          <View style={styles.instructionsText}>
            <ThemedText style={styles.instructionsTitle}>Comment utiliser ?</ThemedText>
            <ThemedText style={styles.instructionsDescription}>
              Présentez ces QR codes à l'entrée de la salle. Un code par personne.
            </ThemedText>
          </View>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    gap: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#8E8E93',
    marginTop: 2,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  sessionCard: {
    backgroundColor: 'rgba(91, 127, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(91, 127, 255, 0.3)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    gap: 12,
  },
  sessionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  sessionText: {
    fontSize: 15,
    color: '#FFFFFF',
    flex: 1,
  },
  ticketsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 24,
  },
  ticketCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#5B7FFF',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  qrContainer: {
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  seatInfo: {
    alignItems: 'center',
    marginTop: 12,
  },
  seatLabel: {
    fontSize: 12,
    color: '#8E8E93',
    fontWeight: '600',
  },
  seatNumber: {
    fontSize: 25,
    fontWeight: 'bold',
    color: '#000000',
    marginTop: 4,
  },
  sectionBadge: {
    backgroundColor: '#5B7FFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginTop: 8,
  },
  sectionText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
    textTransform: 'uppercase',
  },
  bookingNumber: {
    fontSize: 10,
    color: '#8E8E93',
    marginTop: 8,
    fontFamily: 'monospace',
  },
  instructionsCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(91, 127, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(91, 127, 255, 0.3)',
    borderRadius: 16,
    padding: 16,
    gap: 12,
  },
  instructionsText: {
    flex: 1,
  },
  instructionsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  instructionsDescription: {
    fontSize: 14,
    color: '#8E8E93',
    lineHeight: 20,
  },
});
