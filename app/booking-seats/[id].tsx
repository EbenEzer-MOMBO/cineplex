import { SeatGrid } from '@/components/seat-grid';
import { Stepper } from '@/components/stepper';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { TicketCounter } from '@/components/ticket-counter';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { moviesApi } from '@/services/api';
import { getSessionSeats, Seat } from '@/services/seatService';
import { getSessionById, Session } from '@/services/sessionService';
import { Movie } from '@/types/api';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, View } from 'react-native';

export default function BookingSeatsScreen() {
  const { id, sessionId } = useLocalSearchParams();
  const router = useRouter();
  const [movie, setMovie] = useState<Movie | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingSeats, setLoadingSeats] = useState(true);
  
  const [participantCount, setParticipantCount] = useState(1);
  const [seats, setSeats] = useState<Seat[]>([]);
  const [selectedSeatIds, setSelectedSeatIds] = useState<number[]>([]);
  
  const selectedSeats = seats.filter(s => selectedSeatIds.includes(s.id));
  const pricePerTicket = session?.price_per_ticket ? parseFloat(session.price_per_ticket.toString()) : 5000;
  const totalAmount = participantCount * pricePerTicket;
  
  // Charger les données du film et de la séance
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // Charger le film
        const movieData = await moviesApi.getMovieById(Number(id));
        setMovie(movieData);
        
        // Charger la séance si sessionId est fourni
        if (sessionId) {
          const sessionData = await getSessionById(Number(sessionId));
          setSession(sessionData.data);
        }
      } catch (error) {
        console.error('Error loading data:', error);
        Alert.alert('Erreur', 'Impossible de charger les données');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadData();
    }
  }, [id, sessionId]);

  // Charger les sièges depuis l'API
  useEffect(() => {
    const loadSeats = async () => {
      if (!sessionId) return;
      
      try {
        setLoadingSeats(true);
        const response = await getSessionSeats(Number(sessionId));
        setSeats(response.data);
      } catch (error) {
        console.error('Error loading seats:', error);
        Alert.alert('Erreur', 'Impossible de charger les sièges');
      } finally {
        setLoadingSeats(false);
      }
    };

    loadSeats();
  }, [sessionId]);

  const handleSeatPress = (seat: Seat) => {
    // Vérifier si le siège est disponible
    if (!seat.is_available) {
      return;
    }

    const isSelected = selectedSeatIds.includes(seat.id);

    if (isSelected) {
      // Désélectionner le siège
      setSelectedSeatIds(prev => prev.filter(id => id !== seat.id));
    } else {
      // Vérifier si on n'a pas dépassé le nombre de participants
      if (selectedSeatIds.length >= participantCount) {
        Alert.alert(
          'Limite atteinte',
          `Vous ne pouvez sélectionner que ${participantCount} siège(s). Désélectionnez un siège ou augmentez le nombre de participants.`
        );
        return;
      }
      // Sélectionner le siège
      setSelectedSeatIds(prev => [...prev, seat.id]);
    }
  };

  const handleParticipantIncrement = () => {
    if (participantCount < 10) {
      setParticipantCount(participantCount + 1);
    }
  };

  const handleParticipantDecrement = () => {
    if (participantCount > 1) {
      const newCount = participantCount - 1;
      setParticipantCount(newCount);
      
      // Si on a trop de sièges sélectionnés, on enlève les derniers
      if (selectedSeatIds.length > newCount) {
        setSelectedSeatIds(prev => prev.slice(0, newCount));
      }
    }
  };

  const canProceed = selectedSeats.length === participantCount && participantCount > 0;

  if (loading || !movie || loadingSeats) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#5B7FFF" />
          <ThemedText style={styles.loadingText}>
            {loadingSeats ? 'Chargement des sièges...' : 'Chargement...'}
          </ThemedText>
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
      <Stepper currentStep={2} totalSteps={4} />

      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Seat Grid */}
        <SeatGrid 
          seats={seats}
          selectedSeatIds={selectedSeatIds}
          onSeatPress={handleSeatPress}
          maxSeats={participantCount}
        />

        {/* Détails du ticket */}
        <View style={styles.ticketSection}>
          <View style={styles.sectionHeader}>
            <View style={styles.dot} />
            <ThemedText style={styles.sectionTitle}>Détails du Ticket</ThemedText>
          </View>

          {/* Counter */}
          <View style={styles.countersContainer}>
            <TicketCounter
              label="PARTICIPANTS"
              count={participantCount}
              onIncrement={handleParticipantIncrement}
              onDecrement={handleParticipantDecrement}
              min={1}
              max={10}
            />
          </View>

          {/* Summary */}
          <View style={styles.summaryContainer}>
            <View style={styles.summaryLeft}>
              <ThemedText style={styles.summaryLabel}>
                Film: <ThemedText style={styles.summaryValue}>{movie.title}</ThemedText>
              </ThemedText>
              
              <ThemedText style={styles.summaryLabel}>
                Participants: <ThemedText style={styles.summaryValue}>{participantCount}</ThemedText>
              </ThemedText>
              
              <ThemedText style={styles.summaryLabel}>
                <ThemedText style={styles.summaryHighlight}>
                  ( {pricePerTicket.toLocaleString('fr-FR', { 
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0 
                  })} F / ticket )
                </ThemedText>
              </ThemedText>
              
              <ThemedText style={styles.summaryLabel}>
                Séance: <ThemedText style={styles.summaryValue}>
                  {session?.formatted_date ? `${session.formatted_date} à ${session.formatted_time}` : '---'}
                </ThemedText>
              </ThemedText>
              
              <ThemedText style={styles.summaryLabel} numberOfLines={3}>
                Sièges: <ThemedText style={styles.summaryValue}>
                  {selectedSeats.length > 0 
                    ? selectedSeats.map(s => s.seat_code).join(', ')
                    : 'Aucun siège sélectionné'}
                </ThemedText>
              </ThemedText>
              
              <ThemedText style={styles.summaryLabel}>
                Buffet: <ThemedText style={styles.summaryValue}>Aucun ( 0 F )</ThemedText>
              </ThemedText>
            </View>

            <View style={styles.verticalDivider}>
              {Array.from({ length: 45 }).map((_, index) => (
                <View key={index} style={styles.dottedLine} />
              ))}
            </View>

            <View style={styles.summaryRight}>
              <ThemedText style={styles.totalLabel}>Montant Total</ThemedText>
              <ThemedText style={styles.totalAmount}>
                {totalAmount.toLocaleString('fr-FR', { 
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0 
                })} F
              </ThemedText>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Bouton de paiement */}
      <View style={styles.bottomContainer}>
        <Pressable 
          style={[styles.paymentButton, !canProceed && styles.paymentButtonDisabled]}
          disabled={!canProceed}
          onPress={() => {
            if (sessionId) {
              router.push(`/booking-payment/${id}?sessionId=${sessionId}&participants=${participantCount}&seats=${selectedSeatIds.join(',')}`);
            }
          }}
        >
          <ThemedText style={[styles.paymentButtonText, !canProceed && styles.paymentButtonTextDisabled]}>
            Options de Paiement
          </ThemedText>
          <IconSymbol 
            name="chevron.right" 
            size={24} 
            color={canProceed ? "#FFFFFF" : "#636366"} 
          />
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
    paddingBottom: 120,
  },
  ticketSection: {
    padding: 20,
    paddingTop: 30,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 20,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  countersContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 20,
    marginBottom: 20,
  },
  divider: {
    width: 1,
    height: 60,
    backgroundColor: '#48484A',
  },
  summaryContainer: {
    flexDirection: 'row',
    backgroundColor: '#2C2C2E',
    borderRadius: 16,
    padding: 20,
    gap: 20,
  },
  summaryLeft: {
    flex: 1,
    gap: 6,
  },
  summaryLabel: {
    fontSize: 12,
    color: '#8E8E93',
    flexWrap: 'wrap',
  },
  summaryValue: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  summaryHighlight: {
    fontSize: 12,
    color: '#34C759',
    fontWeight: '600',
  },
  verticalDivider: {
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    width: 20,
  },
  dottedLine: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#48484A',
  },
  summaryRight: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 100,
    paddingHorizontal: 5,
  },
  totalLabel: {
    fontSize: 12,
    color: '#8E8E93',
    marginBottom: 8,
    textDecorationLine: 'underline',
    textAlign: 'center',
  },
  totalAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#34C759',
    textAlign: 'center',
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
  paymentButton: {
    backgroundColor: '#5B7FFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    paddingHorizontal: 24,
    borderRadius: 16,
    gap: 8,
  },
  paymentButtonDisabled: {
    backgroundColor: '#3A3A3C',
  },
  paymentButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  paymentButtonTextDisabled: {
    color: '#636366',
  },
});

