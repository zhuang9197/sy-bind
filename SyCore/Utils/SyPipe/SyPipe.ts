import { BindType, ListMethodType } from "../../../src/enums/SyEnums";
import { sy_pipe_types } from "../../../src/types/SyPipeTypes";
import { sy_types } from "../../../src/types/SyTypes";
import { ISyResult } from "../ISyResult";
import { SyContainer } from "../SyContainer";
import { ISyTreeNode } from "./Interfaces";
import { SyPipeTree } from "./SyTree/SyPipeTree";

type t_pipe = sy_pipe_types.t_pipe;
type t_pipe_node = sy_pipe_types.t_pipe_node;
type t_pipe_leader = sy_pipe_types.t_pipe_leader;
type t_pipe_index = sy_pipe_types.t_pipe_index;
type t_pipe_head<T> = sy_pipe_types.t_pipe_head<T>;
type t_head_pipe = sy_pipe_types.t_head_pipe;
type t_pipes = sy_pipe_types.t_pipes;
type t_index_pipe = sy_pipe_types.t_index_pipe;
type t_index_pipes = sy_pipe_types.t_index_pipes;


type bind_target = sy_types.bind_target;
type comm_property_name = sy_types.comm_property_name;

export class SyPipe{
    
    private heads:WeakMap<t_pipe_leader,t_pipe> = new WeakMap();
    private pipes:WeakMap<t_pipe_node,t_pipes> =new WeakMap();

    private readonly trees = new WeakMap<t_pipe,SyPipeTree<any>>();



    private listheadtrees:WeakMap<t_pipe_head<any>,SyPipeTree<any>> = new WeakMap();

    private listpipes:WeakMap<t_head_pipe,Map<string,t_index_pipe>> = new WeakMap();

    private listMutants:WeakMap<t_head_pipe,SyContainer<any>> = new WeakMap();

    private indexpipes:WeakMap<t_pipe_index,t_index_pipes> = new WeakMap();

    private readonly listIndexNodes = new WeakMap<t_index_pipe,ISyTreeNode>();

    constructor(){

    }

    //#region  提供几个内部属性设置的方法

    //添加到heads中  head:WeakMap<t_pipe_leader,t_pipe>
    private _getOrCreateHeads(
        head:t_pipe_leader
    ):t_pipe{
        let headpipe = this.heads.get(head);

        if(headpipe === undefined){
            this.heads.set(head,headpipe = this.createPipe());
        }

        return headpipe
    }

    //添加到pipes中 pipes:WeakMap<t_pipe_node,t_pipes>
    private _addToPipes(node:t_pipe_node,pipe:t_pipe){
        let pipeSet = this.pipes.get(node);

        if(pipeSet === undefined){
            this.pipes.set(node,pipeSet = new Set());
        }

        pipeSet.add(pipe);
    }

    //从pipes中移除 node的pipe，删除node下pipes.size = 0 的数据
    private _removeFromPipes(node:t_pipe_node,pipe:t_pipe){
        let pipeSet = this.pipes.get(node);

        if(pipeSet === undefined) return;

        pipeSet.delete(pipe);

        if(pipeSet.size === 0) this.pipes.delete(node)
    }

    private _createTree(
        headpipe:t_pipe,
        head:t_pipe_leader
    ){
        let tree = this.trees.get(headpipe);

        if(tree === undefined){
            this.trees.set(headpipe,tree = new SyPipeTree(head,headpipe));
            this._addToPipes(head,headpipe);
        }else{
            throw new Error('aleady has a tree')
        }
    }



    //添加到 listheads 中  listheads:WeakMap<t_pipe_head<any>,SyPipeTree<any>>
    private _getOrCreateListHeadTrees<
        T
    >(
        head:t_pipe_head<T>
    ):SyPipeTree<t_pipe_head<T>>{
        let tree = this.listheadtrees.get(head);
        
        if(tree === undefined){
            const headpipe = this.createPipe();
            this.listheadtrees.set(head,tree =  new SyPipeTree(head,headpipe));
        }

        return tree;
    }

    //添加到 listMutant 中 listMutant:WeakMap<t_head_pipe,SyContainer<any>>
    private _getOrCreatelistMutant
    <
        K
    >(
        headpipe:t_head_pipe
    ){
        let conatiner = this.listMutants.get(headpipe);

        if(conatiner === undefined){
            this.listMutants.set(headpipe,conatiner = new SyContainer<K>());
        }

        return conatiner;
    }


    //添加到 indexpipes 中 indexpipes:WeakMap<t_pipe_index,t_index_pipes>
    private _addToIndexPipes(index:t_pipe_index,pipe:t_pipe){
        let pipeSet = this.indexpipes.get(index);

        if(pipeSet === undefined){
            this.indexpipes.set(index,pipeSet = new Set());
        }

        pipeSet.add(pipe);
    }

    //从 indexpipes 中移除 node的pipe，删除node下pipes.size = 0 的数据
    private _removeFromIndexPipes(index:t_pipe_index,pipe:t_pipe){
        let pipeSet = this.indexpipes.get(index);

        if(pipeSet === undefined) return;

        pipeSet.delete(pipe);

        if(pipeSet.size === 0) this.indexpipes.delete(index);
    }

    private createPipe():t_pipe{
        return Object.create(null);
    }



    // 优化交集算法：保持O(min(n,m))时间复杂度，避免不必要的复制
    private intersection(
        setA: t_pipes,
        setB: t_pipes
    ): t_pipes {
        // 增加引用相等性快速检查
        //if (setA === setB) return new Set(setA);

        // 优化遍历顺序：总是遍历较小的集合
        const [smaller, larger] = setA.size <= setB.size ? [setA, setB] : [setB, setA];
        const result = new Set<t_pipe>();

        // 使用迭代器直接遍历避免中间数组转换
        for (const elem of smaller) {
            if (larger.has(elem)) result.add(elem);
            // 提前退出优化：当已找到所有可能元素时
            if (result.size === smaller.size) break;
        }
        return result;
    }

    //#endregion

    //#region normal

    //创建一颗树
    public getOrCreateTree<
        T extends object
    >(
        head:t_pipe_leader
    ):SyPipeTree<T>{
        let headpipe = this.heads.get(head);

        if(headpipe === undefined){
            this.heads.set(head,headpipe = this.createPipe());
            this._createTree(headpipe,head);
        }

        return this.trees.get(headpipe)!;
    }

    public getRoot(
        pipe:t_pipe
    ):ISyResult<ISyTreeNode>{
        const tree = this.trees.get(pipe);

        if(tree === undefined) return{
            success:false,
            data:undefined,
            error:' can not find this tree '
        }

        return {
            success:true,
            data:tree.root,
        }
    }

    replaceNode<
        P extends object,
        C extends object
    >(
        pipe: t_pipe,
        parent: P,
        oldObj: C,
        newObj: C
    ): void {

        const tree = this.trees.get(pipe);
        if(tree === undefined) return
        const [oldSet,newSet] = tree.replaceObj(parent,oldObj,newObj)
        for(const oldObj of oldSet){
            this._removeFromPipes(oldObj,pipe);
        }
        for(const newObject of newSet){
            this._addToPipes(newObject,pipe)
        }
        

    }

    public getOrCreateTreeNode<
        T extends object
    >(
        pipe:t_pipe,
        parentNode:ISyTreeNode,
        index:T,
        prop:comm_property_name,
    ):ISyResult<ISyTreeNode>{

        const tree = this.trees.get(pipe);

        if(tree === undefined) return{
            success:false,
            error:' can not find this tree '
        }


        if(!tree.hasNode(parentNode)) return{
            success:false,
            error: ' node is not in the tree'
        }

        const node = tree.getOrCreateChild<T>(parentNode,prop,index)
        this._addToPipes(index,pipe);

        return {
            success:true,
            data:node
        }
    }

    

    //#endregion


    //#region list

    public getOrCreateIndexTreeNode<
        T extends object
    >(
        tree:SyPipeTree<any>,
        parentNode:ISyTreeNode,
        index:T,
        prop:comm_property_name,
    ):ISyResult<ISyTreeNode>{


        if(!tree.hasNode(parentNode)) return{
            success:false,
            error: ' node is not in the tree'
        }

        const node = tree.getOrCreateChild<T>(parentNode,prop,index)
        this._addToIndexPipes(index,parentNode.pipe);

        return {
            success:true,
            data:node
        }
    }

    public getOrCreateHeadTree<
        T
    >(
        head:t_pipe_head<T>
    ):SyPipeTree<t_pipe_head<T>> | undefined{
        

        return this._getOrCreateListHeadTrees<T>(head);
    }

    public getOrCreatelistMutant<K>(
        headpipe:t_head_pipe
    ):SyContainer<K>{
       
        return this._getOrCreatelistMutant<K>(headpipe);
    }

    public getOrCreateIndexNode(
        tree:SyPipeTree<any>,
        target:object,
        index:string
    ):ISyTreeNode{
        const headpipe = tree.pipe
        let indexMap = this.listpipes.get(headpipe);

        if(indexMap === undefined){
            this.listpipes.set(headpipe,indexMap = new Map())
        }

        let indexpipe =  indexMap.get(index);

        if(indexpipe === undefined){
            indexMap.set(index,indexpipe = this.createPipe());
            let indexSet = this.indexpipes.get(target);

            if(indexSet === undefined){
                this.indexpipes.set(target,indexSet = new Set());
                indexSet.add(indexpipe);
            }

        }

        

        return this.addOrCreateIndexNode(tree,indexpipe,target,index);
    }

    public getIndexNode(
        tree:SyPipeTree<any>,
        index:string
    ):ISyTreeNode|undefined{
        const headpipe = tree.pipe
        const indexpipe = this.listpipes.get(headpipe)?.get(index);

        if(indexpipe === undefined){
            return undefined
        }

        return this.listIndexNodes.get(indexpipe);
        
    }




    private addOrCreateIndexNode<
        T extends object
    >(
        tree:SyPipeTree<any>,
        indexpipe:t_index_pipe,
        obj:T,
        prop: comm_property_name
    ):ISyTreeNode{
        let node = this.listIndexNodes.get(indexpipe);

        if(node === undefined){
            
            this.listIndexNodes.set(indexpipe,node = tree.addChild(tree.root,prop,obj,indexpipe));
        }

        return node

    }

    //#endregion


    //#region  share

    public getPipeline(entrance: object, direction: object): t_pipes | undefined {
        // 双重非空检查优化（逻辑修正）
        const entranceSet = this.pipes.get(entrance);
        const directionSet = this.pipes.get(direction);

        // 短路返回优化：合并条件判断
        if (!entranceSet || !directionSet) return undefined;
        // 增加空集快速通道
        if (entranceSet.size === 0 || directionSet.size === 0) {
            return new Set();
        }

        return this.intersection(entranceSet, directionSet);
    }

    public getIndexPipeline(entrance:object,direction:object):t_pipes | undefined{
        const entranceSet = this.indexpipes.get(entrance);
        const directionSet = this.indexpipes.get(direction);

        if(!entranceSet || !directionSet) return undefined;

        if(entranceSet.size === 0 || directionSet.size === 0){
            return new Set();
        }

        return this.intersection(entranceSet,directionSet)
    }

    public replaceIndexNode<
        P extends object,
        C extends object
    >(
        pipe: t_pipe,
        parent: P,
        oldObj: C,
        newObj: C
    ): void {

        const indexNode = this.listIndexNodes.get(pipe);
        if(indexNode === undefined) return
        const tree = indexNode.root;
        const [oldSet,newSet] = tree.replaceObj(parent,oldObj,newObj)
        for(const oldObj of oldSet){
            this._removeFromIndexPipes(oldObj,pipe);
        }
        for(const newObject of newSet){
            this._addToIndexPipes(newObject,pipe)
        }
        

    }


    public getHeadpipe(head:t_pipe_head<any>):SyPipeTree<t_pipe_head<any>> | undefined{
        return this.listheadtrees.get(head);
    }

    public getIndexPipes(index:t_pipe_index):t_index_pipes|undefined{
        return this.indexpipes.get(index);
    }

    //先不管是不是值类型
    //只考虑object
    headTrigger<
        T extends object
    >(
        tree:SyPipeTree<any>,
        index:ListMethodType,
        oldValue:any,
        value:T
    ){
        const conatiner = this._getOrCreatelistMutant(tree.pipe);
        //const node = index === ListMethodType.pop?null: this.getOrCreateIndexNode(tree,value,oldValue);

        //分为三种情况
        //1 push
        if(index === ListMethodType.push){
            const pushNode = this.headPush(tree,value,oldValue);
            conatiner.call(ListMethodType.push,pushNode)
        }
        //2 pop
        else if(index === ListMethodType.pop){
            this.headPop(tree,oldValue)    
            conatiner.call(ListMethodType.pop);
        }
        //3 change
        else if(index === ListMethodType.change){
            this.headChange(tree,value,oldValue)
            //this.headIndexReplaceNode(tree,node!,value);
        }
    }

    public listen(
        node: ISyTreeNode,
        prop: comm_property_name,
        fn: Function,
        triggerImmediately: boolean = true,
        bindType?:BindType
    ):ISyResult {
        //let structure = this.structures.get(pipe);
        // if (structure === undefined) return {
        //     success :false,
        //     error:'Is the object accidentally released due to abnormal pipeline structure?'
        // }

        return node.listen(prop, fn,triggerImmediately,bindType);
    }

    public unListen
    <
        T extends object
    >(
        target:T,
        prop?:comm_property_name,
        bindType?:BindType
    ):ISyResult{
        try{
            //获取pipe
            const pipeSet = this.pipes.get(target);
            if(pipeSet === undefined) return {
                success:true,
                code:-1
            }

            for(const pipe of pipeSet){
                //this.structures.get(pipe)?.unListen(target,prop,bindType);
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

    public trigger(
        target:bind_target,
        prop:comm_property_name,
        value:any
    ){
        //console.log('进入了 pipe 的 trigger')
        const pipes = this.pipes.get(target);
        if(pipes !== undefined){
            // for(const pipe of pipes){
            //     this.structures.get(pipe)?.trigger(target,prop,value);
            // }
            //console.log('获取到了tree')
            for(const pipe of pipes){
                this.trees.get(pipe)?.trigger(target,prop,value);
            }
        }else{
            //console.log('没有获取到 tree')
        }

        const indexpipes = this.indexpipes.get(target);

        const trees = new Set<SyPipeTree<any>>();

        if(indexpipes !== undefined){
            
            for(const indexpipe of indexpipes){
                const tree = this.listIndexNodes.get(indexpipe)?.root;
                if(tree !== undefined) trees.add(tree)
            }
        }else{
            //console.log('没有获取到 node 1')
        }

        if(trees.size){
            for(const tree of trees){
                tree.trigger(target,prop,value);
            }
        }

    }

    //#endregion

    private headPush<
        T extends object
    >(
        tree:SyPipeTree<any>,
        value:T,
        index:string
    ):ISyTreeNode{
        return this.getOrCreateIndexNode(tree,value,index);
    }

    private headPop(
        tree:SyPipeTree<any>,
        index:string
    ){
        //获取那个node需要pop
        const popNode = this.getIndexNode(tree,index);

        

        if(popNode === undefined){
            return 
        }
        const indexpipe = popNode.pipe;

        const deleteSet = tree.removeNodeAndChild(popNode);

        for(const oldObj of deleteSet){
            this._removeFromIndexPipes(oldObj,indexpipe);
        }

    }

    private headChange<
        T extends object
    >(
        tree:SyPipeTree<any>,
        value:T,
        index:string
    ){
        const changeNode = this.getOrCreateIndexNode(tree,value,index);

        const nodeSet = new Set<ISyTreeNode>();
        const pipe = changeNode.pipe;
        nodeSet.add(changeNode);

        const [oldSet,newSet] = tree.processNodesOptimized(nodeSet,value);

        for(const oldObj of oldSet){
            this._removeFromIndexPipes(oldObj,pipe);
        }

        for(const newObj of newSet){
            this._addToIndexPipes(newObj,pipe);
        }
    }

    //#region share private fun



    //#endregion

    



    

    

    



}