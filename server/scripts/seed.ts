import bcrypt from 'bcryptjs';
import { env } from '../src/config/env';
import { connectDB, disconnectDB } from '../src/config/db';
import { UserModel } from '../src/models/user.model';
import { ProductModel } from '../src/models/product.model';
import { CartModel } from '../src/models/cart.model';

// Real product photos from the Unsplash image CDN (free to hot-link).
// Fixed 600×450 (4:3) crop so every image loads at a uniform size — matching the
// card's aspect-[4/3] frame — instead of each photo's native aspect ratio.
const img = (id: string) =>
  `https://images.unsplash.com/photo-${id}?w=600&h=450&fit=crop&crop=entropy&q=80&auto=format`;

const products = [
  {
    name: 'Aurora Wireless Headphones',
    description: 'Over-ear noise-cancelling headphones with 30h battery life.',
    price: 199.99,
    stock: 25,
    imageUrl: img('1505740420928-5e560c06d30e'),
  },
  {
    name: 'Nimbus Mechanical Keyboard',
    description: 'Hot-swappable 75% mechanical keyboard with PBT keycaps.',
    price: 129.0,
    stock: 40,
    imageUrl: img('1541140532154-b024d705b90a'),
  },
  {
    name: 'Pulse Smartwatch',
    description: 'Fitness tracking, heart-rate monitor, and AMOLED display.',
    price: 249.5,
    stock: 15,
    imageUrl: img('1523275335684-37898b6baf30'),
  },
  {
    name: 'Vertex 4K Monitor',
    description: '27-inch 4K IPS monitor with USB-C and 99% sRGB.',
    price: 379.99,
    stock: 10,
    imageUrl: img('1527443224154-c4a3942d3acf'),
  },
  {
    name: 'Drift Ergonomic Mouse',
    description: 'Wireless ergonomic mouse with silent clicks.',
    price: 49.99,
    stock: 60,
    imageUrl: img('1527864550417-7fd91fc51a46'),
  },
  {
    name: 'Echo Bluetooth Speaker',
    description: 'Portable waterproof speaker with deep bass.',
    price: 89.95,
    stock: 35,
    imageUrl: img('1608043152269-423dbba4e7e1'),
  },
  {
    name: 'Lumen Desk Lamp',
    description: 'LED desk lamp with adjustable color temperature.',
    price: 39.0,
    stock: 50,
    imageUrl: img('1507473885765-e6ed057f782c'),
  },
  {
    name: 'Cobalt USB-C Hub',
    description: '7-in-1 USB-C hub with HDMI, SD, and 100W passthrough.',
    price: 59.99,
    stock: 45,
    imageUrl: img('1625842268584-8f3296236761'),
  },
  {
    name: 'Strata Laptop Stand',
    description: 'Aluminium adjustable laptop stand for better posture.',
    price: 34.5,
    stock: 70,
    imageUrl: img('1593642702821-c8da6771f0c6'),
  },
  {
    name: 'Halo Webcam 1080p',
    description: 'Full-HD webcam with auto-focus and dual microphones.',
    price: 69.99,
    stock: 30,
    imageUrl: img('1587825140708-dfaf72ae4b04'),
  },
];

async function seed() {
  await connectDB(env.MONGO_URI);

  // Clean slate so the seed is idempotent.
  await Promise.all([
    UserModel.deleteMany({}),
    ProductModel.deleteMany({}),
    CartModel.deleteMany({}),
  ]);

  const [adminHash, userHash] = await Promise.all([
    bcrypt.hash('Admin123!', 10),
    bcrypt.hash('User1234!', 10),
  ]);

  await UserModel.create([
    { name: 'Admin', email: 'admin@shop.com', passwordHash: adminHash, role: 'admin' },
    { name: 'Test User', email: 'user@shop.com', passwordHash: userHash, role: 'user' },
  ]);

  await ProductModel.insertMany(products);

  console.log('✓ Seeded:');
  console.log(`  - ${products.length} products`);
  console.log('  - admin@shop.com / Admin123!  (role: admin)');
  console.log('  - user@shop.com  / User1234!  (role: user)');

  await disconnectDB();
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
