import {
  IsString,
  IsNumber,
  IsEnum,
  IsOptional,
  IsArray,
  IsUrl,
  Min,
  Max,
  IsDecimal,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { PropertyType } from '@prisma/client';
import { Transform } from 'class-transformer';

export class CreateListingDto {
  @ApiProperty({ example: 'Beautiful Family Home in Downtown' })
  @IsString()
  title: string;

  @ApiProperty({ example: 'Spacious 4-bedroom home with modern amenities...' })
  @IsString()
  description: string;

  @ApiProperty({ example: 450000 })
  @IsNumber()
  @Min(0)
  @Transform(({ value }) => parseFloat(value))
  price: number;

  @ApiProperty({ example: 'HOUSE', enum: PropertyType })
  @IsEnum(PropertyType)
  propertyType: PropertyType;

  @ApiProperty({ example: '123 Main Street' })
  @IsString()
  address: string;

  @ApiProperty({ example: 'San Francisco' })
  @IsString()
  city: string;

  @ApiProperty({ example: 'CA' })
  @IsString()
  state: string;

  @ApiProperty({ example: '94102' })
  @IsString()
  zipCode: string;

  @ApiProperty({ example: 4, required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(20)
  bedrooms?: number;

  @ApiProperty({ example: 2.5, required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(20)
  @Transform(({ value }) => parseFloat(value))
  bathrooms?: number;

  @ApiProperty({ example: 2500, required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  squareFeet?: number;

  @ApiProperty({ example: 0.25, required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Transform(({ value }) => parseFloat(value))
  lotSize?: number;

  @ApiProperty({ example: 1995, required: false })
  @IsOptional()
  @IsNumber()
  @Min(1800)
  @Max(new Date().getFullYear())
  yearBuilt?: number;

  @ApiProperty({ 
    example: { 
      garage: true, 
      pool: false, 
      fireplace: true 
    }, 
    required: false 
  })
  @IsOptional()
  features?: any;

  @ApiProperty({ 
    example: [
      'https://example.com/image1.jpg',
      'https://example.com/image2.jpg'
    ], 
    required: false 
  })
  @IsOptional()
  @IsArray()
  @IsUrl({}, { each: true })
  images?: string[];

  @ApiProperty({ example: 'https://example.com/virtual-tour', required: false })
  @IsOptional()
  @IsUrl()
  virtualTour?: string;
}