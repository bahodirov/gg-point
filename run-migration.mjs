// Load environment variables
import { config } from 'dotenv';
config();

import('./src/server/db/migrate-to-postgresql.ts').then(async (module) => {
  try {
    const migrate = module.default || module.migrateToPostgreSQL;
    await migrate();
    console.log('\n✅ Migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    console.error(error);
    process.exit(1);
  }
});
