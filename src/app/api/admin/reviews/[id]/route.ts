import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminId, logAdmin } from "@/lib/admin";
import { recomputeCleanerRating } from "@/lib/reviews";

// PATCH /api/admin/reviews/[id] — ocultar/mostrar una reseña sin borrarla.
// Body: { action: "hide" | "show" }
// Las reseñas ocultas no se muestran a los hogares ni cuentan para la media.
export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const adminId = await getAdminId();
  if (!adminId) {
    return NextResponse.json({ error: "No autorizado." }, { status: 403 });
  }

  const { id } = params;
  const body = await req.json().catch(() => ({}));
  const action = String(body.action ?? "");
  if (action !== "hide" && action !== "show") {
    return NextResponse.json({ error: "Acción no válida." }, { status: 400 });
  }

  const review = await prisma.review.findUnique({ where: { id } });
  if (!review) {
    return NextResponse.json({ error: "Reseña no encontrada." }, { status: 404 });
  }

  const hidden = action === "hide";
  await prisma.review.update({ where: { id }, data: { hidden } });
  // La media se recalcula contando solo las visibles.
  await recomputeCleanerRating(review.cleanerUserId);

  await logAdmin({
    adminId,
    action: hidden ? "HIDE_REVIEW" : "SHOW_REVIEW",
    targetType: "REVIEW",
    targetId: id,
    detail: `${review.rating}★ sobre limpiadora ${review.cleanerUserId}`,
  });

  return NextResponse.json({ ok: true, hidden });
}

// DELETE /api/admin/reviews/[id] — borrado definitivo de una reseña.
export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const adminId = await getAdminId();
  if (!adminId) {
    return NextResponse.json({ error: "No autorizado." }, { status: 403 });
  }

  const { id } = params;
  const review = await prisma.review.findUnique({ where: { id } });
  if (!review) {
    return NextResponse.json({ error: "Reseña no encontrada." }, { status: 404 });
  }

  // Auditoría antes del borrado.
  await logAdmin({
    adminId,
    action: "DELETE_REVIEW",
    targetType: "REVIEW",
    targetId: id,
    detail: `${review.rating}★ sobre limpiadora ${review.cleanerUserId}`,
  });

  await prisma.review.delete({ where: { id } });
  await recomputeCleanerRating(review.cleanerUserId);

  return NextResponse.json({ ok: true });
}
