
import PersonalizedSpace from "@/components/features/personalized-space";
import { AppShell } from "@/components/layout/app-shell";

export default function PersonalizedSpacePage() {
  const t = {
    title: 'Personalized Cultivation Space',
    description: "Generate a complete, week-by-week cultivation plan for your farm, from sowing to harvest."
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
        <PersonalizedSpace />
      </div>
    </AppShell>
  );
}
