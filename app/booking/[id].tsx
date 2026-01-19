import { SelectionButton } from '@/components/selection-button';
import { SessionSelectorModal } from '@/components/session-selector-modal';
import { Stepper } from '@/components/stepper';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { moviesApi } from '@/services/api';
import { Session } from '@/services/sessionService';
import { Movie } from '@/types/api';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Image, Pressable, ScrollView, StyleSheet, View } from 'react-native';

export default function BookingScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [movie, setMovie] = useState<Movie | null>(null);
  const [loading, setLoading] = useState(true);
  
  const [selectedTheater, setSelectedTheater] = useState<string>('');
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [selectedBuffet, setSelectedBuffet] = useState<string>('');
  const [showSessionModal, setShowSessionModal] = useState(false);
  
  useEffect(() => {
    const loadMovie = async () => {
      try {
        setLoading(true);
        const movieData = await moviesApi.getMovieById(Number(id));
        setMovie(movieData);
      } catch (error) {
        console.error('Error loading movie:', error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadMovie();
    }
  }, [id]);

  const canProceed = selectedSession;

  const handleSessionSelect = (session: Session) => {
    setSelectedSession(session);
  };

  const formatSessionDisplay = (session: Session): string => {
    // Formater l'heure
    const time = session.start_time.includes('T') 
      ? session.start_time.split('T')[1].substring(0, 5)
      : session.start_time.substring(0, 5);
    
    // Formater la date manuellement
    const dateOnly = session.session_date.includes('T') 
      ? session.session_date.split('T')[0] 
      : session.session_date;
    
    const [year, month, day] = dateOnly.split('-').map(Number);
    
    // Mois en français (abrégés)
    const months = ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 
                    'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'];
    
    const dayNum = day.toString().padStart(2, '0');
    const monthName = months[month - 1];
    
    return `${dayNum} ${monthName} à ${time}`;
  };

  if (loading || !movie) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#5B7FFF" />
        </View>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <IconSymbol name="chevron.left" size={24} color="#FFFFFF" />
        </Pressable>
      </View>

      {/* Stepper */}
      <Stepper currentStep={1} totalSteps={4} />

      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Movie Info Card */}
        <View style={styles.movieCard}>
          <Image 
            source={{ uri: movie.poster_url }}
            style={styles.movieImage}
            resizeMode="cover"
          />
          <View style={styles.movieInfo}>
            <ThemedText style={styles.movieTitle}>{movie.title}</ThemedText>
            {movie.studio && <ThemedText style={styles.movieStudio}>{movie.studio}</ThemedText>}
          </View>
          <Pressable style={styles.shuffleButton}>
            <IconSymbol name="arrow.triangle.2.circlepath" size={24} color="#FFFFFF" />
          </Pressable>
        </View>

        {/* Instructions */}
        <ThemedText style={styles.instructions}>
          Vous devez sélectionner les champs obligatoires (*) pour passer à l'étape suivante.
        </ThemedText>

        {/* Selection Buttons */}
        <View style={styles.selections}>
          
          <SelectionButton
            label="Sélectionner une Séance"
            value={selectedSession ? formatSessionDisplay(selectedSession) : ''}
            required
            onPress={() => setShowSessionModal(true)}
          />
          
          <SelectionButton
            label="Consommations"
            value={selectedBuffet}
            onPress={() => {
              router.push(`/buffet/${id}`);
            }}
          />
        </View>
      </ScrollView>

      {/* Session Selector Modal */}
      <SessionSelectorModal
        visible={showSessionModal}
        movieId={parseInt(id as string)}
        onClose={() => setShowSessionModal(false)}
        onSelect={handleSessionSelect}
      />

      {/* Next Button */}
      <View style={styles.bottomContainer}>
        <Pressable 
          style={[styles.nextButton, !canProceed && styles.nextButtonDisabled]}
          disabled={!canProceed}
          onPress={() => {
            if (selectedSession) {
              router.push(`/booking-seats/${id}?sessionId=${selectedSession.id}`);
            }
          }}
        >
          <ThemedText style={[styles.nextButtonText, !canProceed && styles.nextButtonTextDisabled]}>
            Suivant
          </ThemedText>
          <IconSymbol 
            name="chevron.right" 
            size={24} 
            color={canProceed ? "#FFFFFF" : "#636366"} 
          />
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 120,
  },
  movieCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2C2C2E',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    gap: 16,
  },
  movieImage: {
    width: 80,
    height: 120,
    borderRadius: 8,
  },
  movieInfo: {
    flex: 1,
  },
  movieTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  movieStudio: {
    fontSize: 14,
    color: '#8E8E93',
  },
  shuffleButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  instructions: {
    fontSize: 15,
    lineHeight: 22,
    color: '#EBEBF5',
    marginBottom: 24,
  },
  selections: {
    marginBottom: 20,
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    paddingBottom: 40,
    backgroundColor: '#1C1C1E',
  },
  nextButton: {
    backgroundColor: '#5B7FFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    paddingHorizontal: 24,
    borderRadius: 16,
    gap: 8,
  },
  nextButtonDisabled: {
    backgroundColor: '#3A3A3C',
  },
  nextButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  nextButtonTextDisabled: {
    color: '#636366',
  },
});

