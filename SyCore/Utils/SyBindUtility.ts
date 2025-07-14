import { sy_pipe_types } from "../../src/types/SyPipeTypes";
import { sy_types } from "../../src/types/SyTypes";
import { BindType } from "../../src/enums/SyEnums";
import { SyNotify } from "../SyNotifys/SyNotify";
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


export class SyBindUtility{
    
    public static listen<
        T extends bind_target,
        K extends keyof T
    >(
        source:T,
        sourceProp:K,
        handled:Function,
        triggerImmediately?: boolean, 
        bindType?: BindType
    ){
        return SyNotify.listen(source,sourceProp,handled,triggerImmediately,bindType);
    }

    public static lListen(
        node:ISyTreeNode,
        prop: comm_property_name,
        handled: Function,
        triggerImmediately: boolean = true,
        bindType?:BindType
    ){
        return SyNotify.lListen(node, prop, handled,triggerImmediately,bindType);
    }

    public static unlisten<
        T extends bind_target,
        K extends keyof T
    >(
        source:T,
        prop:K,
        bindType?:BindType
    ){
        return SyNotify.unlisten(source,prop,bindType)
    }

    //获取关系链
    public  static parsePropertyPath(source: any, path: string) :{parent:any,target:any,prop:any} {
        // 将路径分割成数组
        const parts = path.split('/');
        const prop = parts[parts.length - 1]; 
        
        // 获取最终值
        const target = parts.reduce((obj, key) => obj?.[key], source);
        
        // 获取父对象 (去掉最后一个属性)
        const parent = parts.slice(0, -1).reduce((obj, key) => obj?.[key], source);

        return {
            parent,    // 父对象
            target,  //最终对象
            prop    // 最终值
        };
    }

    public static applyChain(node: ISyTreeNode, current: bind_target, chain: string[]): ISyTreeNode | null {
        if (chain.length === 0) {
            return null;
        }

        const [prop, ...rest] = chain;
        const nextNode =  SyNotify.getOrCreateTreeNode(node.pipe,node, (current as any)[prop], prop).data!;

        if (rest.length > 1) {
            return SyBindUtility.applyChain(nextNode, (current as any)[prop], rest);
        }

        return nextNode;
    }

    public static applyIndexChain<
        K extends object
    >(
        tree:SyPipeTree<K>,
        node: ISyTreeNode,
        current:bind_target,
        chain:string[]
    ): ISyTreeNode | null{
        if(chain.length === 0){
            return null;
        }

        const [prop,...rest] = chain;

        const nextNode = SyNotify.getOrCreateIndexTreeNode(tree,node,(current as any)[prop],prop).data!;

        if(rest.length > 1){
            return SyBindUtility.applyIndexChain(tree,nextNode,(current as any)[prop],rest);
        }

        return nextNode;
    }

    public static rlResolve
    <
        T extends bind_target
    >(
        leader:t_pipe_leader,
        target:T
    ):ISyTreeNode | undefined{
        //获取关系链
        let chain:comm_property_name[] | null = []

        if(leader === target){
            chain = []
        }else{
            chain = SyBindUtility.getRelationChain(leader, target);
        }

        

        if(!chain){
            return undefined
        }


        //创建树
        const tree = SyNotify.getOrCreateTree(leader).data!
        //创建从根节点开始的chain节点链，返回最后一个节点
        const node = SyBindUtility.rlBind(tree.pipe,tree.root,leader,chain)
        
        return node;
    }

    public static rlBind(
        pipe:t_pipe,
        parentNode:ISyTreeNode, 
        current:t_pipe_target,
        rlList:comm_property_name[]
    ):ISyTreeNode{
        
        if(rlList.length === 0) return parentNode;

        const [prop,...rest] = rlList;

        const treeNode = SyNotify.getOrCreateTreeNode(pipe,parentNode,(current as any)[prop],prop).data!;

        if(rest.length > 0){
            return SyBindUtility.rlBind(pipe,treeNode,(current as any)[prop],rest)
        }

        return treeNode;
    }

    public static resolveUpdateStrategy
    <
        T extends object,
    >(
        handled:Map<Function,ComponentUpdateStrategy<T>> | ((value: any) => void),
        consumer:T,
    ):((value:any) => void) | undefined{
        if(typeof handled === 'function'){
            return handled;
        }

        if(consumer === null || consumer === undefined) return undefined

        const componentConstructor = consumer.constructor;
        const strategy = handled.get(componentConstructor);

        if(strategy === undefined){
            return undefined
        }

        return (value: any) => strategy(consumer,value);
    }

    private static getRelationChain(
        leader:t_pipe_leader,
        targetParent:t_pipe_target
    ):comm_property_name[] | null{
        return SyBindUtility.relationChainSearch(leader, targetParent);
    }

    private static relationChainSearch(
        current:any,
        targetParent:t_pipe_target,
        path:comm_property_name[] = []
    ):comm_property_name[] | null{
        if (current === targetParent) {
            return [...path];
        }

        //获取当前对象的所有属性
        const keys = Object.keys(current)

        for (const key of keys) {
            const value = current[key];
            if (value && typeof value === 'object') {
                const result = this.relationChainSearch(value, targetParent, [...path, key])
                if (result) return result;
            }
        }

        return null;
    }

    //#region list

    public static getOrCreateHead<T>(
        head:t_pipe_head<T>
    ):SyPipeTree<t_pipe_head<T>> | undefined{
        const tree = SyNotify.getOrCreateHeadTree<T>(head);

        return tree.data!
    }

    public static getOrCreateContainer<
        T extends object
    >(
        headpipe:t_head_pipe
    ){
        return SyNotify.getOrCreateContainer<T>(headpipe)
    }

    //#endregion
}