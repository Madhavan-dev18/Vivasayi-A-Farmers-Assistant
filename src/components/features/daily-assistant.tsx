'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase-client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { LoaderCircle, Calendar, CheckCircle2, Sprout, Sun, Droplets, Scissors, Thermometer, Wind, Zap, Bug, Leaf, Shovel, Tractor, CloudRain, BrainCircuit } from 'lucide-react';
import { SpeakButton } from './speak-button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/context/LanguageContext';
import { getLanguageMeta } from '@/lib/languages';
import { Progress } from '@/components/ui/progress';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const iconMap: Record<string, any> = {
  Sprout, Sun, Droplets, Scissors, CheckCircle2, Thermometer, Wind, Zap, Bug, Leaf,
  Shovel, Tractor, CloudRain, BrainCircuit, Calendar
};

const DynamicIcon = ({ name, className }: { name: string; className?: string }) => {
    const Icon = iconMap[name] || Calendar;
    return <Icon className={cn("size-6", className)} />;
};

interface CultivationPlan {
    id: string;
    cropName: string;
    sowingDate: string;
    planData: any;
}

export function DailyAssistant() {
  const { t, language } = useLanguage();
  const [plans, setPlans] = useState<CultivationPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedWeekByPlan, setSelectedWeekByPlan] = useState<Record<string, number>>({});

  useEffect(() => {
    async function fetchPlans() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data, error } = await supabase
          .from('cultivation_plans')
          .select('*')
          .eq('user_id', user.id)
          .eq('status', 'active');

        if (error) throw error;

        const activePlans: CultivationPlan[] = [];
        const initialSelectedWeeks: Record<string, number> = {};
        
        const now = new Date();
        now.setHours(0, 0, 0, 0);

        (data || []).forEach((plan: any) => {
          if (!plan.plan_data?.cultivationPlan || !plan.sowing_date) return;
          activePlans.push({
              id: plan.id,
              cropName: plan.crop_type,
              sowingDate: plan.sowing_date,
              planData: plan.plan_data,
          });
          
          const sowing = new Date(plan.sowing_date);
          sowing.setHours(0, 0, 0, 0);
          const diffTime = now.getTime() - sowing.getTime();
          const currentWeek = diffTime < 0 ? 1 : Math.floor(diffTime / (1000 * 60 * 60 * 24 * 7)) + 1;
          initialSelectedWeeks[plan.id] = currentWeek;
        });

        setPlans(activePlans);
        setSelectedWeekByPlan(initialSelectedWeeks);
      } catch (error) {
        console.error('Error fetching plans:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchPlans();
  }, []);

  const handleSelectWeek = (planId: string, week: number) => {
      setSelectedWeekByPlan(prev => ({ ...prev, [planId]: week }));
  };

  const handleDayClick = (day: any, cropName: string, weekNumber: number) => {
    if (!day.tasks) return;
    const currentLangMeta = getLanguageMeta(language);
    const targetLanguageName = currentLangMeta.englishName;
    const promptMessage = language === 'en'
      ? `Explain this cultivation task in detail and provide step-by-step guidance: "${day.tasks}" for my ${cropName} crop during week ${weekNumber}.`
      : `Explain this cultivation task in detail and provide step-by-step guidance in ${targetLanguageName}: "${day.tasks}" for my ${cropName} crop during week ${weekNumber}.`;

    window.dispatchEvent(
      new CustomEvent('open-chatbot', {
        detail: { query: promptMessage },
      })
    );
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sprout className="h-5 w-5" /> {t('DailyAssistant.title')}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center py-6">
          <LoaderCircle className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (plans.length === 0) {
      return null;
  }

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-background to-primary/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sprout className="h-5 w-5 text-primary" /> {t('DailyAssistant.title')}
        </CardTitle>
        <CardDescription>
            {t('DailyAssistant.description')}
        </CardDescription>
      </CardHeader>
      <CardContent>
         <Tabs defaultValue={plans[0].id} className="w-full">
            {plans.length > 1 && (
                <TabsList className="mb-4">
                    {plans.map(plan => (
                        <TabsTrigger key={plan.id} value={plan.id}>
                          {plan.cropName ? (t(`CropRecommendationForm.${plan.cropName.toLowerCase()}`) || plan.cropName) : ''}
                        </TabsTrigger>
                    ))}
                </TabsList>
            )}
            {plans.map(plan => {
                const now = new Date();
                now.setHours(0, 0, 0, 0);
                const sowing = new Date(plan.sowingDate);
                sowing.setHours(0, 0, 0, 0);
                const diffTime = now.getTime() - sowing.getTime();
                const actualCurrentWeek = diffTime < 0 ? 0 : Math.floor(diffTime / (1000 * 60 * 60 * 24 * 7)) + 1;
                const totalWeeks = plan.planData.cultivationPlan.length;
                const progressPercentage = totalWeeks > 0 ? (Math.min(Math.max(actualCurrentWeek, 0), totalWeeks) / totalWeeks) * 100 : 0;
                
                const selectedWeek = selectedWeekByPlan[plan.id] || 1;
                const selectedWeekData = plan.planData.cultivationPlan[selectedWeek - 1];

                return (
                    <TabsContent key={plan.id} value={plan.id} className="space-y-4">
                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-sm font-medium">{t('DailyAssistant.week')} {Math.min(Math.max(actualCurrentWeek, 0), totalWeeks)} {t('DailyAssistant.of')} {totalWeeks}</span>
                            </div>
                            <Progress value={progressPercentage} />
                        </div>

                        <ScrollArea className="w-full whitespace-nowrap">
                            <div className="flex space-x-4 pb-4">
                                {plan.planData.cultivationPlan.map((week: any, index: number) => {
                                    const weekNumber = index + 1;
                                    const isPast = weekNumber < actualCurrentWeek;
                                    const isActive = weekNumber === actualCurrentWeek;
                                    const isSelected = weekNumber === selectedWeek;

                                    return (
                                    <button
                                        key={index}
                                        onClick={() => handleSelectWeek(plan.id, weekNumber)}
                                        className={cn(
                                            "flex-shrink-0 flex flex-col items-center justify-center space-y-2 p-4 w-28 h-36 rounded-lg border-2 transition-all",
                                            isPast && "border-gray-200 bg-gray-50 text-gray-400",
                                            isActive && !isSelected && "border-primary bg-primary/10",
                                            isSelected && "border-primary bg-primary/20 ring-2 ring-primary",
                                            !isActive && !isPast && !isSelected && "border-border"
                                        )}
                                    >
                                        <div className="relative">
                                            <DynamicIcon name={week.iconName} className="size-8" />
                                            {isPast && <CheckCircle2 className="absolute -top-2 -right-2 size-5 text-green-500 bg-white rounded-full" />}
                                        </div>
                                        <span className="font-bold text-sm">{t('DailyAssistant.week')} {weekNumber}</span>
                                        <span className="text-xs text-center truncate w-full">
                                            {week.stage ? (t(`stages.${week.stage.toLowerCase().replace(/[^a-z0-9]/g, '')}`) || week.stage) : ''}
                                        </span>
                                    </button>
                                    );
                                })}
                            </div>
                            <ScrollBar orientation="horizontal" />
                        </ScrollArea>

                        {selectedWeekData && (
                            <Card className="mt-4 bg-muted/50 border-0 shadow-none">
                                <CardHeader className="px-4 py-3">
                                    <CardTitle className="flex flex-wrap items-center justify-between gap-2 text-base">
                                        <span>
                                            {t('DailyAssistant.tasksForWeek')} {selectedWeek}: {selectedWeekData.stage ? (t(`stages.${selectedWeekData.stage.toLowerCase().replace(/[^a-z0-9]/g, '')}`) || selectedWeekData.stage) : ''}
                                        </span>
                                        <SpeakButton 
                                            textToSpeak={`${t('DailyAssistant.tasksForWeek')} ${selectedWeek}. ${selectedWeekData.stage ? (t(`stages.${selectedWeekData.stage.toLowerCase().replace(/[^a-z0-9]/g, '')}`) || selectedWeekData.stage) : ''}. ${selectedWeekData.tasks || ''}`} 
                                        />
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="px-4 pb-4">
                                    <p className="text-sm text-muted-foreground mb-4">{selectedWeekData.tasks}</p>
                                    <div>
                                      <h4 className="font-semibold mb-2 text-sm">{t('DailyAssistant.dailyPlan')}</h4>
                                      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 text-center">
                                        {selectedWeekData.dailyTasks.map((day: any, index: number) => {
                                           // Check if this day is literally today
                                           const isToday = diffTime >= 0 && actualCurrentWeek === selectedWeek && index === (Math.floor(diffTime / (1000 * 60 * 60 * 24)) % 7);

                                           return (
                                             <button
                                               key={index}
                                               onClick={() => handleDayClick(day, plan.cropName, selectedWeek)}
                                               title={t('DailyAssistant.clickForDetails')}
                                               className={cn(
                                                 "flex flex-col items-center p-2 rounded-lg border text-center transition-all hover:scale-105 hover:border-primary/50 hover:bg-primary/5 focus:outline-none focus:ring-2 focus:ring-primary w-full",
                                                 isToday ? "bg-primary/10 border-primary shadow-sm ring-1 ring-primary" : "bg-background/50"
                                               )}
                                             >
                                                 <p className={cn("text-xs", isToday ? "font-bold text-primary" : "font-semibold")}>
                                                   {t(`days.${day.day.toLowerCase()}`) || day.day}
                                                 </p>
                                                 <div className="my-2">
                                                     <DynamicIcon name={day.iconName} className={cn("size-5", isToday ? "text-primary" : "text-muted-foreground")} />
                                                 </div>
                                                 <p className="text-[10px] text-muted-foreground line-clamp-3 leading-tight">{day.tasks || t('DailyAssistant.noSpecificTask')}</p>
                                             </button>
                                           );
                                        })}
                                      </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </TabsContent>
                );
            })}
         </Tabs>
      </CardContent>
    </Card>
  );
}
