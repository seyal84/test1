import {
  IsOptional,
  IsNumber,
  IsString,
  IsEnum,
  IsArray,
  Min,
  Max,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { PropertyType } from '@prisma/client';
import { Transform, Type } from 'class-transformer';

export class SearchListingsDto {
  @ApiProperty({ example: 1, required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiProperty({ example: 10, required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 10;

  @ApiProperty({ example: 'San Francisco', required: false })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiProperty({ example: 'CA', required: false })
  @IsOptional()
  @IsString()
  state?: string;

  @ApiProperty({ example: 100000, required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  minPrice?: number;

  @ApiProperty({ example: 1000000, required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  maxPrice?: number;

  @ApiProperty({ example: 'HOUSE', enum: PropertyType, required: false })
  @IsOptional()
  @IsEnum(PropertyType)
  propertyType?: PropertyType;

  @ApiProperty({ example: 2, required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  minBedrooms?: number;

  @ApiProperty({ example: 5, required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  maxBedrooms?: number;

  @ApiProperty({ example: 1, required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  minBathrooms?: number;

  @ApiProperty({ example: 3, required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  maxBathrooms?: number;

  @ApiProperty({ example: 1000, required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  minSquareFeet?: number;

  @ApiProperty({ example: 5000, required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  maxSquareFeet?: number;

  @ApiProperty({ example: ['luxury', 'modern'], required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiProperty({ 
    example: 'createdAt', 
    enum: ['createdAt', 'price', 'bedrooms', 'bathrooms', 'squareFeet'],
    required: false 
  })
  @IsOptional()
  @IsString()
  sortBy?: string = 'createdAt';

  @ApiProperty({ 
    example: 'desc', 
    enum: ['asc', 'desc'],
    required: false 
  })
  @IsOptional()
  @IsEnum(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc' = 'desc';
}