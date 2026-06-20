'use client';

import { useState, useTransition } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import {
  BrainCircuit,
  Leaf,
  LoaderCircle,
  ShieldAlert,
  Thermometer,
} from 'lucide-react';

import { getCropRecommendations, type CropRecommendationOutput } from '@/ai/flows/crop-recommendations';
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
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { useToast } from '@/hooks/use-toast';
import { SpeakButton } from './speak-button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { indianDistricts } from '@/lib/indian-districts';
import { useLanguage } from '@/context/LanguageContext';
import { getLanguageMeta } from '@/lib/languages';

const formSchema = z.object({
  soilAnalysis: z
    .string()
    .min(10, { message: 'Please provide detailed soil analysis.' }),
  weatherData: z
    .string()
    .min(10, { message: 'Please provide detailed weather data.' }),
  district: z.string().min(1, { message: 'Please select a district.' }),
  season: z.string().min(1, { message: 'Please select a season.' }),
  topography: z.string().min(1, { message: 'Please select the field topography.' }),
  cropHistory1: z.string().optional(),
  cropHistory2: z.string().optional(),
  cropHistory3: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

export default function CropRecommendationForm() {
  const { t, language } = useLanguage();
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<CropRecommendationOutput | null>(null);
  const { toast } = useToast();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      soilAnalysis: '',
      weatherData: '',
      district: '',
      season: '',
      topography: '',
      cropHistory1: '',
      cropHistory2: '',
      cropHistory3: '',
    },
  });

  const onSubmit = (data: FormData) => {
    startTransition(async () => {
      setResult(null);
      try {
        const res = await getCropRecommendations({
          ...data,
          language: getLanguageMeta(language).englishName,
        });
        if (res) {
          setResult(res);
        } else {
          toast({
            variant: 'destructive',
            title: 'Error',
            description: 'Failed to get recommendations. Please try again.',
          });
        }
      } catch (error: any) {
        console.error('AI Error:', error);
        toast({
          variant: 'destructive',
          title: 'Analysis Failed',
          description: error.message || 'Failed to get recommendations. Please try again.',
        });
      }
    });
  };

  const commonCrops = ["Rice", "Wheat", "Maize", "Cotton", "Sugarcane", "Soybean", "Potato", "None"];

  return (
    <div className="grid gap-8 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>{t('CropRecommendationForm.farmDataTitle')}</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="district"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('CropRecommendationForm.districtLabel')}</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={t('CropRecommendationForm.districtPlaceholder')} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {indianDistricts.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="season"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('CropRecommendationForm.seasonLabel')}</FormLabel>
                       <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={t('CropRecommendationForm.seasonPlaceholder')} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Kharif">{t('CropRecommendationForm.kharif')}</SelectItem>
                          <SelectItem value="Rabi">{t('CropRecommendationForm.rabi')}</SelectItem>
                          <SelectItem value="Summer">{t('CropRecommendationForm.summer')}</SelectItem>
                          <SelectItem value="Whole Year">{t('CropRecommendationForm.wholeYear')}</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

               <FormField
                  control={form.control}
                  name="topography"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('CropRecommendationForm.topographyLabel')}</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={t('CropRecommendationForm.topographyPlaceholder')} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Flat">{t('CropRecommendationForm.flat')}</SelectItem>
                          <SelectItem value="Gentle Slope">{t('CropRecommendationForm.gentleSlope')}</SelectItem>
                          <SelectItem value="Steep Slope">{t('CropRecommendationForm.steepSlope')}</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div>
                    <FormLabel>{t('CropRecommendationForm.cropHistoryLabel')}</FormLabel>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
                        <FormField
                        control={form.control}
                        name="cropHistory1"
                        render={({ field }) => (
                            <FormItem>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                <SelectTrigger>
                                    <SelectValue placeholder={t('CropRecommendationForm.season1Placeholder')} />
                                </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {commonCrops.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                                </SelectContent>
                            </Select>
                            </FormItem>
                        )}
                        />
                        <FormField
                        control={form.control}
                        name="cropHistory2"
                        render={({ field }) => (
                            <FormItem>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                <SelectTrigger>
                                    <SelectValue placeholder={t('CropRecommendationForm.season2Placeholder')} />
                                </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {commonCrops.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                                </SelectContent>
                            </Select>
                            </FormItem>
                        )}
                        />
                        <FormField
                        control={form.control}
                        name="cropHistory3"
                        render={({ field }) => (
                            <FormItem>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                <SelectTrigger>
                                    <SelectValue placeholder={t('CropRecommendationForm.season3Placeholder')} />
                                </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {commonCrops.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                                </SelectContent>
                            </Select>
                            </FormItem>
                        )}
                        />
                    </div>
                    <FormDescription className="mt-2">
                        {t('CropRecommendationForm.cropHistoryDescription')}
                    </FormDescription>
                </div>

              <FormField
                control={form.control}
                name="soilAnalysis"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('CropRecommendationForm.soilAnalysisLabel')}</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder={t('CropRecommendationForm.soilAnalysisPlaceholder')}
                        {...field}
                        rows={4}
                      />
                    </FormControl>
                    <FormDescription>
                      {t('CropRecommendationForm.soilAnalysisDescription')}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="weatherData"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('CropRecommendationForm.weatherDataLabel')}</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder={t('CropRecommendationForm.weatherDataPlaceholder')}
                        {...field}
                        rows={4}
                      />
                    </FormControl>
                    <FormDescription>
                      {t('CropRecommendationForm.weatherDataDescription')}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <Button type="submit" disabled={isPending} className="w-full">
                {isPending ? (
                  <>
                    <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                    {t('CropRecommendationForm.analyzing')}
                  </>
                ) : (
                  <>
                    <BrainCircuit className="mr-2 h-4 w-4" />
                    {t('CropRecommendationForm.getRecommendations')}
                  </>
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
      
      <div className="space-y-4">
        <h2 className="font-headline text-2xl font-bold">{t('CropRecommendationForm.recommendationsTitle')}</h2>
        {isPending && (
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-center">
                <LoaderCircle className="h-8 w-8 animate-spin text-primary" />
                <p className="ml-4 text-muted-foreground">{t('CropRecommendationForm.generating')}</p>
              </div>
            </CardContent>
          </Card>
        )}
        {result && (
          <Accordion type="single" collapsible defaultValue="item-1" className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger className="text-lg font-semibold">
                <Leaf className="mr-2 size-5 text-green-600" />{t('CropRecommendationForm.recommendedCrops')}
              </AccordionTrigger>
              <AccordionContent className="prose prose-sm max-w-none p-2 text-foreground">
                <div className="flex items-start gap-2">
                  <p className="flex-1">{result.recommendedCrops}</p>
                  <SpeakButton textToSpeak={result.recommendedCrops} />
                </div>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
              <AccordionTrigger className="text-lg font-semibold">
                <Thermometer className="mr-2 size-5 text-red-500" />{t('CropRecommendationForm.plantingInstructions')}
              </AccordionTrigger>
              <AccordionContent className="prose prose-sm max-w-none p-2 text-foreground">
                <div className="flex items-start gap-2">
                  <p className="flex-1">{result.plantingInstructions}</p>
                  <SpeakButton textToSpeak={result.plantingInstructions} />
                </div>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3">
              <AccordionTrigger className="text-lg font-semibold">
                <ShieldAlert className="mr-2 size-5 text-yellow-600" />{t('CropRecommendationForm.riskAssessment')}
              </AccordionTrigger>
              <AccordionContent className="prose prose-sm max-w-none p-2 text-foreground">
                <div className="flex items-start gap-2">
                  <p className="flex-1">{result.riskAssessment}</p>
                  <SpeakButton textToSpeak={result.riskAssessment} />
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        )}
        {!isPending && !result && (
            <Card className="flex h-64 items-center justify-center">
              <CardContent className="p-6 text-center text-muted-foreground">
                <BrainCircuit className="mx-auto h-12 w-12" />
                <p className="mt-4">{t('CropRecommendationForm.placeholder')}</p>
              </CardContent>
            </Card>
        )}
      </div>
    </div>
  );
}