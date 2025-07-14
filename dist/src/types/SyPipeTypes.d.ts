import { ISyTreeNode } from "../../SyCore/Utils/SyPipe/Interfaces";
export declare namespace sy_pipe_types {
    type t_pipe = object;
    type t_pipes = Set<t_pipe>;
    type t_head_pipe = object;
    type t_index_pipe = object;
    type t_index_pipes = Set<t_index_pipe>;
    type t_container_pipe = object;
    type t_pipe_leader = object;
    type t_pipe_target = object;
    type t_pipe_entrance = object;
    type t_pipe_node = object;
    type t_list_source = any;
    type t_pipe_head<T> = T[];
    type t_pipe_index = object;
    type listMethods = 'push' | 'pop';
    type pushMethod<K, C> = (node: ISyTreeNode, target: C) => void;
    type popMethod<C> = (popNode: C) => void;
}
