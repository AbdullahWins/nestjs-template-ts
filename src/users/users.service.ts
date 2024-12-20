import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { CreateUserDto } from './dtos/createUser.dto';
import { UpdateUserDto } from './dtos/updateUser.dto';
import { CustomException } from '@exceptions/customException.exception';
import { LoginUserDto } from './dtos/loginUser.dto';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async create(
    createUserDto: CreateUserDto,
    files: Express.Multer.File[],
  ): Promise<User> {
    try {
      // Create a new user model instance
      const newUser = new this.userModel(createUserDto);

      newUser.firstName = createUserDto.firstName;
      newUser.lastName = createUserDto.lastName;
      newUser.email = createUserDto.email;
      newUser.password = createUserDto.password;

      // Handle files if necessary
      if (files.length > 0) {
        newUser.profilePicture = files[0].path;
      }

      // Save the user to the database
      return await newUser.save();
    } catch (error) {
      throw new CustomException();
    }
  }

  async signin(loginUserDto: LoginUserDto): Promise<User> {
    const email = loginUserDto.email;
    const password = loginUserDto.password;
    console.log('email', email);

    // Find user by email
    const user = await this.userModel.findOne({ email }).exec();
    if (!user) {
      throw new CustomException('User not found', 404);
    }

    // Compare password (Use a proper password comparison method)
    const isMatch = user.email === email && user.password === password;
    if (!isMatch) {
      throw new CustomException('Invalid credentials', 401);
    }

    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    return this.userModel
      .findByIdAndUpdate(id, updateUserDto, { new: true })
      .exec();
  }

  async findAll(): Promise<User[]> {
    return this.userModel.find().exec();
  }

  async findOne(id: string): Promise<User> {
    return this.userModel.findById(id).exec();
  }

  async remove(id: string): Promise<User> {
    return this.userModel.findByIdAndDelete(id).exec();
  }
}

