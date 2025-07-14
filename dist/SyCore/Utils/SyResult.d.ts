import { ListMethodType } from "../../src/enums/SyEnums";
import { sy_pipe_types } from "../../src/types/SyPipeTypes";
import { ISyListResult } from "./ISyResult";
import { SyContainerMethods } from "./SyContainer";
type pushMethod<K, C> = sy_pipe_types.pushMethod<K, C>;
type popMethod<C> = sy_pipe_types.popMethod<C>;
export declare class SyListResult<K, C> implements ISyListResult<K, C> {
    private containerMethods;
    constructor(containerMethods: SyContainerMethods<K, C>);
    pop(method: popMethod<C>, callback: (popValue: C) => void): ISyListResult<K, C>;
    push(method: pushMethod<K, C>): ISyListResult<K, C>;
    clear(listMethodType?: ListMethodType): ISyListResult<K, C>;
}
export {};
