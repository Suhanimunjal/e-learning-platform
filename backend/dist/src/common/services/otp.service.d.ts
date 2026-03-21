interface OTP {
    code: string;
    expiresAt: Date;
    userId?: string;
    email: string;
    verified: boolean;
}
export declare class OtpService {
    private otps;
    generateOTP(email: string, userId?: string): string;
    verifyOTP(email: string, code: string): boolean;
    isVerified(email: string): boolean;
    getOTP(email: string): OTP | undefined;
    deleteOTP(email: string): void;
    cleanExpired(): void;
}
export {};
