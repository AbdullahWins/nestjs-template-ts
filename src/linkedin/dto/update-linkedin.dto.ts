import { PartialType } from '@nestjs/mapped-types';
import { CreateLinkedinDto } from './create-linkedin.dto';

export class UpdateLinkedinDto extends PartialType(CreateLinkedinDto) {}
