"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ListingsService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../prisma/prisma.service");
const nlp_service_1 = require("./nlp.service");
let ListingsService = class ListingsService {
    constructor(prisma, nlpService) {
        this.prisma = prisma;
        this.nlpService = nlpService;
    }
    async create(createListingDto, sellerId) {
        const { title, description, price, propertyType, address, city, state, zipCode, bedrooms, bathrooms, squareFeet, lotSize, yearBuilt, features, images, virtualTour, } = createListingDto;
        const [enhancedDesc, tags] = await Promise.all([
            this.nlpService.enhanceDescription(description),
            this.nlpService.generateTags(description, propertyType),
        ]);
        return this.prisma.listing.create({
            data: {
                title,
                description,
                enhancedDesc,
                price,
                propertyType,
                address,
                city,
                state,
                zipCode,
                bedrooms,
                bathrooms,
                squareFeet,
                lotSize,
                yearBuilt,
                features,
                images: images || [],
                virtualTour,
                tags,
                sellerId,
            },
            include: {
                seller: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                        phone: true,
                    },
                },
            },
        });
    }
    async findAll(searchDto) {
        const { page = 1, limit = 10, city, state, minPrice, maxPrice, propertyType, minBedrooms, maxBedrooms, minBathrooms, maxBathrooms, minSquareFeet, maxSquareFeet, tags, sortBy = 'createdAt', sortOrder = 'desc', } = searchDto;
        const skip = (page - 1) * limit;
        const where = {
            isActive: true,
            status: client_1.PropertyStatus.ACTIVE,
        };
        if (city)
            where.city = { contains: city, mode: 'insensitive' };
        if (state)
            where.state = { contains: state, mode: 'insensitive' };
        if (minPrice || maxPrice) {
            where.price = {};
            if (minPrice)
                where.price.gte = minPrice;
            if (maxPrice)
                where.price.lte = maxPrice;
        }
        if (propertyType)
            where.propertyType = propertyType;
        if (minBedrooms)
            where.bedrooms = { ...where.bedrooms, gte: minBedrooms };
        if (maxBedrooms)
            where.bedrooms = { ...where.bedrooms, lte: maxBedrooms };
        if (minBathrooms)
            where.bathrooms = { ...where.bathrooms, gte: minBathrooms };
        if (maxBathrooms)
            where.bathrooms = { ...where.bathrooms, lte: maxBathrooms };
        if (minSquareFeet)
            where.squareFeet = { ...where.squareFeet, gte: minSquareFeet };
        if (maxSquareFeet)
            where.squareFeet = { ...where.squareFeet, lte: maxSquareFeet };
        if (tags && tags.length > 0) {
            where.tags = { hasSome: tags };
        }
        const orderBy = {};
        orderBy[sortBy] = sortOrder;
        const [listings, total] = await Promise.all([
            this.prisma.listing.findMany({
                where,
                skip,
                take: limit,
                orderBy,
                include: {
                    seller: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                            email: true,
                            phone: true,
                        },
                    },
                    _count: {
                        select: {
                            offers: true,
                        },
                    },
                },
            }),
            this.prisma.listing.count({ where }),
        ]);
        return {
            listings,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
    async findOne(id) {
        const listing = await this.prisma.listing.findUnique({
            where: { id, isActive: true },
            include: {
                seller: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                        phone: true,
                        avatar: true,
                    },
                },
                offers: {
                    where: { status: { in: ['PENDING', 'ACCEPTED'] } },
                    select: {
                        id: true,
                        amount: true,
                        status: true,
                        createdAt: true,
                        buyer: {
                            select: {
                                id: true,
                                firstName: true,
                                lastName: true,
                            },
                        },
                    },
                    orderBy: { createdAt: 'desc' },
                },
                _count: {
                    select: {
                        offers: true,
                    },
                },
            },
        });
        if (!listing) {
            throw new common_1.NotFoundException('Listing not found');
        }
        return listing;
    }
    async update(id, updateListingDto, userId, userRole) {
        const listing = await this.findOne(id);
        if (userRole !== client_1.UserRole.ADMIN && listing.sellerId !== userId) {
            throw new common_1.ForbiddenException('You can only update your own listings');
        }
        const updateData = { ...updateListingDto };
        if (updateListingDto.description) {
            const [enhancedDesc, tags] = await Promise.all([
                this.nlpService.enhanceDescription(updateListingDto.description),
                this.nlpService.generateTags(updateListingDto.description, updateListingDto.propertyType || listing.propertyType),
            ]);
            updateData.enhancedDesc = enhancedDesc;
            updateData.tags = tags;
        }
        return this.prisma.listing.update({
            where: { id },
            data: updateData,
            include: {
                seller: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                        phone: true,
                    },
                },
            },
        });
    }
    async remove(id, userId, userRole) {
        const listing = await this.findOne(id);
        if (userRole !== client_1.UserRole.ADMIN && listing.sellerId !== userId) {
            throw new common_1.ForbiddenException('You can only delete your own listings');
        }
        return this.prisma.listing.update({
            where: { id },
            data: { isActive: false },
        });
    }
    async updateStatus(id, status, userId, userRole) {
        const listing = await this.findOne(id);
        if (userRole !== client_1.UserRole.ADMIN && listing.sellerId !== userId) {
            throw new common_1.ForbiddenException('You can only update your own listings');
        }
        return this.prisma.listing.update({
            where: { id },
            data: { status },
            include: {
                seller: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                        phone: true,
                    },
                },
            },
        });
    }
    async addImages(id, imageUrls, userId, userRole) {
        const listing = await this.findOne(id);
        if (userRole !== client_1.UserRole.ADMIN && listing.sellerId !== userId) {
            throw new common_1.ForbiddenException('You can only update your own listings');
        }
        const updatedImages = [...listing.images, ...imageUrls];
        return this.prisma.listing.update({
            where: { id },
            data: { images: updatedImages },
        });
    }
    async removeImage(id, imageUrl, userId, userRole) {
        const listing = await this.findOne(id);
        if (userRole !== client_1.UserRole.ADMIN && listing.sellerId !== userId) {
            throw new common_1.ForbiddenException('You can only update your own listings');
        }
        const updatedImages = listing.images.filter(img => img !== imageUrl);
        return this.prisma.listing.update({
            where: { id },
            data: { images: updatedImages },
        });
    }
    async getMyListings(userId, page = 1, limit = 10) {
        const skip = (page - 1) * limit;
        const [listings, total] = await Promise.all([
            this.prisma.listing.findMany({
                where: { sellerId: userId, isActive: true },
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    _count: {
                        select: {
                            offers: true,
                        },
                    },
                },
            }),
            this.prisma.listing.count({ where: { sellerId: userId, isActive: true } }),
        ]);
        return {
            listings,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
    async getFeaturedListings(limit = 6) {
        return this.prisma.listing.findMany({
            where: {
                isActive: true,
                status: client_1.PropertyStatus.ACTIVE,
            },
            take: limit,
            orderBy: [
                { createdAt: 'desc' },
                { price: 'desc' },
            ],
            include: {
                seller: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                    },
                },
                _count: {
                    select: {
                        offers: true,
                    },
                },
            },
        });
    }
    async getListingAnalytics(id, userId, userRole) {
        const listing = await this.findOne(id);
        if (userRole !== client_1.UserRole.ADMIN && listing.sellerId !== userId) {
            throw new common_1.ForbiddenException('You can only view analytics for your own listings');
        }
        const [offerStats, viewStats] = await Promise.all([
            this.prisma.offer.groupBy({
                by: ['status'],
                where: { listingId: id },
                _count: { status: true },
            }),
            Promise.resolve({ totalViews: 0, uniqueViews: 0 }),
        ]);
        return {
            listing: {
                id: listing.id,
                title: listing.title,
                price: listing.price,
                status: listing.status,
                createdAt: listing.createdAt,
            },
            offers: offerStats,
            views: viewStats,
        };
    }
};
exports.ListingsService = ListingsService;
exports.ListingsService = ListingsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        nlp_service_1.NlpService])
], ListingsService);
//# sourceMappingURL=listings.service.js.map