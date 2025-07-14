import { SyNotify } from "../SyNotifys/SyNotify.js";
export class SyBindUtility {
    static listen(source, sourceProp, handled, triggerImmediately, bindType) {
        return SyNotify.listen(source, sourceProp, handled, triggerImmediately, bindType);
    }
    static lListen(node, prop, handled, triggerImmediately = true, bindType) {
        return SyNotify.lListen(node, prop, handled, triggerImmediately, bindType);
    }
    static unlisten(source, prop, bindType) {
        return SyNotify.unlisten(source, prop, bindType);
    }
    //获取关系链
    static parsePropertyPath(source, path) {
        // 将路径分割成数组
        const parts = path.split('/');
        const prop = parts[parts.length - 1];
        // 获取最终值
        const target = parts.reduce((obj, key) => obj?.[key], source);
        // 获取父对象 (去掉最后一个属性)
        const parent = parts.slice(0, -1).reduce((obj, key) => obj?.[key], source);
        return {
            parent,
            target,
            prop // 最终值
        };
    }
    static applyChain(node, current, chain) {
        if (chain.length === 0) {
            return null;
        }
        const [prop, ...rest] = chain;
        const nextNode = SyNotify.getOrCreateTreeNode(node.pipe, node, current[prop], prop).data;
        if (rest.length > 1) {
            return SyBindUtility.applyChain(nextNode, current[prop], rest);
        }
        return nextNode;
    }
    static applyIndexChain(tree, node, current, chain) {
        if (chain.length === 0) {
            return null;
        }
        const [prop, ...rest] = chain;
        const nextNode = SyNotify.getOrCreateIndexTreeNode(tree, node, current[prop], prop).data;
        if (rest.length > 1) {
            return SyBindUtility.applyIndexChain(tree, nextNode, current[prop], rest);
        }
        return nextNode;
    }
    static rlResolve(leader, target) {
        //获取关系链
        let chain = [];
        if (leader === target) {
            chain = [];
        }
        else {
            chain = SyBindUtility.getRelationChain(leader, target);
        }
        if (!chain) {
            return undefined;
        }
        //创建树
        const tree = SyNotify.getOrCreateTree(leader).data;
        //创建从根节点开始的chain节点链，返回最后一个节点
        const node = SyBindUtility.rlBind(tree.pipe, tree.root, leader, chain);
        return node;
    }
    static rlBind(pipe, parentNode, current, rlList) {
        if (rlList.length === 0)
            return parentNode;
        const [prop, ...rest] = rlList;
        const treeNode = SyNotify.getOrCreateTreeNode(pipe, parentNode, current[prop], prop).data;
        if (rest.length > 0) {
            return SyBindUtility.rlBind(pipe, treeNode, current[prop], rest);
        }
        return treeNode;
    }
    static resolveUpdateStrategy(handled, consumer) {
        if (typeof handled === 'function') {
            return handled;
        }
        if (consumer === null || consumer === undefined)
            return undefined;
        const componentConstructor = consumer.constructor;
        const strategy = handled.get(componentConstructor);
        if (strategy === undefined) {
            return undefined;
        }
        return (value) => strategy(consumer, value);
    }
    static getRelationChain(leader, targetParent) {
        return SyBindUtility.relationChainSearch(leader, targetParent);
    }
    static relationChainSearch(current, targetParent, path = []) {
        if (current === targetParent) {
            return [...path];
        }
        //获取当前对象的所有属性
        const keys = Object.keys(current);
        for (const key of keys) {
            const value = current[key];
            if (value && typeof value === 'object') {
                const result = this.relationChainSearch(value, targetParent, [...path, key]);
                if (result)
                    return result;
            }
        }
        return null;
    }
    //#region list
    static getOrCreateHead(head) {
        const tree = SyNotify.getOrCreateHeadTree(head);
        return tree.data;
    }
    static getOrCreateContainer(headpipe) {
        return SyNotify.getOrCreateContainer(headpipe);
    }
}
//# sourceMappingURL=SyBindUtility.js.map