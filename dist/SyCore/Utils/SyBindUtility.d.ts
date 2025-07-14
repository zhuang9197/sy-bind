import { sy_pipe_types } from "../../src/types/SyPipeTypes";
import { sy_types } from "../../src/types/SyTypes";
import { BindType } from "../../src/enums/SyEnums";
import { ISyTreeNode } from "./SyPipe/Interfaces";
import { SyPipeTree } from "./SyPipe/SyTree/SyPipeTree";
type bind_target = sy_types.bind_target;
type comm_property_name = sy_types.comm_property_name;
type ComponentUpdateStrategy<T> = sy_types.ComponentUpdateStrategy<T>;
type t_pipe = sy_pipe_types.t_pipe;
type t_pipe_leader = sy_pipe_types.t_pipe_leader;
type t_pipe_target = sy_pipe_types.t_pipe_target;
type t_head_pipe = sy_pipe_types.t_head_pipe;
type t_pipe_head<T> = sy_pipe_types.t_pipe_head<T>;
export declare class SyBindUtility {
    static listen<T extends bind_target, K extends keyof T>(source: T, sourceProp: K, handled: Function, triggerImmediately?: boolean, bindType?: BindType): import("./ISyResult").ISyResult<void>;
    static lListen(node: ISyTreeNode, prop: comm_property_name, handled: Function, triggerImmediately?: boolean, bindType?: BindType): import("./ISyResult").ISyResult<void>;
    static unlisten<T extends bind_target, K extends keyof T>(source: T, prop: K, bindType?: BindType): import("./ISyResult").ISyResult<void>;
    static parsePropertyPath(source: any, path: string): {
        parent: any;
        target: any;
        prop: any;
    };
    static applyChain(node: ISyTreeNode, current: bind_target, chain: string[]): ISyTreeNode | null;
    static applyIndexChain<K extends object>(tree: SyPipeTree<K>, node: ISyTreeNode, current: bind_target, chain: string[]): ISyTreeNode | null;
    static rlResolve<T extends bind_target>(leader: t_pipe_leader, target: T): ISyTreeNode | undefined;
    static rlBind(pipe: t_pipe, parentNode: ISyTreeNode, current: t_pipe_target, rlList: comm_property_name[]): ISyTreeNode;
    static resolveUpdateStrategy<T extends object>(handled: Map<Function, ComponentUpdateStrategy<T>> | ((value: any) => void), consumer: T): ((value: any) => void) | undefined;
    private static getRelationChain;
    private static relationChainSearch;
    static getOrCreateHead<T>(head: t_pipe_head<T>): SyPipeTree<t_pipe_head<T>> | undefined;
    static getOrCreateContainer<T extends object>(headpipe: t_head_pipe): import("./ISyResult").ISyResult<import("./SyContainer").SyContainer<T>>;
}
export {};
