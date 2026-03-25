import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm/dist/common';
import { UpdateUserDto } from './dto/update-user.dto';
import { PaginationDto } from './dto/pagination.dto';
import { DEFAULT_PAGE_SIZE } from 'src/utils/constants';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
  ) {}

  async create(dto: CreateUserDto) {
    const passwordSalt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(dto.password, passwordSalt);

    const user = this.userRepository.create({
      ...dto,
      password: hashedPassword,
    });
    return await this.userRepository.save(user);
  }

  findAll(paginationDto: PaginationDto) {
    return this.userRepository.find({
      skip: paginationDto.skip,
      take: paginationDto.limit ?? DEFAULT_PAGE_SIZE,
    });
  }

  async findUserById(id: number) {
    return await this.userRepository.findOne({ where: { id } });
  }

  async findUserByName(username: string) {
    return await this.userRepository.findOne({
      where: { username },
      select: ['id', 'username', 'password', 'role', 'email'],
    });
  }

  async update(id: number, dto: UpdateUserDto, reqUser: any) {
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

  async remove(id: number) {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    await this.userRepository.softRemove(user);
    return user;
  }
}
