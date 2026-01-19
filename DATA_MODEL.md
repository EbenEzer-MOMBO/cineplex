# Modèle de Données - Cineplex

## Schéma MLD (Modèle Logique de Données)

### 1. **USERS** (Administration uniquement)
Table pour les administrateurs et le personnel du cinéma.

```
users
----
id: INTEGER [PK]
email: VARCHAR(255) [UNIQUE, NOT NULL]
password: VARCHAR(255) [NOT NULL]
name: VARCHAR(255) [NOT NULL]
role: ENUM('admin', 'staff') [NOT NULL, DEFAULT 'staff']
created_at: TIMESTAMP [DEFAULT CURRENT_TIMESTAMP]
updated_at: TIMESTAMP
```

---

### 2. **CUSTOMERS** (Clients)
Table pour les clients de l'application mobile.

```
customers
----
id: INTEGER [PK]
email: VARCHAR(255) [UNIQUE, NOT NULL]
password: VARCHAR(255) [NOT NULL]
name: VARCHAR(255) [NOT NULL]
phone: VARCHAR(20)
created_at: TIMESTAMP [DEFAULT CURRENT_TIMESTAMP]
updated_at: TIMESTAMP
```

---

### 3. **MOVIES** (Films)
Table contenant les informations sur les films.

```
movies
----
id: INTEGER [PK]
title: VARCHAR(255) [NOT NULL]
studio: VARCHAR(255)
synopsis: TEXT
poster_url: VARCHAR(500)
backdrop_url: VARCHAR(500)
imdb_rating: DECIMAL(2,1)
rating: INTEGER [1-5]
status: ENUM('now_showing', 'coming_soon', 'archived') [NOT NULL]
created_at: TIMESTAMP [DEFAULT CURRENT_TIMESTAMP]
updated_at: TIMESTAMP
```

---

### 4. **MOVIE_IMAGES** (Images de films)
Table pour stocker les images additionnelles des films.

```
movie_images
----
id: INTEGER [PK]
movie_id: INTEGER [FK -> movies.id] [NOT NULL]
image_url: VARCHAR(500) [NOT NULL]
order: INTEGER [DEFAULT 0]
created_at: TIMESTAMP [DEFAULT CURRENT_TIMESTAMP]
```

---

### 5. **SESSIONS** (Séances)
Table pour les séances de projection.

```
sessions
----
id: INTEGER [PK]
movie_id: INTEGER [FK -> movies.id] [NOT NULL]
session_date: DATE [NOT NULL]
start_time: TIME [NOT NULL]
end_time: TIME [NOT NULL]
price_per_ticket: DECIMAL(10,2) [NOT NULL]
status: ENUM('available', 'full', 'cancelled') [NOT NULL, DEFAULT 'available']
created_at: TIMESTAMP [DEFAULT CURRENT_TIMESTAMP]
updated_at: TIMESTAMP
```

---

### 6. **SEATS** (Sièges)
Table pour gérer les sièges disponibles par séance.

```
seats
----
id: INTEGER [PK]
session_id: INTEGER [FK -> sessions.id] [NOT NULL]
row: VARCHAR(2) [NOT NULL] -- A, B, C, etc.
number: INTEGER [NOT NULL]
section: ENUM('left', 'center', 'right') [NOT NULL]
status: ENUM('available', 'occupied', 'selected', 'vip') [NOT NULL, DEFAULT 'available']
created_at: TIMESTAMP [DEFAULT CURRENT_TIMESTAMP]
updated_at: TIMESTAMP

UNIQUE(session_id, row, number, section)
```

---

### 7. **BUFFET_ITEMS** (Produits Buffet)
Table pour les produits disponibles au buffet.

```
buffet_items
----
id: INTEGER [PK]
name: VARCHAR(255) [NOT NULL]
description: TEXT
type: ENUM('single', 'menu', 'dual_menu') [NOT NULL]
price: DECIMAL(10,2) [NOT NULL]
image_url: VARCHAR(500)
is_available: BOOLEAN [DEFAULT TRUE]
created_at: TIMESTAMP [DEFAULT CURRENT_TIMESTAMP]
updated_at: TIMESTAMP
```

---

### 8. **BUFFET_ITEM_COMPONENTS** (Composants des menus buffet)
Table pour décrire les composants d'un menu (ex: Large Popcorn, Large Coco Cola).

```
buffet_item_components
----
id: INTEGER [PK]
buffet_item_id: INTEGER [FK -> buffet_items.id] [NOT NULL]
component_name: VARCHAR(255) [NOT NULL]
quantity: INTEGER [DEFAULT 1]
```

---

### 9. **BOOKINGS** (Réservations)
Table principale pour les réservations.

```
bookings
----
id: INTEGER [PK]
customer_id: INTEGER [FK -> customers.id] [NOT NULL]
movie_id: INTEGER [FK -> movies.id] [NOT NULL]
session_id: INTEGER [FK -> sessions.id] [NOT NULL]
booking_number: VARCHAR(50) [UNIQUE, NOT NULL] -- Format: CPX-12345678
adult_count: INTEGER [DEFAULT 0]
child_count: INTEGER [DEFAULT 0]
total_amount: DECIMAL(10,2) [NOT NULL]
payment_status: ENUM('pending', 'completed', 'failed', 'refunded') [NOT NULL, DEFAULT 'pending']
payment_method: ENUM('airtel_money', 'moov_money') [NOT NULL]
payment_phone: VARCHAR(20) [NOT NULL]
status: ENUM('pending', 'confirmed', 'cancelled') [NOT NULL, DEFAULT 'pending']
created_at: TIMESTAMP [DEFAULT CURRENT_TIMESTAMP]
updated_at: TIMESTAMP
```

---

### 10. **BOOKING_SEATS** (Sièges réservés)
Table de liaison entre les réservations et les sièges.

```
booking_seats
----
id: INTEGER [PK]
booking_id: INTEGER [FK -> bookings.id] [NOT NULL]
seat_id: INTEGER [FK -> seats.id] [NOT NULL]
created_at: TIMESTAMP [DEFAULT CURRENT_TIMESTAMP]

UNIQUE(booking_id, seat_id)
```

---

### 11. **BOOKING_BUFFET** (Produits buffet dans une réservation)
Table de liaison entre les réservations et les produits buffet.

```
booking_buffet
----
id: INTEGER [PK]
booking_id: INTEGER [FK -> bookings.id] [NOT NULL]
buffet_item_id: INTEGER [FK -> buffet_items.id] [NOT NULL]
quantity: INTEGER [NOT NULL, DEFAULT 1]
unit_price: DECIMAL(10,2) [NOT NULL]
subtotal: DECIMAL(10,2) [NOT NULL]
created_at: TIMESTAMP [DEFAULT CURRENT_TIMESTAMP]
```

---

### 12. **FAVORITES** (Films favoris)
Table pour gérer les films favoris des clients.

```
favorites
----
id: INTEGER [PK]
customer_id: INTEGER [FK -> customers.id] [NOT NULL]
movie_id: INTEGER [FK -> movies.id] [NOT NULL]
created_at: TIMESTAMP [DEFAULT CURRENT_TIMESTAMP]

UNIQUE(customer_id, movie_id)
```

---

## Relations entre les tables

### Diagramme des relations principales :

```
CUSTOMERS (1) ----< (N) BOOKINGS (N) >---- (1) MOVIES
                            |
                            +------ (N) >---- (1) SESSIONS
                            |
                            +------ (N) BOOKING_SEATS (N) >---- (1) SEATS
                            |
                            +------ (N) BOOKING_BUFFET (N) >---- (1) BUFFET_ITEMS

CUSTOMERS (1) ----< (N) FAVORITES (N) >---- (1) MOVIES

MOVIES (1) ----< (N) MOVIE_IMAGES

MOVIES (1) ----< (N) SESSIONS (1) ----< (N) SEATS

BUFFET_ITEMS (1) ----< (N) BUFFET_ITEM_COMPONENTS
```

---

## Cardinalités

- **CUSTOMERS → BOOKINGS** : Un client peut avoir plusieurs réservations (1,N)
- **MOVIES → BOOKINGS** : Un film peut avoir plusieurs réservations (1,N)
- **SESSIONS → BOOKINGS** : Une séance peut avoir plusieurs réservations (1,N)
- **BOOKINGS → BOOKING_SEATS** : Une réservation peut avoir plusieurs sièges (1,N)
- **SEATS → BOOKING_SEATS** : Un siège peut être réservé dans plusieurs réservations (différentes séances) (0,N)
- **BOOKINGS → BOOKING_BUFFET** : Une réservation peut avoir plusieurs produits buffet (0,N)
- **BUFFET_ITEMS → BOOKING_BUFFET** : Un produit peut être dans plusieurs réservations (0,N)
- **CUSTOMERS → FAVORITES** : Un client peut avoir plusieurs films favoris (0,N)
- **MOVIES → FAVORITES** : Un film peut être favori de plusieurs clients (0,N)
- **MOVIES → MOVIE_IMAGES** : Un film peut avoir plusieurs images (0,N)
- **MOVIES → SESSIONS** : Un film peut avoir plusieurs séances (0,N)
- **SESSIONS → SEATS** : Une séance a plusieurs sièges (1,N)
- **BUFFET_ITEMS → BUFFET_ITEM_COMPONENTS** : Un produit buffet peut avoir plusieurs composants (0,N)

---

## Notes importantes

1. **Séparation Users/Customers** : 
   - `users` : Administration uniquement (connexion backoffice)
   - `customers` : Clients de l'application mobile

2. **Pas de tables Cinema/Salle** : 
   - Le modèle est simplifié sans gestion multi-cinémas ni multi-salles
   - Une séance correspond directement à une projection

3. **Gestion des sièges** :
   - Les sièges sont créés dynamiquement pour chaque séance
   - Status : available, occupied, selected (temporaire), vip

4. **Paiement** :
   - Support de Airtel Money et Moov Money
   - Stockage du numéro de téléphone pour le paiement mobile

5. **Numéro de réservation** :
   - Format : CPX-{timestamp} (ex: CPX-12345678)
   - Unique pour chaque réservation

6. **Prix** :
   - Le prix par ticket est défini au niveau de la session
   - Les prix des produits buffet sont stockés dans booking_buffet pour historique

---

## Flux de données principaux

### 1. Processus de réservation
1. Client sélectionne un film → `MOVIES`
2. Client choisit une séance → `SESSIONS`
3. Client sélectionne des sièges → `SEATS` → `BOOKING_SEATS`
4. Client ajoute des produits buffet (optionnel) → `BUFFET_ITEMS` → `BOOKING_BUFFET`
5. Client effectue le paiement → `BOOKINGS` (payment_status = 'completed')
6. Confirmation avec numéro → `BOOKINGS.booking_number`

### 2. Gestion des favoris
- Client ajoute/retire un film → `FAVORITES`

### 3. Authentification
- Client : connexion via `CUSTOMERS`
- Admin : connexion via `USERS`

