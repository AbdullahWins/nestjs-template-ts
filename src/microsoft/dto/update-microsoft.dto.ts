import { PartialType } from '@nestjs/mapped-types';
import { CreateMicrosoftDto } from './create-microsoft.dto';

export class UpdateMicrosoftDto extends PartialType(CreateMicrosoftDto) {}
