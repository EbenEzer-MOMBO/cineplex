/**
 * Page d'historique des réservations
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

export default function BookingsScreen() {
  const router = useRouter();
  const { customer } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'past'>('all');

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    try {
      setLoading(true);
      const token = await authService.getToken();

      if (!token) {
        router.replace('/auth/login');
        return;
      }

      const response = await getBookings(token);
      setBookings(response.data);
    } catch (error: any) {
      console.error('Error loading bookings:', error);
      Alert.alert('Erreur', error.message || 'Impossible de charger les réservations');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadBookings();
    setRefreshing(false);
  };

  const getFilteredBookings = () => {
    const now = new Date();
    
    return bookings.filter((booking) => {
      const sessionDate = new Date(booking.movie_session.session_date);
      
      if (filter === 'upcoming') {
        return sessionDate >= now && booking.status !== 'cancelled';
      } else if (filter === 'past') {
        return sessionDate < now || booking.status === 'cancelled';
      }
      return true;
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return '#34C759';
      case 'pending':
        return '#FF9500';
      case 'cancelled':
        return '#FF3B30';
      default:
        return '#8E8E93';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return '#34C759';
      case 'pending':
        return '#FF9500';
      case 'failed':
        return '#FF3B30';
      case 'refunded':
        return '#5B7FFF';
      default:
        return '#8E8E93';
    }
  };

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

  const filteredBookings = getFilteredBookings();

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
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <IconSymbol name="chevron.left" size={24} color="#FFFFFF" />
        </Pressable>
        <ThemedText style={styles.headerTitle}>Mes Réservations</ThemedText>
        <View style={styles.placeholder} />
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        <Pressable
          style={[styles.filterTab, filter === 'all' && styles.filterTabActive]}
          onPress={() => setFilter('all')}
        >
          <ThemedText style={[styles.filterText, filter === 'all' && styles.filterTextActive]}>
            Toutes
          </ThemedText>
        </Pressable>
        <Pressable
          style={[styles.filterTab, filter === 'upcoming' && styles.filterTabActive]}
          onPress={() => setFilter('upcoming')}
        >
          <ThemedText style={[styles.filterText, filter === 'upcoming' && styles.filterTextActive]}>
            À venir
          </ThemedText>
        </Pressable>
        <Pressable
          style={[styles.filterTab, filter === 'past' && styles.filterTabActive]}
          onPress={() => setFilter('past')}
        >
          <ThemedText style={[styles.filterText, filter === 'past' && styles.filterTextActive]}>
            Passées
          </ThemedText>
        </Pressable>
      </View>

      {/* Bookings List */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#5B7FFF" />}
      >
        {filteredBookings.length === 0 ? (
          <View style={styles.emptyContainer}>
            <IconSymbol name="ticket" size={64} color="#8E8E93" />
            <ThemedText style={styles.emptyText}>Aucune réservation</ThemedText>
            <ThemedText style={styles.emptySubtext}>
              {filter === 'all'
                ? 'Vous n\'avez pas encore de réservations'
                : filter === 'upcoming'
                ? 'Aucune réservation à venir'
                : 'Aucune réservation passée'}
            </ThemedText>
          </View>
        ) : (
          filteredBookings.map((booking) => (
            <Pressable
              key={booking.id}
              style={styles.bookingCard}
              onPress={() => {
                // Si le paiement est en attente, permettre de reprendre le paiement
                if (booking.payment_status === 'pending' && booking.status === 'pending') {
                  router.push(
                    `/booking-payment/${booking.movie.id}?sessionId=${booking.movie_session_id}&bookingId=${booking.id}`
                  );
                } else {
                  // TODO: Afficher les détails de la réservation
                  console.log('View booking details:', booking.id);
                }
              }}
            >
              {/* Movie Poster */}
              <Image source={{ uri: booking.movie.poster_url }} style={styles.poster} />

              {/* Booking Info */}
              <View style={styles.bookingInfo}>
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

                <View style={styles.infoRow}>
                  <IconSymbol name="ticket" size={16} color="#8E8E93" />
                  <ThemedText style={styles.infoText}>
                    {booking.seats.length} siège{booking.seats.length > 1 ? 's' : ''}
                  </ThemedText>
                </View>

                <View style={styles.statusContainer}>
                  <View style={[styles.statusBadge, { backgroundColor: getStatusColor(booking.status) }]}>
                    <ThemedText style={styles.statusText}>{booking.status_label}</ThemedText>
                  </View>
                  <View
                    style={[
                      styles.statusBadge,
                      { backgroundColor: getPaymentStatusColor(booking.payment_status) },
                    ]}
                  >
                    <ThemedText style={styles.statusText}>{booking.payment_status_label}</ThemedText>
                  </View>
                </View>
              </View>

              {/* Amount & Action */}
              <View style={styles.amountContainer}>
                <ThemedText style={styles.amount}>{booking.total_amount}</ThemedText>
                <ThemedText style={styles.currency}>XAF</ThemedText>
                {booking.payment_status === 'pending' && booking.status === 'pending' && (
                  <View style={styles.retryBadge}>
                    <IconSymbol name="arrow.clockwise" size={14} color="#FFFFFF" />
                    <ThemedText style={styles.retryText}>Payer</ThemedText>
                  </View>
                )}
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  placeholder: {
    width: 40,
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
    gap: 12,
  },
  filterTab: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    alignItems: 'center',
  },
  filterTabActive: {
    backgroundColor: '#5B7FFF',
  },
  filterText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8E8E93',
  },
  filterTextActive: {
    color: '#FFFFFF',
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
  bookingCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  poster: {
    width: 80,
    height: 120,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  bookingInfo: {
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
  statusContainer: {
    flexDirection: 'row',
    marginTop: 8,
    gap: 6,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  amountContainer: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  amount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  currency: {
    fontSize: 12,
    color: '#8E8E93',
    marginTop: 2,
  },
  retryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#5B7FFF',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    marginTop: 8,
    gap: 4,
  },
  retryText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
