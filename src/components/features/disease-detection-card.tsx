
'use client';

import Image from 'next/image';
import { useState, useRef, useTransition } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { LoaderCircle, ScanLine, Upload, Bug, Camera } from 'lucide-react';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { SpeakButton } from './speak-button';
import { detectPlantDisease, type DiseaseDetectionOutput } from '@/ai/flows/disease-detection-flow';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/context/LanguageContext';
import { getLanguageMeta } from '@/lib/languages';

export default function DiseaseDetection() {
  const { t, language } = useLanguage();
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isAnalyzing, startTransition] = useTransition();
  const [result, setResult] = useState<DiseaseDetectionOutput | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const placeholderImage = PlaceHolderImages.find(img => img.id === 'plant-preview') || PlaceHolderImages[0];
  const { toast } = useToast();

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setImagePreview(reader.result as string);
          setResult(null);
          setError(null);
        };
        reader.readAsDataURL(file);
      } else {
        const err = 'Please upload a valid image file.';
        setError(err);
        setImagePreview(null);
        toast({
            variant: 'destructive',
            title: 'Invalid File',
            description: err,
        });
      }
    }
  };

  const handleAnalyze = () => {
    if (!imagePreview) {
      const err = 'Please upload an image first.';
      setError(err);
      toast({
            variant: 'destructive',
            title: 'No Image',
            description: err,
      });
      return;
    }
    
    setResult(null);
    setError(null);

    startTransition(async () => {
      try {
        const res = await detectPlantDisease({
          photoDataUri: imagePreview,
          language: getLanguageMeta(language).englishName,
        });
        setResult(res);
      } catch (e) {
        console.error(e);
        const err = 'An error occurred during analysis. Please try again.';
        setError(err);
        toast({
            variant: 'destructive',
            title: 'Analysis Failed',
            description: 'An unexpected error occurred. Please try again later.',
        });
      }
    });
  };
  
  const isHealthy = result && result.disease.toLowerCase() === 'healthy';
  const speakableText = result
    ? `${t('DiseaseDetectionCard.diagnosisLabel')} ${result.disease}. ${t('DiseaseDetectionCard.confidenceLabel')} ${result.confidence.toFixed(0)}%. ${result.description}. ${t('DiseaseDetectionCard.treatmentLabel')} ${result.treatment}`
    : '';

  return (
    <Card className="mx-auto max-w-2xl">
      <CardHeader>
        <CardTitle className="flex flex-wrap items-center justify-between gap-2">
          <span>{t('DiseaseDetectionCard.uploadTitle')}</span>
          <Badge variant="outline">{t('DiseaseDetectionCard.badge')}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="mx-auto w-full max-w-lg">
          <div className="mb-4 aspect-video w-full overflow-hidden rounded-lg border-2 border-dashed">
            <Image
              src={imagePreview || placeholderImage.imageUrl}
              alt="Plant preview"
              width={600}
              height={400}
              className="h-full w-full object-cover"
              data-ai-hint={imagePreview ? "plant leaf" : placeholderImage.imageHint}
            />
          </div>
          <div className="grid w-full items-center gap-1.5">
            <Label htmlFor="picture">{t('DiseaseDetectionCard.pictureLabel')}</Label>
            <div className="flex flex-wrap gap-2">
              <Input
                id="picture"
                type="file"
                accept="image/*"
                ref={fileInputRef}
                onChange={handleImageChange}
                className="hidden"
              />
              {/* capture="environment" tells mobile browsers to open the
                  rear camera directly instead of the file/photo picker.
                  Desktop browsers ignore this attribute entirely, so this
                  input is functionally identical to the one above there —
                  it's a second, mobile-only entry point, not a replacement. */}
              <Input
                id="picture-camera"
                type="file"
                accept="image/*"
                capture="environment"
                ref={cameraInputRef}
                onChange={handleImageChange}
                className="hidden"
              />
              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="mr-2 h-4 w-4" />
                {t('DiseaseDetectionCard.chooseFile')}
              </Button>
              <Button
                variant="outline"
                onClick={() => cameraInputRef.current?.click()}
              >
                <Camera className="mr-2 h-4 w-4" />
                {t('DiseaseDetectionCard.takePhoto')}
              </Button>
              <Button onClick={handleAnalyze} disabled={isAnalyzing || !imagePreview}>
                {isAnalyzing ? (
                  <>
                    <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                    {t('DiseaseDetectionCard.analyzing')}
                  </>
                ) : (
                  <>
                    <ScanLine className="mr-2 h-4 w-4" />
                    {t('DiseaseDetectionCard.analyze')}
                  </>
                )}
              </Button>
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>
        </div>

        {isAnalyzing && (
          <div className="pt-4 text-center text-muted-foreground">
            <LoaderCircle className="mx-auto h-8 w-8 animate-spin text-primary" />
            <p className="mt-2 text-sm">
              {t('DiseaseDetectionCard.analyzingWithAI')}
            </p>
          </div>
        )}

        {result && (
          <div className="pt-4">
            <Alert variant={isHealthy ? 'default' : 'destructive'}>
              <Bug className="h-4 w-4" />
              <AlertTitle className="flex flex-wrap items-center justify-between gap-2">
                <span>{t('DiseaseDetectionCard.diagnosisResult')}</span>
                 <SpeakButton textToSpeak={speakableText} />
              </AlertTitle>
              <AlertDescription>
                <div className="mt-4 space-y-4">
                  <div>
                    <h3 className="font-semibold">{t('DiseaseDetectionCard.diagnosisLabel')}</h3>
                    <p className={cn('font-bold', isHealthy ? 'text-green-600' : 'text-destructive')}>
                      {result.disease}
                    </p>
                  </div>
                   <div>
                    <h3 className="font-semibold">{t('DiseaseDetectionCard.confidenceLabel')}</h3>
                    <div className="flex items-center gap-2">
                      <Progress value={result.confidence} className="w-48" />
                      <span>{result.confidence.toFixed(0)}%</span>
                    </div>
                  </div>
                   <div>
                    <h3 className="font-semibold">{t('DiseaseDetectionCard.observationsLabel')}</h3>
                    <p className="text-sm text-muted-foreground">{result.description}</p>
                  </div>
                  {!isHealthy && (
                    <div>
                        <h3 className="font-semibold">{t('DiseaseDetectionCard.treatmentLabel')}</h3>
                        <p>{result.treatment}</p>
                    </div>
                  )}
                </div>
              </AlertDescription>
            </Alert>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <p className="text-xs text-muted-foreground">
          {t('DiseaseDetectionCard.disclaimer')}
        </p>
      </CardFooter>
    </Card>
  );
}
