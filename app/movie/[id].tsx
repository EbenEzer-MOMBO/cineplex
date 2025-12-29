import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, View } from 'react-native';

// Données de films avec images TMDB
const moviesData: { [key: string]: any } = {
  '1': {
    id: '1',
    title: 'Kung Fu Panda 4',
    studio: 'DreamWorks Animation',
    rating: 4,
    imdbRating: '8.1',
    posterUrl: 'https://image.tmdb.org/t/p/w500/kDp1vUBnMpe8ak4rjgl3cLELqjU.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/original/kDp1vUBnMpe8ak4rjgl3cLELqjU.jpg',
    synopsis: 'After Po is tapped to become the Spiritual Leader of the Valley of Peace, he needs to find and train a new Dragon Warrior, while a wicked sorceress plans to re-summon all the master villains whom Po has vanquished to the spirit realm...',
    images: [
      'https://image.tmdb.org/t/p/w500/kDp1vUBnMpe8ak4rjgl3cLELqjU.jpg',
      'https://image.tmdb.org/t/p/w500/6B0vrFi5JJiKhKAlUG1QnYQFGsh.jpg',
    ],
  },
  '2': {
    id: '2',
    title: 'Dune: Part Two',
    studio: 'Warner Bros. Pictures',
    rating: 5,
    imdbRating: '8.9',
    posterUrl: 'https://image.tmdb.org/t/p/w500/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/original/xOMo8BRK7PfcJv9JCnx7s5hj0PX.jpg',
    synopsis: 'Follow the mythic journey of Paul Atreides as he unites with Chani and the Fremen while on a path of revenge against the conspirators who destroyed his family.',
    images: [
      'https://image.tmdb.org/t/p/w500/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg',
      'https://image.tmdb.org/t/p/w500/8b8R8l88Qje9dn9OE8PY05Nxl1X.jpg',
    ],
  },
  '3': {
    id: '3',
    title: 'Deadpool & Wolverine',
    studio: 'Marvel Studios',
    rating: 4,
    imdbRating: '8.5',
    posterUrl: 'https://image.tmdb.org/t/p/w500/8cdWjvZQUExUUTzyp4t6EDMubfO.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/original/yDHYTfA3R0jFYba16jBB1ef8oIt.jpg',
    synopsis: 'A listless Wade Wilson toils away in civilian life with his days as the morally flexible mercenary, Deadpool, behind him. But when his homeworld faces an existential threat, Wade must reluctantly suit-up again.',
    images: [
      'https://image.tmdb.org/t/p/w500/8cdWjvZQUExUUTzyp4t6EDMubfO.jpg',
      'https://image.tmdb.org/t/p/w500/9l1eZiJHmhr5jIlthMdJN5WYoff.jpg',
    ],
  },
};

export default function MovieDetailsScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [isFavorite, setIsFavorite] = useState(false);
  
  const movie = moviesData[id as string] || moviesData['1'];

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <IconSymbol
        key={index}
        name="star.fill"
        size={20}
        color={index < rating ? '#FFD700' : '#48484A'}
      />
    ));
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Header avec image backdrop */}
        <View style={styles.headerContainer}>
          <Image 
            source={{ uri: movie.backdropUrl }}
            style={styles.backdropImage}
            resizeMode="cover"
          />
          
          {/* Overlay dégradé pour améliorer la lisibilité */}
          <LinearGradient
            colors={['rgba(0,0,0,0.3)', 'rgba(28,28,30,0.95)']}
            style={styles.headerGradient}
            locations={[0, 0.9]}
          />
          
          {/* Boutons overlay */}
          <View style={styles.headerOverlay}>
            <Pressable 
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <IconSymbol name="chevron.left" size={24} color="#FFFFFF" />
            </Pressable>
            
            <Pressable 
              style={styles.favoriteButton}
              onPress={() => setIsFavorite(!isFavorite)}
            >
              <IconSymbol 
                name={isFavorite ? "heart.fill" : "heart"} 
                size={24} 
                color={isFavorite ? "#FF3B30" : "#FFFFFF"} 
              />
            </Pressable>
          </View>

          {/* Bouton play */}
          <View style={styles.playButtonContainer}>
            <Pressable style={styles.playButton}>
              <IconSymbol name="play.fill" size={32} color="#FFFFFF" />
            </Pressable>
          </View>

          {/* Poster et infos principales par-dessus l'image */}
          <View style={styles.mainInfo}>
            <Image 
              source={{ uri: movie.posterUrl }}
              style={styles.posterImage}
              resizeMode="cover"
            />
            
            <View style={styles.infoContainer}>
              <ThemedText style={styles.title}>{movie.title}</ThemedText>
              <ThemedText style={styles.studio}>{movie.studio}</ThemedText>
              
              <View style={styles.ratingContainer}>
                <View style={styles.starsContainer}>
                  {renderStars(movie.rating)}
                </View>
                <ThemedText style={styles.ratingText}>({movie.rating}/5)</ThemedText>
              </View>

              <View style={styles.imdbContainer}>
                <View style={styles.imdbBadge}>
                  <ThemedText style={styles.imdbText}>IMDb</ThemedText>
                </View>
                <ThemedText style={styles.imdbRating}>{movie.imdbRating}</ThemedText>
              </View>
            </View>
          </View>
        </View>

        {/* Contenu */}
        <View style={styles.content}>
          {/* Movie Subject */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.dot} />
              <ThemedText style={styles.sectionTitle}>Movie Subject</ThemedText>
            </View>
            <ThemedText style={styles.synopsis}>
              {movie.synopsis}{' '}
              <ThemedText style={styles.seeAll}>See All</ThemedText>
            </ThemedText>
          </View>

          {/* Images From the Movie */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.dot} />
              <ThemedText style={styles.sectionTitle}>Images From the Movie</ThemedText>
            </View>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              style={styles.imagesScroll}
            >
              {movie.images.map((imageUrl: string, index: number) => (
                <Image 
                  key={index}
                  source={{ uri: imageUrl }}
                  style={styles.movieImage}
                  resizeMode="cover"
                />
              ))}
            </ScrollView>
          </View>
        </View>
      </ScrollView>

      {/* Overlay dégradé sous le bouton Buy Ticket */}
      <LinearGradient
        colors={['rgba(28,28,30,0)', 'rgba(28,28,30,0.95)', '#1C1C1E']}
        style={styles.bottomGradient}
        locations={[0, 0.5, 1]}
      />

      {/* Bouton Buy Ticket */}
      <View style={styles.bottomContainer}>
        <Pressable 
          style={styles.buyButton}
          onPress={() => router.push(`/booking/${movie.id}`)}
        >
          <ThemedText style={styles.buyButtonText}>Buy Ticket Now</ThemedText>
          <IconSymbol name="chevron.right" size={24} color="#FFFFFF" />
        </Pressable>
      </View>
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
  headerContainer: {
    height: 550,
    position: 'relative',
  },
  backdropImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  headerGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: '100%',
  },
  headerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    paddingTop: 60,
    zIndex: 10,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    backdropFilter: 'blur(10px)',
  },
  favoriteButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    backdropFilter: 'blur(10px)',
  },
  playButtonContainer: {
    position: 'absolute',
    top: '40%',
    left: '50%',
    transform: [{ translateX: -35 }, { translateY: -35 }],
    zIndex: 5,
  },
  playButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(91, 127, 255, 0.8)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  mainInfo: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 16,
    zIndex: 5,
  },
  posterImage: {
    width: 120,
    height: 180,
    borderRadius: 12,
    backgroundColor: '#2C2C2E',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 8,
  },
  infoContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingBottom: 10,
  },
  content: {
    padding: 20,
    paddingBottom: 120,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  studio: {
    fontSize: 16,
    color: '#8E8E93',
    marginBottom: 12,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  starsContainer: {
    flexDirection: 'row',
    gap: 4,
  },
  ratingText: {
    fontSize: 14,
    color: '#8E8E93',
  },
  imdbContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  imdbBadge: {
    backgroundColor: '#F5C518',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  imdbText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#000000',
  },
  imdbRating: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  section: {
    marginBottom: 30,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  synopsis: {
    fontSize: 15,
    lineHeight: 22,
    color: '#EBEBF5',
  },
  seeAll: {
    color: '#5B7FFF',
    fontWeight: '600',
  },
  imagesScroll: {
    marginTop: 8,
  },
  movieImage: {
    width: 280,
    height: 160,
    borderRadius: 12,
    backgroundColor: '#2C2C2E',
    marginRight: 12,
  },
  bottomGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 150,
    zIndex: 1,
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    paddingBottom: 40,
    backgroundColor: 'transparent',
    zIndex: 2,
  },
  buyButton: {
    backgroundColor: '#5B7FFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    paddingHorizontal: 24,
    borderRadius: 16,
    gap: 8,
    shadowColor: '#5B7FFF',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  buyButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
});

