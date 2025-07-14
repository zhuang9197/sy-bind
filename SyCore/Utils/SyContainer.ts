import { CompileStatus, ListMethodType } from "../../src/enums/SyEnums";
import { sy_pipe_types } from "../../src/types/SyPipeTypes";
import { ISyTreeNode, ITempPopMethod, ITempPushMethod } from "./SyPipe/Interfaces";

type pushMethod<K,C> = sy_pipe_types.pushMethod<K,C>;
type popMethod<C> = sy_pipe_types.popMethod<C>;

//define a target collection func
export class SyContainerMethods<K,C>{
    private pushMethods:pushMethod<K,C>[] = [];
    private popMethods:popMethod<C> [] = [];

    private tempPushMethods:ITempPushMethod<K,C>[] = [];
    private tempPopMethods:ITempPopMethod<C> [] = [];

    private createTarget: () => C;
    private target:any;
    private componentType:new(...args:any[]) =>C;

    private isCompiled:Map<ListMethodType,CompileStatus> = new Map();

    public constructor(target:any,componentType: new (...args: any[]) => C,createTarget:() => C){
        this.isCompiled.set(ListMethodType.pop,CompileStatus.uncompiled);
        this.isCompiled.set(ListMethodType.push,CompileStatus.uncompiled);
        this.target = target;
        this.createTarget = createTarget;
        this.componentType = componentType;
    }

    private pushCompiled:pushMethod<K,C> | null = (node: ISyTreeNode, target: C) => {
        for (const method of this.pushMethods) {
            method(node, target);
        }
    };
    private popCompiled:popMethod<C> | null = (node: C) => {
        for (const method of this.popMethods) {
            method(node);
        }
    }
    
    private _push():C{
        const newTarget = this.createTarget();

        this.target.addChild(newTarget);

        return newTarget;
    }

    private _pushEnd(){

    }

    public push(){

    }

    private _pop():C|undefined{
        const targets:C[] = this.target.getComponentsInChildren(this.componentType);

        return targets.pop()
    }

    private _popEnd(popNode:C){
        (popNode as any).node.destroy(); // 性能最优
    }

    //provide public func
    // add push
    public addPush(method:pushMethod<K,C>){
        this.pushMethods.push(method);
    }

    // add pop
    public addPop(method:popMethod<C>){
        this.popMethods.push(method);
    }

    //add push once
    //If isSave is false, then these methods will only be triggered once and discarded, as they will be persisted anyway
    public addPushOnce(method:pushMethod<K,C>,isSave:boolean = true){
        this.isCompiled.set(ListMethodType.push,CompileStatus.new);
        this.tempPushMethods.push({method:method,save:isSave})
    }

    //add pop once
    //If isSave is false, then these methods will only be triggered once and discarded, as they will be persisted anyway
    public addPopOnce(method:popMethod<C>,isSave:boolean = true){
        this.isCompiled.set(ListMethodType.pop,CompileStatus.new);
        this.tempPopMethods.push({method:method,save:isSave})
    }

    compilePush(node:ISyTreeNode,target:C){
        for(const tempMethods of this.tempPushMethods){
            if(tempMethods.save){
                this.pushMethods.push(tempMethods.method)
            }else{
                tempMethods.method(node,target)
            }
        }

    }

    compilePop(target:C){
        for(const tempMethods of this.tempPopMethods){
            if(tempMethods.save){
                this.popMethods.push(tempMethods.method)
            }else{
                tempMethods.method(target)
            }
        }

    }

    public callPush(node:ISyTreeNode){
        //when the push method is triggered
        //first get a new target and push to target
        const newTarget = this._push();

        //second 

        if((this.isCompiled.get(ListMethodType.push)!) === CompileStatus.new){
            this.compilePush(node,newTarget);
        }
        

        this.pushCompiled!(node,newTarget)
    }

    public callPop(){
        const popNode = this._pop();
        if(popNode === undefined) return;

        if((this.isCompiled.get(ListMethodType.pop)!) === CompileStatus.new){
            this.compilePop(popNode);
        }

        this.popCompiled!(popNode)

        this._popEnd(popNode);
    }

    

    public clear(listMethodType?:ListMethodType){
        if(listMethodType === undefined || listMethodType === ListMethodType.push){
            this.pushMethods = [];
            this.tempPushMethods = [];
        }

        if(listMethodType === undefined || listMethodType === ListMethodType.pop){
            this.popMethods = [];
            this.tempPopMethods = [];
        }

    }

}

export class SyContainer<K>{


    private methods:Map<any,SyContainerMethods<K,any>> = new Map();

    constructor(){

    }

    //获取一个Methods

    public getContainerMethods<
        C extends object
    >(
        target:any,
        componentType: new (...args: any[]) => C,
        createTarget:() => C
    ):SyContainerMethods<K,C>{
        let methods = this.methods.get(target);

        if(methods === undefined){
            this.methods.set(target,methods = new SyContainerMethods(target,componentType,createTarget))
        }

        return methods;
    }

    public call(listMethodType:ListMethodType,node?:ISyTreeNode){
        if(listMethodType === ListMethodType.push){

            for(const [key,containerMethods] of this.methods){
                containerMethods.callPush(node!);
            }
        }
        if(listMethodType === ListMethodType.pop){
            for(const [key,containerMethods] of this.methods){
                containerMethods.callPop()
            }
        }


    }
    

    clear(listMethodType?:ListMethodType,target?:any){
        if(listMethodType === undefined || listMethodType === ListMethodType.push){
            
        }
    }
}