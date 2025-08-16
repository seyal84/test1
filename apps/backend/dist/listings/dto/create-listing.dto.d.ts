import { PropertyType } from '@prisma/client';
export declare class CreateListingDto {
    title: string;
    description: string;
    price: number;
    propertyType: PropertyType;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    bedrooms?: number;
    bathrooms?: number;
    squareFeet?: number;
    lotSize?: number;
    yearBuilt?: number;
    features?: any;
    images?: string[];
    virtualTour?: string;
}
