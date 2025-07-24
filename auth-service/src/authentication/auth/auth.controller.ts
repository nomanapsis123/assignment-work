/**dependencies */
import {
  Controller
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger/dist';
import { UserService } from 'src/modules/user/user.service';
import { AuthService } from './auth.service';

//swagger doc
@ApiTags('AS|Auth')
@Controller({
  //path name
  path: 'auth'
})
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
  ) {}
}
