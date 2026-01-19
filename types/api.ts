// Types pour les données de l'API
export interface Movie {
  id: number;
  title: string;
  studio: string | null;
  synopsis: string;
  poster_url: string;
  backdrop_url: string;
  imdb_rating: number;
  rating: number;
  status: 'now_showing' | 'coming_soon' | 'archived';
  status_label: string;
  created_at: string;
  updated_at: string;
  images: MovieImage[];
  sessions_count: number;
}

export interface MovieImage {
  id: number;
  movie_id: number;
  image_url: string;
  order: number;
  created_at: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  links: {
    first: string;
    last: string;
    prev: string | null;
    next: string | null;
  };
  meta: {
    current_page: number;
    from: number;
    last_page: number;
    path: string;
    per_page: number;
    to: number;
    total: number;
  };
}

