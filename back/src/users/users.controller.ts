import { Controller, Post, Body } from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from './user.entity';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  // Register a new user
  @Post('register')
  async register(@Body() user: User): Promise<User> {
    return this.usersService.create(user);
  }
}