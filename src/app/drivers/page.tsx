
import DriverProfileCard from '@/components/driver-profile-card';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import Link from 'next/link';

const drivers = [
    {
        name: "Jerome Evame",
        imageUrl: "https://placehold.co/400x400.png",
        imageHint: "pixar style man",
        regions: ["Greater Accra", "Central", "Eastern"],
        bio: "With over 10 years of experience driving in Accra and the coastal regions, I know all the best spots, from historic landmarks to hidden gems. I ensure a safe, comfortable, and insightful journey.",
        vehicle: "Toyota Corolla (A/C)",
        whatsAppUrl: "https://wa.me/233200635250",
    },
    {
        name: "Ama Serwaa",
        imageUrl: "https://placehold.co/400x400.png",
        imageHint: "pixar style woman",
        regions: ["Ashanti", "Bono", "Ahafo"],
        bio: "As a proud Ashanti native, I love sharing the rich culture of my homeland. From the bustling Kejetia market to serene craft villages, I'll guide you through the heart of Ghana with a smile.",
        vehicle: "Hyundai Tucson (SUV)",
        whatsAppUrl: "https://wa.me/233200635250",
    },
    {
        name: "Yaw Asante",
        imageUrl: "https://placehold.co/400x400.png",
        imageHint: "man sunglasses",
        regions: ["Northern", "Savannah", "North East"],
        bio: "The northern regions are full of adventure! I specialize in wildlife tours to Mole National Park and exploring historic sites like the Larabanga Mosque. My 4x4 is ready for any road.",
        vehicle: "Ford Ranger (4x4)",
        whatsAppUrl: "https://wa.me/233200635250",
    },
    {
        name: "Esi Badu",
        imageUrl: "https://placehold.co/400x400.png",
        imageHint: "woman headwrap",
        regions: ["Volta", "Oti"],
        bio: "Discover the natural beauty of the Volta region with me. From the Wli waterfalls to the monkey sanctuaries, I offer a peaceful and scenic travel experience away from the city hustle.",
        vehicle: "Kia Sportage (A/C)",
        whatsAppUrl: "https://wa.me/233200635250",
    }
]

export default function DriversPage() {
  return (
    <main className="flex-1">
      <div className="relative flex h-[40vh] min-h-[300px] items-center justify-center px-4 text-center">
          <Image
              src="https://www.letvisitghana.com/wp-content/uploads/2024/05/Accra-city.jpg"
              alt="A street in Accra with cars"
              fill
              className="object-cover -z-10 brightness-50"
              priority
              data-ai-hint="accra street"
          />
          <div className="max-w-3xl">
              <h1 className="font-headline text-3xl font-bold text-white shadow-lg sm:text-4xl md:text-5xl">
                  Connect with a Trusted Local Driver
              </h1>
              <p className="mt-4 text-base text-white/90 sm:text-lg md:text-xl">
                Travel with confidence. Our vetted drivers are more than just transport—they're your personal guides to experiencing the real Ghana at a fair, negotiated price.
              </p>
          </div>
      </div>

      <div className="container mx-auto max-w-5xl px-4 py-16 sm:py-24">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-2">
            {drivers.map(driver => (
                <DriverProfileCard key={driver.name} {...driver} />
            ))}
        </div>

         <div className="mt-16 rounded-lg border-2 border-dashed border-primary bg-primary/5 p-8 text-center">
            <h2 className="font-headline text-2xl font-bold">Are You a Driver?</h2>
            <p className="mx-auto mt-2 max-w-xl text-muted-foreground">
              If you're a professional, reliable driver with a deep knowledge of Ghana and a passion for tourism, we'd love to hear from you. Join our trusted network.
            </p>
            <Button asChild size="lg" className="mt-6">
              <Link href="https://wa.me/233200635250" target="_blank">
                Apply to Join
              </Link>
            </Button>
        </div>
      </div>
    </main>
  );
}
