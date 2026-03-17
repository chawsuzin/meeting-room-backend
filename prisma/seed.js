const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  await prisma.user.createMany({
    data: [
      { name: "Admin", role: "ADMIN" },
      { name: "Owner", role: "OWNER" },
      { name: "User", role: "USER" },
    ],
  });

  console.log("Users seeded");
}

main().finally(() => prisma.$disconnect());
