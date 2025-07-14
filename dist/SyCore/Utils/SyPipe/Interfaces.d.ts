import { sy_pipe_types } from "../../../src/types/SyPipeTypes";
import { sy_types } from "../../../src/types/SyTypes";
import { BindType } from "../../../src/enums/SyEnums";
import { ISyResult } from "../ISyResult";
import { SyPipeTree } from "./SyTree/SyPipeTree";
type comm_property_name = sy_types.comm_property_name;
type t_pipe = sy_pipe_types.t_pipe;
type t_index_pipe = sy_pipe_types.t_index_pipe;
type pushMethod<K, C> = sy_pipe_types.pushMethod<K, C>;
type popMethod<C> = sy_pipe_types.popMethod<C>;
export interface ISyTreeNode {
    root: SyPipeTree<any>;
    obj: object;
    pipe: t_pipe;
    prop: comm_property_name;
    parent: ISyTreeNode | null;
    children: Set<ISyTreeNode>;
    trigger(prop: comm_property_name, value: any): void;
    addChild<C extends object>(tree: SyPipeTree<any>, childObj: C, prop: comm_property_name, pipe?: t_index_pipe): ISyTreeNode;
    getOrCreateChild<C extends object>(tree: SyPipeTree<any>, childObj: C, prop: comm_property_name): ISyTreeNode;
    getChild<C extends object>(childObj: C): ISyTreeNode | undefined;
    changeObj(newObj: object): void;
    listen(prop: comm_property_name, fn: Function, triggerImmediately?: Boolean, bindType?: BindType): ISyResult;
}
export interface ITempPushMethod<K, C> {
    method: pushMethod<K, C>;
    save: boolean;
}
export interface ITempPopMethod<C> {
    method: popMethod<C>;
    save: boolean;
}
export {};
