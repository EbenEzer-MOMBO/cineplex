import { Seat, SeatGrid, SeatStatus } from '@/components/seat-grid';
import { Stepper } from '@/components/stepper';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { TicketCounter } from '@/components/ticket-counter';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

export default function BookingSeatsScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  
  const [adultCount, setAdultCount] = useState(2);
  const [childCount, setChildCount] = useState(0);
  const [seats, setSeats] = useState<Seat[]>([]);
  
  const totalTickets = adultCount + childCount;
  const selectedSeats = seats.filter(s => s.status === 'selected');
  const pricePerTicket = 5000; // 5000f par ticket
  const totalAmount = totalTickets * pricePerTicket;
  
  // Générer les sièges initiaux
  useEffect(() => {
    const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
    const initialSeats: Seat[] = [];
    
    rows.forEach((row) => {
      // Section gauche - 7 sièges
      for (let number = 1; number <= 7; number++) {
        let status: SeatStatus = 'available';
        
        // Quelques sièges occupés
        if ((row === 'B' && [3].includes(number)) ||
            (row === 'D' && number === 2) ||
            (row === 'G' && [3, 4].includes(number))) {
          status = 'occupied';
        }
        
        initialSeats.push({
          id: `${row}L${number}`,
          row,
          number,
          section: 'left',
          status,
        });
      }
      
      // Section centrale - 10 sièges
      for (let number = 1; number <= 10; number++) {
        let status: SeatStatus = 'available';
        
        // Quelques sièges occupés
        if ((row === 'B' && [6, 7].includes(number)) ||
            (row === 'C' && [8, 9].includes(number)) ||
            (row === 'F' && number === 6)) {
          status = 'occupied';
        }
        
        // Quelques sièges sélectionnés au départ
        if (row === 'C' && [3, 4].includes(number)) {
          status = 'selected';
        }
        
        // Sièges VIP (oranges)
        if (row === 'C' && [8, 9].includes(number)) {
          status = 'vip';
        }
        
        initialSeats.push({
          id: `${row}C${number}`,
          row,
          number,
          section: 'center',
          status,
        });
      }
      
      // Section droite - 7 sièges
      for (let number = 1; number <= 7; number++) {
        let status: SeatStatus = 'available';
        
        // Quelques sièges occupés
        if ((row === 'D' && number === 7) ||
            (row === 'G' && [6, 7].includes(number))) {
          status = 'occupied';
        }
        
        initialSeats.push({
          id: `${row}R${number}`,
          row,
          number,
          section: 'right',
          status,
        });
      }
    });
    
    setSeats(initialSeats);
  }, []);

  const handleSeatPress = (seat: Seat) => {
    setSeats(prevSeats =>
      prevSeats.map(s =>
        s.id === seat.id
          ? { ...s, status: s.status === 'selected' ? 'available' : 'selected' }
          : s
      )
    );
  };

  const handleAdultIncrement = () => {
    if (adultCount + childCount < 10) {
      setAdultCount(adultCount + 1);
    }
  };

  const handleAdultDecrement = () => {
    if (adultCount > 0) {
      setAdultCount(adultCount - 1);
    }
  };

  const handleChildIncrement = () => {
    if (adultCount + childCount < 10) {
      setChildCount(childCount + 1);
    }
  };

  const handleChildDecrement = () => {
    if (childCount > 0) {
      setChildCount(childCount - 1);
    }
  };

  const canProceed = selectedSeats.length === totalTickets && totalTickets > 0;

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
          onSeatPress={handleSeatPress}
          maxSeats={totalTickets}
        />

        {/* Détails du ticket */}
        <View style={styles.ticketSection}>
          <View style={styles.sectionHeader}>
            <View style={styles.dot} />
            <ThemedText style={styles.sectionTitle}>Détails du Ticket</ThemedText>
          </View>

          {/* Counters */}
          <View style={styles.countersContainer}>
            <TicketCounter
              label="ADULTE"
              count={adultCount}
              onIncrement={handleAdultIncrement}
              onDecrement={handleAdultDecrement}
              min={0}
              max={10}
            />
            
            <View style={styles.divider} />
            
            <TicketCounter
              label="ENFANT"
              count={childCount}
              onIncrement={handleChildIncrement}
              onDecrement={handleChildDecrement}
              min={0}
              max={10}
            />
          </View>

          {/* Summary */}
          <View style={styles.summaryContainer}>
            <View style={styles.summaryLeft}>
              <ThemedText style={styles.summaryLabel}>
                Film: <ThemedText style={styles.summaryValue}>Kung Fu Panda 4</ThemedText>
              </ThemedText>
              
              <ThemedText style={styles.summaryLabel}>
                Nombre de tickets: <ThemedText style={styles.summaryValue}>{totalTickets} Adulte</ThemedText>
              </ThemedText>
              
              <ThemedText style={styles.summaryLabel}>
                <ThemedText style={styles.summaryHighlight}>( {pricePerTicket}f )</ThemedText>
              </ThemedText>
              
              <ThemedText style={styles.summaryLabel}>
                Séance: <ThemedText style={styles.summaryValue}>20h30 - 22h00</ThemedText>
              </ThemedText>
              
              <ThemedText style={styles.summaryLabel} numberOfLines={2}>
                Numéros de siège: <ThemedText style={styles.summaryValue}>
                  {selectedSeats.map(s => s.id).join(', ') || 'Aucun'}
                </ThemedText>
              </ThemedText>
              
              <ThemedText style={styles.summaryLabel}>
                Produits buffet: <ThemedText style={styles.summaryValue}>Aucun ( 0f )</ThemedText>
              </ThemedText>
              
              <ThemedText style={styles.summaryLabel} numberOfLines={2}>
                Cinéma: <ThemedText style={styles.summaryValue}>Cineplex Millennium</ThemedText>
              </ThemedText>
            </View>

            <View style={styles.verticalDivider}>
              {Array.from({ length: 55 }).map((_, index) => (
                <View key={index} style={styles.dottedLine} />
              ))}
            </View>

            <View style={styles.summaryRight}>
              <ThemedText style={styles.totalLabel}>Montant Total</ThemedText>
              <ThemedText style={styles.totalAmount}>{totalAmount.toLocaleString('fr-FR')}f</ThemedText>
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
            router.push(`/booking-payment/${id}`);
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

