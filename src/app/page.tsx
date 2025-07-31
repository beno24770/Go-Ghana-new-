
import { InstallPwaButton } from "@/components/install-pwa-button";
import { Button } from "@/components/ui/button";
import { CheckCircle, Wand2 } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import AnimatedPhoneMockup from "@/components/animated-phone-mockup";

const features = [
    "Personalized, AI-powered itineraries",
    "Insider tips from local experts",
    "Connections to trusted drivers",
    "Real-time festival and event info"
];

const PhoneSkeleton = () => (
    <div className="relative mx-auto border-gray-800 dark:border-gray-800 bg-gray-800 border-[14px] rounded-[2.5rem] h-[600px] w-[300px] shadow-xl">
        <div className="w-full h-full bg-muted rounded-[2rem] p-4 space-y-4">
            <div className="flex justify-between items-center">
                <Skeleton className="h-6 w-6 rounded-full" />
                <Skeleton className="h-4 w-24 rounded-lg" />
                <Skeleton className="h-6 w-6 rounded-full" />
            </div>
            <div className="space-y-2">
                <Skeleton className="h-5 w-3/4 rounded-lg" />
                <Skeleton className="h-4 w-1/2 rounded-lg" />
            </div>
            <div className="space-y-3 pt-4">
                {[...Array(5)].map((_, i) => (
                    <div key={i} className="p-3 rounded-lg bg-background/50 space-y-2">
                        <Skeleton className="h-4 w-5/6" />
                        <Skeleton className="h-3 w-1/2" />
                    </div>
                ))}
            </div>
        </div>
    </div>
);


export default function Home() {
  return (
    <main className="flex-1 overflow-hidden">
        <div className="container mx-auto px-4 py-12 sm:py-24">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
                <div className="space-y-6 text-center lg:text-left">
                    <h1 className="font-headline text-4xl font-bold text-foreground drop-shadow-md sm:text-5xl md:text-6xl">
                        Your Trusted Ghana Travel Planner
                    </h1>
                    <p className="text-lg text-muted-foreground">
                        Plan your perfect trip with AI-powered itineraries, insider tips from local experts, and connections to trusted drivers. Experience Ghana like never before.
                    </p>
                    <ul className="space-y-3 text-left max-w-md mx-auto lg:mx-0">
                        {features.map((feature, i) => (
                            <li key={i} className="flex items-center gap-3">
                                <CheckCircle className="h-6 w-6 text-primary shrink-0" />
                                <span>{feature}</span>
                            </li>
                        ))}
                    </ul>
                    <div className="pt-4">
                        <Button asChild size="lg">
                            <Link href="/planner">
                                <Wand2 />
                                Start Planning Now
                            </Link>
                        </Button>
                    </div>
                </div>

                <div className="relative h-full min-h-[600px]">
                    <Suspense fallback={<PhoneSkeleton />}>
                        <AnimatedPhoneMockup />
                    </Suspense>
                </div>
            </div>
        </div>
        <InstallPwaButton />
    </main>
  );
}
