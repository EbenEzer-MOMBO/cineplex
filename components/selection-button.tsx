import { Pressable, StyleSheet, View } from 'react-native';
import { ThemedText } from './themed-text';
import { IconSymbol } from './ui/icon-symbol';

interface SelectionButtonProps {
  label: string;
  value?: string;
  required?: boolean;
  onPress: () => void;
}

export function SelectionButton({ label, value, required, onPress }: SelectionButtonProps) {
  return (
    <Pressable style={styles.container} onPress={onPress}>
      <View style={styles.content}>
        <ThemedText style={[styles.label, !value && styles.labelPlaceholder]}>
          {value || label}
          {required && <ThemedText style={styles.required}> *</ThemedText>}
        </ThemedText>
      </View>
      <IconSymbol name="chevron.right" size={20} color="#8E8E93" />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(58, 58, 60, 0.3)',
    borderWidth: 2,
    borderColor: '#5B7FFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  content: {
    flex: 1,
  },
  label: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  labelPlaceholder: {
    color: '#5B7FFF',
  },
  required: {
    color: '#5B7FFF',
  },
});

