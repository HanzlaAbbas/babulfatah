import { z } from 'zod';

export const checkoutSchema = z.object({
  fullName: z.string().min(2, 'Full name is required').max(100),
  phone: z
    .string()
    .min(7, 'Phone number is required')
    .max(20, 'Phone number is too long')
    .regex(/^[+]?[\d\s-()]+$/, 'Enter a valid phone number'),
  city: z.string().min(2, 'City is required').max(100),
  address: z.string().min(5, 'Address is required').max(500),
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;
