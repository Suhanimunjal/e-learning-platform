export declare class UploadsController {
    uploadSingle(file: Express.Multer.File): {
        name: string;
        url: string;
        type: string;
        size: number;
    };
    uploadMultiple(files: Express.Multer.File[]): {
        name: string;
        url: string;
        type: string;
        size: number;
    }[];
    private getFileType;
}
