
import CropRecommendationForm from '@/components/features/crop-recommendation-form';
import { AppShell } from '@/components/layout/app-shell';

export default function CropRecommendationPage() {
  const t = {
    title: 'AI Crop Recommendation',
    description: 'Fill in the details below to receive AI-powered crop recommendations tailored to your farm.'
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
        <CropRecommendationForm />
      </div>
    </AppShell>
  );
}
