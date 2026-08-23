import { prisma } from "@/lib/prisma";

export function getOwnedResume(userId: string, resumeId: string) {
  return prisma.resume.findFirst({
    where: { id: resumeId, userId },
    include: {
      experiences: { orderBy: { sortOrder: "asc" } },
      education: { orderBy: { sortOrder: "asc" } },
      skills: { orderBy: { name: "asc" } },
    },
  });
}
