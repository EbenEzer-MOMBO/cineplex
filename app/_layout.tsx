import { AuthProvider } from '@/contexts/auth-context';
import { DarkTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { SafeAreaProvider } from 'react-native-safe-area-context';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <ThemeProvider value={DarkTheme}>
          <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
            <Stack.Screen name="auth/signup" options={{ headerShown: false, animation: 'slide_from_right' }} />
            <Stack.Screen name="auth/login" options={{ headerShown: false, animation: 'slide_from_right' }} />
            <Stack.Screen name="auth/otp" options={{ headerShown: false, animation: 'slide_from_right' }} />
            <Stack.Screen name="auth/forgot-password" options={{ headerShown: false, animation: 'slide_from_right' }} />
            <Stack.Screen name="movie/[id]" options={{ headerShown: false, animation: 'slide_from_right' }} />
            <Stack.Screen name="booking/[id]" options={{ headerShown: false, animation: 'slide_from_right' }} />
            <Stack.Screen name="bookings" options={{ headerShown: false, animation: 'slide_from_right' }} />
            <Stack.Screen name="buffet/[id]" options={{ headerShown: false, animation: 'slide_from_right' }} />
            <Stack.Screen name="booking-seats/[id]" options={{ headerShown: false, animation: 'slide_from_right' }} />
            <Stack.Screen name="booking-payment/[id]" options={{ headerShown: false, animation: 'slide_from_right' }} />
            <Stack.Screen name="booking-success/[id]" options={{ headerShown: false, animation: 'slide_from_right' }} />
            <Stack.Screen name="ticket-details/[id]" options={{ headerShown: false, animation: 'slide_from_right' }} />
          </Stack>
          <StatusBar style="light" />
        </ThemeProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
