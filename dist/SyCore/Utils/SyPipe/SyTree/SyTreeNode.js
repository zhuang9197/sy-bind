import { BindType } from "../../../../src/enums/SyEnums.js";
export class SyTreeNode {
    //root : tree pointing to the node itself
    root;
    obj;
    prop;
    parent = null;
    children = new Set();
    bindFunction = new Map();
    funcIndex = new Map();
    pipe;
    level;
    constructor(tree, obj, prop, pipe, level) {
        this.root = tree;
        this.obj = obj;
        this.prop = prop;
        this.pipe = pipe;
        this.level = level;
    }
    listen(prop, fn, triggerImmediately = true, bindType = BindType.Level10) {
        try {
            let funcs = this.bindFunction.get(prop);
            if (funcs === undefined) {
                this.bindFunction.set(prop, funcs = new Set());
            }
            funcs.add(fn);
            let bindFuncMap = this.funcIndex.get(prop);
            if (bindFuncMap === undefined) {
                this.funcIndex.set(prop, bindFuncMap = new Map());
            }
            let funSet = bindFuncMap.get(bindType);
            if (funSet === undefined) {
                bindFuncMap.set(bindType, funSet = new Set());
            }
            funSet.add(fn);
            if (triggerImmediately) {
                fn(this.obj[prop]);
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
    unListen(prop, bindType) {
        try {
            if (prop === undefined) {
                //没有指定prop，清空相应bindType等级的监听
                if (bindType !== undefined) {
                    for (const [key, typeMap] of this.funcIndex) {
                        const funSet = typeMap.get(bindType);
                        if (funSet === undefined)
                            continue;
                        const triggerFns = this.bindFunction.get(key);
                        if (triggerFns) {
                            for (const fn of funSet) {
                                triggerFns.delete(fn);
                            }
                        }
                        typeMap.delete(bindType);
                    }
                }
                else {
                    //没有指定prop，也没有指定bindType，全部删除
                    this.funcIndex.clear();
                    this.bindFunction.clear();
                }
            }
            else {
                //指定了prop，清空相应的bindType等级的监听
                if (bindType !== undefined) {
                    const typeMap = this.funcIndex.get(prop);
                    if (typeMap === undefined)
                        return {
                            success: true
                        };
                    const fns = typeMap.get(bindType);
                    if (fns === undefined)
                        return {
                            success: true
                        };
                    //双端同步删除
                    const triggerFns = this.bindFunction.get(prop);
                    if (triggerFns) {
                        for (const fn of fns) {
                            triggerFns.delete(fn);
                        }
                    }
                    typeMap.delete(bindType);
                }
                else {
                    //清空prop
                    this.bindFunction.delete(prop);
                    this.funcIndex.delete(prop);
                }
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
    trigger(prop, value) {
        const funcs = this.bindFunction.get(prop);
        if (funcs) {
            for (const func of funcs) {
                func(value);
            }
        }
    }
    triggerAll() {
        console.log(this.bindFunction.size);
        for (const [key, functionSet] of this.bindFunction) {
            console.log('这里正在进行triggerAll操作', key);
            const value = this.obj[key];
            for (const func of functionSet) {
                func(value);
            }
        }
    }
    setParent(parent) {
        this.parent = parent;
    }
    getChild(child) {
        for (const childNode of this.children) {
            if (childNode.obj === child) {
                return childNode;
            }
        }
        return undefined;
    }
    addChild(tree, childObj, prop, pipe) {
        const t_pipe = pipe === undefined ? this.pipe : pipe;
        const child = new SyTreeNode(tree, childObj, prop, t_pipe, this.level + 1);
        child.setParent(this);
        this.children.add(child);
        return child;
    }
    getOrCreateChild(tree, childObj, prop) {
        for (const child of this.children) {
            if (child.obj === childObj && child.prop === prop) {
                return child;
            }
        }
        return this.addChild(tree, childObj, prop);
    }
    changeObj(newObj) {
        this.obj = newObj;
        this.triggerAll();
    }
}
//# sourceMappingURL=SyTreeNode.js.map