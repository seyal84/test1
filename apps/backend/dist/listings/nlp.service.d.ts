import { ConfigService } from '@nestjs/config';
export declare class NlpService {
    private configService;
    private readonly logger;
    private readonly huggingFaceApiUrl;
    private readonly apiKey;
    constructor(configService: ConfigService);
    enhanceDescription(originalDescription: string): Promise<string>;
    generateTags(description: string, propertyType: string): Promise<string[]>;
    extractKeyFeatures(description: string): Promise<string[]>;
    private extractCommonFeatures;
    analyzeSentiment(description: string): Promise<{
        sentiment: string;
        confidence: number;
    }>;
}
