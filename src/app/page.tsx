
import { InstallPwaButton } from "@/components/install-pwa-button";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calculator, Languages, ListChecks, Map } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const features = [
    {
        icon: '🧮',
        title: "Smart Budget Estimator",
        description: "Know what to expect. Get a detailed cost breakdown based on your travel style, trip duration, and the regions you want to explore.",
        href: "/planner?tab=estimate"
    },
    {
        icon: '📅',
        title: "Custom Itinerary Builder",
        description: "No stress, no spreadsheets. Build a full day-by-day travel plan with suggested activities that match your interests and budget.",
        href: "/planner?tab=plan"
    },
    {
        icon: '🎒',
        title: "Your Personal Packing List",
        description: "Never forget the essentials. Get a checklist tailored to your destinations, season, and trip type.",
        href: "/planner?tab=plan"
    },
    {
        icon: '🗣️',
        title: "Ghanaian Language Companion",
        description: "Feel more connected. Learn key phrases in Twi, Ewe, Ga, and more—with audio guides to help you speak confidently.",
        href: "/planner?tab=plan"
    }
]

export default function Home() {
  return (
    <main className="flex-1">
      <div className="relative flex h-[60vh] items-center justify-center px-4 text-center">
          <Image 
              src="https://www.letvisitghana.com/wp-content/uploads/2024/05/Nzulezu-Stilt-Village.jpg"
              alt="Beautiful landscape of Ghana"
              fill
              className="object-cover -z-10 brightness-50"
              priority
          />
          <div className="max-w-2xl">
              <h1 className="font-headline text-3xl font-bold text-white shadow-lg sm:text-4xl md:text-6xl">
                  Go Ghana: Plan Less, Explore More
              </h1>
              <p className="mt-4 text-base text-white/90 sm:text-lg md:text-xl">
                  Let Ghana welcome you. Build your dream trip with personalized budgets, custom itineraries, and travel tips—everything crafted to help you experience the real Ghana.
              </p>
              <Button asChild size="lg" className="mt-8">
                  <Link href="/planner">Start Planning Now</Link>
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
                        <div className="mx-auto w-fit rounded-full bg-primary/10 p-4 text-4xl">
                            {feature.icon}
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
