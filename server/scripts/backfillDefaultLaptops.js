import { sequelize, User, Asset, AssetCustodyHistory } from '../models/index.js';

async function run() {
  try {
    await sequelize.authenticate();
    console.log('[backfill] DB connected');

    const employees = await User.findAll({
      where: { role: 'employee', archived: false },
      attributes: ['id', 'email', 'name']
    });

    let created = 0;
    for (const e of employees) {
      const hasLaptop = await Asset.findOne({
        where: { assignedEmployeeId: e.id, assetType: 'Laptop' }
      });
      if (hasLaptop) continue;

      const asset = await Asset.create({
        assetType: 'Laptop',
        assignedEmployeeId: e.id,
        status: 'Assigned',
        assignedDate: new Date()
      });
      await AssetCustodyHistory.create({
        assetId: asset.id,
        employeeId: e.id,
        assignedAt: new Date(),
        releasedAt: null,
        reason: 'Backfill default laptop assignment script'
      });
      created += 1;
    }

    console.log(`[backfill] created laptop assignments: ${created}`);
  } catch (err) {
    console.error('[backfill] failed:', err);
    process.exitCode = 1;
  } finally {
    await sequelize.close();
  }
}

run();

