import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { buildApiUrl } from '@/services/config';
import { Session } from '@/services/sessionService';
import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';

interface SessionSelectorModalProps {
  visible: boolean;
  movieId: number;
  onClose: () => void;
  onSelect: (session: Session) => void;
}

export function SessionSelectorModal({ visible, movieId, onClose, onSelect }: SessionSelectorModalProps) {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  useEffect(() => {
    if (visible && movieId) {
      loadSessions();
    }
  }, [visible, movieId]);

  const loadSessions = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(buildApiUrl(`movies/${movieId}/sessions`));
      
      if (!response.ok) {
        throw new Error('Erreur lors du chargement des séances');
      }
      
      const data = await response.json();
      setSessions(data.data || []);
      
      // Sélectionner automatiquement la première date disponible
      if (data.data && data.data.length > 0) {
        // Extraire uniquement la partie date (YYYY-MM-DD)
        const firstDate = data.data[0].session_date.split('T')[0];
        setSelectedDate(firstDate);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  // Grouper les séances par date
  const sessionsByDate = sessions.reduce((acc, session) => {
    // Extraire uniquement la partie date (YYYY-MM-DD) de session_date
    const dateOnly = session.session_date.split('T')[0];
    if (!acc[dateOnly]) {
      acc[dateOnly] = [];
    }
    acc[dateOnly].push(session);
    return acc;
  }, {} as Record<string, Session[]>);

  const dates = Object.keys(sessionsByDate).sort();

  const handleSessionSelect = (session: Session) => {
    onSelect(session);
    onClose();
  };

  const formatDate = (dateString: string): string => {
    try {
      // Extraire uniquement la partie date si c'est un ISO string
      const dateOnly = dateString.includes('T') ? dateString.split('T')[0] : dateString;
      
      const parts = dateOnly.split('-');
      if (parts.length !== 3) {
        return dateString; // Retourner la chaîne originale si le format est invalide
      }
      
      const [year, month, day] = parts.map(Number);
      
      // Créer la date en utilisant les composants pour éviter les problèmes de timezone
      const date = new Date(year, month - 1, day);
      
      // Jours de la semaine en français (abrégés)
      const weekdays = ['dim.', 'lun.', 'mar.', 'mer.', 'jeu.', 'ven.', 'sam.'];
      
      // Mois en français (abrégés)
      const months = ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 
                      'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'];
      
      const weekday = weekdays[date.getDay()];
      const dayNum = day.toString().padStart(2, '0');
      const monthName = months[month - 1];
      
      return `${weekday} ${dayNum} ${monthName}`;
    } catch (error) {
      return dateString;
    }
  };

  const formatTime = (time: string): string => {
    // Si c'est un timestamp ISO complet (ex: "2026-01-19T19:20:00.000000Z")
    if (time.includes('T')) {
      const timePart = time.split('T')[1];
      return timePart.substring(0, 5);
    }
    // Si c'est déjà au format HH:mm:ss
    return time.substring(0, 5);
  };

  const renderSessionItem = (session: Session) => {
    const isAvailable = session.status === 'available' && !session.is_past && session.available_seats > 0;

    return (
      <Pressable
        key={session.id}
        style={[styles.sessionItem, !isAvailable && styles.sessionItemDisabled]}
        onPress={() => isAvailable && handleSessionSelect(session)}
        disabled={!isAvailable}
      >
        <View style={styles.sessionTime}>
          <ThemedText style={styles.timeText}>{formatTime(session.start_time)}</ThemedText>
        </View>
        
        <View style={styles.sessionDetails}>
          <View style={styles.sessionInfo}>
            <IconSymbol name="clock" size={16} color="#8E8E93" />
            <ThemedText style={styles.durationText}>
              {formatTime(session.start_time)} - {formatTime(session.end_time)}
            </ThemedText>
          </View>
          
          <View style={styles.sessionInfo}>
            <IconSymbol name="banknote" size={16} color="#34C759" />
            <ThemedText style={styles.priceText}>
              {parseFloat(session.price_per_ticket.toString()).toLocaleString('fr-FR', { 
                minimumFractionDigits: 0,
                maximumFractionDigits: 0 
              })} F / ticket
            </ThemedText>
          </View>
          
          <View style={styles.sessionInfo}>
            <IconSymbol name="person.2" size={16} color="#5B7FFF" />
            <ThemedText style={styles.seatsText}>{session.available_seats} places</ThemedText>
          </View>
        </View>

        {!isAvailable && (
          <View style={styles.unavailableBadge}>
            <ThemedText style={styles.unavailableText}>
              {session.status === 'full' ? 'Complet' : session.is_past ? 'Passée' : 'Indisponible'}
            </ThemedText>
          </View>
        )}

        {isAvailable && (
          <IconSymbol name="chevron.right" size={20} color="#5B7FFF" />
        )}
      </Pressable>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <ThemedView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <ThemedText style={styles.title}>Sélectionner une Séance</ThemedText>
          <Pressable style={styles.closeButton} onPress={onClose}>
            <IconSymbol name="xmark.circle.fill" size={30} color="#8E8E93" />
          </Pressable>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#5B7FFF" />
            <ThemedText style={styles.loadingText}>Chargement des séances...</ThemedText>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <IconSymbol name="exclamationmark.triangle" size={48} color="#FF3B30" />
            <ThemedText style={styles.errorText}>{error}</ThemedText>
            <Pressable style={styles.retryButton} onPress={loadSessions}>
              <ThemedText style={styles.retryButtonText}>Réessayer</ThemedText>
            </Pressable>
          </View>
        ) : sessions.length === 0 ? (
          <View style={styles.emptyContainer}>
            <IconSymbol name="calendar.badge.exclamationmark" size={48} color="#8E8E93" />
            <ThemedText style={styles.emptyText}>Aucune séance disponible pour ce film</ThemedText>
          </View>
        ) : (
          <>
            {/* Dates Selector */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.datesContainer}
              contentContainerStyle={styles.datesContent}
            >
              {dates.map((date) => {
                const isSelected = date === selectedDate;
                return (
                  <Pressable
                    key={date}
                    style={[styles.dateChip, isSelected && styles.dateChipSelected]}
                    onPress={() => setSelectedDate(date)}
                  >
                    <ThemedText style={[styles.dateText, isSelected && styles.dateTextSelected]}>
                      {formatDate(date)}
                    </ThemedText>
                  </Pressable>
                );
              })}
            </ScrollView>

            {/* Sessions List */}
            <FlatList
              data={selectedDate ? sessionsByDate[selectedDate] : []}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => renderSessionItem(item)}
              contentContainerStyle={styles.sessionsList}
              showsVerticalScrollIndicator={false}
            />
          </>
        )}
      </ThemedView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1C1C1E',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  closeButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    gap: 16,
  },
  errorText: {
    fontSize: 16,
    color: '#FF3B30',
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#5B7FFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 8,
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    gap: 16,
  },
  emptyText: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
  },
  datesContainer: {
    maxHeight: 60,
    marginBottom: 16,
  },
  datesContent: {
    paddingHorizontal: 20,
    gap: 12,
  },
  dateChip: {
    backgroundColor: '#2C2C2E',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'transparent',
    flexShrink: 0,
    minWidth: 140,
  },
  dateChipSelected: {
    backgroundColor: 'rgba(91, 127, 255, 0.2)',
    borderColor: '#5B7FFF',
  },
  dateText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8E8E93',
    textAlign: 'center',
    flexShrink: 0,
  },
  dateTextSelected: {
    color: '#5B7FFF',
  },
  sessionsList: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  sessionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2C2C2E',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    gap: 16,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  sessionItemDisabled: {
    opacity: 0.5,
  },
  sessionTime: {
    backgroundColor: '#5B7FFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    minWidth: 70,
    alignItems: 'center',
  },
  timeText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  sessionDetails: {
    flex: 1,
    gap: 6,
  },
  sessionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  durationText: {
    fontSize: 13,
    color: '#8E8E93',
  },
  priceText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#34C759',
  },
  seatsText: {
    fontSize: 13,
    color: '#5B7FFF',
  },
  unavailableBadge: {
    backgroundColor: '#FF3B30',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  unavailableText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
});
