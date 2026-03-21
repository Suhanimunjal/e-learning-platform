export declare class EmailService {
    private transporter;
    constructor();
    sendOTP(email: string, otp: string): Promise<boolean>;
    sendLoginOTP(email: string, name: string, otp: string): Promise<boolean>;
    sendTeacherApproved(email: string, name: string): Promise<boolean>;
    sendTeacherRejected(email: string, name: string, reason?: string): Promise<boolean>;
    sendEnrollmentApproved(studentEmail: string, studentName: string, courseTitle: string): Promise<boolean>;
}
