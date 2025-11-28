-- CreateIndex
CREATE INDEX "Availability_providerId_day_of_week_idx" ON "Availability"("providerId", "day_of_week");

-- CreateIndex
CREATE INDEX "Booking_status_end_time_idx" ON "Booking"("status", "end_time");

-- CreateIndex
CREATE INDEX "Booking_clientId_idx" ON "Booking"("clientId");

-- CreateIndex
CREATE INDEX "Booking_serviceVariationId_idx" ON "Booking"("serviceVariationId");

-- CreateIndex
CREATE INDEX "Booking_start_time_end_time_idx" ON "Booking"("start_time", "end_time");

-- CreateIndex
CREATE INDEX "Review_serviceId_idx" ON "Review"("serviceId");

-- CreateIndex
CREATE INDEX "Service_providerId_idx" ON "Service"("providerId");
