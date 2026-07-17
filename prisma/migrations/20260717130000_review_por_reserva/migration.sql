-- Una reseña por reserva.
-- Review no estaba atada a ninguna reserva y la API solo comprobaba que
-- existiera ALGUNA reserva completada con esa limpiadora, así que un hogar podía
-- crear reseñas en bucle y controlar la media y el número de valoraciones de
-- cualquier limpiadora (y con ello su orden en el listado).

ALTER TABLE "Review" ADD COLUMN "bookingId" TEXT;

-- El índice único es lo que impide de raíz la segunda reseña de una reserva.
-- Postgres admite varios NULL en un índice único, así que las reseñas antiguas
-- (sin reserva asociada) conviven sin chocar entre ellas.
CREATE UNIQUE INDEX "Review_bookingId_key" ON "Review"("bookingId");

ALTER TABLE "Review" ADD CONSTRAINT "Review_bookingId_fkey"
  FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Sin backfill: emparejar a ciegas cada reseña vieja con una reserva sería
-- inventarse a cuál se refiere, y donde hubo abuso habría varias reseñas
-- compitiendo por la misma. Se quedan con bookingId NULL; el admin ya puede
-- ocultarlas una a una desde /admin.
