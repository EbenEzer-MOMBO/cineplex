import { PaymentOption } from '@/components/payment-option';
import { PhoneInput } from '@/components/phone-input';
import { Stepper } from '@/components/stepper';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

type PaymentMethod = 'airtel' | 'moov' | null;

export default function BookingPaymentScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>(null);
  const [phoneNumber, setPhoneNumber] = useState('');
  
  const isPhoneValid = phoneNumber.length === 9 && (
    (selectedMethod === 'airtel' && phoneNumber.startsWith('07')) ||
    (selectedMethod === 'moov' && phoneNumber.startsWith('06'))
  );
  
  const canProceed = selectedMethod && isPhoneValid;

  const handleMethodSelect = (method: PaymentMethod) => {
    setSelectedMethod(method);
    // Réinitialiser le numéro avec le bon préfixe
    if (method === 'airtel') {
      setPhoneNumber('07');
    } else if (method === 'moov') {
      setPhoneNumber('06');
    }
  };

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
      <Stepper currentStep={3} totalSteps={4} />

      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Title */}
        <View style={styles.titleSection}>
          <ThemedText style={styles.title}>Mode de Paiement</ThemedText>
          <ThemedText style={styles.subtitle}>
            Sélectionnez votre mode de paiement mobile
          </ThemedText>
        </View>

        {/* Payment Options */}
        <View style={styles.optionsSection}>
          <PaymentOption
            label="Airtel Money"
            logo={require('@/assets/images/airtel money.png')}
            selected={selectedMethod === 'airtel'}
            onPress={() => handleMethodSelect('airtel')}
          />
          
          <PaymentOption
            label="Moov Money"
            logo={require('@/assets/images/moov_money.png')}
            selected={selectedMethod === 'moov'}
            onPress={() => handleMethodSelect('moov')}
          />
        </View>

        {/* Phone Input */}
        {selectedMethod && (
          <View style={styles.phoneSection}>
            <PhoneInput
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              prefix={selectedMethod === 'airtel' ? '07' : '06'}
              provider={selectedMethod === 'airtel' ? 'Airtel Money' : 'Moov Money'}
            />
          </View>
        )}

        {/* Summary Card */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <ThemedText style={styles.summaryLabel}>Film:</ThemedText>
            <ThemedText style={styles.summaryValue}>Kung Fu Panda 4</ThemedText>
          </View>
          
          <View style={styles.summaryRow}>
            <ThemedText style={styles.summaryLabel}>Séance:</ThemedText>
            <ThemedText style={styles.summaryValue}>20h30 - 22h00</ThemedText>
          </View>
          
          <View style={styles.summaryRow}>
            <ThemedText style={styles.summaryLabel}>Tickets:</ThemedText>
            <ThemedText style={styles.summaryValue}>2 Adulte</ThemedText>
          </View>
          
          <View style={styles.summaryRow}>
            <ThemedText style={styles.summaryLabel}>Sièges:</ThemedText>
            <ThemedText style={styles.summaryValue}>C3, C4</ThemedText>
          </View>
          
          <View style={styles.dividerLine} />
          
          <View style={styles.summaryRow}>
            <ThemedText style={styles.totalLabel}>Total:</ThemedText>
            <ThemedText style={styles.totalValue}>10 000f</ThemedText>
          </View>
        </View>
      </ScrollView>

      {/* Confirm Button */}
      <View style={styles.bottomContainer}>
        <Pressable 
          style={[styles.confirmButton, !canProceed && styles.confirmButtonDisabled]}
          disabled={!canProceed}
          onPress={() => {
            router.push(`/booking-success/${id}`);
          }}
        >
          <ThemedText style={[styles.confirmButtonText, !canProceed && styles.confirmButtonTextDisabled]}>
            Confirmer le Paiement
          </ThemedText>
          <IconSymbol 
            name="checkmark.circle" 
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
    padding: 20,
    paddingBottom: 120,
  },
  titleSection: {
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#8E8E93',
  },
  optionsSection: {
    marginBottom: 20,
  },
  phoneSection: {
    marginBottom: 30,
  },
  summaryCard: {
    backgroundColor: '#2C2C2E',
    borderRadius: 16,
    padding: 20,
    gap: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 14,
    color: '#8E8E93',
  },
  summaryValue: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  dividerLine: {
    height: 1,
    backgroundColor: '#48484A',
    marginVertical: 8,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  totalValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#34C759',
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
  confirmButton: {
    backgroundColor: '#5B7FFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    paddingHorizontal: 24,
    borderRadius: 16,
    gap: 8,
  },
  confirmButtonDisabled: {
    backgroundColor: '#3A3A3C',
  },
  confirmButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  confirmButtonTextDisabled: {
    color: '#636366',
  },
});

