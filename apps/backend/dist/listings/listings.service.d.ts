import { PropertyStatus, UserRole } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { NlpService } from './nlp.service';
import { CreateListingDto } from './dto/create-listing.dto';
import { UpdateListingDto } from './dto/update-listing.dto';
import { SearchListingsDto } from './dto/search-listings.dto';
export declare class ListingsService {
    private readonly prisma;
    private readonly nlpService;
    constructor(prisma: PrismaService, nlpService: NlpService);
    create(createListingDto: CreateListingDto, sellerId: string): Promise<{
        seller: {
            id: string;
            email: string;
            firstName: string;
            lastName: string;
            phone: string;
        };
    } & {
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        tags: string[];
        description: string;
        title: string;
        price: import("@prisma/client/runtime/library").Decimal;
        propertyType: import(".prisma/client").$Enums.PropertyType;
        address: string;
        city: string;
        state: string;
        zipCode: string;
        bedrooms: number | null;
        bathrooms: import("@prisma/client/runtime/library").Decimal | null;
        squareFeet: number | null;
        lotSize: import("@prisma/client/runtime/library").Decimal | null;
        yearBuilt: number | null;
        features: import("@prisma/client/runtime/library").JsonValue | null;
        images: string[];
        virtualTour: string | null;
        enhancedDesc: string | null;
        status: import(".prisma/client").$Enums.PropertyStatus;
        mlsId: string | null;
        sellerId: string;
    }>;
    findAll(searchDto: SearchListingsDto): Promise<{
        listings: ({
            _count: {
                offers: number;
            };
            seller: {
                id: string;
                email: string;
                firstName: string;
                lastName: string;
                phone: string;
            };
        } & {
            id: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            tags: string[];
            description: string;
            title: string;
            price: import("@prisma/client/runtime/library").Decimal;
            propertyType: import(".prisma/client").$Enums.PropertyType;
            address: string;
            city: string;
            state: string;
            zipCode: string;
            bedrooms: number | null;
            bathrooms: import("@prisma/client/runtime/library").Decimal | null;
            squareFeet: number | null;
            lotSize: import("@prisma/client/runtime/library").Decimal | null;
            yearBuilt: number | null;
            features: import("@prisma/client/runtime/library").JsonValue | null;
            images: string[];
            virtualTour: string | null;
            enhancedDesc: string | null;
            status: import(".prisma/client").$Enums.PropertyStatus;
            mlsId: string | null;
            sellerId: string;
        })[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    findOne(id: string): Promise<{
        offers: {
            id: string;
            createdAt: Date;
            status: import(".prisma/client").$Enums.OfferStatus;
            amount: import("@prisma/client/runtime/library").Decimal;
            buyer: {
                id: string;
                firstName: string;
                lastName: string;
            };
        }[];
        _count: {
            offers: number;
        };
        seller: {
            id: string;
            email: string;
            firstName: string;
            lastName: string;
            phone: string;
            avatar: string;
        };
    } & {
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        tags: string[];
        description: string;
        title: string;
        price: import("@prisma/client/runtime/library").Decimal;
        propertyType: import(".prisma/client").$Enums.PropertyType;
        address: string;
        city: string;
        state: string;
        zipCode: string;
        bedrooms: number | null;
        bathrooms: import("@prisma/client/runtime/library").Decimal | null;
        squareFeet: number | null;
        lotSize: import("@prisma/client/runtime/library").Decimal | null;
        yearBuilt: number | null;
        features: import("@prisma/client/runtime/library").JsonValue | null;
        images: string[];
        virtualTour: string | null;
        enhancedDesc: string | null;
        status: import(".prisma/client").$Enums.PropertyStatus;
        mlsId: string | null;
        sellerId: string;
    }>;
    update(id: string, updateListingDto: UpdateListingDto, userId: string, userRole: UserRole): Promise<{
        seller: {
            id: string;
            email: string;
            firstName: string;
            lastName: string;
            phone: string;
        };
    } & {
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        tags: string[];
        description: string;
        title: string;
        price: import("@prisma/client/runtime/library").Decimal;
        propertyType: import(".prisma/client").$Enums.PropertyType;
        address: string;
        city: string;
        state: string;
        zipCode: string;
        bedrooms: number | null;
        bathrooms: import("@prisma/client/runtime/library").Decimal | null;
        squareFeet: number | null;
        lotSize: import("@prisma/client/runtime/library").Decimal | null;
        yearBuilt: number | null;
        features: import("@prisma/client/runtime/library").JsonValue | null;
        images: string[];
        virtualTour: string | null;
        enhancedDesc: string | null;
        status: import(".prisma/client").$Enums.PropertyStatus;
        mlsId: string | null;
        sellerId: string;
    }>;
    remove(id: string, userId: string, userRole: UserRole): Promise<{
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        tags: string[];
        description: string;
        title: string;
        price: import("@prisma/client/runtime/library").Decimal;
        propertyType: import(".prisma/client").$Enums.PropertyType;
        address: string;
        city: string;
        state: string;
        zipCode: string;
        bedrooms: number | null;
        bathrooms: import("@prisma/client/runtime/library").Decimal | null;
        squareFeet: number | null;
        lotSize: import("@prisma/client/runtime/library").Decimal | null;
        yearBuilt: number | null;
        features: import("@prisma/client/runtime/library").JsonValue | null;
        images: string[];
        virtualTour: string | null;
        enhancedDesc: string | null;
        status: import(".prisma/client").$Enums.PropertyStatus;
        mlsId: string | null;
        sellerId: string;
    }>;
    updateStatus(id: string, status: PropertyStatus, userId: string, userRole: UserRole): Promise<{
        seller: {
            id: string;
            email: string;
            firstName: string;
            lastName: string;
            phone: string;
        };
    } & {
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        tags: string[];
        description: string;
        title: string;
        price: import("@prisma/client/runtime/library").Decimal;
        propertyType: import(".prisma/client").$Enums.PropertyType;
        address: string;
        city: string;
        state: string;
        zipCode: string;
        bedrooms: number | null;
        bathrooms: import("@prisma/client/runtime/library").Decimal | null;
        squareFeet: number | null;
        lotSize: import("@prisma/client/runtime/library").Decimal | null;
        yearBuilt: number | null;
        features: import("@prisma/client/runtime/library").JsonValue | null;
        images: string[];
        virtualTour: string | null;
        enhancedDesc: string | null;
        status: import(".prisma/client").$Enums.PropertyStatus;
        mlsId: string | null;
        sellerId: string;
    }>;
    addImages(id: string, imageUrls: string[], userId: string, userRole: UserRole): Promise<{
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        tags: string[];
        description: string;
        title: string;
        price: import("@prisma/client/runtime/library").Decimal;
        propertyType: import(".prisma/client").$Enums.PropertyType;
        address: string;
        city: string;
        state: string;
        zipCode: string;
        bedrooms: number | null;
        bathrooms: import("@prisma/client/runtime/library").Decimal | null;
        squareFeet: number | null;
        lotSize: import("@prisma/client/runtime/library").Decimal | null;
        yearBuilt: number | null;
        features: import("@prisma/client/runtime/library").JsonValue | null;
        images: string[];
        virtualTour: string | null;
        enhancedDesc: string | null;
        status: import(".prisma/client").$Enums.PropertyStatus;
        mlsId: string | null;
        sellerId: string;
    }>;
    removeImage(id: string, imageUrl: string, userId: string, userRole: UserRole): Promise<{
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        tags: string[];
        description: string;
        title: string;
        price: import("@prisma/client/runtime/library").Decimal;
        propertyType: import(".prisma/client").$Enums.PropertyType;
        address: string;
        city: string;
        state: string;
        zipCode: string;
        bedrooms: number | null;
        bathrooms: import("@prisma/client/runtime/library").Decimal | null;
        squareFeet: number | null;
        lotSize: import("@prisma/client/runtime/library").Decimal | null;
        yearBuilt: number | null;
        features: import("@prisma/client/runtime/library").JsonValue | null;
        images: string[];
        virtualTour: string | null;
        enhancedDesc: string | null;
        status: import(".prisma/client").$Enums.PropertyStatus;
        mlsId: string | null;
        sellerId: string;
    }>;
    getMyListings(userId: string, page?: number, limit?: number): Promise<{
        listings: ({
            _count: {
                offers: number;
            };
        } & {
            id: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            tags: string[];
            description: string;
            title: string;
            price: import("@prisma/client/runtime/library").Decimal;
            propertyType: import(".prisma/client").$Enums.PropertyType;
            address: string;
            city: string;
            state: string;
            zipCode: string;
            bedrooms: number | null;
            bathrooms: import("@prisma/client/runtime/library").Decimal | null;
            squareFeet: number | null;
            lotSize: import("@prisma/client/runtime/library").Decimal | null;
            yearBuilt: number | null;
            features: import("@prisma/client/runtime/library").JsonValue | null;
            images: string[];
            virtualTour: string | null;
            enhancedDesc: string | null;
            status: import(".prisma/client").$Enums.PropertyStatus;
            mlsId: string | null;
            sellerId: string;
        })[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    getFeaturedListings(limit?: number): Promise<({
        _count: {
            offers: number;
        };
        seller: {
            id: string;
            firstName: string;
            lastName: string;
        };
    } & {
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        tags: string[];
        description: string;
        title: string;
        price: import("@prisma/client/runtime/library").Decimal;
        propertyType: import(".prisma/client").$Enums.PropertyType;
        address: string;
        city: string;
        state: string;
        zipCode: string;
        bedrooms: number | null;
        bathrooms: import("@prisma/client/runtime/library").Decimal | null;
        squareFeet: number | null;
        lotSize: import("@prisma/client/runtime/library").Decimal | null;
        yearBuilt: number | null;
        features: import("@prisma/client/runtime/library").JsonValue | null;
        images: string[];
        virtualTour: string | null;
        enhancedDesc: string | null;
        status: import(".prisma/client").$Enums.PropertyStatus;
        mlsId: string | null;
        sellerId: string;
    })[]>;
    getListingAnalytics(id: string, userId: string, userRole: UserRole): Promise<{
        listing: {
            id: string;
            title: string;
            price: import("@prisma/client/runtime/library").Decimal;
            status: import(".prisma/client").$Enums.PropertyStatus;
            createdAt: Date;
        };
        offers: (import(".prisma/client").Prisma.PickEnumerable<import(".prisma/client").Prisma.OfferGroupByOutputType, "status"[]> & {
            _count: {
                status: number;
            };
        })[];
        views: {
            totalViews: number;
            uniqueViews: number;
        };
    }>;
}
