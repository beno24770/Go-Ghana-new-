
'use client';

import Link from "next/link";
import { Card, CardTitle } from "./ui/card";
import { LazyIcon } from "./lazy-icon";

interface Feature {
    icon: "Calculator" | "Map" | "Car" | "Languages";
    title: string;
    description: string;
    href: string;
}

export default function FeatureCard({ feature }: { feature: Feature }) {
    return (
        <Link href={feature.href} className="block transition-transform duration-300 hover:scale-105">
            <Card className="flex h-full flex-col text-left sm:flex-row">
                <div className="flex items-center justify-center p-6 sm:p-4">
                    <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 p-4 text-4xl">
                        <LazyIcon name={feature.icon} className="h-10 w-10" />
                    </div>
                </div>
                <div className="flex-1 p-6 pt-0 sm:pt-6">
                    <CardTitle className="font-headline text-xl">{feature.title}</CardTitle>
                    <p className="mt-2 text-muted-foreground">{feature.description}</p>
                </div>
            </Card>
        </Link>
    );
}
