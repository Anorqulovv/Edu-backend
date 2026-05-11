import { Entity, Column, OneToMany } from 'typeorm';
import { BaseEntity } from './Base.entity';
import { Group } from './group.entity';

@Entity('directions')
export class Direction extends BaseEntity {
  @Column({ unique: true, length: 100 })
  name: string;        

  @Column({ type: 'text', nullable: true })
  description?: string;
  
  @OneToMany(() => Group, (group) => group.direction)
  groups: Group[];
}