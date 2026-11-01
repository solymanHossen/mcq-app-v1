import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  role: z.enum(['STUDENT', 'TEACHER']).optional().default('STUDENT'),
  institution: z.string().max(150).optional(),
  department: z.string().max(100).optional(),
  bio: z.string().max(1000).optional(),
});

export const teacherApplicationSchema = z.object({
  institution: z.string().min(2, 'Institution name must be at least 2 characters').max(150),
  department: z.string().min(2, 'Subject or department must be at least 2 characters').max(100),
  bio: z.string().min(10, 'Please provide qualification background (min 10 characters)').max(1000),
});

export const verifyEmailSchema = z.object({
  email: z.string().email('Enter a valid email address'),
  otp: z.string().regex(/^\d{6}$/, 'OTP must be 6 digits'),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email('Enter a valid email address'),
});

export const resetPasswordSchema = z
  .object({
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string().min(8, 'Confirm your password'),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });