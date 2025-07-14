import { ISyTreeNode } from "../../SyCore/Utils/SyPipe/Interfaces";

export namespace sy_pipe_types{
    //pipe
    export type t_pipe = object;
    export type t_pipes = Set<t_pipe>
    export type t_head_pipe = object;
    export type t_index_pipe = object;
    export type t_index_pipes = Set<t_index_pipe>;
    export type t_container_pipe = object;

    export type t_pipe_leader = object;

    export type t_pipe_target = object;
    export type t_pipe_entrance = object;
    export type t_pipe_node = object;

    export type t_list_source = any;

    //list
    export type t_pipe_head<T> = T[];

    export type t_pipe_index = object;

    export type listMethods = 'push' | 'pop';

    export type pushMethod<K,C> = (node:ISyTreeNode,target:C) => void;
    export type popMethod<C> = (popNode:C) => void;
}