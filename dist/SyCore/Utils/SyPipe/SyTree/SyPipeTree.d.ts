import { sy_pipe_types } from "../../../../src/types/SyPipeTypes";
import { sy_types } from "../../../../src/types/SyTypes";
import { ISyTreeNode } from "../Interfaces";
type t_pipe = sy_pipe_types.t_pipe;
type t_index_pipe = sy_pipe_types.t_index_pipe;
type comm_property_name = sy_types.comm_property_name;
export declare class SyPipeTree<Root extends object> {
    root: ISyTreeNode;
    readonly pipe: t_pipe;
    private objNodeMap;
    constructor(rootObj: Root, pipe: t_pipe);
    private addToMap;
    private removeFromMap;
    private getNodesByObj;
    private getChangeNode;
    replaceObj<P extends object, C extends object>(parent: P, child: C, newValue: C): [Set<any>, Set<any>];
    processNodesOptimized<T extends object>(nodes: Set<ISyTreeNode>, newObj: T): [Set<any>, Set<any>];
    private collectUpdateNodes;
    private executeUpdatesAndFilter;
    removeNodeAndChild(node: ISyTreeNode): Set<any>;
    private executeDeleteAndFilter;
    private collectDeleteNodes;
    addChild<T extends object>(parent: ISyTreeNode, prop: comm_property_name, childObj: T, pipe?: t_index_pipe): ISyTreeNode;
    getOrCreateChild<T extends object>(parent: ISyTreeNode, prop: comm_property_name, childObj: T): ISyTreeNode;
    hasNode(node: ISyTreeNode): boolean;
    trigger(target: object, prop: comm_property_name, value: any): void;
}
export {};
