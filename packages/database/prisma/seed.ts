import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
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

  for (const product of products) {
    await prisma.product.upsert({
      where: { sku: product.sku },
      update: {},
      create: product,
    });
  }

  console.log('Seed data inserted');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
