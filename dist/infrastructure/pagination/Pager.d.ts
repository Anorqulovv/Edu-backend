import { IResponsePagination } from '../utils/succes-interface';
export declare class Pager<T> {
    private statusCode;
    private message;
    private data;
    private totalElements;
    private totalPages;
    private pageSize;
    private currentPage;
    private from;
    private to;
    private constructor();
    static of<T>(statusCode: number, message: string, data: Array<T>, totalElements: number, pageSize: number, currentPage: number): IResponsePagination;
    toPage(): IResponsePagination;
}
