export class CreateQuestionDto {
  type: string; // 'multiple-choice' | 'short-answer' | 'essay'
  text: string;
  options?: any; // JSON array of options for multiple choice
  correctAnswer?: string;
  points?: number;
  order?: number;
}
