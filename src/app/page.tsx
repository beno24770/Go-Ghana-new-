import { InstallPwaButton } from "@/components/install-pwa-button";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, Languages, ListChecks, Map } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const features = [
    {
        icon: <DollarSign className="h-8 w-8 text-primary" />,
        title: "AI Budget Estimator",
        description: "Get a detailed cost breakdown for your trip based on your travel style, duration, and desired regions.",
        href: "/planner?tab=estimate"
    },
    {
        icon: <Map className="h-8 w-8 text-primary" />,
        title: "AI Itinerary Planner",
        description: "Generate a personalized, day-by-day itinerary with activity suggestions tailored to your budget and interests.",
        href: "/planner?tab=plan"
    },
    {
        icon: <ListChecks className="h-8 w-8 text-primary" />,
        title: "Personalized Packing List",
        description: "Receive a custom packing checklist based on your trip's specifics so you don't forget a thing.",
        href: "/planner?tab=plan"
    },
    {
        icon: <Languages className="h-8 w-8 text-primary" />,
        title: "Interactive Language Guide",
        description: "Learn essential phrases in local languages with audio pronunciation to connect with the culture.",
        href: "/planner?tab=plan"
    }
]

export default function Home() {
  return (
    <main className="flex-1">
      <div className="relative h-[60vh] flex items-center justify-center text-center px-4">
          <Image 
              src="https://www.letvisitghana.com/wp-content/uploads/2024/05/Nzulezu-Stilt-Village.jpg"
              alt="Beautiful landscape of Ghana"
              fill
              className="object-cover -z-10 brightness-50"
              priority
          />
          <div className="max-w-2xl">
              <h1 className="font-headline text-3xl sm:text-4xl md:text-6xl font-bold text-white shadow-lg">
                  Go Ghana: Plan Less, Explore More
              </h1>
              <p className="mt-4 text-base sm:text-lg md:text-xl text-white/90">
                  Let Ghana welcome you. Build your dream trip with personalized budgets, custom itineraries, and travel tips—everything crafted to help you experience the real Ghana.
              </p>
              <Button asChild size="lg" className="mt-8">
                  <Link href="/planner">Start Planning Now</Link>
              </Button>
          </div>
      </div>

      <div className="container mx-auto max-w-5xl px-4 py-16 sm:py-24">
        <div className="text-center">
            <h2 className="font-headline text-3xl md:text-4xl font-bold">Your All-in-One Trip Planner</h2>
            <p className="mt-4 max-w-2xl mx-auto text-muted-foreground">
                From budgeting to booking, our AI tools are designed to make planning your trip to Ghana seamless and stress-free.
            </p>
        </div>

        <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {features.map(feature => (
              <Link href={feature.href} key={feature.title} className="block hover:scale-105 transition-transform duration-300">
                <Card className="text-center h-full">
                    <CardHeader>
                        <div className="mx-auto bg-primary/10 p-3 rounded-full w-fit">
                            {feature.icon}
                        </div>
                        <CardTitle className="font-headline text-xl mt-4">{feature.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground">{feature.description}</p>
                    </CardContent>
                </Card>
              </Link>
            ))}
        </div>
      </div>
      <InstallPwaButton />
    </main>
  );
}
