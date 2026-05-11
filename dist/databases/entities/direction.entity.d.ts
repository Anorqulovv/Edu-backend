import { BaseEntity } from './Base.entity';
import { Group } from './group.entity';
export declare class Direction extends BaseEntity {
    name: string;
    description?: string;
    groups: Group[];
}
