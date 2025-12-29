import { ScrollView, StyleSheet, View } from 'react-native';
import { MovieCard } from './movie-card';
import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';

interface Movie {
  id: string;
  movieId?: string;
  title: string;
  image: any;
}

interface MovieSectionProps {
  title: string;
  movies: Movie[];
  cardWidth?: number;
}

export function MovieSection({ title, movies, cardWidth = 160 }: MovieSectionProps) {
  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.dot} />
        <ThemedText style={styles.title}>{title}</ThemedText>
      </View>
      
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {movies.map((movie) => (
          <MovieCard
            key={movie.id}
            id={movie.movieId || movie.id}
            title={movie.title}
            image={movie.image}
            width={cardWidth}
          />
        ))}
      </ScrollView>
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
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  scrollContent: {
    paddingHorizontal: 20,
    gap: 15,
  },
});

