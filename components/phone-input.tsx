import { useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';
import { ThemedText } from './themed-text';
import { IconSymbol } from './ui/icon-symbol';

interface PhoneInputProps {
  value: string;
  onChangeText: (text: string) => void;
  prefix: '07' | '06';
  provider: 'Airtel Money' | 'Moov Money';
}

export function PhoneInput({ value, onChangeText, prefix, provider }: PhoneInputProps) {
  const [isFocused, setIsFocused] = useState(false);
  
  const handleChange = (text: string) => {
    // Supprimer tous les caractères non numériques
    const cleaned = text.replace(/[^0-9]/g, '');
    
    // Si l'utilisateur essaie de changer le préfixe, on le force
    if (cleaned.length > 0 && !cleaned.startsWith(prefix)) {
      onChangeText(prefix);
      return;
    }
    
    // Limiter à 9 chiffres
    if (cleaned.length <= 9) {
      onChangeText(cleaned);
    }
  };

  const isValid = value.length === 9 && value.startsWith(prefix);
  const showError = value.length > 0 && value.length < 9 && !isFocused;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <ThemedText style={styles.label}>
          Numéro de téléphone {provider}
        </ThemedText>
        {isValid && (
          <View style={styles.validBadge}>
            <IconSymbol name="checkmark.circle.fill" size={20} color="#34C759" />
          </View>
        )}
      </View>
      
      <View style={[
        styles.inputContainer,
        isFocused && styles.inputContainerFocused,
        showError && styles.inputContainerError,
      ]}>
        <ThemedText style={styles.prefix}>{prefix}</ThemedText>
        <TextInput
          style={styles.input}
          value={value.substring(2)}
          onChangeText={(text) => handleChange(prefix + text)}
          placeholder="XXXXXXXX"
          placeholderTextColor="#636366"
          keyboardType="phone-pad"
          maxLength={8}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />
      </View>
      
      {showError && (
        <ThemedText style={styles.errorText}>
          Le numéro doit commencer par {prefix} et contenir 9 chiffres
        </ThemedText>
      )}
      
      <ThemedText style={styles.helperText}>
        Format attendu : {prefix}XXXXXXXX
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  validBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2C2C2E',
    borderWidth: 2,
    borderColor: '#3A3A3C',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  inputContainerFocused: {
    borderColor: '#5B7FFF',
  },
  inputContainerError: {
    borderColor: '#FF3B30',
  },
  prefix: {
    fontSize: 18,
    fontWeight: '600',
    color: '#5B7FFF',
    marginRight: 4,
  },
  input: {
    flex: 1,
    fontSize: 18,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  errorText: {
    fontSize: 12,
    color: '#FF3B30',
    marginTop: 4,
  },
  helperText: {
    fontSize: 12,
    color: '#8E8E93',
    marginTop: 4,
  },
});

