/**
 * Pure business logic for Youzersef Printing Platform
 * - Order ID generation
 * - Request-readiness validation
 * - Order tracking status simulation
 */

export interface CustomizationState {
  category: string;
  size: string;
  color: string;
  customText: string;
  hasDesignFile: boolean;
  quantity: number;
}

export interface ValidationResult {
  isValid: boolean;
  missingFields: string[];
  readinessScore: number;
  message: string;
}

/**
 * Validates whether the user's custom order is ready for checkout
 */
export function validateOrderReadiness(state: Partial<CustomizationState>): ValidationResult {
  const missingFields: string[] = [];
  let score = 0;

  // Category must be selected
  if (state.category && state.category.trim() !== '') {
    score += 25;
  } else {
    missingFields.push('category');
  }

  // Size is required for wearables (t-shirts, hoodies, caps)
  const isWearable = !state.category || ['tshirts', 'hoodies', 'caps'].includes(state.category);
  if (isWearable) {
    if (state.size && state.size.trim() !== '') {
      score += 25;
    } else {
      missingFields.push('size');
    }
  } else {
    // Non-wearables get free pass on size
    score += 25;
  }

  // Color is required for all customizable products
  if (state.color && state.color.trim() !== '') {
    score += 25;
  } else {
    missingFields.push('color');
  }

  // Either a design file upload or custom text must be provided
  const hasArtwork = Boolean(state.hasDesignFile) || Boolean(state.customText && state.customText.trim().length > 0);
  if (hasArtwork) {
    score += 25;
  } else {
    missingFields.push('artwork');
  }

  return {
    isValid: missingFields.length === 0,
    missingFields,
    readinessScore: Math.min(100, score),
    message: missingFields.length === 0
      ? 'التصميم مكتمل وجاهز للمراجعة والطلب'
      : 'يرجى استكمال الحقول المطلوبة لتنفيذ التصميم بأفضل جودة'
  };
}

/**
 * Generates an authentic Egyptian order ID with prefix YZR-XXXX
 */
export function generateOrderId(seed?: number): string {
  const num = seed !== undefined ? seed : Math.floor(1000 + Math.random() * 9000);
  return `YZR-${num}`;
}

export interface TrackingStep {
  step: number;
  title: string;
  description: string;
  date: string;
  isCompleted: boolean;
  isCurrent: boolean;
}

export interface TrackingResult {
  orderId: string;
  found: boolean;
  statusTitle: string;
  productName: string;
  customerName: string;
  estimatedDelivery: string;
  steps: TrackingStep[];
}

/**
 * Simulates tracking lookup for an order ID
 */
export function getOrderTrackingStatus(orderId: string): TrackingResult {
  const cleanId = (orderId || '').trim().toUpperCase();
  
  if (!cleanId) {
    return {
      orderId: '',
      found: false,
      statusTitle: 'رقم الطلب غير صحيح',
      productName: '',
      customerName: '',
      estimatedDelivery: '',
      steps: []
    };
  }

  // Deterministic status based on numeric sum or pattern
  const digits = cleanId.replace(/\D/g, '');
  const sum = digits.split('').reduce((acc, d) => acc + parseInt(d, 10), 0);
  const stage = (sum % 4) + 1; // 1 to 4

  const stages = [
    { title: 'تم استلام وتأكيد الطلب', desc: 'تم استلام طلبك ومراجعة تفاصيل التخصيص والمقاسات بنجاح.' },
    { title: 'مراجعة وتجهيز التصميم للطباعة', desc: 'يقوم مهندس التصميم بفحص دقة الألوان وتجهيز ملفات الـ DTF والطباعة الحرارية.' },
    { title: 'جاري الطباعة والتنفيذ في الورشة', desc: 'المنتج حالياً على خط الطباعة الحرارية وفحص ثبات الألوان.' },
    { title: 'تم التغليف وجاري الشحن والتوصيل', desc: 'تم تسليم الشحنة لمندوب التوصيل السريع لتصلك خلال 24-48 ساعة.' },
  ];

  const steps: TrackingStep[] = stages.map((s, idx) => ({
    step: idx + 1,
    title: s.title,
    description: s.desc,
    date: `2026-10-${20 + idx}`,
    isCompleted: idx + 1 <= stage,
    isCurrent: idx + 1 === stage
  }));

  return {
    orderId: cleanId,
    found: true,
    statusTitle: stages[stage - 1].title,
    productName: 'تيشيرت أوفر سايز بطباعة DTF مخصصة',
    customerName: 'عميل يوزرسيف المميز',
    estimatedDelivery: 'خلال 48 ساعة كحد أقصى',
    steps
  };
}
