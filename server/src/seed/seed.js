import mongoose from 'mongoose';
import { connectDB, closeDB } from '../config/db.js';
import { Category } from '../models/Category.js';
import { Product } from '../models/Product.js';
import { PromoCode } from '../models/PromoCode.js';
import { categoriesData } from './categoriesData.js';
import { productsData } from './productsData.js';
import { promoData } from './promoData.js';

const seedDatabase = async () => {
  try {
    console.log('[Seed] Ma‘lumotlar bazasiga ulanmoqda...');
    await connectDB();

    await Category.bulkWrite(
      categoriesData.map((category) => ({
        updateOne: {
          filter: { slug: category.slug },
          update: { $setOnInsert: category },
          upsert: true,
        },
      }))
    );
    const categories = await Category.find({
      slug: { $in: categoriesData.map(({ slug }) => slug) },
    }).select('_id slug');
    const categoryIds = new Map(categories.map((category) => [category.slug, category._id]));

    await Product.bulkWrite(
      productsData.map(({ categorySlug, ...product }) => {
        const category = categoryIds.get(categorySlug);
        if (!category) throw new Error(`Mahsulot kategoriyasi topilmadi: ${categorySlug}`);
        return {
          updateOne: {
            filter: { slug: product.slug },
            update: {
              $setOnInsert: {
                ...product,
                category,
                ratingAverage: 5,
                ratingCount: 0,
                soldCount: 0,
              },
            },
            upsert: true,
          },
        };
      })
    );

    await PromoCode.bulkWrite(
      promoData.map(({ usedCount, ...promo }) => ({
        updateOne: {
          filter: { code: promo.code },
          update: { $setOnInsert: { ...promo, usedCount: 0 } },
          upsert: true,
        },
      }))
    );

    console.log(`[Seed] ${categoriesData.length} kategoriya, ${productsData.length} mahsulot va ${promoData.length} promo-kod tayyor.`);
    console.log('[Seed] Mavjud foydalanuvchi, buyurtma va katalog ma‘lumotlari o‘zgartirilmadi.');
  } catch (error) {
    console.error('[Seed] Xatolik yuz berdi:', error);
    process.exitCode = 1;
  } finally {
    if (mongoose.connection.readyState !== 0) await closeDB();
  }
};

seedDatabase();
