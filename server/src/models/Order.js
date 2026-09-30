import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    name: { type: String, required: true },
    image: { type: String, required: true },
    color: {
      name: { type: String, required: true },
      hex: { type: String, required: true },
    },
    size: { type: String, required: true },
    sku: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
    unitPrice: { type: Number, required: true },
    lineTotal: { type: Number, required: true },
    ecoBadge: { type: String, default: '100% Organik' },
    waterSavedLitersPerItem: { type: Number, default: 0 },
  },
  { _id: true }
);

const orderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      required: true,
      unique: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    guestEmail: {
      type: String,
      default: null,
    },
    contact: {
      email: { type: String, required: true },
      phone: { type: String, required: true },
    },
    items: [orderItemSchema],
    shippingAddress: {
      firstName: { type: String, required: true },
      lastName: { type: String, required: true },
      street: { type: String, required: true },
      city: { type: String, required: true },
      region: { type: String, required: true },
      district: { type: String, default: '' },
      postalCode: { type: String, default: '' },
      phone: { type: String, required: true },
    },
    pricing: {
      subtotal: { type: Number, required: true },
      discount: { type: Number, default: 0 },
      shipping: { type: Number, default: 0 },
      tax: { type: Number, default: 0 },
      total: { type: Number, required: true },
    },
    promoCode: {
      type: String,
      default: null,
    },
    paymentMethod: {
      type: String,
      enum: ['uzcard', 'humo', 'visa', 'mastercard', 'payme', 'click', 'cash'],
      required: true,
    },
    payment: {
      status: {
        type: String,
        enum: ['pending', 'paid', 'failed', 'refunded'],
        default: 'pending',
      },
      providerRef: { type: String, default: null },
      paidAt: { type: Date, default: null },
    },
    status: {
      type: String,
      enum: ['yangi', 'tasdiqlangan', 'yigilmoqda', 'yo‘lda', 'yetkazildi', 'bekor_qilindi', 'qaytarildi'],
      default: 'yangi',
    },
    statusHistory: [
      {
        status: { type: String, required: true },
        at: { type: Date, default: Date.now },
        note: { type: String, default: '' },
      },
    ],
    ecoImpactTotal: {
      waterSavedLiters: { type: Number, default: 0 },
    },
  },
  {
    timestamps: true,
  }
);

orderSchema.index({ user: 1 });
orderSchema.index({ 'contact.email': 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ createdAt: -1 });

export const Order = mongoose.model('Order', orderSchema);
