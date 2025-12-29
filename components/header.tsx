import { StyleSheet, View } from 'react-native';
import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';

export function Header() {
  return (
    <ThemedView style={styles.container}>
      <View style={styles.avatar}>
        <ThemedText style={styles.avatarText}>👤</ThemedText>
      </View>
      <View style={styles.spacer} />
      <View style={styles.titleContainer}>
        <ThemedText style={styles.title}>CinePlex</ThemedText>
        <ThemedText style={styles.subtitle}>Movies</ThemedText>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: 'transparent',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#5B7FFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 28,
  },
  spacer: {
    flex: 1,
  },
  titleContainer: {
    alignItems: 'flex-end',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    lineHeight: 30,
  },
  subtitle: {
    fontSize: 26,
    fontWeight: 'bold',
    lineHeight: 30,
  },
});

