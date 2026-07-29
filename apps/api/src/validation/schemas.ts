import { z } from "zod";

const productCategorySchema = z.enum([
  "Equipment",
  "Clothing",
  "Footwear",
  "Accessories",
  "Support",
  "Fitness technology",
]);

export const productQuerySchema = z.object({
  q: z.string().optional(),
  sport: z.string().optional(),
  category: productCategorySchema.optional(),
  ageGroup: z.enum(["45-55", "55+", "all-45+"]).optional(),
  experienceLevel: z
    .enum(["Beginner", "Intermediate", "Experienced", "All"])
    .optional(),
  minPrice: z.coerce.number().nonnegative().optional(),
  maxPrice: z.coerce.number().nonnegative().optional(),
  sort: z
    .enum(["price_asc", "price_desc", "rating_desc", "name_asc"])
    .default("name_asc"),
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(20),
});

export const recommendationsBodySchema = z
  .object({
    ageGroup: z.enum(["45-55", "55+"]),
    primarySport: z.string().min(1),
    additionalSports: z.array(z.string()).default([]),
    productType: z.union([
      productCategorySchema,
      z.array(productCategorySchema).min(1),
    ]),
    experienceLevel: z.enum(["Beginner", "Intermediate", "Experienced"]),
    budgetMin: z.number().nonnegative(),
    budgetMax: z.number().nonnegative(),
    preferredBenefits: z.array(z.string()).default([]),
  })
  .superRefine((value, ctx) => {
    if (value.budgetMax < value.budgetMin) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "budgetMax must be greater than or equal to budgetMin",
        path: ["budgetMax"],
      });
    }
  });

export const addToCartSchema = z.object({
  sessionId: z.string().min(1),
  productId: z.string().min(1),
  quantity: z.number().int().positive().default(1),
  size: z.string().optional(),
  color: z.string().optional(),
});

export const updateCartSchema = z.object({
  sessionId: z.string().min(1),
  productId: z.string().min(1),
  quantity: z.number().int().nonnegative(),
  size: z.string().optional(),
  color: z.string().optional(),
});

export const removeFromCartSchema = z.object({
  sessionId: z.string().min(1),
  productId: z.string().min(1),
  size: z.string().optional(),
  color: z.string().optional(),
});

export const shippingAddressSchema = z.object({
  line1: z.string().min(1),
  line2: z.string().optional(),
  city: z.string().min(1),
  postalCode: z.string().min(1),
  state: z.string().optional(),
  country: z.string().optional(),
});

export const createOrderSchema = z.object({
  sessionId: z.string().min(1),
  items: z
    .array(
      z.object({
        productId: z.string().min(1),
        quantity: z.number().int().positive(),
        size: z.string().optional(),
        color: z.string().optional(),
      }),
    )
    .optional(),
  customer: z.object({
    name: z.string().min(1),
    email: z.string().email(),
    phone: z.string().optional(),
    shippingAddress: shippingAddressSchema,
  }),
});

export const createPaymentSchema = z.object({
  orderId: z.string().min(1),
});

export const confirmPaymentSchema = z.object({
  paymentId: z.string().min(1),
  orderId: z.string().min(1),
});
