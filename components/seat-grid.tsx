import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { ThemedText } from './themed-text';

export type SeatStatus = 'available' | 'selected' | 'occupied' | 'vip';

export interface Seat {
  id: string;
  row: string;
  number: number;
  section: 'left' | 'center' | 'right';
  status: SeatStatus;
}

interface SeatGridProps {
  seats: Seat[];
  onSeatPress: (seat: Seat) => void;
  maxSeats?: number;
}

export function SeatGrid({ seats, onSeatPress, maxSeats }: SeatGridProps) {
  const rows = [...new Set(seats.map(seat => seat.row))].sort();

  const getSeatColor = (status: SeatStatus) => {
    switch (status) {
      case 'available':
        return '#8E8E93';
      case 'selected':
        return '#5B7FFF';
      case 'occupied':
        return '#3A3A3C';
      case 'vip':
        return '#FF9500';
      default:
        return '#8E8E93';
    }
  };

  const renderSeat = (row: string, number: number, section: 'left' | 'center' | 'right') => {
    const seat = seats.find(s => s.row === row && s.number === number && s.section === section);
    
    if (!seat) {
      return <View key={`${row}-${section}-${number}`} style={styles.emptySeat} />;
    }

    const isDisabled = seat.status === 'occupied';
    const canSelect = maxSeats ? seats.filter(s => s.status === 'selected').length < maxSeats || seat.status === 'selected' : true;

    return (
      <Pressable
        key={seat.id}
        style={[
          styles.seat,
          { backgroundColor: getSeatColor(seat.status) },
        ]}
        onPress={() => {
          if (!isDisabled && canSelect) {
            onSeatPress(seat);
          }
        }}
        disabled={isDisabled}
      />
    );
  };

  return (
    <View style={styles.container}>
      {/* Scrollable Seats Grid with Screen */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        style={styles.scrollView}
      >
        <View style={styles.fullContent}>
          {/* Screen */}
          <View style={styles.screenContainer}>
            <View style={styles.screen}>
              <ThemedText style={styles.screenText}>Écran</ThemedText>
            </View>
          </View>

          {/* Seats Grid */}
          <View style={styles.seatsContainer}>
            {rows.map((row) => (
              <View key={row} style={styles.row}>
                {/* Left section - 7 seats */}
                <View style={styles.sectionLeft}>
                  {[1, 2, 3, 4, 5, 6, 7].map(number => renderSeat(row, number, 'left'))}
                </View>
                
                {/* Left aisle */}
                <View style={styles.aisle} />
                
                {/* Center section - 10 seats */}
                <View style={styles.sectionCenter}>
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(number => renderSeat(row, number, 'center'))}
                </View>
                
                {/* Right aisle */}
                <View style={styles.aisle} />
                
                {/* Right section - 7 seats */}
                <View style={styles.sectionRight}>
                  {[1, 2, 3, 4, 5, 6, 7].map(number => renderSeat(row, number, 'right'))}
                </View>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Legend */}
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#8E8E93' }]} />
          <ThemedText style={styles.legendText}>Disponible</ThemedText>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#5B7FFF' }]} />
          <ThemedText style={styles.legendText}>Sélectionné</ThemedText>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#FF9500' }]} />
          <ThemedText style={styles.legendText}>VIP</ThemedText>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#3A3A3C' }]} />
          <ThemedText style={styles.legendText}>Occupé</ThemedText>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 20,
  },
  scrollView: {
    maxHeight: 450,
  },
  scrollContent: {
    paddingHorizontal: 20,
  },
  fullContent: {
    alignItems: 'center',
  },
  screenContainer: {
    alignItems: 'center',
    marginBottom: 30,
    width: 600,
  },
  screen: {
    width: '100%',
    height: 60,
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 100,
    borderBottomRightRadius: 100,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 10,
  },
  screenText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#000000',
  },
  seatsContainer: {
    gap: 8,
  },
  row: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  sectionLeft: {
    flexDirection: 'row',
    gap: 8,
  },
  sectionCenter: {
    flexDirection: 'row',
    gap: 8,
  },
  sectionRight: {
    flexDirection: 'row',
    gap: 8,
  },
  aisle: {
    width: 16,
  },
  seat: {
    width: 28,
    height: 28,
    borderRadius: 6,
  },
  emptySeat: {
    width: 28,
    height: 28,
  },
  legend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 16,
    marginTop: 24,
    paddingHorizontal: 20,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  legendDot: {
    width: 16,
    height: 16,
    borderRadius: 4,
  },
  legendText: {
    fontSize: 12,
    color: '#8E8E93',
  },
});

