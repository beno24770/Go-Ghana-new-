
import { InstallPwaButton } from "@/components/install-pwa-button";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Wand2 } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import { LazyIcon } from "@/components/lazy-icon";
import { Skeleton } from "@/components/ui/skeleton";

const features = [
    {
        icon: "Calculator",
        title: "Smart Budget Estimator",
        description: "Know what to expect. Get a detailed cost breakdown based on your travel style, trip duration, and the regions you want to explore.",
        href: "/planner?tab=estimate"
    },
    {
        icon: "Map",
        title: "Custom Itinerary Builder",
        description: "No stress, no spreadsheets. Build a full day-by-day travel plan with suggested activities that match your interests and budget.",
        href: "/planner?tab=plan"
    },
    {
        icon: "Car",
        title: "Connect with a Local Driver",
        description: "Travel like a local. Connect with our vetted, trusted drivers for personalized tours and reliable transport at a fair price.",
        href: "/drivers"
    },
    {
        icon: "Languages",
        title: "Ghanaian Language Companion",
        description: "Feel more connected. Learn key phrases in Twi, Ewe, Ga, and more—with audio guides to help you speak confidently.",
        href: "/planner?tab=plan"
    }
]

const IconSkeleton = () => <Skeleton className="h-20 w-20 rounded-full" />;

export default function Home() {
  return (
    <main className="flex-1">
      <div className="relative flex h-[60vh] min-h-[400px] items-center justify-center bg-muted px-4 text-center sm:min-h-[500px]">
          <div className="max-w-2xl">
              <h1 className="font-headline text-3xl font-bold text-foreground shadow-lg sm:text-4xl md:text-6xl">
                  Go Ghana: Plan Less, Explore More
              </h1>
              <p className="mt-4 text-base text-muted-foreground sm:text-lg md:text-xl">
                  Let Ghana welcome you. Build your dream trip with personalized budgets, custom itineraries, and travel tips—everything crafted to help you experience the real Ghana.
              </p>
              <Button asChild size="lg" className="mt-8">
                  <Link href="/planner">
                    <Wand2 />
                    Start Planning Now
                  </Link>
              </Button>
          </div>
      </div>

      <div className="container mx-auto max-w-5xl px-4 py-16 sm:py-24">
        <div className="text-center">
            <h2 className="font-headline text-3xl font-bold md:text-4xl">From Budgeting to Booking—Plan Your Ghana Trip the Easy Way</h2>
            <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
                Our smart travel tools are crafted to make your journey to Ghana smooth, personalized, and unforgettable. Whether you're visiting for the first time or coming home, we've got you covered—from cost estimates to cultural tips.
            </p>
        </div>

        <div className="mt-12 grid gap-8 md:grid-cols-2">
            {features.map(feature => (
              <Link href={feature.href} key={feature.title} className="block transition-transform duration-300 hover:scale-105">
                <Card className="flex h-full flex-col text-left sm:flex-row">
                    <div className="flex items-center justify-center p-6 sm:p-4">
                        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 p-4 text-4xl">
                            <Suspense fallback={<IconSkeleton />}>
                                <LazyIcon name={feature.icon as any} className="h-10 w-10" />
                            </Suspense>
                        </div>
                    </div>
                    <div className="flex-1 p-6 pt-0 sm:pt-6">
                        <CardTitle className="font-headline text-xl">{feature.title}</CardTitle>
                        <p className="mt-2 text-muted-foreground">{feature.description}</p>
                    </div>
                </Card>
              </Link>
            ))}
        </div>
      </div>
      <InstallPwaButton />
    </main>
  );
}
