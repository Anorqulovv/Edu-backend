import { DirectionService } from './directions.service';
import { CreateDirectionDto } from './dto/create-direction.dto';
import { UpdateDirectionDto } from './dto/update-direction.dto';
export declare class DirectionController {
    private readonly directionService;
    constructor(directionService: DirectionService);
    create(dto: CreateDirectionDto): Promise<import("../../infrastructure/utils/succes-interface").ISucces>;
    findAll(name?: string): Promise<import("../../infrastructure/utils/succes-interface").ISucces>;
    findOne(id: number): Promise<import("../../infrastructure/utils/succes-interface").ISucces>;
    update(id: number, dto: UpdateDirectionDto): Promise<import("../../infrastructure/utils/succes-interface").ISucces>;
    remove(id: number): Promise<import("../../infrastructure/utils/succes-interface").ISucces>;
}
