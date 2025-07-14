;
import { SyPipe } from "../Utils/SyPipe/SyPipe.js";
import { BindType } from "../../src/enums/SyEnums.js";
export class SyNotify {
    static triggerStore = new WeakMap();
    static funIndex = new WeakMap();
    static syPipe = new SyPipe();
    static trigger(source, prop, value) {
        const fns = SyNotify.triggerStore.get(source)?.get(prop);
        if (fns) {
            //直接便利最底层Set
            for (const fn of fns) {
                fn(value);
            }
        }
        SyNotify.syPipe.trigger(source, prop, value);
    }
    static ltrigger(parent, startPosition, value) {
        const pipeSet = SyNotify.syPipe.getPipeline(parent, startPosition);
        if (pipeSet !== undefined && pipeSet.size !== 0) {
            for (const pipe of pipeSet) {
                SyNotify.syPipe.replaceNode(pipe, parent, startPosition, value);
            }
        }
        const indexPipeSet = SyNotify.syPipe.getIndexPipeline(parent, startPosition);
        if (indexPipeSet !== undefined && indexPipeSet.size !== 0) {
            for (const pipe of indexPipeSet) {
                SyNotify.syPipe.replaceIndexNode(pipe, parent, startPosition, value);
            }
        }
    }
    static htrigger(source, prop, oldValue, value) {
        let tree;
        if (Array.isArray(source)) {
            tree = SyNotify.syPipe.getHeadpipe(source);
        }
        //isHead,
        if (tree === undefined)
            return;
        //get the headpipe,use the headpipe
        SyNotify.syPipe.headTrigger(tree, prop, oldValue, value);
    }
    static listen(source, prop, handled, triggerImmediately = true, bindType = BindType.level0) {
        try {
            let trigger_propMap = SyNotify.triggerStore.get(source);
            if (trigger_propMap === undefined) {
                SyNotify.triggerStore.set(source, trigger_propMap = new Map());
            }
            let trigger_funcs = trigger_propMap.get(prop);
            if (trigger_funcs === undefined) {
                trigger_propMap.set(prop, trigger_funcs = new Set());
            }
            trigger_funcs.add(handled);
            let indexMap = SyNotify.funIndex.get(source);
            if (indexMap === undefined) {
                SyNotify.funIndex.set(source, indexMap = new Map());
            }
            let indexFuncMap = indexMap.get(prop);
            if (indexFuncMap === undefined) {
                indexMap.set(prop, indexFuncMap = new Map());
            }
            let indexSet = indexFuncMap.get(bindType);
            if (indexSet === undefined) {
                indexFuncMap.set(bindType, indexSet = new Set());
            }
            indexSet.add(handled);
            if (triggerImmediately) {
                handled(source[prop]);
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
    static lListen(node, prop, handled, triggerImmediately = true, bindType) {
        return SyNotify.syPipe.listen(node, prop, handled, triggerImmediately, bindType);
    }
    static unlisten(source, prop, bindType) {
        SyNotify.syPipe.unListen(source, prop, bindType);
        if (bindType) {
            const indexPropMap = SyNotify.funIndex.get(source)?.get(prop);
            if (indexPropMap === undefined)
                return {
                    success: true,
                    code: -1
                };
            const indexSet = indexPropMap.get(bindType);
            if (indexSet === undefined)
                return {
                    success: true,
                    code: -1
                };
            //双端同步删除
            const triggerFns = SyNotify.triggerStore.get(source)?.get(prop);
            if (triggerFns === undefined) {
                indexPropMap.delete(bindType);
                return {
                    success: true,
                    code: -1
                };
            }
            for (const fn of indexSet) {
                triggerFns.delete(fn);
            }
            indexPropMap.delete(bindType);
        }
        else {
            SyNotify.triggerStore.get(source)?.delete(prop);
            SyNotify.funIndex.get(source)?.delete(prop);
        }
        return {
            success: true,
        };
    }
    static getOrCreateTree(head) {
        const tree = SyNotify.syPipe.getOrCreateTree(head);
        return {
            success: true,
            data: tree
        };
    }
    static getOrCreateTreeNode(pipe, parentNode, target, prop) {
        return SyNotify.syPipe.getOrCreateTreeNode(pipe, parentNode, target, prop);
    }
    static getRoot(headpipe) {
        const root = SyNotify.syPipe.getRoot(headpipe);
        return root;
    }
    static getOrCreateHeadTree(head) {
        const tree = SyNotify.syPipe.getOrCreateHeadTree(head);
        return {
            success: true,
            data: tree
        };
    }
    static getOrCreateIndexTreeNode(tree, parentNode, target, prop) {
        return SyNotify.syPipe.getOrCreateIndexTreeNode(tree, parentNode, target, prop);
    }
    static getOrCreateContainer(headpipe) {
        const container = SyNotify.syPipe.getOrCreatelistMutant(headpipe);
        return {
            success: true,
            data: container
        };
    }
}
//# sourceMappingURL=SyNotify.js.map