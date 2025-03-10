import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class MetricType {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string;
}