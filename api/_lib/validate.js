import { z } from "zod";

export const CreateBookingSchema = z.object({
  tripId: z.string().min(1),
  packageId: z.string().min(1),
  firstName: z.string().min(1).max(80),
  lastName: z.string().min(1).max(80),
  email: z.string().email(),
  phone: z.string().min(7).max(30),
  tshirtSize: z.enum(["XS","S","M","L","XL","XXL","3XL"]).or(z.string().min(1))
});
