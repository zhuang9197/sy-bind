import { ListMethodType } from "../../../src/enums/SyEnums.js";
import { SyContainer } from "../SyContainer.js";
import { SyPipeTree } from "./SyTree/SyPipeTree.js";
export class SyPipe {
    heads = new WeakMap();
    pipes = new WeakMap();
    trees = new WeakMap();
    listheadtrees = new WeakMap();
    listpipes = new WeakMap();
    listMutants = new WeakMap();
    indexpipes = new WeakMap();
    listIndexNodes = new WeakMap();
    constructor() {
    }
    //#region  提供几个内部属性设置的方法
    //添加到heads中  head:WeakMap<t_pipe_leader,t_pipe>
    _getOrCreateHeads(head) {
        let headpipe = this.heads.get(head);
        if (headpipe === undefined) {
            this.heads.set(head, headpipe = this.createPipe());
        }
        return headpipe;
    }
    //添加到pipes中 pipes:WeakMap<t_pipe_node,t_pipes>
    _addToPipes(node, pipe) {
        let pipeSet = this.pipes.get(node);
        if (pipeSet === undefined) {
            this.pipes.set(node, pipeSet = new Set());
        }
        pipeSet.add(pipe);
    }
    //从pipes中移除 node的pipe，删除node下pipes.size = 0 的数据
    _removeFromPipes(node, pipe) {
        let pipeSet = this.pipes.get(node);
        if (pipeSet === undefined)
            return;
        pipeSet.delete(pipe);
        if (pipeSet.size === 0)
            this.pipes.delete(node);
    }
    _createTree(headpipe, head) {
        let tree = this.trees.get(headpipe);
        if (tree === undefined) {
            this.trees.set(headpipe, tree = new SyPipeTree(head, headpipe));
            this._addToPipes(head, headpipe);
        }
        else {
            throw new Error('aleady has a tree');
        }
    }
    //添加到 listheads 中  listheads:WeakMap<t_pipe_head<any>,SyPipeTree<any>>
    _getOrCreateListHeadTrees(head) {
        let tree = this.listheadtrees.get(head);
        if (tree === undefined) {
            const headpipe = this.createPipe();
            this.listheadtrees.set(head, tree = new SyPipeTree(head, headpipe));
        }
        return tree;
    }
    //添加到 listMutant 中 listMutant:WeakMap<t_head_pipe,SyContainer<any>>
    _getOrCreatelistMutant(headpipe) {
        let conatiner = this.listMutants.get(headpipe);
        if (conatiner === undefined) {
            this.listMutants.set(headpipe, conatiner = new SyContainer());
        }
        return conatiner;
    }
    //添加到 indexpipes 中 indexpipes:WeakMap<t_pipe_index,t_index_pipes>
    _addToIndexPipes(index, pipe) {
        let pipeSet = this.indexpipes.get(index);
        if (pipeSet === undefined) {
            this.indexpipes.set(index, pipeSet = new Set());
        }
        pipeSet.add(pipe);
    }
    //从 indexpipes 中移除 node的pipe，删除node下pipes.size = 0 的数据
    _removeFromIndexPipes(index, pipe) {
        let pipeSet = this.indexpipes.get(index);
        if (pipeSet === undefined)
            return;
        pipeSet.delete(pipe);
        if (pipeSet.size === 0)
            this.indexpipes.delete(index);
    }
    createPipe() {
        return Object.create(null);
    }
    // 优化交集算法：保持O(min(n,m))时间复杂度，避免不必要的复制
    intersection(setA, setB) {
        // 增加引用相等性快速检查
        //if (setA === setB) return new Set(setA);
        // 优化遍历顺序：总是遍历较小的集合
        const [smaller, larger] = setA.size <= setB.size ? [setA, setB] : [setB, setA];
        const result = new Set();
        // 使用迭代器直接遍历避免中间数组转换
        for (const elem of smaller) {
            if (larger.has(elem))
                result.add(elem);
            // 提前退出优化：当已找到所有可能元素时
            if (result.size === smaller.size)
                break;
        }
        return result;
    }
    //#endregion
    //#region normal
    //创建一颗树
    getOrCreateTree(head) {
        let headpipe = this.heads.get(head);
        if (headpipe === undefined) {
            this.heads.set(head, headpipe = this.createPipe());
            this._createTree(headpipe, head);
        }
        return this.trees.get(headpipe);
    }
    getRoot(pipe) {
        const tree = this.trees.get(pipe);
        if (tree === undefined)
            return {
                success: false,
                data: undefined,
                error: ' can not find this tree '
            };
        return {
            success: true,
            data: tree.root,
        };
    }
    replaceNode(pipe, parent, oldObj, newObj) {
        const tree = this.trees.get(pipe);
        if (tree === undefined)
            return;
        const [oldSet, newSet] = tree.replaceObj(parent, oldObj, newObj);
        for (const oldObj of oldSet) {
            this._removeFromPipes(oldObj, pipe);
        }
        for (const newObject of newSet) {
            this._addToPipes(newObject, pipe);
        }
    }
    getOrCreateTreeNode(pipe, parentNode, index, prop) {
        const tree = this.trees.get(pipe);
        if (tree === undefined)
            return {
                success: false,
                error: ' can not find this tree '
            };
        if (!tree.hasNode(parentNode))
            return {
                success: false,
                error: ' node is not in the tree'
            };
        const node = tree.getOrCreateChild(parentNode, prop, index);
        this._addToPipes(index, pipe);
        return {
            success: true,
            data: node
        };
    }
    //#endregion
    //#region list
    getOrCreateIndexTreeNode(tree, parentNode, index, prop) {
        if (!tree.hasNode(parentNode))
            return {
                success: false,
                error: ' node is not in the tree'
            };
        const node = tree.getOrCreateChild(parentNode, prop, index);
        this._addToIndexPipes(index, parentNode.pipe);
        return {
            success: true,
            data: node
        };
    }
    getOrCreateHeadTree(head) {
        return this._getOrCreateListHeadTrees(head);
    }
    getOrCreatelistMutant(headpipe) {
        return this._getOrCreatelistMutant(headpipe);
    }
    getOrCreateIndexNode(tree, target, index) {
        const headpipe = tree.pipe;
        let indexMap = this.listpipes.get(headpipe);
        if (indexMap === undefined) {
            this.listpipes.set(headpipe, indexMap = new Map());
        }
        let indexpipe = indexMap.get(index);
        if (indexpipe === undefined) {
            indexMap.set(index, indexpipe = this.createPipe());
            let indexSet = this.indexpipes.get(target);
            if (indexSet === undefined) {
                this.indexpipes.set(target, indexSet = new Set());
                indexSet.add(indexpipe);
            }
        }
        return this.addOrCreateIndexNode(tree, indexpipe, target, index);
    }
    getIndexNode(tree, index) {
        const headpipe = tree.pipe;
        const indexpipe = this.listpipes.get(headpipe)?.get(index);
        if (indexpipe === undefined) {
            return undefined;
        }
        return this.listIndexNodes.get(indexpipe);
    }
    addOrCreateIndexNode(tree, indexpipe, obj, prop) {
        let node = this.listIndexNodes.get(indexpipe);
        if (node === undefined) {
            this.listIndexNodes.set(indexpipe, node = tree.addChild(tree.root, prop, obj, indexpipe));
        }
        return node;
    }
    //#endregion
    //#region  share
    getPipeline(entrance, direction) {
        // 双重非空检查优化（逻辑修正）
        const entranceSet = this.pipes.get(entrance);
        const directionSet = this.pipes.get(direction);
        // 短路返回优化：合并条件判断
        if (!entranceSet || !directionSet)
            return undefined;
        // 增加空集快速通道
        if (entranceSet.size === 0 || directionSet.size === 0) {
            return new Set();
        }
        return this.intersection(entranceSet, directionSet);
    }
    getIndexPipeline(entrance, direction) {
        const entranceSet = this.indexpipes.get(entrance);
        const directionSet = this.indexpipes.get(direction);
        if (!entranceSet || !directionSet)
            return undefined;
        if (entranceSet.size === 0 || directionSet.size === 0) {
            return new Set();
        }
        return this.intersection(entranceSet, directionSet);
    }
    replaceIndexNode(pipe, parent, oldObj, newObj) {
        const indexNode = this.listIndexNodes.get(pipe);
        if (indexNode === undefined)
            return;
        const tree = indexNode.root;
        const [oldSet, newSet] = tree.replaceObj(parent, oldObj, newObj);
        for (const oldObj of oldSet) {
            this._removeFromIndexPipes(oldObj, pipe);
        }
        for (const newObject of newSet) {
            this._addToIndexPipes(newObject, pipe);
        }
    }
    getHeadpipe(head) {
        return this.listheadtrees.get(head);
    }
    getIndexPipes(index) {
        return this.indexpipes.get(index);
    }
    //先不管是不是值类型
    //只考虑object
    headTrigger(tree, index, oldValue, value) {
        const conatiner = this._getOrCreatelistMutant(tree.pipe);
        //const node = index === ListMethodType.pop?null: this.getOrCreateIndexNode(tree,value,oldValue);
        //分为三种情况
        //1 push
        if (index === ListMethodType.push) {
            const pushNode = this.headPush(tree, value, oldValue);
            conatiner.call(ListMethodType.push, pushNode);
        }
        //2 pop
        else if (index === ListMethodType.pop) {
            this.headPop(tree, oldValue);
            conatiner.call(ListMethodType.pop);
        }
        //3 change
        else if (index === ListMethodType.change) {
            this.headChange(tree, value, oldValue);
            //this.headIndexReplaceNode(tree,node!,value);
        }
    }
    listen(node, prop, fn, triggerImmediately = true, bindType) {
        //let structure = this.structures.get(pipe);
        // if (structure === undefined) return {
        //     success :false,
        //     error:'Is the object accidentally released due to abnormal pipeline structure?'
        // }
        return node.listen(prop, fn, triggerImmediately, bindType);
    }
    unListen(target, prop, bindType) {
        try {
            //获取pipe
            const pipeSet = this.pipes.get(target);
            if (pipeSet === undefined)
                return {
                    success: true,
                    code: -1
                };
            for (const pipe of pipeSet) {
                //this.structures.get(pipe)?.unListen(target,prop,bindType);
            }
            return {
                success: true
            };
        }
        catch (e) {
            return {
                success: false,
                error: e.toString(),
                code: 404
            };
        }
    }
    trigger(target, prop, value) {
        //console.log('进入了 pipe 的 trigger')
        const pipes = this.pipes.get(target);
        if (pipes !== undefined) {
            // for(const pipe of pipes){
            //     this.structures.get(pipe)?.trigger(target,prop,value);
            // }
            //console.log('获取到了tree')
            for (const pipe of pipes) {
                this.trees.get(pipe)?.trigger(target, prop, value);
            }
        }
        else {
            //console.log('没有获取到 tree')
        }
        const indexpipes = this.indexpipes.get(target);
        const trees = new Set();
        if (indexpipes !== undefined) {
            for (const indexpipe of indexpipes) {
                const tree = this.listIndexNodes.get(indexpipe)?.root;
                if (tree !== undefined)
                    trees.add(tree);
            }
        }
        else {
            //console.log('没有获取到 node 1')
        }
        if (trees.size) {
            for (const tree of trees) {
                tree.trigger(target, prop, value);
            }
        }
    }
    //#endregion
    headPush(tree, value, index) {
        return this.getOrCreateIndexNode(tree, value, index);
    }
    headPop(tree, index) {
        //获取那个node需要pop
        const popNode = this.getIndexNode(tree, index);
        if (popNode === undefined) {
            return;
        }
        const indexpipe = popNode.pipe;
        const deleteSet = tree.removeNodeAndChild(popNode);
        for (const oldObj of deleteSet) {
            this._removeFromIndexPipes(oldObj, indexpipe);
        }
    }
    headChange(tree, value, index) {
        const changeNode = this.getOrCreateIndexNode(tree, value, index);
        const nodeSet = new Set();
        const pipe = changeNode.pipe;
        nodeSet.add(changeNode);
        const [oldSet, newSet] = tree.processNodesOptimized(nodeSet, value);
        for (const oldObj of oldSet) {
            this._removeFromIndexPipes(oldObj, pipe);
        }
        for (const newObj of newSet) {
            this._addToIndexPipes(newObj, pipe);
        }
    }
}
//# sourceMappingURL=SyPipe.js.map