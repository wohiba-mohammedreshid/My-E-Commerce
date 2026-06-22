/**
 * Seed script — populates Firebase Firestore with sample data.
 * Run: npm run seed (from server directory)
 * Requires Firebase credentials in server/.env
 */
import dotenv from 'dotenv';
import { initFirebase } from '../config/firebase.js';
import { demoProducts, demoCategories } from '../data/demoStore.js';

dotenv.config();

const { isDemo, db } = initFirebase();

if (isDemo || !db) {
  console.log('❌ Firebase not configured. Add credentials to server/.env first.');
  console.log('   The app works in demo mode without Firebase — just run npm run dev!');
  process.exit(1);
}

async function seed() {
  console.log('🌱 Seeding Firestore...\n');

  // Seed categories
  for (const cat of demoCategories) {
    await db.collection('categories').doc(cat.id).set(cat);
    console.log(`  ✓ Category: ${cat.name}`);
  }

  // Seed products
  for (const product of demoProducts) {
    const { id, ...data } = product;
    await db.collection('products').doc(id).set(data);
    console.log(`  ✓ Product: ${product.name}`);
  }

  console.log('\n✅ Seeding complete!');
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
