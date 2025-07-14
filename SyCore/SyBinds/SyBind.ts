import { sy_pipe_types } from "../../src/types/SyPipeTypes";
import { sy_types } from "../../src/types/SyTypes";
import { BindType } from "../../src/enums/SyEnums";
import { ISyListResult, ISyResult } from "../Utils/ISyResult";
import { SyBindUtility } from "../Utils/SyBindUtility";
import { SyContainerMethods } from "../Utils/SyContainer";
import { ISyTreeNode } from "../Utils/SyPipe/Interfaces";
import { SyPipeTree } from "../Utils/SyPipe/SyTree/SyPipeTree";
import { SyListResult } from "../Utils/SyResult";
import { SyReflect } from "../Utils/SyReflect";

type bind_target = sy_types.bind_target;
type ComponentUpdateStrategy<T> = sy_types.ComponentUpdateStrategy<T>;
type SyList<K> = sy_types.SyList<K>;

type t_pipe_target = sy_pipe_types.t_pipe_target;
type t_pipe_leader = sy_pipe_types.t_pipe_leader;


export class SyBind{

    public static bind<
        T extends bind_target
    >(
        source:T,
        target:any,
        handled:Map<Function,ComponentUpdateStrategy<any>> | ((value:any) => void),
        triggerImmediately:boolean = true,
        bindType?:BindType
    ):ISyResult{
        if(SyReflect.isProxy(source))
            return SyBind._bind(source,target,handled,triggerImmediately,bindType)


        return {
            success:false,
            error:'The target is not the desired proxy, try to decorate her with @Bind?',
            code:101
        };
    }

    private static _bind(
        source:bind_target,
        target:any,
        handled:Map<Function,ComponentUpdateStrategy<any>> | ((value: any) => void),
        triggerImmediately:boolean = true,
        bindType?:BindType
    ):ISyResult{
        Object.keys(target).forEach(targetKey => {
            if(SyReflect.isMarked(target[targetKey])){
                SyBind._bind(source,target[targetKey],handled,triggerImmediately)
            }else{
                const bindKey = SyReflect.getPropMetada(target,targetKey);
                if(bindKey === undefined) return //退出当层循环

                 const updateStrategy = 
                    SyBindUtility.resolveUpdateStrategy(handled, target[targetKey]) 
                    ?? ((value: any) => {}); // 使用 ?? 运算符兜底

                bindKey.forEach(key => {
                    if(key.indexOf('/') !== -1){
                        const sourcePath = SyBindUtility.parsePropertyPath(source,key);
                        if (sourcePath.parent !== undefined && sourcePath.target != undefined) {    
                            if(sourcePath.prop in sourcePath.parent){
                                SyBindUtility.listen(sourcePath.parent, sourcePath.prop , updateStrategy,triggerImmediately, bindType)
                            }
                        }
                    }else{
                        if(key in source){
                            SyBindUtility.listen(source, key as keyof typeof source , updateStrategy,triggerImmediately, bindType);
                        }                        
                    }
                })


            }
        })

        return{
            success:true
        }
    }

    public static pbind
    <
        T extends bind_target,
        K extends keyof T,
        C extends object,
    >(
        source:T,
        sourceProp:K,
        target:C,
        handled:Map<Function,ComponentUpdateStrategy<any>> | ((value: T[K]) => void),
        triggerImmediately:boolean = true,
        bindType?:BindType
    ):ISyResult{
        if(SyReflect.isProxy(source)){
            const updateStrategy = 
                SyBindUtility.resolveUpdateStrategy(handled,target)
                ?? ((value: any) => {}); // 使用 ?? 运算符兜底


            return SyBindUtility.listen(source,sourceProp,updateStrategy,triggerImmediately,bindType)
        }

        return {
            success:false,
            error:'The target is not the desired proxy, try to decorate her with @Bind?',
            code:101
        };
    }

    public static lbind
    <
        L extends t_pipe_leader,
        T extends t_pipe_target
    >(
        source : T,
        target:any,
        handled:Map<Function,ComponentUpdateStrategy<any>> | ((value: any) => void),
        leader? : L,
        triggerImmediately:boolean = true,
        bindType?:BindType
    ):ISyResult{
        //验证是否被BindClass修饰或以为Proxy
        const t_leader = leader ? leader : source;
        if (SyReflect.isProxy(t_leader)) {
            //选举leader
            
            //为leader添加监听，当触发对象变更时，触发相关操作
            //获取或复用管道,同时管道上的对象赋予监听
            const node = SyBindUtility.rlResolve(t_leader, source);
            if (node === undefined) return{
                success:false,
                error:'An unexpected situation occurred while initializing the pipeline',
                code:202
            };
            return SyBind._lbind(node, source, target, handled, triggerImmediately,bindType);
        }

        return {
            success:false,
            error:'The target is not the desired proxy, try to decorate her with @Bind?',
            code:101
        };    
    }

    private static _lbind(
        node:ISyTreeNode,
        source:t_pipe_target,
        target:any,
        handled:Map<Function,ComponentUpdateStrategy<any>> | ((value: any) => void),
        triggerImmediately:boolean = true,
        bindType?:BindType
    ):ISyResult{
        Object.keys(target).forEach(targetKey => {

            if(SyReflect.isMarked(target[targetKey])){
                SyBind._lbind(node,source,target[targetKey],handled,triggerImmediately)
            }else{
                const bindKey = SyReflect.getPropMetada(target,targetKey);
                if(!bindKey) return;

                const updateStrategy = 
                    SyBindUtility.resolveUpdateStrategy(handled,target[targetKey])
                    ?? ((value: any) => {}); // 使用 ?? 运算符兜底

                

                //判断bindkey中是否存在 / 如果存在则代表深层绑定，递归判断其父类是否为proxy，是则在其直接父类上添加监听方法
                bindKey.forEach(key => {
                    if(key.indexOf('/') !== -1){
                        //
                        const sourcePath = SyBindUtility.parsePropertyPath(source, key);
                        if (sourcePath.parent !== undefined && sourcePath.target !== undefined) {
                            if(sourcePath.prop in sourcePath.parent){
                                const childList = key.split('/')

                                const finalNode = SyBindUtility.applyChain(node, source, childList);

                                if(finalNode === null){
                                    throw new Error()
                                }
                                SyBindUtility.lListen(finalNode, sourcePath.prop, updateStrategy,triggerImmediately,bindType);
                            }
                            
                        }
                    }else{
                        if(key in source){
                            SyBindUtility.lListen(node, key, updateStrategy,triggerImmediately,bindType);
                        }
                        
                    }
                })
                
            }
        })

        return{
            success:true
        }

    }

    public static lpbind
    <
        T extends t_pipe_target,
        K extends keyof T,
        L extends t_pipe_leader,
        C extends object,
    >(
        source: T,
        sourceProp: K,
        target: C,
        handled: Map<Function,ComponentUpdateStrategy<any>> | ((value: T[K]) => void),
        leader?: L,
        triggerImmediately: boolean = true,
        bindType?:BindType 
    ): ISyResult{
        if (SyReflect.isProxy(source)) {
            const t_leader = leader ? leader : source;
            const updateStrategy = 
                SyBindUtility.resolveUpdateStrategy(handled,target)
                ?? ((value: any) => {}); // 使用 ?? 运算符兜底
            //获取到一个只需要newvalue的function
            const node = SyBindUtility.rlResolve(t_leader, source);
            if (node === undefined) return{
                success:false,
                error:'An unexpected situation occurred while initializing the pipeline',
                code:202
            };

            return SyBindUtility.lListen(node,sourceProp,updateStrategy,triggerImmediately,bindType)
        }

        return {
            success:false,
            error:'The target is not the desired proxy, try to decorate her with @Bind?',
            code:101
        };
    }


    public static bindlist<
        K extends object,
        LK extends SyList<K>,
        C extends object,
        LC
    >(
        source:LK,
        target:LC,
        componentType: new (...args: any[]) => C,
        handled: Map<Function,ComponentUpdateStrategy<any>> | ((value: C) => void),
        createTarget: ()=> C,
        triggerImmediately: boolean = true,
        bindType?:BindType,
    ):ISyListResult<K,C> | undefined{
        if(SyReflect.isProxy(source)){
            const tree = SyBindUtility.getOrCreateHead<K>(source);
            if(tree !== undefined){


                return SyBind._bindlist<K,C,LC>(tree,target,componentType,handled,createTarget,triggerImmediately,bindType);

            }

            
            return undefined;
            
        }
        return undefined;

    }

    private static _bindlist<
        K extends object,
        C extends object,
        LC 

    >(
        tree:SyPipeTree<K>,
        target:LC,
        componentType: new (...args: any[]) => C,
        handled: Map<Function,ComponentUpdateStrategy<any>> | ((value: C) => void),
        createTarget: ()=> C,
        triggerImmediately: boolean = true,
        bindType?:BindType 
    ):ISyListResult<K,C>{
        const headpipe = tree.pipe;
        const container = SyBindUtility.getOrCreateContainer<K>(headpipe).data!;
        const containerMethods:SyContainerMethods<K,C> = container.getContainerMethods(target,componentType,createTarget);

        const targetList:C[] = (target as any).getComponentsInChildren(componentType)

        const targetfirst = (targetList.length > 0 ? targetList[0] : createTarget()) as any

        SyBind._bindMutant(tree,targetfirst,handled,containerMethods,triggerImmediately,bindType);
            
       

        //如果是object，判断是否
        
        return new SyListResult<K,C>(containerMethods);
    }

    

    private static _bindMutant<
        K extends object,
        C extends object,
    >(
        tree:SyPipeTree<K>,
        target:any,
        handled: Map<Function,ComponentUpdateStrategy<any>> | ((value: C) => void),
        containerMethods:SyContainerMethods<K,C>,
        triggerImmediately: boolean = true,
        bindType?:BindType
        
    ){
        Object.keys(target).forEach(targetKey =>{
                if(SyReflect.isMarked(target[targetKey])){
                    SyBind._bindMutant(tree,target[targetKey],handled,containerMethods,triggerImmediately,bindType)
                }else{
                    const bindKey = SyReflect.getPropMetada(target,targetKey);
                    if(bindKey === undefined) return;
                    
                    bindKey.forEach(key => {
                        if(key.indexOf('/') !== -1){
                            containerMethods.addPush((node:ISyTreeNode,c_target:C) => {
                                const c_source = node.obj;
                                const updateStrategy = 
                                    SyBindUtility.resolveUpdateStrategy(handled,(c_target as any)[targetKey])
                                    ?? ((value: any) => {}); // 使用 ?? 运算符兜底

                                
                                const sourcePath = SyBindUtility.parsePropertyPath(c_source,key);
                                if(sourcePath.parent !== undefined && sourcePath.target !== undefined){
                                    if(sourcePath.prop in sourcePath.parent){
                                        const childList = key.split('/');

                                        const finalNode = SyBindUtility.applyIndexChain(tree,node, c_source, childList);

                                        if(finalNode === null){
                                            throw new Error();
                                        }

                                        SyBindUtility.lListen(finalNode,sourcePath.prop,updateStrategy,triggerImmediately,bindType)
                                    }
                                }
                            })
                        }else{
                            //if(key in source){
                                containerMethods.addPush((node:ISyTreeNode,c_target:C) =>{
                                    const updateStrategy = 
                                        SyBindUtility.resolveUpdateStrategy(handled,(c_target as any)[targetKey])
                                        ?? ((value: any) => {}); // 使用 ?? 运算符兜底

                                    
                                    SyBindUtility.lListen(node,key,updateStrategy,triggerImmediately,bindType);
                                })
                            
                        }
                    })
                }
            })
    }

    

    public static onChange
    <
        T extends bind_target,
        K extends keyof T
    >(
        source:T,
        sourceProp:K,
        handled:(value:T[K]) => void,
        triggerImmediately: boolean = true,
        bindType?: BindType
    ):ISyResult {
        if (SyReflect.isProxy(source)) {
            return SyBindUtility.listen(source, sourceProp, handled,triggerImmediately, bindType);
        }

        return {
            success:false,
            error:'The target is not the desired proxy, try to decorate her with @Bind?',
            code:101
        };
    }

    public static onLChange
    <
        T extends t_pipe_target,
        K extends keyof T,
        L extends t_pipe_leader
    >(
        source: T,
        sourceProp: K,
        handled: (value: T[K]) => void,
        leader?:L,
        triggerImmediately: boolean = true,
        bindType?: BindType
    ) :ISyResult{
        if (SyReflect.isProxy(source)) {
            const t_leader = leader ? leader : source;
            const node = SyBindUtility.rlResolve(t_leader, source);
            if (node === undefined) return{
                success:false,
                error:'An unexpected situation occurred while initializing the pipeline',
                code:202
            };

            return SyBindUtility.lListen(node, sourceProp, handled,triggerImmediately, bindType)

        }

        return {
            success:false,
            error:'The target is not the desired proxy, try to decorate her with @Bind?',
            code:101
        };
    }

    

    public static unBind
    <
        T extends bind_target,
        K extends keyof T
    >(
        source:T,
        prop:K,
        bindType?:BindType
    ):ISyResult{
        return SyBindUtility.unlisten(source,prop,bindType);
    }


}