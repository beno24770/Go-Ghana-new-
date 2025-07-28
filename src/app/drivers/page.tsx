
'use client';

import DriverProfileCard from '@/components/driver-profile-card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { UserPlus } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

const drivers = [
    {
        name: "Jerome Evame",
        regions: ["Greater Accra", "Central", "Eastern"],
        bio: "With over 10 years of experience driving in Accra and the coastal regions, I know all the best spots, from historic landmarks to hidden gems. I ensure a safe, comfortable, and insightful journey.",
        vehicle: "Toyota Corolla (A/C)",
        whatsAppUrl: "https://wa.me/233200635250",
    },
    {
        name: "Ama Serwaa",
        regions: ["Ashanti", "Bono", "Ahafo"],
        bio: "As a proud Ashanti native, I love sharing the rich culture of my homeland. From the bustling Kejetia market to serene craft villages, I'll guide you through the heart of Ghana with a smile.",
        vehicle: "Hyundai Tucson (SUV)",
        whatsAppUrl: "https://wa.me/233200635250",
    },
    {
        name: "Yaw Asante",
        regions: ["Northern", "Savannah", "North East"],
        bio: "The northern regions are full of adventure! I specialize in wildlife tours to Mole National Park and exploring historic sites like the Larabanga Mosque. My 4x4 is ready for any road.",
        vehicle: "Ford Ranger (4x4)",
        whatsAppUrl: "https://wa.me/233200635250",
    },
    {
        name: "Esi Badu",
        regions: ["Volta", "Oti"],
        bio: "Discover the natural beauty of the Volta region with me. From the Wli waterfalls to the monkey sanctuaries, I offer a peaceful and scenic travel experience away from the city hustle.",
        vehicle: "Kia Sportage (A/C)",
        whatsAppUrl: "https://wa.me/233200635250",
    }
];

const DriverSkeleton = () => (
    <div className="flex flex-col space-y-3 rounded-lg border bg-card p-6">
        <Skeleton className="h-6 w-1/2 rounded" />
        <div className="flex flex-wrap gap-2">
            <Skeleton className="h-5 w-20 rounded-full" />
            <Skeleton className="h-5 w-16 rounded-full" />
        </div>
        <div className="space-y-2 pt-2">
            <Skeleton className="h-4 w-full rounded" />
            <Skeleton className="h-4 w-full rounded" />
            <Skeleton className="h-4 w-3/4 rounded" />
        </div>
        <div className="space-y-4 pt-4">
            <Skeleton className="h-5 w-1/3 rounded" />
            <Skeleton className="h-11 w-full rounded-md" />
        </div>
    </div>
)

export default function DriversPage() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading to show skeleton
    const timer = setTimeout(() => {
        setIsLoading(false);
    }, 500); // Adjust delay as needed
    return () => clearTimeout(timer);
  }, []);

  return (
    <main className="flex-1">
      <div className="bg-muted py-20">
        <div className="container mx-auto max-w-3xl px-4 text-center">
            <h1 className="font-headline text-3xl font-bold sm:text-4xl md:text-5xl">
                Connect with a Trusted Local Driver
            </h1>
            <p className="mt-4 text-base text-muted-foreground sm:text-lg md:text-xl">
              Travel with confidence. Our vetted drivers are more than just transport—they're your personal guides to experiencing the real Ghana at a fair, negotiated price.
            </p>
        </div>
      </div>

      <div className="container mx-auto max-w-5xl px-4 py-16 sm:py-24">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            {isLoading ? (
                <>
                    <DriverSkeleton />
                    <DriverSkeleton />
                    <DriverSkeleton />
                    <DriverSkeleton />
                </>
            ) : (
                drivers.map(driver => (
                    <DriverProfileCard key={driver.name} {...driver} />
                ))
            )}
        </div>

         <div className="mt-16 rounded-lg bg-primary/5 p-8 text-center">
            <h2 className="font-headline text-2xl font-bold">Are You a Driver?</h2>
            <p className="mx-auto mt-2 max-w-xl text-muted-foreground">
              If you're a professional, reliable driver with a deep knowledge of Ghana and a passion for tourism, we'd love to hear from you. Join our trusted network.
            </p>
            <Button asChild size="lg" className="mt-6">
              <Link href="https://wa.me/233200635250" target="_blank">
                <UserPlus />
                Apply to Join
              </Link>
            </Button>
        </div>
      </div>
    </main>
  );
}
