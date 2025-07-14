;
import { SyPipe } from "../Utils/SyPipe/SyPipe";
import { sy_pipe_types } from "../../src/types/SyPipeTypes";
import { ISyResult } from "../Utils/ISyResult";
import { SyPipeTree } from "../Utils/SyPipe/SyTree/SyPipeTree";
import { ISyTreeNode } from "../Utils/SyPipe/Interfaces";
import { SyContainer } from "../Utils/SyContainer";
import { BindType, ListMethodType } from "../../src/enums/SyEnums";
import { sy_types } from "../../src/types/SyTypes";

type bind_target = sy_types.bind_target;
type comm_property_name = sy_types.comm_property_name;
type bind_func = sy_types.bind_func;

type t_pipe = sy_pipe_types.t_pipe;
type t_pipe_target = sy_pipe_types.t_pipe_target;
type t_list_source = sy_pipe_types.t_list_source;
type t_pipe_leader = sy_pipe_types.t_pipe_leader;
type t_head_pipe = sy_pipe_types.t_head_pipe;
type t_pipe_head<T> = sy_pipe_types.t_pipe_head<T>;

export class SyNotify{
    
    private static triggerStore = new WeakMap<bind_target,Map<comm_property_name,bind_func>>();
    private static funIndex = new WeakMap<bind_target,Map<comm_property_name,Map<BindType,bind_func>>>();
    private static syPipe = new SyPipe();

    public static trigger(
        source:bind_target,
        prop:comm_property_name,
        value:any
    ):void{
        const fns = SyNotify.triggerStore.get(source)?.get(prop);
        if(fns){
            //直接便利最底层Set
            for(const fn of fns){
                fn(value)
            }
        }
        SyNotify.syPipe.trigger(source,prop,value);
    }

    public static ltrigger(
        parent:t_pipe_target,
        startPosition:t_pipe_target,
        value:any
    ):void{
        const pipeSet = SyNotify.syPipe.getPipeline(parent,startPosition)
        if(pipeSet !== undefined && pipeSet.size !== 0) {
            for(const pipe of pipeSet){
                SyNotify.syPipe.replaceNode(pipe,parent,startPosition,value);
            }
        }

        const indexPipeSet = SyNotify.syPipe.getIndexPipeline(parent,startPosition);
        if(indexPipeSet !== undefined && indexPipeSet.size !== 0) {
            for(const pipe of indexPipeSet){
                SyNotify.syPipe.replaceIndexNode(pipe,parent,startPosition,value);
            }
        } 
    }

    public static htrigger(
        source:object,
        prop:ListMethodType,
        oldValue:t_list_source,
        value:t_list_source
    ){
        
        let tree:SyPipeTree<any> | undefined;
        if (Array.isArray(source)){
            tree = SyNotify.syPipe.getHeadpipe(source);
        }

        //isHead,
        if(tree === undefined) return;

        //get the headpipe,use the headpipe
        SyNotify.syPipe.headTrigger(tree,prop,oldValue,value);
        
        
    }

    public static listen<
        T extends bind_target,
        K extends keyof T
    >(
        source: T,
        prop: K,
        handled:  Function,
        triggerImmediately:boolean = true,
        bindType: BindType = BindType.level0,
    ):ISyResult{
        try{
            let trigger_propMap = SyNotify.triggerStore.get(source);
            if(trigger_propMap === undefined){
                SyNotify.triggerStore.set(source,trigger_propMap = new Map());
            }

            let trigger_funcs = trigger_propMap.get(prop);
            if(trigger_funcs === undefined){
                trigger_propMap.set(prop,trigger_funcs = new Set());
            }

            trigger_funcs.add(handled);

            let indexMap = SyNotify.funIndex.get(source);
            if(indexMap === undefined){
                SyNotify.funIndex.set(source,indexMap =  new Map());
            }

            let indexFuncMap = indexMap.get(prop);
            if(indexFuncMap === undefined){
                indexMap.set(prop,indexFuncMap = new Map());
            }

            let indexSet = indexFuncMap.get(bindType);
            if(indexSet === undefined){
                indexFuncMap.set(bindType,indexSet = new Set());
            }

            indexSet.add(handled)

            if(triggerImmediately){
                handled(source[prop]);
            }

            return {
                success:true
            }
        }catch(e){
            return {
                success:false,
                error:(e as any).toString(),
                code:404
            }
        }

        
    }

    public static lListen(
        node:ISyTreeNode,
        prop:comm_property_name,
        handled:Function,
        triggerImmediately: boolean = true,
        bindType?:BindType
    ):ISyResult{

        return SyNotify.syPipe.listen(node,prop,handled,triggerImmediately,bindType);
    }






    public static unlisten
    <
        T extends bind_target,
        K extends keyof T
    >(
        source:T,
        prop:K,
        bindType?:BindType
    ):ISyResult{
        SyNotify.syPipe.unListen(source,prop,bindType);
        if(bindType){
            const indexPropMap = SyNotify.funIndex.get(source)?.get(prop);
            if(indexPropMap === undefined) return {
                success:true,
                code: -1
            }

            const indexSet = indexPropMap.get(bindType);
            if(indexSet === undefined) return{
                success:true,
                code:-1
            }

            //双端同步删除
            const triggerFns = SyNotify.triggerStore.get(source)?.get(prop);
            if(triggerFns === undefined){
                indexPropMap.delete(bindType);
                return{
                    success:true,
                    code:-1
                }
            }

            for(const fn of indexSet){
                triggerFns.delete(fn)
            }
            indexPropMap.delete(bindType)
        }else{
            SyNotify.triggerStore.get(source)?.delete(prop);
            SyNotify.funIndex.get(source)?.delete(prop);
        }

        return{
            success:true,
        }
    }

    public static getOrCreateTree<
        T extends object
    >(
        head:t_pipe_leader
    ):ISyResult<SyPipeTree<T>>{
        const tree = SyNotify.syPipe.getOrCreateTree<T>(head);

        return {
            success:true,
            data:tree
        }
    }

    public static getOrCreateTreeNode(
        pipe:t_pipe,
        parentNode:ISyTreeNode,
        target:object,
        prop:comm_property_name,
    ):ISyResult<ISyTreeNode>{
        return SyNotify.syPipe.getOrCreateTreeNode(pipe,parentNode,target,prop)
    }

    public static getRoot(
        headpipe:t_pipe
    ):ISyResult<ISyTreeNode>{
        const root = SyNotify.syPipe.getRoot(headpipe)

        return root;
    }

    public static getOrCreateHeadTree<T>(
        head:t_pipe_head<T>
    ):ISyResult<SyPipeTree<t_pipe_head<T>>>{
        const tree = SyNotify.syPipe.getOrCreateHeadTree(head);

        return {
            success:true,
            data:tree
        }
    }



    
    public static getOrCreateIndexTreeNode<
        K extends object
    >(
        tree:SyPipeTree<K>,
        parentNode:ISyTreeNode,
        target:object,
        prop:comm_property_name,
    ):ISyResult<ISyTreeNode>{
        return SyNotify.syPipe.getOrCreateIndexTreeNode(tree,parentNode,target,prop)
    }


   

    public static getOrCreateContainer<
        K
    >(
        headpipe:t_head_pipe
    ):ISyResult<SyContainer<K>>{
        const container = SyNotify.syPipe.getOrCreatelistMutant<K>(headpipe);

        return {
            success:true,
            data:container
        }
    }
}