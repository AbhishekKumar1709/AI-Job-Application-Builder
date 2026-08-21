import { prisma } from "@/lib/prisma";

export async function getOrCreateProfile(userId: string) {
  const existing = await prisma.profile.findUnique({ where: { userId } });
  if (existing) {
    return existing;
  }
  return prisma.profile.create({ data: { userId } });
}
