'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { supabase } from '@/lib/supabase-client';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { uploadImage } from '@/lib/storage';

// ----------------------------------------------------------------------
// 1. ZOD SCHEMA
// ----------------------------------------------------------------------
const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  soilType: z.string().min(2, 'Please enter your primary soil type'),
  soilReport: z.any().optional(),
});

type FormData = z.infer<typeof registerSchema>;

const t = {
  nameLabel: 'Full Name',
  emailLabel: 'Email Address',
  passwordLabel: 'Password',
  soilTypeLabel: 'Primary Soil Type',
  soilReportLabel: 'Upload Soil Report (Optional)',
  submit: 'Sign Up for Vivasayi',
};

export function RegisterForm() {
  const { toast } = useToast();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      soilType: '',
    },
  });

  // ----------------------------------------------------------------------
  // SUBMIT HANDLER
  // ----------------------------------------------------------------------
  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    try {
      const { data: authData, error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            name: data.name,
            soilType: data.soilType,
          },
        },
      });

      if (error) throw error;

      // Upload the soil report now that we have a real user ID. We store
      // the storage PATH (not a public URL — the bucket is private), and
      // generate a signed URL on demand later via getSignedFileUrl().
      const soilReportFile: File | undefined = data.soilReport?.[0];
      if (soilReportFile && authData.user) {
        try {
          const soilReportPath = await uploadImage(
            soilReportFile,
            authData.user.id,
            'soil-reports'
          );
          await supabase.auth.updateUser({
            data: { soilReportPath },
          });
        } catch (uploadError) {
          console.error('Soil report upload failed:', uploadError);
          toast({
            title: 'Soil Report Upload Failed',
            description:
              'Your account was created, but the soil report could not be uploaded. You can add it later from your profile.',
            variant: 'destructive',
          });
        }
      }

      form.reset();

      // Supabase's default project setting requires email confirmation
      // before a session exists. In that case authData.session is null
      // even though signUp succeeded — sending the user to /dashboard
      // right now would just bounce them straight to /login via
      // middleware. Branch on session presence instead of assuming one.
      if (authData.session) {
        toast({
          title: 'Registration Successful 🌾',
          description: 'Your account has been created successfully.',
        });
        router.push('/dashboard');
      } else {
        toast({
          title: 'Check your email 📧',
          description:
            "We've sent a confirmation link to your email. Verify your account, then log in.",
        });
        router.push('/login');
      }
    } catch (error: any) {
      console.error('Signup failed:', error);
      toast({
        title: 'Registration Error',
        description: error.message || 'Failed to register. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t.nameLabel}</FormLabel>
              <FormControl>
                <Input placeholder="Enter your full name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t.emailLabel}</FormLabel>
              <FormControl>
                <Input type="email" placeholder="farmer@vivasayi.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t.passwordLabel}</FormLabel>
              <FormControl>
                <Input type="password" placeholder="Create a secure password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="soilType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t.soilTypeLabel}</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Red Soil, Black Cotton" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="soilReport"
          render={({ field: { value, onChange, ...fieldProps } }) => (
            <FormItem>
              <FormLabel>{t.soilReportLabel}</FormLabel>
              <FormControl>
                <Input
                  {...fieldProps}
                  type="file"
                  accept=".pdf,image/*"
                  onChange={(e) => {
                    onChange(e.target.files);
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? 'Creating Account...' : t.submit}
        </Button>
      </form>
    </Form>
  );
}
