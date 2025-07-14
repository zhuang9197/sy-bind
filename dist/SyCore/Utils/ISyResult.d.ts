import { sy_pipe_types } from "../../src/types/SyPipeTypes";
type pushMethod<K, C> = sy_pipe_types.pushMethod<K, C>;
type popMethod<C> = sy_pipe_types.popMethod<C>;
export interface ISyResult<T = void> {
    success: boolean;
    data?: T;
    error?: string;
    code?: number;
}
export interface ISyListResult<K, C> {
    push(method: pushMethod<K, C>): ISyListResult<K, C>;
    pop(method: popMethod<C>, callback: (popValue: C) => void): ISyListResult<K, C>;
}
export {};
