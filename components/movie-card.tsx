import { useRouter } from 'expo-router';
import { Image, Pressable, StyleSheet } from 'react-native';
import { ThemedView } from './themed-view';

interface MovieCardProps {
  id: string;
  title: string;
  image: any;
  width?: number;
}

export function MovieCard({ id, title, image, width = 160 }: MovieCardProps) {
  const router = useRouter();
  
  return (
    <Pressable onPress={() => router.push(`/movie/${id}`)}>
      <ThemedView style={[styles.container, { width }]}>
        <Image source={image} style={[styles.image, { width, height: width * 1.5 }]} resizeMode="cover" />
      </ThemedView>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#2C2C2E',
  },
  image: {
    width: '100%',
  },
});

