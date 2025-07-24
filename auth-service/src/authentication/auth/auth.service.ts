import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { ClientProxy } from '@nestjs/microservices';
import { ReturnModelType } from '@typegoose/typegoose';
import * as bcrypt from 'bcrypt';
import { InjectModel } from 'nestjs-typegoose';
import { encrypt } from 'src/helper/crypto.helper';
import { UserModel } from 'src/modules/user/entities';
import { UserTypesEnum } from '../common/enum';
import { UserInterface } from '../common/interfaces';
import { AuthDto } from './dto/auth.dto';
import { LoginDto } from './dto/login.dto';
import { ErrorMessage } from '../common/enum/error-message.enum';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(UserModel)
    private readonly usersRepository: ReturnModelType<typeof UserModel>,
    @Inject('RABBITMQ_SERVICE') private readonly rabbitClient: ClientProxy,
    private jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  // ********** GENERAL USER ********

  async signupLocal(dto: AuthDto): Promise<any> {
    // Check if user already exists
    const dataCheck = await this.usersRepository.findOne({
      email: dto.email,
      userType: dto.userType,
    });

    if (dataCheck) {
      return `this mail is already exist!`;
    }

    // Get secret code from config
    const secPass = this.configService.get<string>('GENERATE_SECRET_CODE');

    // Hash password
    dto.password =
      dto && dto.password && dto.password.length > 1
        ? bcrypt.hashSync(dto.password, 10)
        : bcrypt.hashSync(secPass, 10);

    // Create user document
    const insertData = await this.usersRepository.create(dto);

    this.rabbitClient.emit('user.created', insertData);

    // Generate tokens
    let tokens;
    if (insertData) {
      tokens = await this.getTokens({
        id: insertData._id.toString(),
        email: insertData.email,
        hashType: encrypt(dto.userType),
      });

      // Update refresh token hash
      await this.updateRtHashUser(
        {
          id: insertData._id.toString(),
          email: insertData.email,
        },
        tokens.refresh_token,
      );
    }

    return tokens;
  }

  async signinLocal(loginDto: LoginDto): Promise<any> {
    const user = await this.usersRepository.findOne({
      email: loginDto.email,
      userType: loginDto.userType,
    });

    if (!user) throw new ForbiddenException(ErrorMessage.NO_USER_FOUND);

    const passwordMatches = await bcrypt.compare(
      loginDto.password,
      user.password,
    );
    if (!passwordMatches) throw new ForbiddenException('Invalid password!');

    const tokens = await this.getTokens({
      id: user._id.toString(),
      email: user.email,
      hashType: encrypt(loginDto.userType),
    });
    await this.updateRtHashUser(
      { id: user._id.toString() },
      tokens.refresh_token,
    );

    return tokens;
  }

  async validateToken(token: string) {
    try {
      const payload = this.jwtService.verify(token);
      return payload;
    } catch (error) {
      throw new BadRequestException('Invalid token');
    }
  }

  // logout user
  async logout(userPayload: UserInterface) {
 
    const isUpdated = await this.usersRepository.updateOne(
      { _id: userPayload.id },
      { $set: { hashedRt: null } },
    );

    return isUpdated ? true : false;
  }

  async findUserById(userPayload: UserInterface) {
    const data = await this.usersRepository.findById(userPayload.id);
    if (!data) throw new ForbiddenException(ErrorMessage.NO_USER_FOUND);

    const result = data.toObject();
    delete result.password;
    delete result.hashedRt;
    return result;
  }

  async updateRtHashUser(userPayload: any, rt: string) {
    const hash = await bcrypt.hash(rt, 10);
    await this.usersRepository.updateOne(
      { _id: userPayload.id },
      { hashedRt: hash },
    );
  }

  async refreshTokens(userId: string, rt: string): Promise<any> {
    const user = await this.usersRepository.findById(userId);

    if (!user || !user.hashedRt)
      throw new ForbiddenException(ErrorMessage.NO_USER_FOUND);

    const rtMatches = await bcrypt.compare(rt, user.hashedRt);

    if (!rtMatches) throw new ForbiddenException('Token not matches!');

    const tokens = await this.getTokens({
      id: user._id.toString(),
      email: user.email,
      hashType: encrypt(UserTypesEnum.USER),
    });
    await this.updateRtHashUser(
      { id: user._id.toString() },
      tokens.refresh_token,
    );

    return tokens;
  }

  async hashPassword(password: string) {
    return bcrypt.hashSync(password, 10);
  }

  async getUserById(userId: string) {
    const data = await this.usersRepository.findById(userId);
    return data;
  }

  async deleteUser(userPayload: UserInterface) {
    await this.usersRepository.deleteOne({ _id: userPayload.id });
    return `deleted successfully!!`;
  }

  async getTokens(userPayload: UserInterface) {
    const payload = {
      id: userPayload.id,
      email: userPayload.email,
      hashType: userPayload.hashType,
    };

    const [at, rt] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('AT_SECRET'),
        expiresIn: '10d',
      }),
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('RT_SECRET'),
        expiresIn: '7d',
      }),
    ]);

    return {
      access_token: at,
      refresh_token: rt,
    };
  }
}
