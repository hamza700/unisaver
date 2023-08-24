import { Exclude } from 'class-transformer';
import { User } from 'src/auth/user.entity';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';

@Entity()
export class Blog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column()
  description: string;

  @Column()
  content: string;

  @Column()
  image: string;

  @ManyToOne((_type) => User, (user) => user.blogs, { eager: false })
  @Exclude({ toPlainOnly: true })
  user: User;
}
