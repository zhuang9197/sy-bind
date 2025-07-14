import { sy_pipe_types } from "../../../../src/types/SyPipeTypes";
import { sy_types } from "../../../../src/types/SyTypes";
import { ISyTreeNode } from "../Interfaces";
import { SyTreeNode } from "./SyTreeNode";

type t_pipe = sy_pipe_types.t_pipe;
type t_index_pipe = sy_pipe_types.t_index_pipe;

type comm_property_name = sy_types.comm_property_name;
type t_pipe_target = sy_pipe_types.t_pipe_target;

export class SyPipeTree<Root extends object>{
    //root:root Node
    root: ISyTreeNode;
    readonly pipe: t_pipe;
    private objNodeMap = new Map<object, Set<ISyTreeNode>>();


    constructor(rootObj: Root,pipe:t_pipe) {
        this.root = new SyTreeNode(this,rootObj, '',pipe,0);
        this.pipe = pipe;
        this.addToMap(this.root);
    }

    //some private methods
    // add to this.objNodeMap
    private addToMap(node: ISyTreeNode) {
        let set = this.objNodeMap.get(node.obj);
        if (set === undefined) {
            this.objNodeMap.set(node.obj, set = new Set());
        }
        set.add(node);
        
    }

    // remove from this.objNodeMap
    private removeFromMap(node: ISyTreeNode) {
        const set = this.objNodeMap.get(node.obj);
        if (set) {
            set.delete(node);
            if (set.size === 0) {
                this.objNodeMap.delete(node.obj);
            }
        }
    }

    // 获取关联节点
    private getNodesByObj<T extends object>(obj: T): Set<ISyTreeNode> | undefined {
        return this.objNodeMap.get(obj);
    }

    private getChangeNode<P extends object,C extends object>(parent:P,child:C):Set<ISyTreeNode> | undefined{
        const parentNodes = this.objNodeMap.get(parent);

        if(parentNodes === undefined) return undefined

        const nodeSet:Set<ISyTreeNode> = new Set()

        for(const parentNode of parentNodes){
            const childNode = parentNode.getChild(child);
            if(childNode !== undefined){
                nodeSet.add(childNode)
            }
        }

        return nodeSet
    }

    
    
    //#region change Node

    replaceObj<
        P extends object,C extends object
    >(
        parent:P,
        child:C,
        newValue:C
    ):[Set<any>,Set<any>]{
        const nodes = this.getChangeNode(parent,child);

        if (!nodes?.size) return [new Set(),new Set()];




        return this.processNodesOptimized(nodes,newValue)
        
        
        
    }

    processNodesOptimized<
        T extends object
    >(
        nodes:Set<ISyTreeNode>,
        newObj:T
    ):[Set<any>,Set<any>]{
        const updateQueue = new Map<ISyTreeNode,object>();
        // 一次性收集所有需要更新的节点
        for (const node of nodes) {
            this.collectUpdateNodes(node, newObj, updateQueue);
        }

        return this.executeUpdatesAndFilter(updateQueue);

    }

    private collectUpdateNodes<
        T extends object
    >(
        node:ISyTreeNode,
        newObj:T,
        updateQueue:Map<ISyTreeNode,object>
    ){
        const stack: [ISyTreeNode, T][] = [[node, newObj]];
        
        while(stack.length){
            const [current,newValue] = stack.pop()!;
            updateQueue.set(current,newValue);

            for(const child of current.children){
                try{
                    const childValue = (newValue as any)[child.prop];
                    if(childValue != undefined){
                        stack.push([child,childValue]);
                    }
                }catch {
                    // 忽略无效属性访问
                }
            }
        }
    }

    private executeUpdatesAndFilter(
        updateQueue:Map<ISyTreeNode,object>
    ):[Set<any>,Set<any>]{
        const validOldObjs = new Set<any>();
        const validNewObjs = new Set<any>();
        const oldObjsToCheck:any[] = [];

        for(const [node,newObj] of updateQueue){
            const oldObj = node.obj;
            this.removeFromMap(node);
            node.changeObj(newObj); // 临时修改内部状态
            this.addToMap(node);

            oldObjsToCheck.push(oldObj);
            validNewObjs.add(newObj)
        }

        for(const oldObj of oldObjsToCheck){
            if(!this.objNodeMap.has(oldObj)){
                validOldObjs.add(oldObj);
            }
        }

        return [validOldObjs,validNewObjs];
    }

    //#endregion
    

    removeNodeAndChild(node:ISyTreeNode):Set<any>{
        const deleteQueue:Map<ISyTreeNode,object> = new Map();
        this.collectDeleteNodes(node,deleteQueue);

        return this.executeDeleteAndFilter(deleteQueue);

    }

    private executeDeleteAndFilter(
        deleteQueue:Map<ISyTreeNode,object>
    ):Set<any>{
        const validOldObjs = new Set<any>();    

        for(const [node,obj] of deleteQueue){

            this.removeFromMap(node);
            if(!this.objNodeMap.has(obj)){
                validOldObjs.add(obj);
            }

        }


        return validOldObjs
    }


    private collectDeleteNodes(
        node:ISyTreeNode,
        deleteQueue:Map<ISyTreeNode,object>
    ){
        const stack: ISyTreeNode[] = [node];
        
        while(stack.length){
            const current = stack.pop()!;
            deleteQueue.set(current,current.obj);

            for(const child of current.children){
                try{
                    stack.push(child);
                    
                }catch {
                    // 忽略无效属性访问
                }
            }
        }
    }
    

    

    // just add
    public addChild<
        T extends object
    >(
        parent: ISyTreeNode, 
        prop: comm_property_name, 
        childObj: T,
        pipe?:t_index_pipe
    ):ISyTreeNode {
        
        const node =  parent.addChild(parent.root,childObj,prop,pipe)

        this.addToMap(node);

        return node;
    }

    //If the children of parentNode do not contain nodes with the same childObj and prop, 
    // create a node and add it to the children of parentNode
    public getOrCreateChild<
        T extends object
    >(
        parent:ISyTreeNode,
        prop:comm_property_name,
        childObj:T
    ):ISyTreeNode{
        const node = parent.getOrCreateChild(parent.root,childObj,prop);

        this.addToMap(node);

        return node;
    }


    // Determine whether a node is included
    public hasNode(node:ISyTreeNode):boolean{
        const nodes = this.objNodeMap.get(node.obj);
        if(nodes === undefined) return false;

        for(const item of nodes){
            if(node === item){
                return true;
            }
        }

        return false;

    }

    public trigger(target:object,prop:comm_property_name,value:any){
        const nodes = this.objNodeMap.get(target);
        if(nodes === undefined) return
        for(const node of nodes){
            node.trigger(prop,value);
        }
    }


    

   












   

    
}