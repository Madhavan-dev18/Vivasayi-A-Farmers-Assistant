'use client';

import React, { useState, useTransition, useRef } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import * as LucideIcons from 'lucide-react';
import { BrainCircuit, LoaderCircle, Calendar, FileDown, Upload, Save, type LucideIcon } from 'lucide-react';

import { getPersonalizedCultivationPlan } from '@/ai/flows/personalized-space-flow';
import { 
    type PersonalizedCultivationPlanOutput,
    type WeeklyTask,
    type DailyTask,
} from '@/ai/schemas/personalized-space-schema';

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
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import {indianDistricts} from '@/lib/indian-districts';
import { Progress } from '../ui/progress';
import { ScrollArea, ScrollBar } from '../ui/scroll-area';
import { SpeakButton } from './speak-button';
import WeatherCard from './weather-card';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase-client';

const formSchema = z.object({
  crop: z.string().min(2, { message: 'Please specify the crop.' }),
  district: z.string().min(1, { message: 'Please select a district.' }),
  sowingDate: z.string().min(1, { message: 'Please select a sowing date.' }),
  soilReport: z.any().optional(),
});

type FormData = z.infer<typeof formSchema>;

function getWeekOfSowing(sowingDate: string): number {
    const start = new Date(sowingDate);
    const now = new Date();
    const diff = now.getTime() - start.getTime();
    if (diff < 0) return 1;
    const week = Math.floor(diff / (1000 * 60 * 60 * 24 * 7)) + 1;
    return week;
}

const DynamicIcon = ({ name, className }: { name: string; className?: string }) => {
    const Icon = LucideIcons[name as keyof typeof LucideIcons] as LucideIcon | undefined;
    if (!Icon || typeof Icon !== 'function') {
        return <LucideIcons.Check className={cn("size-8 text-muted-foreground", className)} />;
    }
    return <Icon className={cn("size-8", className)} />;
};


export default function PersonalizedSpace() {
  const t = {
    formTitle: "Cultivation Details",
    formDescription: "Provide your farm's details to generate a plan.",
    cropLabel: "Crop to Cultivate",
    cropPlaceholder: "e.g., Tomato, Wheat",
    districtLabel: "District",
    districtPlaceholder: "Select your district",
    sowingDateLabel: "Planned Sowing Date",
    sowingDateDescription: "This helps track your weekly progress.",
    soilReportLabel: "Soil Health Report (Optional)",
    soilReportPlaceholder: "Upload PDF or Image",
    soilReportDescription: "Uploading a report provides more accurate advice.",
    getPlan: "Generate Cultivation Plan",
    generatingPlan: "Generating Plan...",
    planTitle: "Your Cultivation Plan",
    planDescription: "A weekly guide from sowing to harvest.",
    downloadPdf: "Download as PDF",
    savePlan: "Save Plan",
    downloading: "Downloading...",
    saving: "Saving...",
    week: "Week",
    currentWeek: "Current Week",
    placeholder: "Your personalized cultivation plan will appear here once generated.",
    disclaimer: "This is an AI-generated plan. Always adapt based on real-world field conditions and consult local experts.",
    tasksForWeek: "Tasks for Week",
    dailyPlan: "Daily Plan",
    listenToTasks: "Listen to tasks",
    success: {
        planSaved: "Plan Saved!",
        notificationsEnabled: "Daily task notifications have been enabled.",
        pdfDownloaded: "PDF downloaded successfully."
    },
    error: {
      title: "Error",
      planFailed: "Failed to generate cultivation plan. Please try again.",
      pdfFailed: "Failed to generate PDF. Please try again later.",
      unexpected: "An unexpected error occurred. Please try again.",
      modelOverloaded: "Our AI service is experiencing high demand right now. Please try again in a minute."
    }
  };
  const [isPending, startTransition] = useTransition();
  const [isDownloading, setIsDownloading] = useState(false);
  const [result, setResult] = useState<PersonalizedCultivationPlanOutput | null>(null);
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const planContentRef = useRef<HTMLDivElement>(null);
  const [fileName, setFileName] = useState('');
  const { user } = useAuth();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      crop: '',
      district: '',
      sowingDate: '',
    },
  });
  
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type.startsWith('image/') || file.type === 'application/pdf') {
        const reader = new FileReader();
        reader.onloadend = () => {
          form.setValue('soilReport', reader.result as string);
          setFileName(file.name);
        };
        reader.readAsDataURL(file);
      } else {
        toast({
          variant: 'destructive',
          title: 'Invalid File Type',
          description: 'Please upload a PDF or an image file.',
        });
      }
    }
  };

  const onSubmit = (data: FormData) => {
    startTransition(async () => {
      setResult(null);
      try {
        const res = await getPersonalizedCultivationPlan({
          crop: data.crop,
          district: data.district,
          sowingDate: data.sowingDate,
          soilReport: data.soilReport,
          // Explicitly pass the boolean to satisfy the new schema
          isSoilReportFile: !!data.soilReport && data.soilReport.startsWith('data:'),
          userProfile: "User from " + data.district + ", growing " + data.crop,
        });
        
        if (res?.cultivationPlan?.length) {
          setResult(res);
          setSelectedWeek(getWeekOfSowing(data.sowingDate));
        } else {
          toast({
            variant: 'destructive',
            title: t.error.title,
            description: t.error.planFailed,
          });
        }
      } catch (error) {
        console.error(error);
        const message = error instanceof Error ? error.message : '';
        const isOverloaded = /503|overloaded|high demand/i.test(message);
        toast({
          variant: 'destructive',
          title: t.error.title,
          description: isOverloaded
            ? t.error.modelOverloaded
            : t.error.unexpected,
        });
      }
    });
  };

  const handleSavePlan = async () => {
    if (!result || !user) return;

    try {
      const formData = form.getValues();
      const { error } = await supabase.from('cultivation_plans').insert({
        user_id: user.id,
        crop_type: formData.crop,
        district: formData.district,
        sowing_date: formData.sowingDate,
        plan_data: result,
        status: 'active',
      });

      if (error) throw error;

      toast({
        title: t.success.planSaved,
        description: t.success.notificationsEnabled,
      });
    } catch (error) {
      console.error('Error saving plan:', error);
      toast({
        variant: 'destructive',
        title: 'Save Failed',
        description: 'Failed to save cultivation plan. Please try again.',
      });
    }
  };
  
  const handleDownloadPdf = async () => {
    if (!result || !planContentRef.current) return;

    setIsDownloading(true);
    try {
      // Dynamically imported because both libraries touch the DOM/canvas
      // APIs and have no business being in the server bundle.
      const { default: jsPDF } = await import('jspdf');
      const { default: html2canvas } = await import('html2canvas');

      const canvas = await html2canvas(planContentRef.current, {
        scale: 2,
        backgroundColor: '#ffffff',
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      const imgWidth = pageWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      // Paginate if the captured content is taller than one A4 page.
      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      const formData = form.getValues();
      pdf.save(`vivasayi-cultivation-plan-${formData.crop || 'plan'}.pdf`);

      toast({
        title: t.success.planSaved,
        description: t.success.pdfDownloaded,
      });
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast({
        variant: 'destructive',
        title: t.error.title,
        description: t.error.pdfFailed,
      });
    } finally {
      setIsDownloading(false);
    }
  };

  const currentWeek = result ? getWeekOfSowing(form.getValues('sowingDate')) : 0;
  const totalWeeks = result?.cultivationPlan?.length || 0;
  const progressPercentage = totalWeeks > 0 ? (Math.min(currentWeek, totalWeeks) / totalWeeks) * 100 : 0;
  const [selectedWeek, setSelectedWeek] = useState(currentWeek || 1);
  
  const selectedWeekData = result?.cultivationPlan[selectedWeek - 1];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-1 space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>{t.formTitle}</CardTitle>
            <CardDescription>{t.formDescription}</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="crop"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t.cropLabel}</FormLabel>
                      <FormControl>
                        <Input placeholder={t.cropPlaceholder} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="district"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t.districtLabel}</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={t.districtPlaceholder} />
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
                  name="sowingDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t.sowingDateLabel}</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                       <FormDescription>{t.sowingDateDescription}</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                    control={form.control}
                    name="soilReport"
                    render={() => (
                        <FormItem>
                        <FormLabel>{t.soilReportLabel}</FormLabel>
                        <FormControl>
                            <div>
                            <Input
                                type="file"
                                accept=".pdf,image/*"
                                ref={fileInputRef}
                                onChange={handleFileChange}
                                className="hidden"
                            />
                            <Button
                                type="button"
                                variant="outline"
                                className="w-full justify-start"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <Upload className="mr-2" />
                                {fileName || t.soilReportPlaceholder}
                            </Button>
                            </div>
                        </FormControl>
                        <FormDescription>{t.soilReportDescription}</FormDescription>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                <Button type="submit" disabled={isPending} className="w-full">
                  {isPending ? (
                    <><LoaderCircle className="mr-2 h-4 w-4 animate-spin" />{t.generatingPlan}</>
                  ) : (
                    <><BrainCircuit className="mr-2 h-4 w-4" />{t.getPlan}</>
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
        {result && form.getValues('district') && (
            <WeatherCard location={form.getValues('district')} />
        )}
      </div>
      
      <div className="lg:col-span-2">
        <Card className="h-full flex flex-col">
          <CardHeader>
            <div className="flex justify-between items-start">
                <div>
                    <CardTitle>{t.planTitle}</CardTitle>
                    <CardDescription>{t.planDescription}</CardDescription>
                </div>
                 {result && (
                    <div className="flex gap-2">
                         <Button variant="outline" onClick={handleDownloadPdf} disabled={isDownloading}>
                            <FileDown className="mr-2 h-4 w-4"/>
                            {isDownloading ? t.downloading : t.downloadPdf}
                        </Button>
                         <Button variant="outline" onClick={handleSavePlan}>
                            <Save className="mr-2 h-4 w-4"/>
                            {t.savePlan}
                        </Button>
                    </div>
                )}
            </div>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col">
            {isPending && (
              <div className="flex-1 flex flex-col items-center justify-center gap-2 text-muted-foreground">
                <LoaderCircle className="h-8 w-8 animate-spin text-primary" />
                <span>{t.generatingPlan}</span>
              </div>
            )}
            {result && result.cultivationPlan && (
                <div ref={planContentRef} className="space-y-4">
                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-medium">{t.week} {Math.min(currentWeek, totalWeeks)} of {totalWeeks}</span>
                        </div>
                        <Progress value={progressPercentage} />
                    </div>

                    <ScrollArea className="w-full whitespace-nowrap">
                        <div className="flex space-x-4 pb-4">
                            {result.cultivationPlan.map((week: WeeklyTask, index) => {
                                const weekNumber = index + 1;
                                const isPast = weekNumber < currentWeek;
                                const isActive = weekNumber === currentWeek;
                                const isSelected = weekNumber === selectedWeek;

                                return (
                                <button
                                    key={index}
                                    onClick={() => setSelectedWeek(weekNumber)}
                                    className={cn(
                                        "flex-shrink-0 flex flex-col items-center justify-center space-y-2 p-4 w-28 h-36 rounded-lg border-2 transition-all",
                                        isPast && "border-gray-200 bg-gray-50 text-gray-400",
                                        isActive && !isSelected && "border-primary bg-primary/10",
                                        isSelected && "border-primary bg-primary/20 ring-2 ring-primary",
                                        !isActive && !isPast && !isSelected && "border-border"
                                    )}
                                >
                                    <div className="relative">
                                        <DynamicIcon name={week.iconName} />
                                        {isPast && <LucideIcons.CheckCircle2 className="absolute -top-2 -right-2 size-5 text-green-500 bg-white rounded-full" />}
                                    </div>
                                    <span className="font-bold text-sm">{t.week} {weekNumber}</span>
                                    <span className="text-xs text-center truncate w-full">{week.stage}</span>
                                </button>
                                );
                            })}
                        </div>
                        <ScrollBar orientation="horizontal" />
                    </ScrollArea>
                    
                    {selectedWeekData && (
                        <Card className="mt-4 bg-muted/50">
                            <CardHeader>
                                <CardTitle className="flex items-center justify-between">
                                    <span>{t.tasksForWeek} {selectedWeek}: {selectedWeekData.stage}</span>
                                    <SpeakButton textToSpeak={`${t.tasksForWeek} ${selectedWeek}. ${selectedWeekData.stage}. ${selectedWeekData.tasks}`} />
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground">{selectedWeekData.tasks}</p>
                                <div className="mt-4">
                                  <h4 className="font-semibold mb-2">{t.dailyPlan}</h4>
                                  <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 text-center">
                                    {selectedWeekData.dailyTasks.map((day: DailyTask, index: number) => (
                                      <div key={index} className="flex flex-col items-center p-2 rounded-lg border bg-background/50">
                                        <p className="font-bold text-xs">{day.day}</p>
                                        <div className="my-2">
                                          <DynamicIcon name={day.iconName} className="size-6 text-primary" />
                                        </div>
                                        <p className="text-xs text-muted-foreground">{day.tasks || 'No specific task'}</p>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            )}
            {!isPending && !result && (
              <div className="flex-1 flex flex-col items-center justify-center text-center text-muted-foreground">
                <Calendar className="mx-auto h-12 w-12" />
                <p className="mt-4">{t.placeholder}</p>
              </div>
            )}
          </CardContent>
          {result && (
            <CardFooter>
                <p className="text-xs text-muted-foreground">{t.disclaimer}</p>
            </CardFooter>
          )}
        </Card>
      </div>
    </div>
  );
}