export declare class GenerateAssignmentDto {
    topic: string;
    tone?: string;
}
export declare class GenerateExamplesDto {
    topic: string;
    tone?: string;
}
export declare class SummarizeContentDto {
    content: string;
    tone?: string;
}
export declare class TranslateTextDto {
    text: string;
    targetLang: string;
    sourceLang?: string;
}
export declare class DetectLanguageDto {
    text: string;
}
export declare class ChatDto {
    message: string;
    sessionId?: string;
    courseId?: string;
}
export declare class TrackProgressDto {
    studentId: string;
    topic: string;
    score: number;
}
