import { z } from "zod";

export const createCategorySchema = z.object({
  name: z.string().min(1, "Category name is required").max(100),
  slug: z.string().min(1, "Slug is required").max(100).regex(/^[a-z0-9-]+$/, "Slug must be lowercase letters, numbers, and hyphens only"),
  parentId: z.string().uuid("Invalid parent category ID").nullable().optional(),
});

export const updateCategorySchema = createCategorySchema.partial().omit({}).extend({
  name: z.string().min(1).max(100).optional(),
  slug: z.string().min(1).max(100).regex(/^[a-z0-9-]+$/).optional(),
});

export const createProductSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  slug: z.string().min(1, "Slug is required").max(200).regex(/^[a-z0-9-]+$/, "Slug must be lowercase letters, numbers, and hyphens only"),
  description: z.string().min(1, "Description is required"),
  price: z.coerce.number().positive("Price must be a positive number"),
  stock: z.coerce.number().int().min(0, "Stock cannot be negative").default(0),
  sku: z.string().max(50).optional().nullable(),
  authorId: z.string().uuid("Invalid author ID").optional().nullable(),
  language: z.enum(["URDU", "ARABIC", "ENGLISH", "PUNJABI", "SPANISH"]).default("URDU"),
  categoryId: z.string().min(1, "Category is required"),
  imageUrl: z.string().url("Must be a valid URL").optional().nullable(),
});

export const updateProductSchema = createProductSchema.partial();

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
