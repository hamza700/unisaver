import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from '../auth/user.entity';

@Entity()
export class BankCard {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  accessToken: string;

  @Column()
  itemId: string;

  @ManyToOne(() => User, (user) => user.bankCards, { eager: true })
  user: User;
}
