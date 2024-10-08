import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  UseInterceptors,
  UploadedFiles,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dtos/createUser.dto';
import { UpdateUserDto } from './dtos/updateUser.dto';
import { User } from './schemas/user.schema';
import { FilesInterceptor } from '@nestjs/platform-express';
import { multerConfig } from '@configs/multer.config';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('signup')
  @UseInterceptors(FilesInterceptor('files', 10, multerConfig))
  async create(
    @Body('data') data: string, // Change here to receive data as string
    @UploadedFiles() files: Express.Multer.File[],
  ): Promise<User> {
    // Parse the JSON string to an object
    const createUserDto: CreateUserDto = JSON.parse(data);

    // Log the user data before saving
    console.log('Creating new user:', {
      ...createUserDto,
      profilePicture: files.length > 0 ? files[0].path : null,
    });

    return this.usersService.create(createUserDto, files); // Return the result directly
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<User> {
    return this.usersService.update(id, updateUserDto);
  }

  @Get('all')
  findAll(): Promise<User[]> {
    return this.usersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<User> {
    return this.usersService.findOne(id);
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<User> {
    return this.usersService.remove(id);
  }
}
