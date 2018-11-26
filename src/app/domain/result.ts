/**
 * 后台接口返回实体
 */
export class Result {
    code: number;
    message: string;
    data: any;
    pageCount?: number;
}
