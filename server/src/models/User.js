import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const addressSchema = new mongoose.Schema(
  {
    label: { type: String, default: 'Asosiy manzil' },
    firstName: { type: String, required: [true, 'Ismni kiritish shart'] },
    lastName: { type: String, required: [true, 'Familiyani kiritish shart'] },
    street: { type: String, required: [true, 'Ko‘cha va uy raqami shart'] },
    city: { type: String, required: [true, 'Shahar yoki aholi punktini kiritish shart'] },
    region: { type: String, required: [true, 'Viloyatni tanlash shart'] },
    district: { type: String },
    postalCode: { type: String },
    phone: { type: String, required: [true, 'Telefon raqamini kiritish shart'] },
    isDefault: { type: Boolean, default: false },
  },
  { _id: true }
);

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Ismingizni kiriting'],
      trim: true,
    },
    surname: {
      type: String,
      trim: true,
      default: '',
    },
    email: {
      type: String,
      required: [true, 'Elektron pochta manzilini kiriting'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/\S+@\S+\.\S+/, 'Iltimos, to‘g‘ri elektron pochta manzilini kiriting'],
    },
    phone: {
      type: String,
      trim: true,
      default: '',
    },
    avatarUrl: {
      type: String,
      trim: true,
      default: '',
      maxlength: [500, 'Profil rasmi manzili juda uzun'],
    },
    passwordHash: {
      type: String,
      required: [true, 'Parolni kiriting'],
      select: false,
    },
    role: {
      type: String,
      enum: ['customer', 'admin'],
      default: 'customer',
    },
    addresses: [addressSchema],
    newsletterOptIn: {
      type: Boolean,
      default: false,
    },
    refreshTokenHash: {
      type: String,
      select: false,
    },
    resetPasswordTokenHash: {
      type: String,
      select: false,
    },
    resetPasswordExpires: {
      type: Date,
      select: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.passwordHash);
};

export const User = mongoose.model('User', userSchema);
