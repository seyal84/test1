import { Module } from '@nestjs/common';
import { ListingsService } from './listings.service';
import { ListingsController } from './listings.controller';
import { NlpService } from './nlp.service';
import { FilesModule } from '../files/files.module';

@Module({
  imports: [FilesModule],
  controllers: [ListingsController],
  providers: [ListingsService, NlpService],
  exports: [ListingsService],
})
export class ListingsModule {}