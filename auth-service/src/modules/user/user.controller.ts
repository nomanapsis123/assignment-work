import {
  Body,
  Controller,
  Delete,
  Get,
  Patch,
  Post,
  UseGuards
} from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiTags
} from '@nestjs/swagger';
import { AuthService } from 'src/authentication/auth/auth.service';
import {
  AuthDto,
  LoginDto
} from 'src/authentication/auth/dto';
import { UpdateUserDto } from 'src/authentication/auth/dto/update-user.dto';
import { AtGuard, RtGuard } from 'src/authentication/auth/guards';
import { UserInterface } from 'src/authentication/common/interfaces';
import { UserPayload } from 'src/authentication/utils/decorators';

//swagger doc
@ApiTags('User')
@Controller({
  //path name
  path: 'user'
})
export class UserController {
  constructor(private readonly authService: AuthService) {}

    // RabbitMQ pattern
  @MessagePattern('validate-token')
  async validateTokenMessage(@Payload() data: { token: string }) {
    console.log('dataaa', data);
    
    return await this.authService.validateToken(data.token);
  }

  // user registration
  @Post('local/signup')
  async signupLocal(@Body() authDto: AuthDto) {
    const data = await this.authService.signupLocal(authDto);

    return { message: 'Successful', result: data };
  }

  @Post('local/signin')
  async signinLocal(@Body() dto: LoginDto): Promise<any> {
    const data = await this.authService.signinLocal(dto);
    return { message: 'Successful', result: data };
  }

  @ApiBearerAuth('jwt')
  @UseGuards(AtGuard)
  @Get()
  async getUser(@UserPayload() user: UserInterface) {
    const data = await this.authService.findUserById(user);

    return { message: 'Successful', result: data };
  }

  @Post('validate-token')
  async validateToken(@Body('token') token: string) {
    const data = await this.authService.validateToken(token);
    return { message: 'Successful', result: data };
  }

  /**
   *  UPDATE USER Profile
   */
  @ApiBearerAuth('jwt')
  @UseGuards(AtGuard)
  @Patch()
  @ApiOperation({
    summary: 'Update a SUBSCRIBER User data',
    description: 'This route is responsible for updating a SUBSCRIBER User',
  })
  @ApiBody({
    type: UpdateUserDto,
    description:
      'How to update an user with body?... here is the example given below!',
    examples: {
      a: {
        summary: 'default',
        value: {
          name: 'string',
          mobile: 'string',
          gender: 'female',
          maritalStatus: 'married',
          birthDate: '2022-03-02',
          address: 'string',
        } as unknown as UpdateUserDto,
      },
    },
  })
  async updateUser(
    @Body() updateUserDto: UpdateUserDto,
    @UserPayload() userPayload: UserInterface,
  ) {
    // const data = await this.authService.updateUserProfile(
    //   updateUserDto,
    //   userPayload,
    // );
    // return { message: 'Successful', result: data };
  }

  // delete user
  @ApiBearerAuth('jwt')
  @UseGuards(AtGuard)
  @Delete()
  async delete(@UserPayload() user: UserInterface) {
    const data = await this.authService.deleteUser(user);

    return { message: 'Successful', result: data };
  }

  @ApiBearerAuth('jwt')
  @UseGuards(AtGuard)
  @Post('logout')
  async logout(@UserPayload() user: UserInterface) {    
    const data = await this.authService.logout(user);

    return { message: 'Successful', result: data };
  }

  // refresh the access token of admin

  @ApiBearerAuth('jwt')
  @ApiOperation({
    summary: 'access token need to be refreshed',
    description: 'this route is responsible for access token refreshed',
  })
  @UseGuards(RtGuard)
  @Post('refresh')
  async refreshTokens(
    @UserPayload() userPayload: any,
    @UserPayload('refreshToken') refreshToken: string,
  ): Promise<any> {
    const data = await this.authService.updateRtHashUser(
      userPayload.id,
      refreshToken,
    );

    return { message: 'Successful', result: data };
  }

}
