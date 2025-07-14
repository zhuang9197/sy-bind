import { CompileStatus, ListMethodType } from "../../src/enums/SyEnums.js";
//define a target collection func
export class SyContainerMethods {
    pushMethods = [];
    popMethods = [];
    tempPushMethods = [];
    tempPopMethods = [];
    createTarget;
    target;
    componentType;
    isCompiled = new Map();
    constructor(target, componentType, createTarget) {
        this.isCompiled.set(ListMethodType.pop, CompileStatus.uncompiled);
        this.isCompiled.set(ListMethodType.push, CompileStatus.uncompiled);
        this.target = target;
        this.createTarget = createTarget;
        this.componentType = componentType;
    }
    pushCompiled = (node, target) => {
        for (const method of this.pushMethods) {
            method(node, target);
        }
    };
    popCompiled = (node) => {
        for (const method of this.popMethods) {
            method(node);
        }
    };
    _push() {
        const newTarget = this.createTarget();
        this.target.addChild(newTarget);
        return newTarget;
    }
    _pushEnd() {
    }
    push() {
    }
    _pop() {
        const targets = this.target.getComponentsInChildren(this.componentType);
        return targets.pop();
    }
    _popEnd(popNode) {
        popNode.node.destroy(); // 性能最优
    }
    //provide public func
    // add push
    addPush(method) {
        this.pushMethods.push(method);
    }
    // add pop
    addPop(method) {
        this.popMethods.push(method);
    }
    //add push once
    //If isSave is false, then these methods will only be triggered once and discarded, as they will be persisted anyway
    addPushOnce(method, isSave = true) {
        this.isCompiled.set(ListMethodType.push, CompileStatus.new);
        this.tempPushMethods.push({ method: method, save: isSave });
    }
    //add pop once
    //If isSave is false, then these methods will only be triggered once and discarded, as they will be persisted anyway
    addPopOnce(method, isSave = true) {
        this.isCompiled.set(ListMethodType.pop, CompileStatus.new);
        this.tempPopMethods.push({ method: method, save: isSave });
    }
    compilePush(node, target) {
        for (const tempMethods of this.tempPushMethods) {
            if (tempMethods.save) {
                this.pushMethods.push(tempMethods.method);
            }
            else {
                tempMethods.method(node, target);
            }
        }
    }
    compilePop(target) {
        for (const tempMethods of this.tempPopMethods) {
            if (tempMethods.save) {
                this.popMethods.push(tempMethods.method);
            }
            else {
                tempMethods.method(target);
            }
        }
    }
    callPush(node) {
        //when the push method is triggered
        //first get a new target and push to target
        const newTarget = this._push();
        //second 
        if ((this.isCompiled.get(ListMethodType.push)) === CompileStatus.new) {
            this.compilePush(node, newTarget);
        }
        this.pushCompiled(node, newTarget);
    }
    callPop() {
        const popNode = this._pop();
        if (popNode === undefined)
            return;
        if ((this.isCompiled.get(ListMethodType.pop)) === CompileStatus.new) {
            this.compilePop(popNode);
        }
        this.popCompiled(popNode);
        this._popEnd(popNode);
    }
    clear(listMethodType) {
        if (listMethodType === undefined || listMethodType === ListMethodType.push) {
            this.pushMethods = [];
            this.tempPushMethods = [];
        }
        if (listMethodType === undefined || listMethodType === ListMethodType.pop) {
            this.popMethods = [];
            this.tempPopMethods = [];
        }
    }
}
export class SyContainer {
    methods = new Map();
    constructor() {
    }
    //获取一个Methods
    getContainerMethods(target, componentType, createTarget) {
        let methods = this.methods.get(target);
        if (methods === undefined) {
            this.methods.set(target, methods = new SyContainerMethods(target, componentType, createTarget));
        }
        return methods;
    }
    call(listMethodType, node) {
        if (listMethodType === ListMethodType.push) {
            for (const [key, containerMethods] of this.methods) {
                containerMethods.callPush(node);
            }
        }
        if (listMethodType === ListMethodType.pop) {
            for (const [key, containerMethods] of this.methods) {
                containerMethods.callPop();
            }
        }
    }
    clear(listMethodType, target) {
        if (listMethodType === undefined || listMethodType === ListMethodType.push) {
        }
    }
}
//# sourceMappingURL=SyContainer.js.map