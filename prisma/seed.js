import prisma from "../src/config/prisma.js";
import bcrypt from "bcryptjs";

async function main() {
  const email = "superadmin@almubarak.com";
  const password = "SuperAdmin123"; // change later
  const name = "Super Admin";

  const existing = await prisma.user.findUnique({ where: { email } });

  if (existing) {
    console.log("SUPERADMIN already exists");
    return;
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  await prisma.user.create({
    data: {
      email,
      name,
      password: hashedPassword,
      role: "SUPERADMIN",
    },
  });

  console.log("SUPERADMIN created successfully");
}

main()
  .catch((e) => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });