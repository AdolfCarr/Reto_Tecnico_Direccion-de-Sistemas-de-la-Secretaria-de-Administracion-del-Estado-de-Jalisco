import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class TransportType {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string;
}