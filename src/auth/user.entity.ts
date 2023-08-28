import { BankCard } from '../banking/bank-card.entity';
import { Blog } from '../blogs/blog.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column()
  isVerified: boolean;

  @Column({ nullable: true })
  verificationCode: string;

  @Column({ nullable: true })
  resetCode: string;

  @OneToMany(() => BankCard, (bankCard) => bankCard.user)
  bankCards: BankCard[];

  @OneToMany((_type) => Blog, (blog) => blog.user, { eager: true })
  blogs: Blog[];
}
