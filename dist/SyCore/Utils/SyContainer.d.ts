import { ListMethodType } from "../../src/enums/SyEnums";
import { sy_pipe_types } from "../../src/types/SyPipeTypes";
import { ISyTreeNode } from "./SyPipe/Interfaces";
type pushMethod<K, C> = sy_pipe_types.pushMethod<K, C>;
type popMethod<C> = sy_pipe_types.popMethod<C>;
export declare class SyContainerMethods<K, C> {
    private pushMethods;
    private popMethods;
    private tempPushMethods;
    private tempPopMethods;
    private createTarget;
    private target;
    private componentType;
    private isCompiled;
    constructor(target: any, componentType: new (...args: any[]) => C, createTarget: () => C);
    private pushCompiled;
    private popCompiled;
    private _push;
    private _pushEnd;
    push(): void;
    private _pop;
    private _popEnd;
    addPush(method: pushMethod<K, C>): void;
    addPop(method: popMethod<C>): void;
    addPushOnce(method: pushMethod<K, C>, isSave?: boolean): void;
    addPopOnce(method: popMethod<C>, isSave?: boolean): void;
    compilePush(node: ISyTreeNode, target: C): void;
    compilePop(target: C): void;
    callPush(node: ISyTreeNode): void;
    callPop(): void;
    clear(listMethodType?: ListMethodType): void;
}
export declare class SyContainer<K> {
    private methods;
    constructor();
    getContainerMethods<C extends object>(target: any, componentType: new (...args: any[]) => C, createTarget: () => C): SyContainerMethods<K, C>;
    call(listMethodType: ListMethodType, node?: ISyTreeNode): void;
    clear(listMethodType?: ListMethodType, target?: any): void;
}
export {};
