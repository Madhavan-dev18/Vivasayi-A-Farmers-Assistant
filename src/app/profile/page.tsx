
'use client';

import { AppShell } from '@/components/layout/app-shell';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User, Upload, Droplets, Banknote, Mountain } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { uploadImage } from '@/lib/storage';
import { supabase } from '@/lib/supabase-client';
import { useToast } from '@/hooks/use-toast';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import React from 'react';
import { Input } from '@/components/ui/input';
import { useLanguage } from '@/context/LanguageContext';
import LanguageSwitcher from '@/components/layout/language-switcher';

export default function ProfilePage() {
  const { t } = useLanguage();

  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = React.useState('');

  const { user: authUser } = useAuth();
  const { toast } = useToast();

  const user = {
    name: authUser?.user_metadata?.name || 'Farmer',
    email: authUser?.email || '',
    location: 'India',
    avatarUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${authUser?.email || 'F'}`,
    waterSource: t('ProfilePage.notSet'),
    annualBudget: t('ProfilePage.notSet'),
    soilType: authUser?.user_metadata?.soilType || t('ProfilePage.notSet'),
  };

  // Mock soil health records
  const soilRecords = [
    {
      year: 2024,
      n: '120',
      p: '55',
      k: '45',
      ph: 6.8,
      status: 'Active',
      fileName: 'SoilReport_2024.pdf'
    },
    {
      year: 2023,
      n: '110',
      p: '50',
      k: '48',
      ph: 6.5,
      status: 'Archived',
      fileName: 'SoilReport_2023.pdf'
    },
    {
      year: 2022,
      n: '115',
      p: '48',
      k: '50',
      ph: 6.7,
      status: 'Archived',
      fileName: 'SoilReport_2022.pdf'
    },
  ];
  
  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && authUser) {
      setFileName(file.name);
      try {
        const soilReportPath = await uploadImage(file, authUser.id, 'soil-reports');
        await supabase.auth.updateUser({
          data: { soilReportPath }
        });
        toast({
          title: t('ProfilePage.reportUploadedTitle'),
          description: t('ProfilePage.reportUploadedDescription'),
        });
      } catch (error: any) {
        toast({
          variant: 'destructive',
          title: t('ProfilePage.uploadFailedTitle'),
          description: error.message || t('ProfilePage.uploadFailedDescription'),
        });
      }
    }
  };

  return (
    <AppShell>
      <div className="flex-1 space-y-6 p-4 md:p-6">
        <div className="mb-6">
          <h1 className="font-headline text-3xl font-bold">{t('ProfilePage.title')}</h1>
        </div>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-1">
            <Card>
              <CardHeader>
                <div className="flex flex-col items-center gap-4 text-center">
                  <Avatar className="h-24 w-24 border-2 border-primary">
                    <AvatarImage src={user.avatarUrl} alt={user.name} />
                    <AvatarFallback>
                      <User className="h-12 w-12" />
                    </AvatarFallback>
                  </Avatar>
                  <CardTitle className="text-2xl">{user.name}</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-1">
                  <p className="text-sm font-medium text-muted-foreground">
                    {t('ProfilePage.email')}
                  </p>
                  <p>{user.email}</p>
                </div>
                <div className="grid gap-1">
                  <p className="text-sm font-medium text-muted-foreground">
                    {t('ProfilePage.location')}
                  </p>
                  <p>{user.location}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Mountain className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      {t('ProfilePage.soilType')}
                    </p>
                    <p>{user.soilType}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Droplets className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      {t('ProfilePage.waterSource')}
                    </p>
                    <p>{user.waterSource}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Banknote className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      {t('ProfilePage.annualBudget')}
                    </p>
                    <p>{user.annualBudget}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t('ProfilePage.appSettingsTitle')}</CardTitle>
                <CardDescription>{t('ProfilePage.appSettingsDescription')}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-sm font-medium text-muted-foreground">
                    {t('ProfilePage.languageLabel')}
                  </span>
                  <LanguageSwitcher />
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="lg:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>{t('ProfilePage.soilHealthTitle')}</CardTitle>
                <CardDescription>{t('ProfilePage.soilHealthDescription')}</CardDescription>
              </div>
              <>
                 <Input
                    type="file"
                    accept=".pdf,image/*"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                  />
                <Button onClick={() => fileInputRef.current?.click()}>
                  <Upload className="mr-2" />
                  {t('ProfilePage.uploadReportButton')}
                </Button>
              </>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('ProfilePage.reportYear')}</TableHead>
                    <TableHead>N (kg/ha)</TableHead>
                    <TableHead>P (kg/ha)</TableHead>
                    <TableHead>K (kg/ha)</TableHead>
                    <TableHead>pH</TableHead>
                    <TableHead className="text-right">{t('ProfilePage.status')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {soilRecords.map((record) => (
                    <TableRow key={record.year}>
                      <TableCell className="font-medium">
                        {record.year} - <span className="text-muted-foreground">{record.fileName}</span>
                      </TableCell>
                      <TableCell>{record.n}</TableCell>
                      <TableCell>{record.p}</TableCell>
                      <TableCell>{record.k}</TableCell>
                      <TableCell>{record.ph}</TableCell>
                      <TableCell className="text-right">
                        <Badge
                          variant={
                            record.status === 'Active' ? 'default' : 'outline'
                          }
                        >
                          {record.status === 'Active' ? t('ProfilePage.active') : t('ProfilePage.archived')}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
