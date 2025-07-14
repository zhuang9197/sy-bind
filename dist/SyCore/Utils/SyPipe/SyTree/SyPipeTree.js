import { SyTreeNode } from "./SyTreeNode.js";
export class SyPipeTree {
    //root:root Node
    root;
    pipe;
    objNodeMap = new Map();
    constructor(rootObj, pipe) {
        this.root = new SyTreeNode(this, rootObj, '', pipe, 0);
        this.pipe = pipe;
        this.addToMap(this.root);
    }
    //some private methods
    // add to this.objNodeMap
    addToMap(node) {
        let set = this.objNodeMap.get(node.obj);
        if (set === undefined) {
            this.objNodeMap.set(node.obj, set = new Set());
        }
        set.add(node);
    }
    // remove from this.objNodeMap
    removeFromMap(node) {
        const set = this.objNodeMap.get(node.obj);
        if (set) {
            set.delete(node);
            if (set.size === 0) {
                this.objNodeMap.delete(node.obj);
            }
        }
    }
    // 获取关联节点
    getNodesByObj(obj) {
        return this.objNodeMap.get(obj);
    }
    getChangeNode(parent, child) {
        const parentNodes = this.objNodeMap.get(parent);
        if (parentNodes === undefined)
            return undefined;
        const nodeSet = new Set();
        for (const parentNode of parentNodes) {
            const childNode = parentNode.getChild(child);
            if (childNode !== undefined) {
                nodeSet.add(childNode);
            }
        }
        return nodeSet;
    }
    //#region change Node
    replaceObj(parent, child, newValue) {
        const nodes = this.getChangeNode(parent, child);
        if (!nodes?.size)
            return [new Set(), new Set()];
        return this.processNodesOptimized(nodes, newValue);
    }
    processNodesOptimized(nodes, newObj) {
        const updateQueue = new Map();
        // 一次性收集所有需要更新的节点
        for (const node of nodes) {
            this.collectUpdateNodes(node, newObj, updateQueue);
        }
        return this.executeUpdatesAndFilter(updateQueue);
    }
    collectUpdateNodes(node, newObj, updateQueue) {
        const stack = [[node, newObj]];
        while (stack.length) {
            const [current, newValue] = stack.pop();
            updateQueue.set(current, newValue);
            for (const child of current.children) {
                try {
                    const childValue = newValue[child.prop];
                    if (childValue != undefined) {
                        stack.push([child, childValue]);
                    }
                }
                catch {
                    // 忽略无效属性访问
                }
            }
        }
    }
    executeUpdatesAndFilter(updateQueue) {
        const validOldObjs = new Set();
        const validNewObjs = new Set();
        const oldObjsToCheck = [];
        for (const [node, newObj] of updateQueue) {
            const oldObj = node.obj;
            this.removeFromMap(node);
            node.changeObj(newObj); // 临时修改内部状态
            this.addToMap(node);
            oldObjsToCheck.push(oldObj);
            validNewObjs.add(newObj);
        }
        for (const oldObj of oldObjsToCheck) {
            if (!this.objNodeMap.has(oldObj)) {
                validOldObjs.add(oldObj);
            }
        }
        return [validOldObjs, validNewObjs];
    }
    //#endregion
    removeNodeAndChild(node) {
        const deleteQueue = new Map();
        this.collectDeleteNodes(node, deleteQueue);
        return this.executeDeleteAndFilter(deleteQueue);
    }
    executeDeleteAndFilter(deleteQueue) {
        const validOldObjs = new Set();
        for (const [node, obj] of deleteQueue) {
            this.removeFromMap(node);
            if (!this.objNodeMap.has(obj)) {
                validOldObjs.add(obj);
            }
        }
        return validOldObjs;
    }
    collectDeleteNodes(node, deleteQueue) {
        const stack = [node];
        while (stack.length) {
            const current = stack.pop();
            deleteQueue.set(current, current.obj);
            for (const child of current.children) {
                try {
                    stack.push(child);
                }
                catch {
                    // 忽略无效属性访问
                }
            }
        }
    }
    // just add
    addChild(parent, prop, childObj, pipe) {
        const node = parent.addChild(parent.root, childObj, prop, pipe);
        this.addToMap(node);
        return node;
    }
    //If the children of parentNode do not contain nodes with the same childObj and prop, 
    // create a node and add it to the children of parentNode
    getOrCreateChild(parent, prop, childObj) {
        const node = parent.getOrCreateChild(parent.root, childObj, prop);
        this.addToMap(node);
        return node;
    }
    // Determine whether a node is included
    hasNode(node) {
        const nodes = this.objNodeMap.get(node.obj);
        if (nodes === undefined)
            return false;
        for (const item of nodes) {
            if (node === item) {
                return true;
            }
        }
        return false;
    }
    trigger(target, prop, value) {
        const nodes = this.objNodeMap.get(target);
        if (nodes === undefined)
            return;
        for (const node of nodes) {
            node.trigger(prop, value);
        }
    }
}
//# sourceMappingURL=SyPipeTree.js.map