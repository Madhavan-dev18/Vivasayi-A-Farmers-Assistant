
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
import { LoaderCircle, ScanLine, Upload, Bug } from 'lucide-react';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { SpeakButton } from './speak-button';
import { detectPlantDisease, type DiseaseDetectionOutput } from '@/ai/flows/disease-detection-flow';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export default function DiseaseDetection() {
  const t = {
    uploadTitle: "Upload Plant Image",
    badge: "AI-Powered",
    pictureLabel: "Plant Image",
    chooseFile: "Choose File",
    analyze: "Analyze Plant",
    analyzing: "Analyzing...",
    analyzingWithAI: "Analyzing with Gemini AI...",
    diagnosisResult: "Diagnosis Result",
    diagnosisLabel: "Diagnosis:",
    confidenceLabel: "Confidence:",
    observationsLabel: "AI's Observations:",
    treatmentLabel: "Recommended Treatment:",
    disclaimer: "Disclaimer: This tool is for informational purposes only. Always consult with a local agricultural expert for definitive diagnosis."
  };
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isAnalyzing, startTransition] = useTransition();
  const [result, setResult] = useState<DiseaseDetectionOutput | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
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
        const res = await detectPlantDisease({ photoDataUri: imagePreview });
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
  const speakableText = result ? `Diagnosis: ${result.disease}. Confidence: ${result.confidence} percent. ${result.description}. Recommended Treatment: ${result.treatment}` : '';

  return (
    <Card className="mx-auto max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{t.uploadTitle}</span>
          <Badge variant="outline">{t.badge}</Badge>
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
            <Label htmlFor="picture">{t.pictureLabel}</Label>
            <div className="flex gap-2">
              <Input
                id="picture"
                type="file"
                accept="image/*"
                ref={fileInputRef}
                onChange={handleImageChange}
                className="hidden"
              />
              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="mr-2 h-4 w-4" />
                {t.chooseFile}
              </Button>
              <Button onClick={handleAnalyze} disabled={isAnalyzing || !imagePreview}>
                {isAnalyzing ? (
                  <>
                    <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                    {t.analyzing}
                  </>
                ) : (
                  <>
                    <ScanLine className="mr-2 h-4 w-4" />
                    {t.analyze}
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
              {t.analyzingWithAI}
            </p>
          </div>
        )}

        {result && (
          <div className="pt-4">
            <Alert variant={isHealthy ? 'default' : 'destructive'}>
              <Bug className="h-4 w-4" />
              <AlertTitle className="flex items-center justify-between">
                <span>{t.diagnosisResult}</span>
                 <SpeakButton textToSpeak={speakableText} />
              </AlertTitle>
              <AlertDescription>
                <div className="mt-4 space-y-4">
                  <div>
                    <h3 className="font-semibold">{t.diagnosisLabel}</h3>
                    <p className={cn('font-bold', isHealthy ? 'text-green-600' : 'text-destructive')}>
                      {result.disease}
                    </p>
                  </div>
                   <div>
                    <h3 className="font-semibold">{t.confidenceLabel}</h3>
                    <div className="flex items-center gap-2">
                      <Progress value={result.confidence} className="w-48" />
                      <span>{result.confidence.toFixed(0)}%</span>
                    </div>
                  </div>
                   <div>
                    <h3 className="font-semibold">{t.observationsLabel}</h3>
                    <p className="text-sm text-muted-foreground">{result.description}</p>
                  </div>
                  {!isHealthy && (
                    <div>
                        <h3 className="font-semibold">{t.treatmentLabel}</h3>
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
          {t.disclaimer}
        </p>
      </CardFooter>
    </Card>
  );
}
