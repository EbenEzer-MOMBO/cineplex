import { Image, Pressable, StyleSheet, View } from 'react-native';
import { ThemedText } from './themed-text';

interface PaymentOptionProps {
  label: string;
  logo: any;
  selected: boolean;
  onPress: () => void;
}

export function PaymentOption({ label, logo, selected, onPress }: PaymentOptionProps) {
  return (
    <Pressable 
      style={[styles.container, selected && styles.containerSelected]}
      onPress={onPress}
    >
      <View style={styles.content}>
        <Image source={logo} style={styles.logo} resizeMode="contain" />
        <ThemedText style={styles.label}>{label}</ThemedText>
      </View>
      
      <View style={[styles.radio, selected && styles.radioSelected]}>
        {selected && <View style={styles.radioDot} />}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#2C2C2E',
    borderWidth: 2,
    borderColor: '#3A3A3C',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  containerSelected: {
    borderColor: '#5B7FFF',
    backgroundColor: 'rgba(91, 127, 255, 0.1)',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    flex: 1,
  },
  logo: {
    width: 50,
    height: 50,
    borderRadius: 8,
  },
  label: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  radio: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#8E8E93',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioSelected: {
    borderColor: '#5B7FFF',
  },
  radioDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#5B7FFF',
  },
});

