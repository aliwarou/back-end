import { IsInt, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateConversationDto {
  @ApiProperty({
    description: "ID de l'autre participant (client ou juriste)",
    example: 5,
  })
  @IsInt()
  @IsNotEmpty()
  participantId: number;
}
