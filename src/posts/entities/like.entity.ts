import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { User } from '../../users/entities';
import { Post } from './post.entity';

@Entity('likes')
@Unique(['user', 'post'])
export class Like {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToOne(() => Post, { onDelete: 'CASCADE' }) // 'CASCADE' để khi xóa bài viết, các like của bài đó cũng mất
  @JoinColumn({ name: 'postId' })
  post: Post;
}
