import { ApiError } from '../utils/ApiError.js';

class MockProvider {
  async processPayment({ orderNumber, amount, paymentMethod, cardDetails }) {
    if (paymentMethod === 'cash') {
      return {
        success: true,
        status: 'pending',
        providerRef: `CASH-${orderNumber}-${Date.now()}`,
        message: 'Yetkazib berilganda naqd to‘lov tanlandi',
      };
    }

    throw new ApiError(503, 'Onlayn to‘lov provayderi sozlanmagan. Hozircha yetkazib berganda to‘lash usulidan foydalaning.');
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
