
import { Button } from "@/components/ui/button";
import { ArrowRight, Wand2 } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { PhoneMockup } from "@/components/phone-mockup";
import { InstallPwaButton } from "@/components/install-pwa-button";

const PhoneSkeleton = () => (
    <div className="relative mx-auto border-gray-800 bg-gray-800 border-[14px] rounded-[2.5rem] h-[600px] w-[300px] shadow-xl">
        <Skeleton className="h-full w-full rounded-[2rem] bg-muted/50" />
    </div>
)

export default function Home() {
  return (
    <div className="flex-1 overflow-hidden">
        <div className="container mx-auto px-4 py-12 sm:py-24">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
                <div className="space-y-6 text-center lg:text-left">
                    <h1 className="text-4xl font-bold text-foreground drop-shadow-md sm:text-5xl md:text-6xl">
                        Plan Your Dream Ghana Trip in Minutes
                    </h1>
                    <p className="text-lg text-muted-foreground">
                        Stop guessing. Get a realistic budget, a personalized itinerary, and connect with trusted local experts — all built on real data and insight from those who know Ghana best.
                    </p>
                    <div className="pt-4 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                        <Button asChild size="lg">
                            <Link href="/planner">
                                <Wand2 />
                                Start Planning Now
                            </Link>
                        </Button>
                        <Button asChild variant="ghost" size="lg">
                            <Link href="/events">
                                See Local Events <ArrowRight />
                            </Link>
                        </Button>
                    </div>
                </div>

                <div className="relative h-full min-h-[600px] flex items-center justify-center">
                    <Suspense fallback={<PhoneSkeleton />}>
                        <PhoneMockup />
                    </Suspense>
                </div>
            </div>
        </div>
        <InstallPwaButton className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg" />
    </div>
  );
}

    