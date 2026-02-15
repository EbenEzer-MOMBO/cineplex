import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useAuth } from '@/contexts/auth-context';
import { authService } from '@/services/auth';
import { Favorite, FavoriteStatus, getFavorites, removeFavorite } from '@/services/favoritesService';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_PADDING = 20;
const CARD_GAP = 16;
const CARD_WIDTH = (SCREEN_WIDTH - (CARD_PADDING * 2) - CARD_GAP) / 2;

export default function FavoritesScreen() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<FavoriteStatus>('all');

  // Redirection immédiate si non authentifié
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/auth/login');
    }
  }, [isAuthenticated, isLoading]);

  useEffect(() => {
    // Ne charger que si authentifié ET non en cours de chargement
    if (!isLoading && isAuthenticated) {
      loadFavorites();
    } else if (!isLoading && !isAuthenticated) {
      // Arrêter le chargement si pas authentifié
      setLoading(false);
    }
  }, [isAuthenticated, isLoading, selectedFilter]);

  const loadFavorites = async () => {
    try {
      setLoading(true);
      const token = await authService.getToken();
      if (!token) {
        router.replace('/auth/login');
        return;
      }

      const data = await getFavorites(token, selectedFilter);
      setFavorites(data);
    } catch (error: any) {
      console.error('Erreur chargement favoris:', error);
      Alert.alert('Erreur', error.message || 'Impossible de charger les favoris');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadFavorites();
    setRefreshing(false);
  }, [selectedFilter]);

  const handleRemoveFavorite = (favoriteId: number, movieTitle: string) => {
    Alert.alert(
      'Retirer des favoris',
      `Voulez-vous retirer "${movieTitle}" de vos favoris ?`,
      [
        {
          text: 'Annuler',
          style: 'cancel',
        },
        {
          text: 'Retirer',
          style: 'destructive',
          onPress: async () => {
            try {
              const token = await authService.getToken();
              if (!token) return;

              await removeFavorite(token, favoriteId);
              setFavorites((prev) => prev.filter((fav) => fav.id !== favoriteId));
              Alert.alert('Succès', 'Film retiré des favoris');
            } catch (error: any) {
              Alert.alert('Erreur', error.message || 'Impossible de retirer le favori');
            }
          },
        },
      ]
    );
  };

  const handleMoviePress = (movieId: number) => {
    router.push(`/movie/${movieId}`);
  };

  if (isLoading || loading) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#5B7FFF" />
          <ThemedText style={styles.loadingText}>Chargement...</ThemedText>
        </View>
      </ThemedView>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#5B7FFF" />
        }
      >
        <ThemedView style={styles.header}>
          <ThemedText type="title" style={styles.title}>Mes Favoris</ThemedText>
          <ThemedText style={styles.subtitle}>
            {favorites.length} film{favorites.length > 1 ? 's' : ''}
          </ThemedText>
        </ThemedView>

        {/* Filtres */}
        <View style={styles.filtersContainer}>
          <Pressable
            style={[styles.filterButton, selectedFilter === 'all' && styles.filterButtonActive]}
            onPress={() => setSelectedFilter('all')}
          >
            <ThemedText
              style={[styles.filterText, selectedFilter === 'all' && styles.filterTextActive]}
            >
              Tous
            </ThemedText>
          </Pressable>
          <Pressable
            style={[
              styles.filterButton,
              selectedFilter === 'upcoming' && styles.filterButtonActive,
            ]}
            onPress={() => setSelectedFilter('upcoming')}
          >
            <ThemedText
              style={[
                styles.filterText,
                selectedFilter === 'upcoming' && styles.filterTextActive,
              ]}
            >
              À venir
            </ThemedText>
          </Pressable>
          <Pressable
            style={[styles.filterButton, selectedFilter === 'past' && styles.filterButtonActive]}
            onPress={() => setSelectedFilter('past')}
          >
            <ThemedText
              style={[styles.filterText, selectedFilter === 'past' && styles.filterTextActive]}
            >
              Passés
            </ThemedText>
          </Pressable>
        </View>

        {/* Liste des favoris */}
        <ThemedView style={styles.content}>
          {favorites.length === 0 ? (
            <View style={styles.emptyContainer}>
              <IconSymbol name="heart" size={64} color="#8E8E93" />
              <ThemedText style={styles.emptyTitle}>Aucun favori</ThemedText>
              <ThemedText style={styles.emptyText}>
                {selectedFilter === 'all'
                  ? 'Ajoutez des films à vos favoris pour les retrouver facilement'
                  : selectedFilter === 'upcoming'
                  ? 'Aucun film à venir dans vos favoris'
                  : 'Aucun film passé dans vos favoris'}
              </ThemedText>
            </View>
          ) : (
            <View style={styles.moviesGrid}>
              {favorites.map((favorite, index) => (
                <View 
                  key={favorite.id} 
                  style={[
                    styles.movieCard,
                    index % 2 === 0 && styles.movieCardLeft,
                  ]}
                >
                  <Pressable
                    style={styles.moviePoster}
                    onPress={() => handleMoviePress(favorite.movie.id)}
                  >
                    <Image
                      source={{ uri: favorite.movie.poster_url }}
                      style={styles.posterImage}
                      resizeMode="cover"
                    />
                    {/* Badge de statut */}
                    <View
                      style={[
                        styles.statusBadge,
                        favorite.movie.status === 'now_showing' && styles.statusNowShowing,
                        favorite.movie.status === 'coming_soon' && styles.statusComingSoon,
                      ]}
                    >
                      <ThemedText style={styles.statusText}>
                        {favorite.movie.status === 'now_showing'
                          ? 'À l\'affiche'
                          : favorite.movie.status === 'coming_soon'
                          ? 'Bientôt'
                          : 'Archivé'}
                      </ThemedText>
                    </View>
                    {/* Bouton favori */}
                    <Pressable
                      style={styles.favoriteButton}
                      onPress={() => handleRemoveFavorite(favorite.id, favorite.movie.title)}
                    >
                      <IconSymbol name="heart.fill" size={24} color="#FF3B30" />
                    </Pressable>
                  </Pressable>

                  <View style={styles.movieInfo}>
                    <ThemedText style={styles.movieTitle} numberOfLines={2}>
                      {favorite.movie.title}
                    </ThemedText>
                    <View style={styles.movieMeta}>
                      <View style={styles.ratingContainer}>
                        <IconSymbol name="star.fill" size={14} color="#FFD700" />
                        <ThemedText style={styles.ratingText}>
                          {favorite.movie.imdb_rating.toFixed(1)}
                        </ThemedText>
                      </View>
                      <ThemedText style={styles.durationText}>
                        {favorite.movie.duration} min
                      </ThemedText>
                    </View>
                    <ThemedText style={styles.genreText} numberOfLines={1}>
                      {favorite.movie.genre}
                    </ThemedText>
                    {favorite.movie.sessions && favorite.movie.sessions.length > 0 && (
                      <View style={styles.sessionsInfo}>
                        <IconSymbol name="calendar" size={14} color="#5B7FFF" />
                        <ThemedText style={styles.sessionsText}>
                          {favorite.movie.sessions.length} séance
                          {favorite.movie.sessions.length > 1 ? 's' : ''}
                        </ThemedText>
                      </View>
                    )}
                  </View>
                </View>
              ))}
            </View>
          )}
        </ThemedView>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
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
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 16,
    backgroundColor: 'transparent',
  },
  title: {
    fontSize: 34,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#8E8E93',
  },
  filtersContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 20,
  },
  filterButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#1C1C1E',
    borderWidth: 1,
    borderColor: '#2C2C2E',
  },
  filterButtonActive: {
    backgroundColor: '#5B7FFF',
    borderColor: '#5B7FFF',
  },
  filterText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8E8E93',
  },
  filterTextActive: {
    color: '#FFFFFF',
  },
  content: {
    padding: 20,
    paddingBottom: 100,
    backgroundColor: 'transparent',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    gap: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  emptyText: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  moviesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  movieCard: {
    width: CARD_WIDTH,
    marginBottom: 16,
  },
  movieCardLeft: {
    marginRight: CARD_GAP,
  },
  moviePoster: {
    width: '100%',
    aspectRatio: 2 / 3,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#1C1C1E',
  },
  posterImage: {
    width: '100%',
    height: '100%',
  },
  statusBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  statusNowShowing: {
    backgroundColor: 'rgba(91, 127, 255, 0.9)',
  },
  statusComingSoon: {
    backgroundColor: 'rgba(255, 149, 0, 0.9)',
  },
  statusText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  favoriteButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  movieInfo: {
    marginTop: 8,
    gap: 4,
  },
  movieTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    lineHeight: 18,
  },
  movieMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  durationText: {
    fontSize: 12,
    color: '#8E8E93',
  },
  genreText: {
    fontSize: 12,
    color: '#8E8E93',
  },
  sessionsInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  sessionsText: {
    fontSize: 11,
    color: '#5B7FFF',
    fontWeight: '600',
  },
});
