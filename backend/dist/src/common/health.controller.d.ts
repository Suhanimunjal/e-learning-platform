export declare class HealthController {
    health(): {
        status: string;
        timestamp: string;
        message: string;
        version: string;
    };
    checkDb(): Promise<{
        status: string;
        database: string;
    }>;
}
