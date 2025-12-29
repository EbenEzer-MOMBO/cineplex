import { Header } from '@/components/header';
import { MovieSection } from '@/components/movie-section';
import { Spotlight } from '@/components/spotlight';
import { ThemedView } from '@/components/themed-view';
import { ScrollView, StyleSheet } from 'react-native';

// Données temporaires avec vraies images de films TMDB
const newMoviesInTheaters = [
  {
    id: '1',
    movieId: '1',
    title: 'Kung Fu Panda 4',
    image: { uri: 'https://image.tmdb.org/t/p/w500/kDp1vUBnMpe8ak4rjgl3cLELqjU.jpg' },
  },
  {
    id: '2',
    movieId: '2',
    title: 'Dune: Part Two',
    image: { uri: 'https://image.tmdb.org/t/p/w500/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg' },
  },
  {
    id: '3',
    movieId: '3',
    title: 'Deadpool & Wolverine',
    image: { uri: 'https://image.tmdb.org/t/p/w500/8cdWjvZQUExUUTzyp4t6EDMubfO.jpg' },
  },
  {
    id: '4',
    movieId: '1',
    title: 'Kung Fu Panda 4',
    image: { uri: 'https://image.tmdb.org/t/p/w500/kDp1vUBnMpe8ak4rjgl3cLELqjU.jpg' },
  },
];

const comingSoonMovies = [
  {
    id: '5',
    movieId: '2',
    title: 'Dune: Part Two',
    image: { uri: 'https://image.tmdb.org/t/p/w500/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg' },
  },
  {
    id: '6',
    movieId: '3',
    title: 'Deadpool & Wolverine',
    image: { uri: 'https://image.tmdb.org/t/p/w500/8cdWjvZQUExUUTzyp4t6EDMubfO.jpg' },
  },
  {
    id: '7',
    movieId: '1',
    title: 'Kung Fu Panda 4',
    image: { uri: 'https://image.tmdb.org/t/p/w500/kDp1vUBnMpe8ak4rjgl3cLELqjU.jpg' },
  },
  {
    id: '8',
    movieId: '2',
    title: 'Dune: Part Two',
    image: { uri: 'https://image.tmdb.org/t/p/w500/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg' },
  },
];

export default function HomeScreen() {
  return (
    <ThemedView style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <Header />
        <Spotlight />
        <MovieSection 
          title="Nouveaux films à la box office" 
          movies={newMoviesInTheaters}
          cardWidth={180}
        />
        <MovieSection 
          title="À venir" 
          movies={comingSoonMovies}
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
});
