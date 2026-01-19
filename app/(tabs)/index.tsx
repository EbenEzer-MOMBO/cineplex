import { Header } from '@/components/header';
import { MovieSection } from '@/components/movie-section';
import { Spotlight } from '@/components/spotlight';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { moviesApi } from '@/services/api';
import { Movie } from '@/types/api';
import { useEffect, useState } from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';

export default function HomeScreen() {
  const [nowShowingMovies, setNowShowingMovies] = useState<Movie[]>([]);
  const [comingSoonMovies, setComingSoonMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadMovies = async () => {
    try {
      setLoading(true);
      const [nowShowing, comingSoon] = await Promise.all([
        moviesApi.getNowShowingMovies(10),
        moviesApi.getComingSoonMovies(10),
      ]);
      setNowShowingMovies(nowShowing);
      setComingSoonMovies(comingSoon);
    } catch (error) {
      console.error('Error loading movies:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadMovies();
    setRefreshing(false);
  };

  useEffect(() => {
    loadMovies();
  }, []);

  // Transformer les données API pour les composants
  const transformMovies = (movies: Movie[]) => {
    return movies.map((movie) => ({
      id: `${movie.id}`,
      movieId: `${movie.id}`,
      title: movie.title,
      image: { uri: movie.poster_url },
    }));
  };

  if (loading && !refreshing) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#5B7FFF" />
          <ThemedText style={styles.loadingText}>Chargement des films...</ThemedText>
        </View>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#5B7FFF" />
        }
      >
        <Header />
        <Spotlight movies={transformMovies(nowShowingMovies.slice(0, 3))} />
        <MovieSection 
          title="Nouveaux films à la box office" 
          movies={transformMovies(nowShowingMovies)}
          cardWidth={180}
        />
        <MovieSection 
          title="À venir" 
          movies={transformMovies(comingSoonMovies)}
          cardWidth={160}
        />
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1C1C1E',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    color: '#8E8E93',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
});
