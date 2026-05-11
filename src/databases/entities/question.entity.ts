import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { Test } from './test.entity';
import { Choice } from './choice.entity';   // agar Choice entityingiz bo'lsa

@Entity()
export class Question {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  text: string;

  // === TO'G'RI YOZILISHI ===
  @ManyToOne(() => Test, (test) => test.questions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'testId' })
  test: Test;

  @OneToMany(() => Choice, (choice) => choice.question, { cascade: true })
  choices: Choice[];

  // Agar testId ni alohida saqlamoqchi bo'lsangiz (tavsiya qilinadi)
  @Column()
  testId: number;
}