import { IsInt, IsMongoId, Min } from 'class-validator';

/** One item of a `PATCH .../reorder` body: `[{ id, order }]`. */
export class ReorderItemDto {
  @IsMongoId()
  id: string;

  @IsInt()
  @Min(0)
  order: number;
}
