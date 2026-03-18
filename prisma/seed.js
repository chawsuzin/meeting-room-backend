const prisma = require("../database");

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

main()
  .catch((e) => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });