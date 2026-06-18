
import DiseaseDetection from '@/components/features/disease-detection-card';
import { AppShell } from '@/components/layout/app-shell';

export default function DiseaseDetectionPage() {
  const t = {
    title: 'Plant Disease Detection',
    description: 'Upload an image of a plant leaf to detect diseases using AI. This feature works even when you are offline.'
  };
  return (
    <AppShell>
      <div className="flex-1 p-4 md:p-6">
        <div className="mb-6">
          <h1 className="font-headline text-3xl font-bold">
            {t.title}
          </h1>
          <p className="text-muted-foreground">
            {t.description}
          </p>
        </div>
        <DiseaseDetection />
      </div>
    </AppShell>
  );
}
