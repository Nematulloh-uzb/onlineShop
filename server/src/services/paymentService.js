import { ApiError } from '../utils/ApiError.js';

class CashOnDeliveryProvider {
  async processPayment({ orderNumber, paymentMethod }) {
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

  async refund() {
    throw new ApiError(503, 'To‘lovni qaytarish provayderi sozlanmagan.');
  }
}

export const paymentService = {
  provider: new CashOnDeliveryProvider(),

  async processPayment(params) {
    return this.provider.processPayment(params);
  },

  async refund(providerRef) {
    return this.provider.refund(providerRef);
  },
};
