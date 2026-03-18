export declare class HooksService {
    private readonly logger;
    private hooks;
    register(event: string, handler: (data: any) => Promise<void> | void): void;
    trigger(event: string, data: any): Promise<void>;
    unregister(event: string, handler: (data: any) => Promise<void> | void): void;
}
