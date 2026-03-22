export declare class UpdateProfileDto {
    name?: string;
    phone?: string;
    rollNo?: string;
    year?: string;
    branch?: string;
    course?: string;
}
export declare class ChangePasswordDto {
    currentPassword: string;
    newPassword: string;
}
export declare class ChangePasswordOtpDto {
    otp: string;
    newPassword: string;
}
