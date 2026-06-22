-- Moderación de reseñas: campo para ocultar una reseña sin borrarla.
-- Las reseñas ocultas no se muestran a los hogares ni cuentan para la media.

ALTER TABLE "Review" ADD COLUMN "hidden" BOOLEAN NOT NULL DEFAULT false;

CREATE INDEX "Review_cleanerUserId_hidden_idx" ON "Review"("cleanerUserId", "hidden");
