export declare class OllamaService {
    private readonly logger;
    private baseURL;
    private model;
    private apiKey;
    private isConfigured;
    constructor();
    private ensureConfigured;
    generateResponse(prompt: string): Promise<any>;
    generateStructuredResponse(prompt: string): Promise<any>;
    private parseJSONResponse;
}
