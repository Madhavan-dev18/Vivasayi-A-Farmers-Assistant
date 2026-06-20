'use client';

import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { Plus } from 'lucide-react';
import { supabase } from '@/lib/supabase-client';

import { useAuth } from '@/context/AuthContext';
import { AppShell } from '@/components/layout/app-shell';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { indianDistricts } from '@/lib/indian-districts';
import { useLanguage } from '@/context/LanguageContext';

const formSchema = z.object({
  farmName: z.string().min(2, { message: 'Farm name must be at least 2 characters.' }),
  location: z.string().min(2, { message: 'Location is required.' }),
  district: z.string().min(1, { message: 'Please select a district.' }),
  sizeAcres: z.number().min(0.1, { message: 'Size must be at least 0.1 acres.' }),
  soilType: z.string().min(1, { message: 'Please select a soil type.' }),
  topography: z.string().min(1, { message: 'Please select topography.' }),
  waterSource: z.string().min(1, { message: 'Please select water source.' }),
});

type FormData = z.infer<typeof formSchema>;

export default function AddFarmPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { t } = useLanguage();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      farmName: '',
      location: '',
      district: '',
      sizeAcres: 0,
      soilType: '',
      topography: '',
      waterSource: '',
    },
  });

  const onSubmit = async (data: FormData) => {
    if (!user) {
      toast({
        variant: 'destructive',
        title: t('FarmsAddPage.authRequiredTitle'),
        description: t('FarmsAddPage.authRequiredDescription'),
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase.from('farms').insert({
        user_id: user.id, // Supabase uses .id not .uid
        name: data.farmName,
        area: data.sizeAcres.toString(),
        soil_type: data.soilType,
        location: data.location,
        district: data.district,
        topography: data.topography,
        water_source: data.waterSource,
      });

      if (error) throw error;

      toast({
        title: t('FarmsAddPage.successTitle'),
        description: `${data.farmName} has been added to your account.`,
      });
      router.push('/farms');
    } catch (error) {
      console.error('Error adding farm:', error);
      toast({
        variant: 'destructive',
        title: t('FarmsAddPage.errorTitle'),
        description: t('FarmsAddPage.errorDescription'),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AppShell>
      <div className="flex-1 p-4 md:p-6">
        <div className="mb-6">
          <h1 className="font-headline text-3xl font-bold">{t('FarmsAddPage.title')}</h1>
          <p className="text-muted-foreground">
            {t('FarmsAddPage.description')}
          </p>
        </div>

        <Card className="max-w-2xl">
          <CardHeader>
            <CardTitle>{t('FarmsAddPage.cardTitle')}</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="farmName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('FarmsAddPage.farmNameLabel')}</FormLabel>
                        <FormControl>
                          <Input placeholder={t('FarmsAddPage.farmNamePlaceholder')} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="sizeAcres"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('FarmsAddPage.sizeLabel')}</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.1"
                            placeholder={t('FarmsAddPage.sizePlaceholder')}
                            {...field}
                            onChange={(e) =>
                              field.onChange(parseFloat(e.target.value) || 0)
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('FarmsAddPage.locationLabel')}</FormLabel>
                      <FormControl>
                        <Input placeholder={t('FarmsAddPage.locationPlaceholder')} {...field} />
                      </FormControl>
                      <FormDescription>
                        {t('FarmsAddPage.locationDescription')}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="district"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('FarmsAddPage.districtLabel')}</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={t('FarmsAddPage.districtPlaceholder')} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {indianDistricts.map((d) => (
                            <SelectItem key={d} value={d.split(',')[0]}>
                              {d}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="soilType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('FarmsAddPage.soilTypeLabel')}</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder={t('FarmsAddPage.soilTypePlaceholder')} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Alluvial">Alluvial</SelectItem>
                            <SelectItem value="Black">Black (Regur)</SelectItem>
                            <SelectItem value="Red and Yellow">Red and Yellow</SelectItem>
                            <SelectItem value="Laterite">Laterite</SelectItem>
                            <SelectItem value="Sandy">Sandy</SelectItem>
                            <SelectItem value="Clay">Clay</SelectItem>
                            <SelectItem value="Loamy">Loamy</SelectItem>
                            <SelectItem value="Other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="topography"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('FarmsAddPage.topographyLabel')}</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder={t('FarmsAddPage.topographyPlaceholder')} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Flat">Flat</SelectItem>
                            <SelectItem value="Gentle Slope">Gentle Slope</SelectItem>
                            <SelectItem value="Steep Slope">Steep Slope</SelectItem>
                            <SelectItem value="Hilly">Hilly</SelectItem>
                            <SelectItem value="Valley">Valley</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="waterSource"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('FarmsAddPage.waterSourceLabel')}</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder={t('FarmsAddPage.waterSourcePlaceholder')} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Well/Borewell">Well/Borewell</SelectItem>
                            <SelectItem value="Canal">Canal</SelectItem>
                            <SelectItem value="River">River</SelectItem>
                            <SelectItem value="Rainwater">Rainwater</SelectItem>
                            <SelectItem value="Drip Irrigation">Drip Irrigation</SelectItem>
                            <SelectItem value="Sprinkler">Sprinkler</SelectItem>
                            <SelectItem value="Other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex gap-4">
                  <Button type="button" variant="outline" onClick={() => router.back()}>
                    {t('FarmsAddPage.cancel')}
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>{t('FarmsAddPage.addingFarm')}</>
                    ) : (
                      <>
                        <Plus className="mr-2 h-4 w-4" />
                        {t('FarmsAddPage.addFarm')}
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
