import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { TransportType } from './transport-type.entity';
import { MetricType } from './metric-type.entity';

@Entity()
export class TransportData {
  @PrimaryColumn()
  id: string;

  @Column()
  year: number;

  @Column()
  month: number;

  @ManyToOne(() => TransportType)
  @JoinColumn({ name: 'transport_type_id' })
  transportType: TransportType;

  @ManyToOne(() => MetricType)
  @JoinColumn({ name: 'metric_type_id' })
  metricType: MetricType;

  @Column()
  entity: string;

  @Column()
  municipality: string;
/*
  @Column('decimal')
  value: number;
*/
@Column({
    type: 'decimal',
    precision: 12,   // Total de dígitos (incluyendo decimales)
    scale: 2,        // 2 decimales
    nullable: false,
    default: 0.00    // Valor por defecto como string/number
  })
  value: number;
  
  @Column()
  status: string;
}