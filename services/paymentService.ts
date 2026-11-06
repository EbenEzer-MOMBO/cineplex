import { apiClient } from './apiClient';
import { logger } from './logger';

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
  return apiClient.post<InitiatePaymentResponse>('/payments/initiate', request, { token });
}

/**
 * Vérifie le statut d'un paiement
 */
export async function verifyPayment(
  token: string,
  request: VerifyPaymentRequest
): Promise<VerifyPaymentResponse> {
  return apiClient.post<VerifyPaymentResponse>('/payments/verify', request, { token });
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
  logger.log(`Début du polling: ${maxAttempts} tentatives, intervalle ${intervalMs}ms`);

  for (let i = 0; i < maxAttempts; i++) {
    const result = await verifyPayment(token, { bill_id: billId });

    logger.log(`Résultat tentative ${i + 1}/${maxAttempts}:`, result.status);

    if (result.status === 'completed' || result.status === 'failed') {
      return result;
    }

    // Attendre avant la prochaine tentative (sauf pour la dernière)
    if (i < maxAttempts - 1) {
      await new Promise(resolve => setTimeout(resolve, intervalMs));
    }
  }

  // Timeout
  logger.log('Timeout: délai de paiement expiré');
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
  return apiClient.post<CancelPaymentResponse>('/payments/cancel', request, { token });
}

/**
 * Récupère l'historique des transactions du client
 */
export async function getPaymentHistory(
  token: string,
  page: number = 1,
  perPage: number = 15
): Promise<PaymentHistoryResponse> {
  return apiClient.get<PaymentHistoryResponse>(
    `/payments/history?page=${page}&per_page=${perPage}`,
    { token }
  );
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
