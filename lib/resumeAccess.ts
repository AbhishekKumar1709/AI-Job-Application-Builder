import { prisma } from "@/lib/prisma";

export function getOwnedResume(userId: string, resumeId: string) {
  return prisma.resume.findFirst({
    where: { id: resumeId, userId },
    include: {
      experiences: { orderBy: { startDate: "desc" } },
      education: { orderBy: { startDate: "desc" } },
      skills: { orderBy: { name: "asc" } },
    },
  });
}
