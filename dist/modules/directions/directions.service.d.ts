import { Repository } from 'typeorm';
import { Direction } from "../../databases/entities/direction.entity";
import { CreateDirectionDto } from './dto/create-direction.dto';
import { UpdateDirectionDto } from './dto/update-direction.dto';
import { ISucces } from "../../infrastructure/utils/succes-interface";
export declare class DirectionService {
    private directionRepo;
    constructor(directionRepo: Repository<Direction>);
    create(dto: CreateDirectionDto): Promise<ISucces>;
    findAll(): Promise<ISucces>;
    findOne(id: number): Promise<ISucces>;
    update(id: number, dto: UpdateDirectionDto): Promise<ISucces>;
    remove(id: number): Promise<ISucces>;
}
