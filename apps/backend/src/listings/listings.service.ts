import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PropertyType, PropertyStatus, UserRole } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { NlpService } from './nlp.service';
import { CreateListingDto } from './dto/create-listing.dto';
import { UpdateListingDto } from './dto/update-listing.dto';
import { SearchListingsDto } from './dto/search-listings.dto';

@Injectable()
export class ListingsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly nlpService: NlpService,
  ) {}

  async create(createListingDto: CreateListingDto, sellerId: string) {
    const {
      title,
      description,
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
      images,
      virtualTour,
    } = createListingDto;

    // Enhance description and generate tags using NLP
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

  async findAll(searchDto: SearchListingsDto) {
    const {
      page = 1,
      limit = 10,
      city,
      state,
      minPrice,
      maxPrice,
      propertyType,
      minBedrooms,
      maxBedrooms,
      minBathrooms,
      maxBathrooms,
      minSquareFeet,
      maxSquareFeet,
      tags,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = searchDto;

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {
      isActive: true,
      status: PropertyStatus.ACTIVE,
    };

    if (city) where.city = { contains: city, mode: 'insensitive' };
    if (state) where.state = { contains: state, mode: 'insensitive' };
    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = minPrice;
      if (maxPrice) where.price.lte = maxPrice;
    }
    if (propertyType) where.propertyType = propertyType;
    if (minBedrooms) where.bedrooms = { ...where.bedrooms, gte: minBedrooms };
    if (maxBedrooms) where.bedrooms = { ...where.bedrooms, lte: maxBedrooms };
    if (minBathrooms) where.bathrooms = { ...where.bathrooms, gte: minBathrooms };
    if (maxBathrooms) where.bathrooms = { ...where.bathrooms, lte: maxBathrooms };
    if (minSquareFeet) where.squareFeet = { ...where.squareFeet, gte: minSquareFeet };
    if (maxSquareFeet) where.squareFeet = { ...where.squareFeet, lte: maxSquareFeet };
    if (tags && tags.length > 0) {
      where.tags = { hasSome: tags };
    }

    // Build order by clause
    const orderBy: any = {};
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

  async findOne(id: string) {
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
      throw new NotFoundException('Listing not found');
    }

    return listing;
  }

  async update(id: string, updateListingDto: UpdateListingDto, userId: string, userRole: UserRole) {
    const listing = await this.findOne(id);

    // Check permissions
    if (userRole !== UserRole.ADMIN && listing.sellerId !== userId) {
      throw new ForbiddenException('You can only update your own listings');
    }

    const updateData: any = { ...updateListingDto };

    // If description is being updated, enhance it with NLP
    if (updateListingDto.description) {
      const [enhancedDesc, tags] = await Promise.all([
        this.nlpService.enhanceDescription(updateListingDto.description),
        this.nlpService.generateTags(
          updateListingDto.description,
          updateListingDto.propertyType || listing.propertyType,
        ),
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

  async remove(id: string, userId: string, userRole: UserRole) {
    const listing = await this.findOne(id);

    // Check permissions
    if (userRole !== UserRole.ADMIN && listing.sellerId !== userId) {
      throw new ForbiddenException('You can only delete your own listings');
    }

    // Soft delete by setting isActive to false
    return this.prisma.listing.update({
      where: { id },
      data: { isActive: false },
    });
  }

  async updateStatus(id: string, status: PropertyStatus, userId: string, userRole: UserRole) {
    const listing = await this.findOne(id);

    // Check permissions
    if (userRole !== UserRole.ADMIN && listing.sellerId !== userId) {
      throw new ForbiddenException('You can only update your own listings');
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

  async addImages(id: string, imageUrls: string[], userId: string, userRole: UserRole) {
    const listing = await this.findOne(id);

    // Check permissions
    if (userRole !== UserRole.ADMIN && listing.sellerId !== userId) {
      throw new ForbiddenException('You can only update your own listings');
    }

    const updatedImages = [...listing.images, ...imageUrls];

    return this.prisma.listing.update({
      where: { id },
      data: { images: updatedImages },
    });
  }

  async removeImage(id: string, imageUrl: string, userId: string, userRole: UserRole) {
    const listing = await this.findOne(id);

    // Check permissions
    if (userRole !== UserRole.ADMIN && listing.sellerId !== userId) {
      throw new ForbiddenException('You can only update your own listings');
    }

    const updatedImages = listing.images.filter(img => img !== imageUrl);

    return this.prisma.listing.update({
      where: { id },
      data: { images: updatedImages },
    });
  }

  async getMyListings(userId: string, page = 1, limit = 10) {
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
        status: PropertyStatus.ACTIVE,
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

  async getListingAnalytics(id: string, userId: string, userRole: UserRole) {
    const listing = await this.findOne(id);

    // Check permissions
    if (userRole !== UserRole.ADMIN && listing.sellerId !== userId) {
      throw new ForbiddenException('You can only view analytics for your own listings');
    }

    const [offerStats, viewStats] = await Promise.all([
      this.prisma.offer.groupBy({
        by: ['status'],
        where: { listingId: id },
        _count: { status: true },
      }),
      // Note: In a real app, you'd track views in a separate table
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
}