import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class NlpService {
  private readonly logger = new Logger(NlpService.name);
  private readonly huggingFaceApiUrl = 'https://api-inference.huggingface.co/models';
  private readonly apiKey: string;

  constructor(private configService: ConfigService) {
    this.apiKey = this.configService.get('HUGGING_FACE_API_KEY');
  }

  async enhanceDescription(originalDescription: string): Promise<string> {
    try {
      // Use a text generation model to enhance the description
      const response = await axios.post(
        `${this.huggingFaceApiUrl}/microsoft/DialoGPT-medium`,
        {
          inputs: `Enhance this real estate property description to be more appealing and professional: ${originalDescription}`,
          parameters: {
            max_length: 200,
            temperature: 0.7,
            do_sample: true,
          },
        },
        {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
        },
      );

      const enhancedText = response.data[0]?.generated_text || originalDescription;
      
      // Clean up the response to remove the original prompt
      const cleaned = enhancedText.replace(originalDescription, '').trim();
      
      return cleaned || originalDescription;
    } catch (error) {
      this.logger.error('Failed to enhance description with Hugging Face:', error.message);
      return originalDescription; // Fallback to original description
    }
  }

  async generateTags(description: string, propertyType: string): Promise<string[]> {
    try {
      // Use a classification model to generate relevant tags
      const response = await axios.post(
        `${this.huggingFaceApiUrl}/facebook/bart-large-mnli`,
        {
          inputs: description,
          parameters: {
            candidate_labels: [
              'luxury',
              'family-friendly',
              'modern',
              'historic',
              'spacious',
              'cozy',
              'updated',
              'move-in ready',
              'investment property',
              'fixer-upper',
              'waterfront',
              'mountain view',
              'city view',
              'quiet neighborhood',
              'walkable',
              'near schools',
              'near shopping',
              'near transportation',
              'pet-friendly',
              'energy efficient',
            ],
          },
        },
        {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
        },
      );

      // Extract high-confidence tags
      const tags = response.data.labels
        .filter((_, index) => response.data.scores[index] > 0.5)
        .slice(0, 5); // Limit to top 5 tags

      // Always include property type as a tag
      tags.unshift(propertyType.toLowerCase());

      return [...new Set(tags)]; // Remove duplicates
    } catch (error) {
      this.logger.error('Failed to generate tags with Hugging Face:', error.message);
      return [propertyType.toLowerCase()]; // Fallback to property type only
    }
  }

  async extractKeyFeatures(description: string): Promise<string[]> {
    try {
      // Use NER (Named Entity Recognition) to extract key features
      const response = await axios.post(
        `${this.huggingFaceApiUrl}/dbmdz/bert-large-cased-finetuned-conll03-english`,
        {
          inputs: description,
        },
        {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
        },
      );

      // Extract relevant entities and features
      const features = response.data
        .filter(entity => ['MISC', 'ORG'].includes(entity.entity_group))
        .map(entity => entity.word)
        .filter(word => word.length > 2);

      // Add common real estate features based on keywords
      const commonFeatures = this.extractCommonFeatures(description);
      
      return [...new Set([...features, ...commonFeatures])];
    } catch (error) {
      this.logger.error('Failed to extract features with Hugging Face:', error.message);
      return this.extractCommonFeatures(description); // Fallback to keyword extraction
    }
  }

  private extractCommonFeatures(description: string): string[] {
    const features = [];
    const lowerDesc = description.toLowerCase();

    // Common real estate features to look for
    const featureMap = {
      'granite countertops': ['granite', 'countertop'],
      'hardwood floors': ['hardwood', 'wood floor'],
      'stainless steel appliances': ['stainless', 'steel appliance'],
      'walk-in closet': ['walk-in closet', 'walk in closet'],
      'master suite': ['master suite', 'master bedroom'],
      'open floor plan': ['open floor', 'open concept'],
      'fireplace': ['fireplace', 'fire place'],
      'swimming pool': ['pool', 'swimming'],
      'garage': ['garage', 'car port'],
      'deck': ['deck', 'patio'],
      'basement': ['basement', 'lower level'],
      'attic': ['attic', 'loft'],
      'central air': ['central air', 'ac', 'air conditioning'],
      'heating': ['heating', 'furnace', 'heat pump'],
      'laundry room': ['laundry', 'washer', 'dryer'],
    };

    Object.entries(featureMap).forEach(([feature, keywords]) => {
      if (keywords.some(keyword => lowerDesc.includes(keyword))) {
        features.push(feature);
      }
    });

    return features;
  }

  async analyzeSentiment(description: string): Promise<{ sentiment: string; confidence: number }> {
    try {
      const response = await axios.post(
        `${this.huggingFaceApiUrl}/cardiffnlp/twitter-roberta-base-sentiment-latest`,
        {
          inputs: description,
        },
        {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
        },
      );

      const result = response.data[0];
      return {
        sentiment: result.label,
        confidence: result.score,
      };
    } catch (error) {
      this.logger.error('Failed to analyze sentiment:', error.message);
      return { sentiment: 'NEUTRAL', confidence: 0.5 };
    }
  }
}