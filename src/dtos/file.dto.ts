import { IsString } from 'class-validator';

export class CreateFileDto {
  @IsString()
  public path: string;

  @IsString()
  public name: string;

  public uploadedBy: any;

  @IsString()
  public status: string;
}
