import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { moviesApi } from '@/services/api';
import { Movie } from '@/types/api';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Image, Pressable, ScrollView, StyleSheet, View } from 'react-native';

interface MenuItem {
  id: string;
  name: string;
  description: string[];
  price: number;
  image: any;
}

const menuItems: MenuItem[] = [
  {
    id: 'large',
    name: 'Large Menu',
    description: ['Large Popcorn', 'Large Coco Cola (400 ml.)'],
    price: 30,
    image: require('@/assets/images/react-logo.png'),
  },
  {
    id: 'medium',
    name: 'Medium Menu',
    description: ['Medium Popcorn', 'Medium Coco Cola (330 ml.)'],
    price: 50,
    image: require('@/assets/images/react-logo.png'),
  },
  {
    id: 'small',
    name: 'Small Menu',
    description: ['Small Popcorn', 'Small Coco Cola (250 ml.)'],
    price: 15,
    image: require('@/assets/images/react-logo.png'),
  },
];

const dualMenus: MenuItem[] = [
  {
    id: 'double',
    name: 'M. Double Menu',
    description: ['Medium Popcorn (x2)', 'Medium Coco Cola (330 ml.) (x2)'],
    price: 30,
    image: require('@/assets/images/react-logo.png'),
  },
];

export default function BuffetScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [movie, setMovie] = useState<Movie | null>(null);
  const [loading, setLoading] = useState(true);
  
  const [quantities, setQuantities] = useState<{ [key: string]: number }>({
    large: 1,
    medium: 0,
    small: 0,
    double: 0,
  });

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

  const handleIncrement = (itemId: string) => {
    setQuantities(prev => ({
      ...prev,
      [itemId]: (prev[itemId] || 0) + 1,
    }));
  };

  const handleDecrement = (itemId: string) => {
    setQuantities(prev => ({
      ...prev,
      [itemId]: Math.max(0, (prev[itemId] || 0) - 1),
    }));
  };

  const totalItems = Object.values(quantities).reduce((sum, qty) => sum + qty, 0);

  if (loading || !movie) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#5B7FFF" />
        </View>
      </ThemedView>
    );
  }

  const renderMenuItem = (item: MenuItem) => {
    const quantity = quantities[item.id] || 0;

    return (
      <View key={item.id} style={styles.menuItem}>
        <Image source={item.image} style={styles.menuImage} resizeMode="contain" />
        
        <View style={styles.menuDetails}>
          <ThemedText style={styles.menuName}>{item.name}</ThemedText>
          {item.description.map((desc, index) => (
            <ThemedText key={index} style={styles.menuDescription}>{desc}</ThemedText>
          ))}
          <View style={styles.priceContainer}>
            <ThemedText style={styles.priceLabel}>Price:</ThemedText>
            <ThemedText style={styles.priceValue}>{item.price}f</ThemedText>
          </View>
        </View>

        <View style={styles.quantityControls}>
          <Pressable 
            style={styles.controlButton}
            onPress={() => handleIncrement(item.id)}
          >
            <IconSymbol name="plus.circle" size={44} color="#FFFFFF" />
          </Pressable>
          
          <ThemedText style={styles.quantityText}>{quantity}</ThemedText>
          
          <Pressable 
            style={styles.controlButton}
            onPress={() => handleDecrement(item.id)}
            disabled={quantity === 0}
          >
            <IconSymbol 
              name="minus.circle" 
              size={44} 
              color={quantity === 0 ? "#3A3A3C" : "#FFFFFF"} 
            />
          </Pressable>
        </View>
      </View>
    );
  };

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
        
        <View style={styles.headerIcon}>
          <IconSymbol name="popcorn.fill" size={32} color="#FFFFFF" />
        </View>
      </View>

      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Regular Menus */}
        {menuItems.map(item => renderMenuItem(item))}

        {/* Dual Menus Section */}
        <View style={styles.dualSection}>
          <View style={styles.sectionHeader}>
            <View style={styles.dot} />
            <ThemedText style={styles.sectionTitle}>Advantageous Dual Menus</ThemedText>
          </View>
          
          {dualMenus.map(item => renderMenuItem(item))}
        </View>
      </ScrollView>

      {/* Add to Cart Button */}
      <View style={styles.bottomContainer}>
        <Pressable 
          style={styles.addButton}
          onPress={() => {
            // Return to booking page with selected items
            router.back();
          }}
        >
          <ThemedText style={styles.addButtonText}>
            Add to Cart {totalItems > 0 && `(${totalItems})`}
          </ThemedText>
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
    paddingBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerIcon: {
    flex: 1,
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 120,
  },
  menuItem: {
    flexDirection: 'row',
    backgroundColor: '#2C2C2E',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#5B7FFF',
    padding: 16,
    marginBottom: 16,
    gap: 16,
    alignItems: 'center',
  },
  menuImage: {
    width: 100,
    height: 100,
    borderRadius: 12,
    backgroundColor: '#3A3A3C',
  },
  menuDetails: {
    flex: 1,
  },
  menuName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  menuDescription: {
    fontSize: 13,
    color: '#8E8E93',
    marginBottom: 2,
  },
  priceContainer: {
    marginTop: 8,
  },
  priceLabel: {
    fontSize: 13,
    color: '#8E8E93',
  },
  priceValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#34C759',
  },
  quantityControls: {
    alignItems: 'center',
    gap: 8,
  },
  controlButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    minWidth: 40,
    textAlign: 'center',
  },
  dualSection: {
    marginTop: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
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
  bottomContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    paddingBottom: 40,
    backgroundColor: '#1C1C1E',
  },
  addButton: {
    backgroundColor: '#5B7FFF',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    paddingHorizontal: 24,
    borderRadius: 16,
  },
  addButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
});

