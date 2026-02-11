import { IsArray, IsInt } from 'class-validator';

export class UpdatePostOrderDto {
  @IsArray()
  @IsInt({ each: true })
  postIds: number[];
}
