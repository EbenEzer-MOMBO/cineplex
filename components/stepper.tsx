import { StyleSheet, View } from 'react-native';
import { ThemedText } from './themed-text';
import { IconSymbol } from './ui/icon-symbol';

interface StepperProps {
  currentStep: number;
  totalSteps: number;
}

export function Stepper({ currentStep, totalSteps }: StepperProps) {
  return (
    <View style={styles.container}>
      {Array.from({ length: totalSteps }, (_, index) => {
        const stepNumber = index + 1;
        const isActive = stepNumber === currentStep;
        const isCompleted = stepNumber < currentStep;
        
        return (
          <View key={stepNumber} style={styles.stepWrapper}>
            <View
              style={[
                styles.stepCircle,
                isActive && styles.stepCircleActive,
                isCompleted && styles.stepCircleCompleted,
              ]}
            >
              {isCompleted ? (
                <IconSymbol name="checkmark" size={24} color="#FFFFFF" />
              ) : (
                <ThemedText
                  style={[
                    styles.stepText,
                    (isActive || isCompleted) && styles.stepTextActive,
                  ]}
                >
                  {stepNumber}
                </ThemedText>
              )}
            </View>
            {index < totalSteps - 1 && (
              <View
                style={[
                  styles.stepLine,
                  isCompleted && styles.stepLineCompleted,
                ]}
              />
            )}
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  stepWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#3A3A3C',
    borderWidth: 2,
    borderColor: '#48484A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepCircleActive: {
    backgroundColor: '#5B7FFF',
    borderColor: '#5B7FFF',
  },
  stepCircleCompleted: {
    backgroundColor: '#5B7FFF',
    borderColor: '#5B7FFF',
  },
  stepText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#8E8E93',
  },
  stepTextActive: {
    color: '#FFFFFF',
  },
  stepLine: {
    width: 40,
    height: 2,
    backgroundColor: '#48484A',
    marginHorizontal: 8,
  },
  stepLineCompleted: {
    backgroundColor: '#5B7FFF',
  },
});

