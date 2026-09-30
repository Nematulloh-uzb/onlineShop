import { ApiError } from '../utils/ApiError.js';

class MockProvider {
  async processPayment({ orderNumber, amount, paymentMethod, cardDetails }) {
    console.log(`[MockProvider] To‘lov so‘rovi: Buyurtma ${orderNumber}, Summa: ${amount} so‘m, Usul: ${paymentMethod}`);

    // Naqd to'lov
    if (paymentMethod === 'cash') {
      return {
        success: true,
        status: 'pending',
        providerRef: `CASH-${orderNumber}-${Date.now()}`,
        message: 'Yetkazib berilganda naqd to‘lov tanlandi',
      };
    }

    // Karta tekshiruvi (Test kartalari)
    const cardNumber = cardDetails?.cardNumber ? cardDetails.cardNumber.replace(/\s+/g, '') : '';

    if (cardNumber.endsWith('0002')) {
      throw new ApiError(400, 'To‘lov rad etildi: kartada mablag‘ yetarli emas yoki karta bloklangan (Test)');
    }

    // Muvaffaqiyatli to'lov
    return {
      success: true,
      status: 'paid',
      providerRef: `MOCK-${paymentMethod.toUpperCase()}-${orderNumber}-${Date.now()}`,
      paidAt: new Date(),
      message: 'To‘lov muvaffaqiyatli qabul qilindi',
    };
  }

  async refund(providerRef) {
    console.log(`[MockProvider] To‘lov qaytarildi: Ref: ${providerRef}`);
    return {
      success: true,
      status: 'refunded',
      refundedAt: new Date(),
    };
  }
}

export const paymentService = {
  provider: new MockProvider(),

  async processPayment(params) {
    return this.provider.processPayment(params);
  },

  async refund(providerRef) {
    return this.provider.refund(providerRef);
  },
};
