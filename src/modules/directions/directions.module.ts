import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Direction } from 'src/databases/entities/direction.entity';
import { DirectionController } from './directions.controller';
import { DirectionService } from './directions.service';

@Module({
  imports: [TypeOrmModule.forFeature([Direction])],
  controllers: [DirectionController],
  providers: [DirectionService],
  exports: [DirectionService],
})
export class DirectionModule {}