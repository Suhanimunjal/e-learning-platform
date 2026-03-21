export class UpdateQuestionDto {
  type?: string;
  text?: string;
  options?: any;
  correctAnswer?: string;
  points?: number;
  order?: number;
}
