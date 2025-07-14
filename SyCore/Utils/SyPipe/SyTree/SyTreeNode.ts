import { sy_pipe_types } from "../../../../src/types/SyPipeTypes";
import { sy_types } from "../../../../src/types/SyTypes";
import { BindType } from "../../../../src/enums/SyEnums";
import { ISyResult } from "../../ISyResult";
import { ISyTreeNode } from "../Interfaces";
import { SyPipeTree } from "./SyPipeTree";


type comm_property_name = sy_types.comm_property_name;
type bind_func = sy_types.bind_func;

type t_pipe = sy_pipe_types.t_pipe;
type t_index_pipe = sy_pipe_types.t_index_pipe;

export class SyTreeNode<T extends object> implements ISyTreeNode{
    //root : tree pointing to the node itself
    public root: SyPipeTree<any>;
    public obj: T;
    public prop:comm_property_name;
    parent: ISyTreeNode | null = null;
    children: Set<ISyTreeNode> = new Set();
    protected bindFunction:Map<comm_property_name,bind_func> = new Map();
    protected funcIndex:Map<comm_property_name,Map<BindType,bind_func>> = new Map();

    readonly pipe:t_pipe;
    readonly level:number;
    
    constructor(tree:SyPipeTree<any>, obj: T, prop: comm_property_name,pipe:t_pipe,level:number) {
        this.root = tree;
        this.obj = obj;
        this.prop = prop;

        this.pipe = pipe;
        this.level = level;
    }

    public listen(
        prop:comm_property_name,
        fn:Function,
        triggerImmediately:Boolean = true,
        bindType:BindType = BindType.Level10
    ):ISyResult{
        try{
            let funcs = this.bindFunction.get(prop);

            if(funcs === undefined){
                this.bindFunction.set(prop,funcs = new Set());
            }

            funcs.add(fn);

            let bindFuncMap = this.funcIndex.get(prop);

            if(bindFuncMap === undefined){
                this.funcIndex.set(prop,bindFuncMap = new Map());
            }

            let funSet = bindFuncMap.get(bindType);
            if(funSet === undefined){
                bindFuncMap.set(bindType,funSet = new Set());
            }

            funSet.add(fn);

            if(triggerImmediately){
                fn((this.obj as any)[prop])
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

    public unListen(
        prop?:comm_property_name,
        bindType?:BindType
    ):ISyResult{
        try{
            if(prop === undefined){
                //没有指定prop，清空相应bindType等级的监听
                if(bindType !== undefined){
                    for(const [key,typeMap] of this.funcIndex){
                        const funSet = typeMap.get(bindType);
                        if(funSet === undefined) continue
    
                        const triggerFns = this.bindFunction.get(key);
                        
                        if(triggerFns){
                            for(const fn of funSet){
                                triggerFns.delete(fn)
                            }
                        }
    
                        typeMap.delete(bindType)
                    }
                }else{
                    //没有指定prop，也没有指定bindType，全部删除
                    this.funcIndex.clear();
                    this.bindFunction.clear();
                }
            }else{
                //指定了prop，清空相应的bindType等级的监听
                if(bindType !== undefined){
                    const typeMap = this.funcIndex.get(prop);
                    if(typeMap === undefined) return{
                        success:true
                    };
    
                    const fns = typeMap.get(bindType)
                    if(fns === undefined) return {
                        success:true
                    };
    
                    //双端同步删除
                    const triggerFns = this.bindFunction.get(prop);
                    if(triggerFns){
                        for(const fn of fns){
                            triggerFns.delete(fn);
                        }
                    }
    
                    typeMap.delete(bindType)
                }else{
                    //清空prop
                    this.bindFunction.delete(prop);
                    this.funcIndex.delete(prop);
                }
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

    public trigger(prop:comm_property_name,value:any){
        const funcs = this.bindFunction.get(prop)
        if (funcs) {

            for (const func of funcs) {
                func(value);
            }
        }
    }

    public triggerAll(){
        console.log(this.bindFunction.size)
        for (const [key, functionSet] of this.bindFunction) {
            console.log('这里正在进行triggerAll操作',key)
            const value = (this.obj as any)[key];
            for (const func of functionSet) {
                func(value);
            }
        }
    }

    setParent<P extends object>(parent:SyTreeNode<P>){
        this.parent = parent;
    }

    getChild<T extends object>(child:T):ISyTreeNode | undefined{
        for(const childNode of this.children){
            if (childNode.obj === child){
                return childNode
            }
        }

        return undefined
    }

    public addChild<
        C extends object
    >(
        tree:SyPipeTree<any>,
        childObj:C,
        prop:comm_property_name,
        pipe?:t_index_pipe
    ):ISyTreeNode{
        const t_pipe = pipe === undefined ? this.pipe : pipe
        const child = new SyTreeNode<C>(tree,childObj,prop,t_pipe,this.level + 1)
        child.setParent<T>(this)
        this.children.add(child);

        return child
    }

    public getOrCreateChild<
        C extends object
    >(
        tree:SyPipeTree<any>,
        childObj:C,
        prop:comm_property_name
    ):ISyTreeNode{
        for(const child of this.children){
            if(child.obj === childObj && child.prop === prop){
                return child;
            }
        }

        return this.addChild<C>(tree,childObj,prop);
    }

    changeObj(newObj:T){

        this.obj = newObj;

        this.triggerAll();
    }

    
}