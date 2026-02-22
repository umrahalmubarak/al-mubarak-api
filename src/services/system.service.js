import prisma from "../config/prisma.js";


// Reset Database or delete database
export const resetDatabaseService = async () => {
  return prisma.$transaction([
    prisma.payment.deleteMany(),
    prisma.tourMember.deleteMany(),
    prisma.member.deleteMany(),
    prisma.tourPackage.deleteMany(),
    prisma.enquiryForm.deleteMany(),
    prisma.user.deleteMany({
      where: {
        role: {
          notIn: ["SUPERADMIN", "ADMIN"],
        },
      },
    }),
  ]);
};

// Get system settings
export const getSystemSettingsService = async () => {
  let settings = await prisma.systemSettings.findFirst();

  // If not exists, create default
  if (!settings) {
    settings = await prisma.systemSettings.create({
      data: {
        businessName: "Al Mubarak Travels",
        logoUrl: null,
      },
    });
  }

  return settings;
};

// Update system settings
export const updateSystemSettingsService = async (data) => {
  const existing = await prisma.systemSettings.findFirst();

  if (!existing) {
    return prisma.systemSettings.create({
      data,
    });
  }

  return prisma.systemSettings.update({
    where: { id: existing.id },
    data,
  });
};