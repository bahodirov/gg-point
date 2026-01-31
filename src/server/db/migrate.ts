import { db } from './database';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import rawProductsData from '../../../data/products';

// Default admin credentials
const DEFAULT_ADMIN_USERNAME = 'admin';
const DEFAULT_ADMIN_PASSWORD = 'admin123';

export async function migrateData(): Promise<void> {
  // Check if users already exist
  const userCount = db.users.count();
  
  if (userCount === 0) {
    // Create default admin user
    const passwordHash = await bcrypt.hash(DEFAULT_ADMIN_PASSWORD, 12);
    const userId = uuidv4();
    const now = new Date().toISOString();
    
    db.users.insert({
      id: userId,
      username: DEFAULT_ADMIN_USERNAME,
      password_hash: passwordHash,
      email: null,
      role: 'admin',
      created_at: now,
      updated_at: now,
    });
    
    console.log('Default admin user created (username: admin, password: admin123)');
  }

  // Check if products already exist
  const productCount = db.products.count();
  
  if (productCount === 0 && rawProductsData.length > 0) {
    console.log(`Migrating ${rawProductsData.length} products to database...`);
    
    const now = new Date().toISOString();
    const products = rawProductsData.map(p => ({
      id: p.id,
      slug: p.slug,
      name_ru: p.name.ru,
      name_uz: p.name.uz || null,
      description_ru: p.description.ru || null,
      description_uz: p.description.uz || null,
      price: p.price,
      old_price: p.oldPrice || null,
      category: p.category,
      images: JSON.stringify(p.images || []),
      specs: JSON.stringify(p.specs || {}),
      in_stock: p.inStock ? 1 : 0,
      featured: p.featured ? 1 : 0,
      is_new: p.isNew ? 1 : 0,
      related_products: JSON.stringify(p.relatedProducts || []),
      created_at: now,
      updated_at: now,
    }));

    db.products.insertMany(products);
    console.log('Products migrated successfully');
  }
}

export default migrateData;
