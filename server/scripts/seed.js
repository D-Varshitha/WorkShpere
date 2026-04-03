import 'dotenv/config';
import { sequelize } from '../models/index.js';
import { seedDefaultData } from '../seed/defaultData.js';

async function main() {
  await sequelize.authenticate();
  await sequelize.sync();
  await seedDefaultData();
  await sequelize.close();
  console.log('Done.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
