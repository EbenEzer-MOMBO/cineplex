/**
 * Page des tickets - Liste des réservations confirmées
 */

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useAuth } from '@/contexts/auth-context';
import { authService } from '@/services/auth';
import { Booking, getBookings } from '@/services/bookingService';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    Image,
    Pressable,
    RefreshControl,
    ScrollView,
    StyleSheet,
    View,
} from 'react-native';

const { width } = Dimensions.get('window');

export default function TicketsScreen() {
  const router = useRouter();
  const { customer } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadTickets();
  }, []);

  const loadTickets = async () => {
    try {
      setLoading(true);
      const token = await authService.getToken();

      if (!token) {
        router.replace('/auth/login');
        return;
      }

      const response = await getBookings(token);
      // Filtrer uniquement les réservations confirmées et payées
      const confirmedBookings = response.data.filter(
        (booking) => booking.status === 'confirmed' && booking.payment_status === 'completed'
      );
      setBookings(confirmedBookings);
    } catch (error: any) {
      console.error('Error loading tickets:', error);
      Alert.alert('Erreur', error.message || 'Impossible de charger les tickets');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadTickets();
    setRefreshing(false);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const formatTime = (timeString: string) => {
    return timeString.substring(0, 5); // HH:MM
  };

  if (loading) {
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
        <ThemedText style={styles.headerTitle}>Mes Tickets</ThemedText>
        <ThemedText style={styles.headerSubtitle}>
          {bookings.length} {bookings.length > 1 ? 'réservations' : 'réservation'}
        </ThemedText>
      </View>

      {/* Tickets List */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#5B7FFF" />}
      >
        {bookings.length === 0 ? (
          <View style={styles.emptyContainer}>
            <IconSymbol name="ticket" size={64} color="#8E8E93" />
            <ThemedText style={styles.emptyText}>Aucun ticket</ThemedText>
            <ThemedText style={styles.emptySubtext}>
              Vos tickets confirmés apparaîtront ici
            </ThemedText>
          </View>
        ) : (
          bookings.map((booking) => (
            <Pressable
              key={booking.id}
              style={styles.ticketCard}
              onPress={() => {
                router.push(`/ticket-details/${booking.id}` as any);
              }}
            >
              {/* Movie Poster */}
              <Image source={{ uri: booking.movie.poster_url }} style={styles.poster} />

              {/* Ticket Info */}
              <View style={styles.ticketInfo}>
                <ThemedText style={styles.movieTitle} numberOfLines={1}>
                  {booking.movie.title}
                </ThemedText>

                <View style={styles.infoRow}>
                  <IconSymbol name="calendar" size={16} color="#8E8E93" />
                  <ThemedText style={styles.infoText}>
                    {formatDate(booking.movie_session.session_date)}
                  </ThemedText>
                </View>

                <View style={styles.infoRow}>
                  <IconSymbol name="clock" size={16} color="#8E8E93" />
                  <ThemedText style={styles.infoText}>
                    {formatTime(booking.movie_session.start_time)}
                  </ThemedText>
                </View>

                <View style={styles.infoRow}>
                  <IconSymbol name="location" size={16} color="#8E8E93" />
                  <ThemedText style={styles.infoText}>{booking.movie_session.hall}</ThemedText>
                </View>

                <View style={styles.ticketBadge}>
                  <IconSymbol name="ticket.fill" size={16} color="#FFFFFF" />
                  <ThemedText style={styles.ticketCount}>
                    {booking.seats.length} {booking.seats.length > 1 ? 'Tickets' : 'Ticket'}
                  </ThemedText>
                </View>
              </View>

              {/* Arrow */}
              <View style={styles.arrowContainer}>
                <IconSymbol name="chevron.right" size={24} color="#8E8E93" />
              </View>
            </Pressable>
          ))
        )}
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
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#8E8E93',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#8E8E93',
    marginTop: 8,
    textAlign: 'center',
  },
  ticketCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(91, 127, 255, 0.3)',
  },
  poster: {
    width: 80,
    height: 120,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  ticketInfo: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'space-between',
  },
  movieTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  infoText: {
    fontSize: 13,
    color: '#8E8E93',
    marginLeft: 6,
  },
  ticketBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#5B7FFF',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginTop: 8,
    gap: 4,
  },
  ticketCount: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  arrowContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingLeft: 8,
  },
});
