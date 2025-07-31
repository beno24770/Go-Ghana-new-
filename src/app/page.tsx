
import { InstallPwaButton } from "@/components/install-pwa-button";
import { Button } from "@/components/ui/button";
import { ArrowRight, Wand2 } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import { PhoneMockup } from "@/components/phone-mockup";

export default function Home() {
  return (
    <div className="flex-1 overflow-hidden">
        <div className="container mx-auto px-4 py-12 sm:py-24">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
                <div className="space-y-6 text-center lg:text-left">
                    <h1 className="text-4xl font-bold text-foreground drop-shadow-md sm:text-5xl md:text-6xl">
                        Real Plans. Real Prices. Real Ghana.
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
                   <PhoneMockup />
                </div>
            </div>
        </div>
        <InstallPwaButton />
    </div>
  );
}
