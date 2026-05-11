export declare class UpdateParentInStudentDto {
    fullName?: string;
    phone?: string;
    phone2?: string;
    telegramId?: string;
    username?: string;
    password?: string;
}
export declare class UpdateStudentDto {
    cardId?: string;
    parentId?: number;
    groupId?: number;
    fullName?: string;
    username?: string;
    phone?: string;
    password?: string;
    telegramId?: string;
    parent?: UpdateParentInStudentDto;
}
