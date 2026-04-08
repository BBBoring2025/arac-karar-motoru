/**
 * Payment State Machine
 *
 * Sprint B'de eklenen payment state derivation.
 * Spec'teki 6 state'i açıkça modelleyerek /odeme sayfasındaki gri alan
 * belirsizliğini kaldırır.
 *
 * PURE FUNCTION: Side effect yok. Sadece input → state mapping.
 * Actual payment logic hâlâ processor.ts / API routes'ta.
 */

export type PaymentStateName =
  | 'disabled_no_env'
  | 'ready_sandbox'
  | 'ready_production'
  | 'callback_error'
  | 'payment_success'
  | 'payment_failed';

export type PaymentUiVariant =
  | 'coming_soon'
  | 'active'
  | 'error'
  | 'success'
  | 'failed';

export interface PaymentState {
  name: PaymentStateName;
  uiVariant: PaymentUiVariant;
  userMessage: string;
  detail?: string;
  paymentId?: string;
  errorMessage?: string;
}

/**
 * Inputs to derive state:
 *   - paymentEnabled: from /api/health.flags.paymentEnabled.enabled
 *   - iyzicoMode: from /api/health.services.iyzico.mode ('sandbox' | 'production' | 'disabled')
 *   - callbackStatus: URL query param from iyzico callback (?status=success|error)
 *   - callbackMessage: URL query param if error (?message=token_missing|...)
 *   - paymentId: URL query param on success
 */
export interface PaymentStateInputs {
  paymentEnabled: boolean;
  iyzicoMode?: string | null;
  callbackStatus?: string | null;
  callbackMessage?: string | null;
  paymentId?: string | null;
}

/**
 * Derive payment state from runtime inputs.
 * Priority:
 *   1. Callback state wins over base state (user just came back from iyzico)
 *   2. Then base state: disabled_no_env | ready_sandbox | ready_production
 */
export function derivePaymentState(inputs: PaymentStateInputs): PaymentState {
  // 1. Callback handling has priority (user just landed from iyzico)
  if (inputs.callbackStatus === 'success') {
    return {
      name: 'payment_success',
      uiVariant: 'success',
      userMessage: 'Ödemeniz başarıyla tamamlandı.',
      paymentId: inputs.paymentId ?? undefined,
    };
  }

  if (inputs.callbackStatus === 'error') {
    // Differentiate callback_error (our server issue) from payment_failed (iyzico rejected)
    if (inputs.callbackMessage === 'token_missing' || inputs.callbackMessage === 'server_error') {
      return {
        name: 'callback_error',
        uiVariant: 'error',
        userMessage: 'Ödeme doğrulanamadı. Bu bir teknik hata olabilir.',
        detail: inputs.callbackMessage,
      };
    }
    return {
      name: 'payment_failed',
      uiVariant: 'failed',
      userMessage: 'Ödeme tamamlanamadı.',
      errorMessage: inputs.callbackMessage ?? 'İşlem başarısız',
    };
  }

  // 2. Base state from flags + mode
  if (!inputs.paymentEnabled) {
    return {
      name: 'disabled_no_env',
      uiVariant: 'coming_soon',
      userMessage:
        'Ödeme sistemi hazırlanıyor. Güvenli ödeme altyapımız üzerinde çalışıyoruz.',
    };
  }

  if (inputs.iyzicoMode === 'sandbox') {
    return {
      name: 'ready_sandbox',
      uiVariant: 'active',
      userMessage: 'Ödeme sistemi hazır (test modu).',
    };
  }

  if (inputs.iyzicoMode === 'production') {
    return {
      name: 'ready_production',
      uiVariant: 'active',
      userMessage: 'Ödeme sistemi hazır.',
    };
  }

  // Fallback: payment enabled but mode unknown — treat as disabled
  return {
    name: 'disabled_no_env',
    uiVariant: 'coming_soon',
    userMessage: 'Ödeme sistemi yapılandırılıyor.',
  };
}

/**
 * Convenience: determine if state requires actual checkout form rendering.
 */
export function isCheckoutActive(state: PaymentState): boolean {
  return state.name === 'ready_sandbox' || state.name === 'ready_production';
}

/**
 * Convenience: determine if state is a post-callback landing.
 */
export function isCallbackLanding(state: PaymentState): boolean {
  return (
    state.name === 'payment_success' ||
    state.name === 'payment_failed' ||
    state.name === 'callback_error'
  );
}
