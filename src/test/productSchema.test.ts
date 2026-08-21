import { describe, it, expect } from "vitest";
import { productSchema } from "@/components/ProductForm";

const validBase = {
  title: "Antalya Domatesi",
  category_slug: "sebzeler",
  description: "Taze ve organik yetiştirilen domatesler.",
  stock: "500 kg",
  min_order: "10 kg",
  city: "Antalya",
  district: "Kumluca",
  harvest_date: "Mart 2026",
  price_type: "kg" as const,
  price: 45,
  is_organic: true,
};

describe("productSchema", () => {
  it("accepts a fully valid product", () => {
    const result = productSchema.safeParse(validBase);
    expect(result.success).toBe(true);
  });

  it("rejects a title shorter than 3 characters", () => {
    const result = productSchema.safeParse({ ...validBase, title: "Ab" });
    expect(result.success).toBe(false);
  });

  it("rejects a description shorter than 10 characters", () => {
    const result = productSchema.safeParse({ ...validBase, description: "kısa" });
    expect(result.success).toBe(false);
  });

  it("requires a positive price when price_type is kg", () => {
    const result = productSchema.safeParse({ ...validBase, price: "" });
    expect(result.success).toBe(false);
  });

  it("requires a positive price when price_type is ton", () => {
    const result = productSchema.safeParse({ ...validBase, price_type: "ton", price: -5 });
    expect(result.success).toBe(false);
  });

  it("does not require a price when price_type is negotiable", () => {
    const result = productSchema.safeParse({ ...validBase, price_type: "negotiable", price: "" });
    expect(result.success).toBe(true);
  });

  it("does not require a price when price_type is quote", () => {
    const result = productSchema.safeParse({ ...validBase, price_type: "quote", price: "" });
    expect(result.success).toBe(true);
  });

  it("rejects an unknown category", () => {
    const result = productSchema.safeParse({ ...validBase, category_slug: "" });
    expect(result.success).toBe(false);
  });

  it("rejects a missing city or district", () => {
    expect(productSchema.safeParse({ ...validBase, city: "" }).success).toBe(false);
    expect(productSchema.safeParse({ ...validBase, district: "" }).success).toBe(false);
  });
});
