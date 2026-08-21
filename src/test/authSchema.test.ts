import { describe, it, expect } from "vitest";
import { loginSchema, signupSchema } from "@/pages/Auth";

describe("loginSchema", () => {
  it("accepts a valid email and password", () => {
    const result = loginSchema.safeParse({ email: "test@example.com", password: "sifre123" });
    expect(result.success).toBe(true);
  });

  it("rejects an invalid email format", () => {
    const result = loginSchema.safeParse({ email: "not-an-email", password: "sifre123" });
    expect(result.success).toBe(false);
  });

  it("rejects an empty email", () => {
    const result = loginSchema.safeParse({ email: "", password: "sifre123" });
    expect(result.success).toBe(false);
  });

  it("rejects a password shorter than 6 characters", () => {
    const result = loginSchema.safeParse({ email: "test@example.com", password: "abc" });
    expect(result.success).toBe(false);
  });
});

describe("signupSchema", () => {
  const valid = {
    email: "test@example.com",
    password: "sifre123",
    fullName: "Ahmet Yılmaz",
    role: "farmer" as const,
  };

  it("accepts valid signup data", () => {
    expect(signupSchema.safeParse(valid).success).toBe(true);
  });

  it("rejects a full name shorter than 2 characters", () => {
    expect(signupSchema.safeParse({ ...valid, fullName: "A" }).success).toBe(false);
  });

  it("rejects a role outside farmer/buyer", () => {
    expect(signupSchema.safeParse({ ...valid, role: "admin" }).success).toBe(false);
  });
});
