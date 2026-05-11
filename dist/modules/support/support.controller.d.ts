import { SupportService } from './support.service';
import { CreateSupportDto } from './dto/create-support.dto';
import { UpdateSupportDto } from './dto/update-support.dto';
export declare class SupportController {
    private readonly supportService;
    constructor(supportService: SupportService);
    create(dto: CreateSupportDto): Promise<import("../../infrastructure/utils/succes-interface").ISucces>;
    findAll(query: any): Promise<import("../../infrastructure/utils/succes-interface").ISucces>;
    findOne(id: number): Promise<import("../../infrastructure/utils/succes-interface").ISucces>;
    update(id: number, dto: UpdateSupportDto): Promise<import("../../infrastructure/utils/succes-interface").ISucces>;
    remove(id: number): Promise<import("../../infrastructure/utils/succes-interface").ISucces>;
}
