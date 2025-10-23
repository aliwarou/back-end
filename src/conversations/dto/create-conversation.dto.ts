import { IsInt, IsNotEmpty } from 'class-validator';

export class CreateConversationDto {
  @IsInt()
  @IsNotEmpty()
  participantId: number; // ID de l'autre participant (client ou juriste)
}
