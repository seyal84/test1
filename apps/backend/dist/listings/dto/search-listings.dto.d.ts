import { PropertyType } from '@prisma/client';
export declare class SearchListingsDto {
    page?: number;
    limit?: number;
    city?: string;
    state?: string;
    minPrice?: number;
    maxPrice?: number;
    propertyType?: PropertyType;
    minBedrooms?: number;
    maxBedrooms?: number;
    minBathrooms?: number;
    maxBathrooms?: number;
    minSquareFeet?: number;
    maxSquareFeet?: number;
    tags?: string[];
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}
