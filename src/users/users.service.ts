import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { DEFAULT_PAGE_SIZE } from '../common/constants/constants';
import * as bcrypt from 'bcrypt';
import { ReqUser } from '../common/interfaces/req-user.interface';
import { UserQueryDto } from './dto/user-query.dto';
import {
  CreateUserDto,
  UpdateUserDto,
  PaginationDto,
  UserResponseDto,
} from './dto';
import { User } from './entities';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
  ) {}

  async create(dto: CreateUserDto): Promise<UserResponseDto> {
    const passwordSalt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(dto.password, passwordSalt);

    const user = this.userRepository.create({
      ...dto,
      password: hashedPassword,
    });
    return await this.userRepository.save(user);
  }

  async findAll(
    queryDto: UserQueryDto,
  ): Promise<{ data: UserResponseDto[]; info: any }> {
    const { search, role, sortBy, sortOrder, skip, limit } = queryDto;

    const query = this.userRepository.createQueryBuilder('user');

    if (search) {
      query.andWhere(
        '(user.username ILIKE :search OR user.email ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    if (role) {
      query.andWhere('user.role = :role', { role });
    }

    if (sortBy) {
      query.orderBy(`user.${sortBy}`, sortOrder || 'DESC');
    } else {
      query.orderBy('user.id', 'DESC');
    }

    const take = limit ?? DEFAULT_PAGE_SIZE;
    const skipItems = skip || 0;
    query.skip(skipItems).take(take);

    const [users, total] = await query.getManyAndCount();

    return {
      data: users,
      info: {
        totalItems: total,
        currentPage: skipItems === 0 ? 1 : Math.floor(skipItems / take) + 1,
        totalPages: Math.ceil(total / take),
      },
    };
  }

  async findUserById(id: number): Promise<UserResponseDto | null> {
    return await this.userRepository.findOne({ where: { id } });
  }

  async findUserByName(username: string): Promise<User | null> {
    return await this.userRepository.findOne({
      where: { username },
      select: ['id', 'username', 'password', 'role', 'email'],
    });
  }

  async update(
    id: number,
    dto: UpdateUserDto,
    reqUser: ReqUser,
  ): Promise<UserResponseDto> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    if (user.id !== reqUser.userID && reqUser.role !== 'admin') {
      throw new ForbiddenException(
        'Only the owner or admin can update this user.',
      );
    }

    if (dto.password) {
      const passwordSalt = await bcrypt.genSalt(10);
      dto.password = await bcrypt.hash(dto.password, passwordSalt);
    }

    Object.assign(user, dto);
    return await this.userRepository.save(user);
  }

  async remove(id: number): Promise<UserResponseDto> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    await this.userRepository.softRemove(user);
    return user;
  }
}
