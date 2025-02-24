import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import * as bcrypt from 'bcryptjs'; // Use bcryptjs for hashing

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  // Create a new user with a hashed password
  async create(user: User): Promise<User> {
    // Hash the password before saving
    const hashedPassword = bcrypt.hashSync(user.password, 10); // 10 is the salt rounds
    const newUser = this.usersRepository.create({
      username: user.username,
      password: hashedPassword, // Save the hashed password
    });
    return this.usersRepository.save(newUser);
  }

  // Find a user by username
  async findOne(username: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { username } });
  }
}