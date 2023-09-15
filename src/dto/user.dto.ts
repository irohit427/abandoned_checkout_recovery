import { IsEmail } from 'class-validator';

export class UserDto {
  id?: string;
  name: string;

  @IsEmail()
  email: string;
}
