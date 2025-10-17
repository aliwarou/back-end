import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { AuthentificationService } from './authentification.service';
import { SignUpDto } from './dto/sign-up.dto';
import { SignInDto } from './dto/sign-in.dto';

import { AuthType } from './enums/auth-type.enum';
import { Auth } from './decorators/auth.decorator';
import { RefreshTokenDto } from './dto/refresh-token.dto';

@Auth(AuthType.None)
@Controller('auth')
export class AuthentificationController {
  constructor(private readonly authService: AuthentificationService) {}

  @Post('sign-up')
  singUp(@Body() signUpDto: SignUpDto) {
    return this.authService.signUp(signUpDto);
  }

  @HttpCode(HttpStatus.OK)
  @Post('sign-in')
  async singIn(
    // @Res({ passthrough: true }) response: Response,
    @Body() signIpnDto: SignInDto,
  ) {
    return this.authService.signIn(signIpnDto);
    // response.cookie('jwtToken', token, {
    //   httpOnly: true,
    //   sameSite: true,
    //   secure: true,
    // });
  }

  @Post('refresh-token')
  @HttpCode(HttpStatus.OK)
  refreshToken(@Body() refreshTokenDto: RefreshTokenDto) {
    return this.authService.refreshToken(refreshTokenDto);
  }
}
