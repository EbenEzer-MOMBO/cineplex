import { useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import { Dimensions, Image, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width - 40;

interface SpotlightMovie {
  id: string;
  movieId?: string;
  title: string;
  image: any;
}

const spotlightMovies: SpotlightMovie[] = [
  {
    id: 'spotlight-1',
    movieId: '1',
    title: 'Kung Fu Panda 4',
    image: { uri: 'https://image.tmdb.org/t/p/original/kDp1vUBnMpe8ak4rjgl3cLELqjU.jpg' },
  },
  {
    id: 'spotlight-2',
    movieId: '2',
    title: 'Dune: Part Two',
    image: { uri: 'https://image.tmdb.org/t/p/original/xOMo8BRK7PfcJv9JCnx7s5hj0PX.jpg' },
  },
  {
    id: 'spotlight-3',
    movieId: '3',
    title: 'Deadpool & Wolverine',
    image: { uri: 'https://image.tmdb.org/t/p/original/yDHYTfA3R0jFYba16jBB1ef8oIt.jpg' },
  },
];

export function Spotlight() {
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);
  const router = useRouter();

  const handleScroll = (event: any) => {
    const scrollPosition = event.nativeEvent.contentOffset.x;
    const index = Math.round(scrollPosition / CARD_WIDTH);
    setActiveIndex(index);
  };

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.dot} />
        <ThemedText style={styles.title}>Spotlight</ThemedText>
      </View>
      
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        decelerationRate="fast"
        snapToInterval={CARD_WIDTH + 20}
        contentContainerStyle={styles.scrollContent}
      >
        {spotlightMovies.map((movie) => (
          <Pressable 
            key={movie.id} 
            style={styles.card}
            onPress={() => router.push(`/movie/${movie.movieId || movie.id}`)}
          >
            <Image source={movie.image} style={styles.image} resizeMode="cover" />
            <View style={styles.titleOverlay}>
              <ThemedText style={styles.movieTitle}>{movie.title}</ThemedText>
            </View>
          </Pressable>
        ))}
      </ScrollView>

      <View style={styles.pagination}>
        {spotlightMovies.map((_, index) => (
          <View
            key={index}
            style={[
              styles.paginationDot,
              index === activeIndex ? styles.paginationDotActive : styles.paginationDotInactive,
            ]}
          />
        ))}
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 30,
    backgroundColor: 'transparent',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 15,
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  scrollContent: {
    paddingHorizontal: 20,
    gap: 20,
  },
  card: {
    width: CARD_WIDTH,
    height: 280,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#2C2C2E',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  titleOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  movieTitle: {
    fontSize: 25,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginTop: 15,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  paginationDotActive: {
    backgroundColor: '#5B7FFF',
    width: 24,
  },
  paginationDotInactive: {
    backgroundColor: '#48484A',
  },
});

