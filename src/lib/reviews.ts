import { prisma } from "./prisma";

// Recalcula y guarda la valoración media y el número de reseñas de una limpiadora,
// contando SOLO las reseñas visibles (hidden = false). Se llama al crear una reseña
// y cuando el admin oculta/muestra/elimina una.
export async function recomputeCleanerRating(cleanerUserId: string) {
  const agg = await prisma.review.aggregate({
    where: { cleanerUserId, hidden: false },
    _avg: { rating: true },
    _count: true,
  });
  await prisma.cleanerProfile.update({
    where: { userId: cleanerUserId },
    data: {
      ratingAvg: agg._avg.rating ?? 0,
      ratingCount: agg._count,
    },
  });
}
