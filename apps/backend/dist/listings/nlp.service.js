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
var NlpService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.NlpService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const axios_1 = require("axios");
let NlpService = NlpService_1 = class NlpService {
    constructor(configService) {
        this.configService = configService;
        this.logger = new common_1.Logger(NlpService_1.name);
        this.huggingFaceApiUrl = 'https://api-inference.huggingface.co/models';
        this.apiKey = this.configService.get('HUGGING_FACE_API_KEY');
    }
    async enhanceDescription(originalDescription) {
        try {
            const response = await axios_1.default.post(`${this.huggingFaceApiUrl}/microsoft/DialoGPT-medium`, {
                inputs: `Enhance this real estate property description to be more appealing and professional: ${originalDescription}`,
                parameters: {
                    max_length: 200,
                    temperature: 0.7,
                    do_sample: true,
                },
            }, {
                headers: {
                    Authorization: `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json',
                },
            });
            const enhancedText = response.data[0]?.generated_text || originalDescription;
            const cleaned = enhancedText.replace(originalDescription, '').trim();
            return cleaned || originalDescription;
        }
        catch (error) {
            this.logger.error('Failed to enhance description with Hugging Face:', error.message);
            return originalDescription;
        }
    }
    async generateTags(description, propertyType) {
        try {
            const response = await axios_1.default.post(`${this.huggingFaceApiUrl}/facebook/bart-large-mnli`, {
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
            }, {
                headers: {
                    Authorization: `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json',
                },
            });
            const tags = response.data.labels
                .filter((_, index) => response.data.scores[index] > 0.5)
                .slice(0, 5);
            tags.unshift(propertyType.toLowerCase());
            return [...new Set(tags)];
        }
        catch (error) {
            this.logger.error('Failed to generate tags with Hugging Face:', error.message);
            return [propertyType.toLowerCase()];
        }
    }
    async extractKeyFeatures(description) {
        try {
            const response = await axios_1.default.post(`${this.huggingFaceApiUrl}/dbmdz/bert-large-cased-finetuned-conll03-english`, {
                inputs: description,
            }, {
                headers: {
                    Authorization: `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json',
                },
            });
            const features = response.data
                .filter(entity => ['MISC', 'ORG'].includes(entity.entity_group))
                .map(entity => entity.word)
                .filter(word => word.length > 2);
            const commonFeatures = this.extractCommonFeatures(description);
            return [...new Set([...features, ...commonFeatures])];
        }
        catch (error) {
            this.logger.error('Failed to extract features with Hugging Face:', error.message);
            return this.extractCommonFeatures(description);
        }
    }
    extractCommonFeatures(description) {
        const features = [];
        const lowerDesc = description.toLowerCase();
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
    async analyzeSentiment(description) {
        try {
            const response = await axios_1.default.post(`${this.huggingFaceApiUrl}/cardiffnlp/twitter-roberta-base-sentiment-latest`, {
                inputs: description,
            }, {
                headers: {
                    Authorization: `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json',
                },
            });
            const result = response.data[0];
            return {
                sentiment: result.label,
                confidence: result.score,
            };
        }
        catch (error) {
            this.logger.error('Failed to analyze sentiment:', error.message);
            return { sentiment: 'NEUTRAL', confidence: 0.5 };
        }
    }
};
exports.NlpService = NlpService;
exports.NlpService = NlpService = NlpService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], NlpService);
//# sourceMappingURL=nlp.service.js.map