import bcrypt from 'bcryptjs';
import { env } from '../config/env.js';
import { connectDB, closeDB } from '../config/db.js';
import { User } from '../models/User.js';
import { Category } from '../models/Category.js';
import { Product } from '../models/Product.js';
import { Cart } from '../models/Cart.js';
import { Wishlist } from '../models/Wishlist.js';
import { Review } from '../models/Review.js';
import { PromoCode } from '../models/PromoCode.js';
import { Order } from '../models/Order.js';
import { Counter } from '../models/Counter.js';

import { categoriesData } from './categoriesData.js';
import { productsData } from './productsData.js';
import { promoData } from './promoData.js';

const seedDatabase = async () => {
  try {
    console.log('[Seed] Ma‘lumotlar bazasiga ulanmoqda...');
    await connectDB();

    console.log('[Seed] Eski ma‘lumotlar tozalanmoqda...');
    await Promise.all([
      User.deleteMany({}),
      Category.deleteMany({}),
      Product.deleteMany({}),
      Cart.deleteMany({}),
      Wishlist.deleteMany({}),
      Review.deleteMany({}),
      PromoCode.deleteMany({}),
      Order.deleteMany({}),
      Counter.deleteMany({}),
    ]);

    // 1. Foydalanuvchilarni yaratish
    console.log('[Seed] Admin va test mijoz yaratilmoqda...');
    const adminPasswordHash = await bcrypt.hash(env.ADMIN_PASSWORD, 10);
    const customerPasswordHash = await bcrypt.hash('Mijoz123!', 10);

    const adminUser = await User.create({
      name: 'Aura',
      surname: 'Administrator',
      email: env.ADMIN_EMAIL,
      phone: '+998901234567',
      passwordHash: adminPasswordHash,
      role: 'admin',
      isActive: true,
      addresses: [
        {
          label: 'Bosh ofis',
          firstName: 'Aura',
          lastName: 'Admin',
          street: 'Amir Temur shoh ko‘chasi, 107',
          city: 'Toshkent',
          region: 'Toshkent shahri',
          district: 'Yunusobod tumani',
          postalCode: '100084',
          phone: '+998901234567',
          isDefault: true,
        },
      ],
    });

    const testCustomer = await User.create({
      name: 'Nodira',
      surname: 'Karimova',
      email: 'mijoz@aura.uz',
      phone: '+998935551234',
      passwordHash: customerPasswordHash,
      role: 'customer',
      isActive: true,
      addresses: [
        {
          label: 'Uy manzili',
          firstName: 'Nodira',
          lastName: 'Karimova',
          street: 'Mustaqillik shoh ko‘chasi, 45-uy, 12-xonadon',
          city: 'Toshkent',
          region: 'Toshkent shahri',
          district: 'Mirzo Ulug‘bek tumani',
          postalCode: '100000',
          phone: '+998935551234',
          isDefault: true,
        },
      ],
    });

    // 2. Toifalarni yaratish
    console.log('[Seed] Toifalar kiritilmoqda...');
    const createdCategories = await Category.insertMany(categoriesData);
    const categoryMap = {};
    createdCategories.forEach((cat) => {
      categoryMap[cat.slug] = cat._id;
    });

    // 3. Mahsulotlarni yaratish
    console.log('[Seed] Mahsulotlar kiritilmoqda...');
    const formattedProducts = productsData.map((prod) => ({
      ...prod,
      category: categoryMap[prod.categorySlug] || createdCategories[0]._id,
    }));
    const createdProducts = await Product.insertMany(formattedProducts);
    console.log(`[Seed] ${createdProducts.length} ta mahsulot yaratildi.`);

    // 4. Promo kodlar
    console.log('[Seed] Promo-kodlar kiritilmoqda...');
    await PromoCode.insertMany(promoData);

    // 5. Counter inicializatsiya
    await Counter.create({ _id: 'order', seq: 82914 });

    // 6. Namunaviy sharhlar
    console.log('[Seed] Namunaviy sharhlar qo‘shilmoqda...');
    const firstProduct = createdProducts[0]; // Zig'ir ko'ylak
    if (firstProduct) {
      await Review.create([
        {
          product: firstProduct._id,
          user: testCustomer._id,
          rating: 5,
          title: 'Aqlbovar qilmas qulaylik va mato sifati!',
          comment: 'Zig‘ir matosi nihoyatda mayin va nafas oladi. Rangi aynan suratlardagidek. Ekologik qadoqlanishi ham alohida ehtiromga loyiq. Tavsiya qilaman!',
          isVerifiedPurchase: true,
        },
        {
          product: firstProduct._id,
          user: adminUser._id,
          rating: 5,
          title: 'Barqaror modaning ajoyib namunasi',
          comment: 'Tikilishi juda sifatli, choklar tekis. O‘lchami jadvalga 100% mos keldi.',
          isVerifiedPurchase: true,
        },
      ]);
    }

    // 7. Namunaviy buyurtmalar (Dashboard uchun)
    console.log('[Seed] Namunaviy buyurtmalar yaratilmoqda...');
    await Order.create([
      {
        orderNumber: 'AU-82910',
        user: testCustomer._id,
        contact: { email: testCustomer.email, phone: testCustomer.phone },
        items: [
          {
            product: createdProducts[0]._id,
            name: createdProducts[0].name,
            image: createdProducts[0].images[0].url,
            color: createdProducts[0].variants[0].color,
            size: createdProducts[0].variants[0].size,
            sku: createdProducts[0].variants[0].sku,
            quantity: 1,
            unitPrice: createdProducts[0].price,
            lineTotal: createdProducts[0].price,
            ecoBadge: createdProducts[0].ecoBadge,
            waterSavedLitersPerItem: 2400,
          },
        ],
        shippingAddress: testCustomer.addresses[0],
        pricing: {
          subtotal: 1250000,
          discount: 125000,
          shipping: 0,
          tax: 90000,
          total: 1215000,
        },
        promoCode: 'AURA10',
        paymentMethod: 'uzcard',
        payment: {
          status: 'paid',
          providerRef: 'PAY-82910-UZCARD',
          paidAt: new Date(Date.now() - 2 * 24 * 3600 * 1000),
        },
        status: 'yetkazildi',
        statusHistory: [
          { status: 'yangi', at: new Date(Date.now() - 3 * 24 * 3600 * 1000), note: 'Buyurtma rasmiylashtirildi' },
          { status: 'yetkazildi', at: new Date(Date.now() - 1 * 24 * 3600 * 1000), note: 'Xaridorga topshirildi' },
        ],
        ecoImpactTotal: { waterSavedLiters: 2400 },
      },
      {
        orderNumber: 'AU-82914',
        user: testCustomer._id,
        contact: { email: testCustomer.email, phone: testCustomer.phone },
        items: [
          {
            product: createdProducts[0]._id,
            name: createdProducts[0].name,
            image: createdProducts[0].images[0].url,
            color: { name: 'Adaçayı Yashil', hex: '#8A9A5B' },
            size: 'M',
            sku: 'ZK-GRN-M',
            quantity: 1,
            unitPrice: 1250000,
            lineTotal: 1250000,
            ecoBadge: '100% Organik zig‘ir',
            waterSavedLitersPerItem: 2400,
          },
          {
            product: createdProducts[1]._id,
            name: createdProducts[1].name,
            image: createdProducts[1].images[0].url,
            color: { name: 'Sof Oq', hex: '#FFFFFF' },
            size: 'L',
            sku: 'PF-WHT-L',
            quantity: 2,
            unitPrice: 480000,
            lineTotal: 960000,
            ecoBadge: '100% Organik paxta',
            waterSavedLitersPerItem: 1100,
          },
        ],
        shippingAddress: testCustomer.addresses[0],
        pricing: {
          subtotal: 2210000,
          discount: 0,
          shipping: 0,
          tax: 176800,
          total: 2386800,
        },
        paymentMethod: 'humo',
        payment: {
          status: 'paid',
          providerRef: 'PAY-82914-HUMO',
          paidAt: new Date(),
        },
        status: 'yigilmoqda',
        statusHistory: [
          { status: 'yangi', at: new Date(), note: 'To‘lov tasdiqlandi' },
          { status: 'yigilmoqda', at: new Date(), note: 'Ombordan qadoqlanmoqda' },
        ],
        ecoImpactTotal: { waterSavedLiters: 4600 },
      },
    ]);

    console.log('[Seed] Ma‘lumotlar bazasi muvaffaqiyatli to‘ldirildi!');
    process.exit(0);
  } catch (error) {
    console.error('[Seed] Xatolik yuz berdi:', error);
    process.exit(1);
  }
};

seedDatabase();
