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
import { useLanguage } from '@/context/LanguageContext';

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  soilType: z.string().min(2, 'Please enter your primary soil type'),
  soilReport: z.any().optional(),
});

type FormData = z.infer<typeof registerSchema>;

export function RegisterForm() {
  const { toast } = useToast();
  const { t } = useLanguage();
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
      if (soilReportFile && authData.user && authData.session) {
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
            title: t('RegisterForm.uploadFailedTitle'),
            description: t('RegisterForm.uploadFailedDescription'),
            variant: 'destructive',
          });
        }
      } else if (soilReportFile && !authData.session) {
          toast({
              title: "Report Upload Skipped",
              description: "Please verify your email first. You can upload the report from your profile later.",
          });
      }

      form.reset();

      // Supabase's default project setting requires email confirmation
      // before a session exists. In that case authData.session is null
      // even though signUp succeeded — sending the user to /dashboard
      // right now would just bounce them straight to /login via
      // middleware. Branch on session presence instead of assuming one.
      if (authData.session) {
        toast({
          title: t('RegisterForm.successTitle'),
          description: t('RegisterForm.successDescription'),
        });
        router.push('/dashboard');
      } else {
        toast({
          title: t('RegisterForm.checkEmailTitle'),
          description: t('RegisterForm.checkEmailDescription'),
        });
        router.push('/login');
      }
    } catch (error: any) {
      console.error('Signup failed:', error);
      toast({
        title: t('RegisterForm.errorTitle'),
        description: error.message || t('RegisterForm.errorDescription'),
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
              <FormLabel>{t('RegisterForm.nameLabel')}</FormLabel>
              <FormControl>
                <Input placeholder={t('RegisterForm.namePlaceholder')} {...field} />
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
              <FormLabel>{t('RegisterForm.emailLabel')}</FormLabel>
              <FormControl>
                <Input type="email" placeholder={t('RegisterForm.emailPlaceholder')} {...field} />
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
              <FormLabel>{t('RegisterForm.passwordLabel')}</FormLabel>
              <FormControl>
                <Input type="password" {...field} />
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
              <FormLabel>{t('RegisterForm.soilTypeLabel')}</FormLabel>
              <FormControl>
                <Input placeholder={t('RegisterForm.soilTypePlaceholder')} {...field} />
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
              <FormLabel>{t('RegisterForm.soilReportLabel')}</FormLabel>
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
          {isLoading ? t('RegisterForm.creatingAccount') : t('RegisterForm.registerButton')}
        </Button>
      </form>
    </Form>
  );
}
