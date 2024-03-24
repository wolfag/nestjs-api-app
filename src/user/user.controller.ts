import { Controller, Get, UseGuards } from '@nestjs/common';
import { User } from '@prisma/client';
import { GetUser } from '../auth/decorator';
import { MyJwtGuard } from '../auth/guard';

@Controller('users')
export class UserController {
  @UseGuards(MyJwtGuard)
  @Get('me')
  //   me(@Req() request: Request) {
  me(@GetUser() user: User) {
    return user;
  }
}
