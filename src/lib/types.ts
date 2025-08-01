
export type ItineraryDay = {
    day: number;
    title: string;
    details: string;
    overnight: string;
}

export type Tour = {
    id: string;
    title: string;
    duration: string;
    price: string;
    priceValue: number;
    description: string;
    bookingUrl: string;
    "data-ai-hint": string;
    itinerary: ItineraryDay[];
}
