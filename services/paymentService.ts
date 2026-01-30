import { buildApiUrl } from './config';

// Types pour les réponses de l'API
export interface InitiatePaymentRequest {
  booking_id: number;
  payment_method: 'airtel_money' | 'moov_money';
  msisdn: string;
}

export interface InitiatePaymentResponse {
  success: boolean;
  bill_id?: string;
  transaction_reference?: string;
  message: string;
}

export interface VerifyPaymentRequest {
  bill_id: string;
}

export interface VerifyPaymentResponse {
  success: boolean;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  message: string;
  booking?: {
    id: number;
    booking_number: string;
    total_amount: number;
    payment_status: string;
    status: string;
    movie: {
      id: number;
      title: string;
    };
    session: {
      id: number;
      session_date: string;
      start_time: string;
    };
  };
}

export interface CancelPaymentRequest {
  transaction_reference: string;
}

export interface CancelPaymentResponse {
  success: boolean;
  message: string;
}

export interface PaymentTransaction {
  id: number;
  reference: string;
  bill_id: string;
  amount: number;
  payment_method: 'airtel_money' | 'moov_money';
  payer_msisdn: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  completed_at: string | null;
  created_at: string;
  booking: {
    id: number;
    booking_number: string;
    movie: {
      id: number;
      title: string;
    };
    session: {
      id: number;
      session_date: string;
      start_time: string;
    };
  };
}

export interface PaymentHistoryResponse {
  success: boolean;
  data: {
    current_page: number;
    data: PaymentTransaction[];
    first_page_url: string;
    last_page: number;
    per_page: number;
    total: number;
  };
}

/**
 * Initie un paiement mobile pour une réservation
 */
export async function initiatePayment(
  token: string,
  request: InitiatePaymentRequest
): Promise<InitiatePaymentResponse> {
  try {
    console.log('Initiation du paiement avec:', {
      url: buildApiUrl('/payments/initiate'),
      request,
    });

    const response = await fetch(buildApiUrl('/payments/initiate'), {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(request),
    });

    const data = await response.json();
    console.log('Réponse de l\'API:', { status: response.status, data });

    if (!response.ok) {
      // Si c'est une erreur de validation (422), afficher les détails
      if (response.status === 422 && data.errors) {
        const errorMessages = Object.values(data.errors).flat().join(', ');
        throw new Error(errorMessages || data.message || 'Erreur de validation');
      }
      throw new Error(data.message || 'Erreur lors de l\'initiation du paiement');
    }

    return data;
  } catch (error) {
    console.error('Erreur initiatePayment:', error);
    throw error;
  }
}

/**
 * Vérifie le statut d'un paiement
 */
export async function verifyPayment(
  token: string,
  request: VerifyPaymentRequest
): Promise<VerifyPaymentResponse> {
  try {
    const response = await fetch(buildApiUrl('/payments/verify'), {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Erreur lors de la vérification du paiement');
    }

    return data;
  } catch (error) {
    console.error('Erreur verifyPayment:', error);
    throw error;
  }
}

/**
 * Vérifie le paiement avec polling
 * @param token - Token d'authentification
 * @param billId - ID de la facture
 * @param maxAttempts - Nombre maximum de tentatives (défaut: 20 pour 60 secondes)
 * @param intervalMs - Intervalle entre les vérifications en ms (défaut: 3000ms = 3 secondes)
 */
export async function verifyPaymentWithPolling(
  token: string,
  billId: string,
  maxAttempts: number = 20,
  intervalMs: number = 3000
): Promise<VerifyPaymentResponse> {
  console.log(`Début du polling: ${maxAttempts} tentatives, intervalle ${intervalMs}ms`);
  
  for (let i = 0; i < maxAttempts; i++) {
    console.log(`Tentative ${i + 1}/${maxAttempts} - Vérification du paiement...`);
    const result = await verifyPayment(token, { bill_id: billId });
    
    console.log(`Résultat tentative ${i + 1}:`, result.status);

    if (result.status === 'completed' || result.status === 'failed') {
      console.log(`Paiement terminé avec statut: ${result.status}`);
      return result;
    }

    // Attendre avant la prochaine tentative (sauf pour la dernière)
    if (i < maxAttempts - 1) {
      console.log(`Attente de ${intervalMs}ms avant la prochaine tentative...`);
      await new Promise(resolve => setTimeout(resolve, intervalMs));
    }
  }

  // Timeout
  console.log('Timeout: délai de paiement expiré');
  return {
    success: false,
    status: 'failed',
    message: 'Le délai de paiement a expiré. Veuillez réessayer.',
  };
}

/**
 * Annule une transaction en attente
 */
export async function cancelPayment(
  token: string,
  request: CancelPaymentRequest
): Promise<CancelPaymentResponse> {
  try {
    const response = await fetch(buildApiUrl('/payments/cancel'), {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Erreur lors de l\'annulation du paiement');
    }

    return data;
  } catch (error) {
    console.error('Erreur cancelPayment:', error);
    throw error;
  }
}

/**
 * Récupère l'historique des transactions du client
 */
export async function getPaymentHistory(
  token: string,
  page: number = 1,
  perPage: number = 15
): Promise<PaymentHistoryResponse> {
  try {
    const response = await fetch(
      buildApiUrl(`/payments/history?page=${page}&per_page=${perPage}`),
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Erreur lors de la récupération de l\'historique');
    }

    return data;
  } catch (error) {
    console.error('Erreur getPaymentHistory:', error);
    throw error;
  }
}

/**
 * Formate le montant en Francs CFA
 */
export function formatAmount(amount: number): string {
  return amount.toLocaleString('fr-FR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }) + ' F';
}

/**
 * Formate le numéro de téléphone pour l'API (retire les espaces et le +)
 */
export function formatPhoneNumber(phone: string): string {
  return phone.replace(/[\s+]/g, '');
}

/**
 * Valide le format du numéro de téléphone (8-15 chiffres)
 */
export function isValidPhoneNumber(phone: string): boolean {
  const cleaned = formatPhoneNumber(phone);
  return /^\d{8,15}$/.test(cleaned);
}

/**
 * Obtient le label de la méthode de paiement
 */
export function getPaymentMethodLabel(method: 'airtel_money' | 'moov_money'): string {
  return method === 'airtel_money' ? 'Airtel Money' : 'Moov Money';
}

/**
 * Obtient le label du statut de paiement
 */
export function getPaymentStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    pending: 'En attente',
    processing: 'En cours',
    completed: 'Confirmé',
    failed: 'Échoué',
  };
  return labels[status] || status;
}
