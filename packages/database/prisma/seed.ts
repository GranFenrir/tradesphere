import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Type constants (matching schema comments)
const LocationType = {
  ZONE: 'ZONE',
  RACK: 'RACK',
  SHELF: 'SHELF',
  BIN: 'BIN',
} as const;

const MovementType = {
  IN: 'IN',
  OUT: 'OUT',
  TRANSFER: 'TRANSFER',
} as const;

async function main() {
  // ============================================
  // PRODUCTS
  // ============================================
  const products = [
    {
      name: "Quantum Processor",
      sku: "PROD-001",
      category: "Electronics",
      currentStock: 124,
      price: 1299.00,
      cost: 800.00,
      reorderPoint: 50,
      maxStock: 200
    },
    {
      name: "Neural Interface",
      sku: "PROD-002",
      category: "Cybernetics",
      currentStock: 5,
      price: 8999.50,
      cost: 5000.00,
      reorderPoint: 10,
      maxStock: 20
    },
    {
      name: "Plasma Battery",
      sku: "PROD-003",
      category: "Energy",
      currentStock: 850,
      price: 49.99,
      cost: 20.00,
      reorderPoint: 100,
      maxStock: 1000
    },
    {
      name: "Holographic Emitter",
      sku: "PROD-004",
      category: "Optics",
      currentStock: 0,
      price: 249.00,
      cost: 150.00,
      reorderPoint: 20,
      maxStock: 100
    },
    {
      name: "Fusion Core",
      sku: "PROD-005",
      category: "Energy",
      currentStock: 12,
      price: 15000.00,
      cost: 10000.00,
      reorderPoint: 5,
      maxStock: 15
    }
  ];

  const createdProducts: Record<string, string> = {};
  for (const product of products) {
    const created = await prisma.product.upsert({
      where: { sku: product.sku },
      update: {},
      create: product,
    });
    createdProducts[product.sku] = created.id;
  }
  console.log('✓ Products seeded');

  // ============================================
  // WAREHOUSES
  // ============================================
  const warehouses = [
    {
      name: "Main Distribution Center",
      code: "WH-001",
      address: "123 Industrial Blvd, Neo Tokyo",
      description: "Primary warehouse for all product categories",
      isActive: true,
    },
    {
      name: "Electronics Hub",
      code: "WH-002",
      address: "456 Tech Park Ave, Silicon Valley",
      description: "Specialized storage for sensitive electronics",
      isActive: true,
    },
    {
      name: "Regional Depot West",
      code: "WH-003",
      address: "789 Harbor Way, Los Angeles",
      description: "West coast distribution point",
      isActive: true,
    },
  ];

  const createdWarehouses: Record<string, string> = {};
  for (const warehouse of warehouses) {
    const created = await prisma.warehouse.upsert({
      where: { code: warehouse.code },
      update: {},
      create: warehouse,
    });
    createdWarehouses[warehouse.code] = created.id;
  }
  console.log('✓ Warehouses seeded');

  // ============================================
  // LOCATIONS (Hierarchical: Zone → Rack → Shelf → Bin)
  // ============================================
  
  // Main Distribution Center locations
  const wh1Id = createdWarehouses['WH-001']!;
  const wh2Id = createdWarehouses['WH-002']!;
  
  // Zone A
  const zoneA = await prisma.location.upsert({
    where: { warehouseId_code: { warehouseId: wh1Id, code: 'WH001-A' } },
    update: {},
    create: {
      name: 'Zone A - Electronics',
      code: 'WH001-A',
      type: LocationType.ZONE,
      warehouseId: wh1Id,
    },
  });

  const rackA1 = await prisma.location.upsert({
    where: { warehouseId_code: { warehouseId: wh1Id, code: 'WH001-A-R1' } },
    update: {},
    create: {
      name: 'Rack A1',
      code: 'WH001-A-R1',
      type: LocationType.RACK,
      parentId: zoneA.id,
      warehouseId: wh1Id,
    },
  });

  const shelfA1S1 = await prisma.location.upsert({
    where: { warehouseId_code: { warehouseId: wh1Id, code: 'WH001-A-R1-S1' } },
    update: {},
    create: {
      name: 'Shelf 1',
      code: 'WH001-A-R1-S1',
      type: LocationType.SHELF,
      parentId: rackA1.id,
      warehouseId: wh1Id,
    },
  });

  const binA1S1B1 = await prisma.location.upsert({
    where: { warehouseId_code: { warehouseId: wh1Id, code: 'WH001-A-R1-S1-B1' } },
    update: {},
    create: {
      name: 'Bin 1',
      code: 'WH001-A-R1-S1-B1',
      type: LocationType.BIN,
      capacity: 100,
      parentId: shelfA1S1.id,
      warehouseId: wh1Id,
    },
  });

  const binA1S1B2 = await prisma.location.upsert({
    where: { warehouseId_code: { warehouseId: wh1Id, code: 'WH001-A-R1-S1-B2' } },
    update: {},
    create: {
      name: 'Bin 2',
      code: 'WH001-A-R1-S1-B2',
      type: LocationType.BIN,
      capacity: 100,
      parentId: shelfA1S1.id,
      warehouseId: wh1Id,
    },
  });

  // Zone B
  const zoneB = await prisma.location.upsert({
    where: { warehouseId_code: { warehouseId: wh1Id, code: 'WH001-B' } },
    update: {},
    create: {
      name: 'Zone B - Energy',
      code: 'WH001-B',
      type: LocationType.ZONE,
      warehouseId: wh1Id,
    },
  });

  const rackB1 = await prisma.location.upsert({
    where: { warehouseId_code: { warehouseId: wh1Id, code: 'WH001-B-R1' } },
    update: {},
    create: {
      name: 'Rack B1',
      code: 'WH001-B-R1',
      type: LocationType.RACK,
      parentId: zoneB.id,
      warehouseId: wh1Id,
    },
  });

  const shelfB1S1 = await prisma.location.upsert({
    where: { warehouseId_code: { warehouseId: wh1Id, code: 'WH001-B-R1-S1' } },
    update: {},
    create: {
      name: 'Shelf 1',
      code: 'WH001-B-R1-S1',
      type: LocationType.SHELF,
      parentId: rackB1.id,
      warehouseId: wh1Id,
    },
  });

  const binB1S1B1 = await prisma.location.upsert({
    where: { warehouseId_code: { warehouseId: wh1Id, code: 'WH001-B-R1-S1-B1' } },
    update: {},
    create: {
      name: 'Bin 1',
      code: 'WH001-B-R1-S1-B1',
      type: LocationType.BIN,
      capacity: 500,
      parentId: shelfB1S1.id,
      warehouseId: wh1Id,
    },
  });

  // Electronics Hub locations (wh2Id already declared above)
  
  const zoneESD = await prisma.location.upsert({
    where: { warehouseId_code: { warehouseId: wh2Id, code: 'WH002-ESD' } },
    update: {},
    create: {
      name: 'ESD Safe Zone',
      code: 'WH002-ESD',
      type: LocationType.ZONE,
      warehouseId: wh2Id,
    },
  });

  const rackESD1 = await prisma.location.upsert({
    where: { warehouseId_code: { warehouseId: wh2Id, code: 'WH002-ESD-R1' } },
    update: {},
    create: {
      name: 'Rack ESD-1',
      code: 'WH002-ESD-R1',
      type: LocationType.RACK,
      parentId: zoneESD.id,
      warehouseId: wh2Id,
    },
  });

  console.log('✓ Locations seeded');

  // ============================================
  // STOCK ITEMS (Product quantities at locations)
  // ============================================
  const stockItems = [
    { productSku: 'PROD-001', locationCode: 'WH001-A-R1-S1-B1', quantity: 50 },
    { productSku: 'PROD-001', locationCode: 'WH001-A-R1-S1-B2', quantity: 74 },
    { productSku: 'PROD-002', locationCode: 'WH002-ESD-R1', quantity: 5 },
    { productSku: 'PROD-003', locationCode: 'WH001-B-R1-S1-B1', quantity: 850 },
    { productSku: 'PROD-005', locationCode: 'WH001-B-R1-S1-B1', quantity: 12 },
  ];

  for (const item of stockItems) {
    const product = await prisma.product.findUnique({ where: { sku: item.productSku } });
    const location = await prisma.location.findFirst({ where: { code: item.locationCode } });
    
    if (product && location) {
      await prisma.stockItem.upsert({
        where: { productId_locationId: { productId: product.id, locationId: location.id } },
        update: { quantity: item.quantity },
        create: {
          productId: product.id,
          locationId: location.id,
          quantity: item.quantity,
        },
      });
    }
  }
  console.log('✓ Stock items seeded');

  // ============================================
  // SAMPLE STOCK MOVEMENTS
  // ============================================
  const loc1 = await prisma.location.findFirst({ where: { code: 'WH001-A-R1-S1-B1' } });
  const loc2 = await prisma.location.findFirst({ where: { code: 'WH001-A-R1-S1-B2' } });
  const prod1 = await prisma.product.findUnique({ where: { sku: 'PROD-001' } });

  if (loc1 && loc2 && prod1) {
    await prisma.stockMovement.createMany({
      data: [
        {
          type: MovementType.IN,
          quantity: 100,
          reference: 'PO-2025-001',
          notes: 'Initial stock receipt',
          productId: prod1.id,
          toLocationId: loc1.id,
        },
        {
          type: MovementType.TRANSFER,
          quantity: 24,
          reference: 'TRF-2025-001',
          notes: 'Balancing stock between bins',
          productId: prod1.id,
          fromLocationId: loc1.id,
          toLocationId: loc2.id,
        },
        {
          type: MovementType.OUT,
          quantity: 26,
          reference: 'SO-2025-001',
          notes: 'Customer order fulfillment',
          productId: prod1.id,
          fromLocationId: loc1.id,
        },
      ],
    });
  }
  console.log('✓ Stock movements seeded');

  console.log('\n🚀 Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
