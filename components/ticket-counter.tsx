import { Pressable, StyleSheet, View } from 'react-native';
import { ThemedText } from './themed-text';
import { IconSymbol } from './ui/icon-symbol';

interface TicketCounterProps {
  label: string;
  count: number;
  onIncrement: () => void;
  onDecrement: () => void;
  min?: number;
  max?: number;
}

export function TicketCounter({ label, count, onIncrement, onDecrement, min = 0, max = 10 }: TicketCounterProps) {
  return (
    <View style={styles.container}>
      <Pressable 
        style={[styles.button, count <= min && styles.buttonDisabled]}
        onPress={onDecrement}
        disabled={count <= min}
      >
        <IconSymbol 
          name="minus.circle" 
          size={40} 
          color={count <= min ? '#3A3A3C' : '#FFFFFF'} 
        />
      </Pressable>
      
      <View style={styles.countContainer}>
        <ThemedText style={styles.count}>{count}</ThemedText>
        <ThemedText style={styles.label}>{label}</ThemedText>
      </View>
      
      <Pressable 
        style={[styles.button, count >= max && styles.buttonDisabled]}
        onPress={onIncrement}
        disabled={count >= max}
      >
        <IconSymbol 
          name="plus.circle" 
          size={40} 
          color={count >= max ? '#3A3A3C' : '#FFFFFF'} 
        />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
  },
  button: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonDisabled: {
    opacity: 0.3,
  },
  countContainer: {
    alignItems: 'center',
    minWidth: 80,
  },
  count: {
    fontSize: 25,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    textTransform: 'uppercase',
  },
});

