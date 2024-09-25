import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity({ name: 'welcome' })
export class Welcome {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  order: number;

  @Column()
  title: string;

  @Column()
  imageUrl: string;

  @Column()
  discription: string;

  @Column({ default: true })
  status: boolean;

  @CreateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP(6)',
  })
  createdAt: Date;

  @CreateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP(6)',
    onUpdate: 'CURRENT_TIMESTAMP(6)',
  })
  updatedAt: Date;
}
