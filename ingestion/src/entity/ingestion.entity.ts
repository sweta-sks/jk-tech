import { StatusEnum } from 'src/enum/status.enum';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'ingestion' })
export class Ingestion {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  documentId: string;

  @Column()
  userId: string;

  @Column({ enum: StatusEnum, enumName: 'Status' })
  status: StatusEnum;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
