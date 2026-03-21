const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  const rows = await prisma.user.findMany({
    select: { email: true, role: true, status: true, password: true },
    take: 50,
  });

  const mapped = rows.map((r) => ({
    email: r.email,
    role: r.role,
    status: r.status,
    passwordNull: r.password == null,
    passwordPrefix: r.password ? String(r.password).slice(0, 10) : null,
  }));

  console.log(JSON.stringify(mapped, null, 2));
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
