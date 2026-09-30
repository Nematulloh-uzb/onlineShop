import mongoose from 'mongoose';
import { connectDB, closeDB } from '../config/db.js';
import { Category } from '../models/Category.js';
import { Product } from '../models/Product.js';
import { PromoCode } from '../models/PromoCode.js';
import { categoriesData } from './categoriesData.js';
import { productsData } from './productsData.js';
import { promoData } from './promoData.js';

const mensCatalogProductSlugs = new Set([
  'paxta-futbolka',
  'charm-kamar',
  'erkaklar-zigir-koylagi',
  'erkaklar-organik-paxta-polo',
  'erkaklar-jun-pidjagi',
  'erkaklar-zigir-shimi',
  'qayta-ishlangan-toladan-ryukzak',
  'tabiiy-yogoch-quyosh-kozoynagi',
  'erkaklar-eko-charm-poyabzali',
]);

const seedDatabase = async () => {
  try {
    console.log('[Seed] Ma‘lumotlar bazasiga ulanmoqda...');
    await connectDB();

    await Category.bulkWrite(
      categoriesData.map((category) => ({
        updateOne: {
          filter: { slug: category.slug },
          update: { $set: category },
          upsert: true,
        },
      }))
    );
    await Category.updateMany(
      { slug: { $in: ['ayollar', 'yangi-kelganlar', 'chegirmalar'] } },
      { $set: { isActive: false } }
    );
    const categories = await Category.find({
      slug: { $in: categoriesData.map(({ slug }) => slug) },
    }).select('_id slug');
    const categoryIds = new Map(categories.map((category) => [category.slug, category._id]));

    await Product.bulkWrite(
      productsData.map(({ categorySlug, ...product }) => {
        if (!mensCatalogProductSlugs.has(product.slug)) {
          return {
            updateOne: {
              filter: { slug: product.slug },
              update: { $set: { isActive: false } },
            },
          };
        }

        const targetCategorySlug = product.slug === 'paxta-futbolka' ? 'erkaklar' : categorySlug;
        const category = categoryIds.get(targetCategorySlug);
        if (!category) throw new Error(`Mahsulot kategoriyasi topilmadi: ${targetCategorySlug}`);
        const mensProduct = product.slug === 'paxta-futbolka'
          ? {
            ...product,
            name: 'Erkaklar organik paxta futbolkasi',
            shortDescription: 'Organik paxtadan tayyorlangan erkaklar futbolkasi',
            tags: ['erkaklar', 'futbolka', 'paxta', 'organik'],
          }
          : product;
        return {
          updateOne: {
            filter: { slug: product.slug },
            update: {
              $set: {
                ...mensProduct,
                category,
                gender: 'erkaklar',
                isActive: true,
                ratingAverage: 0,
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

    console.log(`[Seed] ${categoriesData.length} erkaklar kategoriyasi, ${mensCatalogProductSlugs.size} erkaklar mahsuloti va ${promoData.length} promo-kod tayyor.`);
    console.log('[Seed] Seed katalogidagi ayollar kolleksiyasi faol katalogdan olib tashlandi; mavjud foydalanuvchi, buyurtma va savatlar saqlandi.');
  } catch (error) {
    console.error('[Seed] Xatolik yuz berdi:', error);
    process.exitCode = 1;
  } finally {
    if (mongoose.connection.readyState !== 0) await closeDB();
  }
};

seedDatabase();
