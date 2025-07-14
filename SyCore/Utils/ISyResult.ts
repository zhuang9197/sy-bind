import { sy_pipe_types } from "../../src/types/SyPipeTypes";

type pushMethod<K,C> = sy_pipe_types.pushMethod<K,C>;
type popMethod<C> = sy_pipe_types.popMethod<C>;

export interface ISyResult<T = void> {
    success: boolean;     // 表示操作是否成功
    data?: T;             // 成功时的数据
    error?: string;            // 失败时的错误信息
    code?: number;        // 可选的错误/成功代码
}

export interface ISyListResult<K,C>{
    push(method:pushMethod<K,C>):ISyListResult<K,C>;
    pop(method:popMethod<C>,callback:(popValue:C) => void):ISyListResult<K,C>;
}