import {
  Column,
  DeleteDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity({ name: 'users' })
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  username: string;

  @Column()
  email: string;

  @Column({ select: false })
  password: string;

  @Column({ default: 'user' })
  role: string;

  @DeleteDateColumn()
  deletedAt?: Date;

  @ManyToMany(() => User, (user) => user.following)
  @JoinTable({ name: 'user_follows' })
  followers: User[];

  @ManyToMany(() => User, (user) => user.followers)
  following: User[];
}
