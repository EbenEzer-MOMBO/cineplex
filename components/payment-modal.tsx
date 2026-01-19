import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Image,
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

// Thème pour le modal
const theme = {
  colors: {
    primary: '#007AFF',
    background: '#1C1C1E',
    surface: '#2C2C2E',
    text: '#FFFFFF',
    textSecondary: '#8E8E93',
    border: '#38383A',
    success: '#34C759',
    error: '#FF3B30',
    warning: '#FF9500',
  },
};

interface PaymentModalProps {
  visible: boolean;
  onClose: () => void;
  paymentMethod: 'airtel_money' | 'moov_money';
  phoneNumber: string;
  amount: number;
  onSuccess: () => void;
  onError: (error: string) => void;
  paymentStatus?: 'initiating' | 'waiting' | 'success' | 'error';
}

type PaymentStep = 'initiating' | 'waiting' | 'verifying' | 'success' | 'error';

export function PaymentModal({
  visible,
  onClose,
  paymentMethod,
  phoneNumber,
  amount,
  onSuccess,
  onError,
  paymentStatus,
}: PaymentModalProps) {
  const [step, setStep] = useState<PaymentStep>('initiating');
  const [countdown, setCountdown] = useState(60);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (visible) {
      setStep('initiating');
      setCountdown(60);
      setErrorMessage('');
      
      // Simuler l'initialisation puis passer à l'attente
      setTimeout(() => {
        setStep('waiting');
      }, 1500);
    }
  }, [visible]);

  // Mettre à jour l'étape selon le statut du paiement
  useEffect(() => {
    if (paymentStatus === 'success') {
      setStep('success');
    } else if (paymentStatus === 'error') {
      setStep('error');
    }
  }, [paymentStatus]);

  useEffect(() => {
    if (step === 'waiting' && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (step === 'waiting' && countdown === 0) {
      setStep('error');
      setErrorMessage('Le délai de paiement a expiré. Veuillez réessayer.');
      onError('Timeout');
    }
  }, [step, countdown, onError]);

  const getPaymentMethodLogo = () => {
    if (paymentMethod === 'airtel_money') {
      return require('@/assets/images/airtel money.png');
    }
    return require('@/assets/images/moov_money.png');
  };

  const getPaymentMethodName = () => {
    return paymentMethod === 'airtel_money' ? 'Airtel Money' : 'Moov Money';
  };

  const formatAmount = (value: number) => {
    return value.toLocaleString('fr-FR', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }) + ' F';
  };

  const renderContent = () => {
    switch (step) {
      case 'initiating':
        return (
          <View style={styles.contentContainer}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <Text style={styles.title}>Initialisation du paiement...</Text>
            <Text style={styles.description}>
              Connexion avec {getPaymentMethodName()}
            </Text>
          </View>
        );

      case 'waiting':
        return (
          <View style={styles.contentContainer}>
            <Image
              source={getPaymentMethodLogo()}
              style={styles.logo}
              resizeMode="contain"
            />
            
            <View style={styles.countdownContainer}>
              <Text style={styles.countdownText}>{countdown}s</Text>
            </View>

            <Text style={styles.title}>Vérifiez votre téléphone</Text>
            
            <View style={styles.instructionsContainer}>
              <View style={styles.instructionItem}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>1</Text>
                </View>
                <Text style={styles.instructionText}>
                  Une notification USSD a été envoyée au{'\n'}
                  <Text style={styles.phoneText}>{phoneNumber}</Text>
                </Text>
              </View>

              <View style={styles.instructionItem}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>2</Text>
                </View>
                <Text style={styles.instructionText}>
                  Entrez votre code PIN {getPaymentMethodName()}
                </Text>
              </View>

              <View style={styles.instructionItem}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>3</Text>
                </View>
                <Text style={styles.instructionText}>
                  Confirmez le paiement de{'\n'}
                  <Text style={styles.amountText}>{formatAmount(amount)}</Text>
                </Text>
              </View>
            </View>

            <View style={styles.warningContainer}>
              <Ionicons name="time-outline" size={20} color={theme.colors.warning} />
              <Text style={styles.warningText}>
                Vous avez {countdown} secondes pour confirmer
              </Text>
            </View>

            <ActivityIndicator
              size="small"
              color={theme.colors.primary}
              style={styles.spinner}
            />
            <Text style={styles.verifyingText}>
              Vérification du paiement en cours...
            </Text>
          </View>
        );

      case 'verifying':
        return (
          <View style={styles.contentContainer}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <Text style={styles.title}>Vérification du paiement...</Text>
            <Text style={styles.description}>
              Confirmation de votre transaction
            </Text>
          </View>
        );

      case 'success':
        return (
          <View style={styles.contentContainer}>
            <View style={styles.successIcon}>
              <Ionicons name="checkmark-circle" size={80} color={theme.colors.success} />
            </View>
            <Text style={styles.title}>Paiement confirmé !</Text>
            <Text style={styles.description}>
              Votre réservation a été validée avec succès
            </Text>
            <TouchableOpacity
              style={styles.successButton}
              onPress={() => {
                onSuccess();
                onClose();
              }}
            >
              <Text style={styles.successButtonText}>Voir ma réservation</Text>
            </TouchableOpacity>
          </View>
        );

      case 'error':
        return (
          <View style={styles.contentContainer}>
            <View style={styles.errorIcon}>
              <Ionicons name="close-circle" size={80} color={theme.colors.error} />
            </View>
            <Text style={styles.title}>Paiement échoué</Text>
            <Text style={styles.errorDescription}>{errorMessage}</Text>
            <View style={styles.errorButtons}>
              <TouchableOpacity
                style={styles.retryButton}
                onPress={() => {
                  setStep('initiating');
                  setCountdown(30);
                  setErrorMessage('');
                }}
              >
                <Text style={styles.retryButtonText}>Réessayer</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={onClose}
              >
                <Text style={styles.cancelButtonText}>Annuler</Text>
              </TouchableOpacity>
            </View>
          </View>
        );
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={step === 'success' || step === 'error' ? onClose : undefined}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          {(step === 'success' || step === 'error') && (
            <TouchableOpacity
              style={styles.closeButton}
              onPress={onClose}
            >
              <Ionicons name="close" size={24} color={theme.colors.textSecondary} />
            </TouchableOpacity>
          )}
          {renderContent()}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    backgroundColor: theme.colors.background,
    borderRadius: 20,
    padding: 30,
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
  },
  closeButton: {
    position: 'absolute',
    top: 15,
    right: 15,
    zIndex: 10,
    padding: 5,
  },
  contentContainer: {
    alignItems: 'center',
  },
  logo: {
    width: 120,
    height: 60,
    marginBottom: 20,
  },
  countdownContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: theme.colors.primary + '20',
    borderWidth: 3,
    borderColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  countdownText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 10,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginTop: 5,
  },
  instructionsContainer: {
    width: '100%',
    marginTop: 25,
    marginBottom: 20,
  },
  instructionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  stepNumber: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
    marginTop: 2,
  },
  stepNumberText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  instructionText: {
    flex: 1,
    fontSize: 15,
    color: theme.colors.text,
    lineHeight: 22,
  },
  phoneText: {
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  amountText: {
    fontWeight: 'bold',
    color: theme.colors.primary,
    fontSize: 16,
  },
  warningContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.warning + '20',
    padding: 12,
    borderRadius: 10,
    marginTop: 10,
    marginBottom: 20,
  },
  warningText: {
    fontSize: 14,
    color: theme.colors.warning,
    marginLeft: 8,
    fontWeight: '600',
  },
  spinner: {
    marginTop: 10,
  },
  verifyingText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginTop: 10,
  },
  successIcon: {
    marginBottom: 20,
  },
  successButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 12,
    marginTop: 25,
    width: '100%',
  },
  successButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  errorIcon: {
    marginBottom: 20,
  },
  errorDescription: {
    fontSize: 15,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginTop: 5,
    lineHeight: 22,
  },
  errorButtons: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 25,
    width: '100%',
  },
  retryButton: {
    flex: 1,
    backgroundColor: theme.colors.primary,
    paddingVertical: 15,
    borderRadius: 12,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  cancelButton: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    paddingVertical: 15,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  cancelButtonText: {
    color: theme.colors.text,
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});
