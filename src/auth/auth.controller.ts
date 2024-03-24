import { Body, Controller, Post, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthDTO } from './dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  //   register(@Req() request: Request) {
  register(@Body() body: AuthDTO) {
    //   register(@Body('email') email: string, @Body('password') password: string) {
    console.log('taitest-register', { body });
    return this.authService.register(body);
  }

  @Post('login')
  login(@Body() body: AuthDTO) {
    return this.authService.login(body);
  }
}
