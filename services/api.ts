import { Movie, PaginatedResponse } from '@/types/api';
import { buildApiUrl } from './config';

export const moviesApi = {
  /**
   * Récupère la liste des films
   */
  async getMovies(params?: {
    status?: 'now_showing' | 'coming_soon' | 'archived';
    search?: string;
    sort_by?: string;
    sort_order?: 'asc' | 'desc';
    per_page?: number;
    page?: number;
  }): Promise<PaginatedResponse<Movie>> {
    try {
      const queryParams = new URLSearchParams();
      
      if (params?.status) queryParams.append('status', params.status);
      if (params?.search) queryParams.append('search', params.search);
      if (params?.sort_by) queryParams.append('sort_by', params.sort_by);
      if (params?.sort_order) queryParams.append('sort_order', params.sort_order);
      if (params?.per_page) queryParams.append('per_page', params.per_page.toString());
      if (params?.page) queryParams.append('page', params.page.toString());

      const url = `${buildApiUrl('movies')}${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching movies:', error);
      throw error;
    }
  },

  /**
   * Récupère les films à l'affiche
   */
  async getNowShowingMovies(perPage: number = 10): Promise<Movie[]> {
    try {
      const response = await this.getMovies({
        status: 'now_showing',
        per_page: perPage,
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching now showing movies:', error);
      return [];
    }
  },

  /**
   * Récupère les films à venir
   */
  async getComingSoonMovies(perPage: number = 10): Promise<Movie[]> {
    try {
      const response = await this.getMovies({
        status: 'coming_soon',
        per_page: perPage,
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching coming soon movies:', error);
      return [];
    }
  },

  /**
   * Récupère un film par son ID
   */
  async getMovieById(id: number): Promise<Movie | null> {
    try {
      const response = await fetch(buildApiUrl(`movies/${id}`));
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Error fetching movie:', error);
      return null;
    }
  },
};

