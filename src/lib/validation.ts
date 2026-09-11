import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

export const EmailSchema = z.string().email({ message: "সঠিক ইমেইল দিন." });
export const PasswordSchema = z
  .string()
  .min(8, { message: "পাসওয়ার্ড কমপক্ষে ৮ অক্ষর হতে হবে." });
export const UUIDSchema = z.string().uuid({ message: "সঠিক ID দিন." });

export const CreateCurriculumSubjectSchema = z.object({
  classId: UUIDSchema,
  name: z
    .string({ required_error: "English name দিন" })
    .trim()
    .min(2, "English name কমপক্ষে ২ অক্ষর")
    .max(100, "English name সর্বোচ্চ ১০০ অক্ষর"),
  nameBn: z
    .string({ required_error: "বাংলা নাম দিন" })
    .trim()
    .min(1, "বাংলা নাম দিন")
    .max(100, "বাংলা নাম সর্বোচ্চ ১০০ অক্ষর"),
  slug: z
    .string({ required_error: "Slug দিন" })
    .trim()
    .min(2, "Slug কমপক্ষে ২ অক্ষর")
    .max(80, "Slug সর্বোচ্চ ৮০ অক্ষর")
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Slug শুধু small letter, number ও hyphen — শুরু/শেষে hyphen নয়",
    ),
  description: z
    .string()
    .max(1000, "বিবরণ সর্বোচ্চ ১০০০ অক্ষর")
    .optional()
    .or(z.literal("")),
  icon: z.string().max(50).optional(),
  color: z.string().max(100).optional(),
  thumbnailUrl: z.string().url("সঠিক URL দিন").optional().or(z.literal("")),
  isMandatory: z.boolean().optional(),
  orderIndex: z
    .number({ invalid_type_error: "Order সংখ্যা হতে হবে" })
    .int("Order পূর্ণ সংখ্যা হতে হবে")
    .min(0, "Order ০ বা তার বেশি")
    .max(999, "Order সর্বোচ্চ ৯৯৯")
    .optional(),
});
