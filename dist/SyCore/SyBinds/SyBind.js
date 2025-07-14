import { SyBindUtility } from "../Utils/SyBindUtility.js";
import { SyListResult } from "../Utils/SyResult.js";
import { SyReflect } from "../Utils/SyReflect.js";
export class SyBind {
    static bind(source, target, handled, triggerImmediately = true, bindType) {
        if (SyReflect.isProxy(source))
            return SyBind._bind(source, target, handled, triggerImmediately, bindType);
        return {
            success: false,
            error: 'The target is not the desired proxy, try to decorate her with @Bind?',
            code: 101
        };
    }
    static _bind(source, target, handled, triggerImmediately = true, bindType) {
        Object.keys(target).forEach(targetKey => {
            if (SyReflect.isMarked(target[targetKey])) {
                SyBind._bind(source, target[targetKey], handled, triggerImmediately);
            }
            else {
                const bindKey = SyReflect.getPropMetada(target, targetKey);
                if (bindKey === undefined)
                    return; //退出当层循环
                const updateStrategy = SyBindUtility.resolveUpdateStrategy(handled, target[targetKey])
                    ?? ((value) => { }); // 使用 ?? 运算符兜底
                bindKey.forEach(key => {
                    if (key.indexOf('/') !== -1) {
                        const sourcePath = SyBindUtility.parsePropertyPath(source, key);
                        if (sourcePath.parent !== undefined && sourcePath.target != undefined) {
                            if (sourcePath.prop in sourcePath.parent) {
                                SyBindUtility.listen(sourcePath.parent, sourcePath.prop, updateStrategy, triggerImmediately, bindType);
                            }
                        }
                    }
                    else {
                        if (key in source) {
                            SyBindUtility.listen(source, key, updateStrategy, triggerImmediately, bindType);
                        }
                    }
                });
            }
        });
        return {
            success: true
        };
    }
    static pbind(source, sourceProp, target, handled, triggerImmediately = true, bindType) {
        if (SyReflect.isProxy(source)) {
            const updateStrategy = SyBindUtility.resolveUpdateStrategy(handled, target)
                ?? ((value) => { }); // 使用 ?? 运算符兜底
            return SyBindUtility.listen(source, sourceProp, updateStrategy, triggerImmediately, bindType);
        }
        return {
            success: false,
            error: 'The target is not the desired proxy, try to decorate her with @Bind?',
            code: 101
        };
    }
    static lbind(source, target, handled, leader, triggerImmediately = true, bindType) {
        //验证是否被BindClass修饰或以为Proxy
        const t_leader = leader ? leader : source;
        if (SyReflect.isProxy(t_leader)) {
            //选举leader
            //为leader添加监听，当触发对象变更时，触发相关操作
            //获取或复用管道,同时管道上的对象赋予监听
            const node = SyBindUtility.rlResolve(t_leader, source);
            if (node === undefined)
                return {
                    success: false,
                    error: 'An unexpected situation occurred while initializing the pipeline',
                    code: 202
                };
            return SyBind._lbind(node, source, target, handled, triggerImmediately, bindType);
        }
        return {
            success: false,
            error: 'The target is not the desired proxy, try to decorate her with @Bind?',
            code: 101
        };
    }
    static _lbind(node, source, target, handled, triggerImmediately = true, bindType) {
        Object.keys(target).forEach(targetKey => {
            if (SyReflect.isMarked(target[targetKey])) {
                SyBind._lbind(node, source, target[targetKey], handled, triggerImmediately);
            }
            else {
                const bindKey = SyReflect.getPropMetada(target, targetKey);
                if (!bindKey)
                    return;
                const updateStrategy = SyBindUtility.resolveUpdateStrategy(handled, target[targetKey])
                    ?? ((value) => { }); // 使用 ?? 运算符兜底
                //判断bindkey中是否存在 / 如果存在则代表深层绑定，递归判断其父类是否为proxy，是则在其直接父类上添加监听方法
                bindKey.forEach(key => {
                    if (key.indexOf('/') !== -1) {
                        //
                        const sourcePath = SyBindUtility.parsePropertyPath(source, key);
                        if (sourcePath.parent !== undefined && sourcePath.target !== undefined) {
                            if (sourcePath.prop in sourcePath.parent) {
                                const childList = key.split('/');
                                const finalNode = SyBindUtility.applyChain(node, source, childList);
                                if (finalNode === null) {
                                    throw new Error();
                                }
                                SyBindUtility.lListen(finalNode, sourcePath.prop, updateStrategy, triggerImmediately, bindType);
                            }
                        }
                    }
                    else {
                        if (key in source) {
                            SyBindUtility.lListen(node, key, updateStrategy, triggerImmediately, bindType);
                        }
                    }
                });
            }
        });
        return {
            success: true
        };
    }
    static lpbind(source, sourceProp, target, handled, leader, triggerImmediately = true, bindType) {
        if (SyReflect.isProxy(source)) {
            const t_leader = leader ? leader : source;
            const updateStrategy = SyBindUtility.resolveUpdateStrategy(handled, target)
                ?? ((value) => { }); // 使用 ?? 运算符兜底
            //获取到一个只需要newvalue的function
            const node = SyBindUtility.rlResolve(t_leader, source);
            if (node === undefined)
                return {
                    success: false,
                    error: 'An unexpected situation occurred while initializing the pipeline',
                    code: 202
                };
            return SyBindUtility.lListen(node, sourceProp, updateStrategy, triggerImmediately, bindType);
        }
        return {
            success: false,
            error: 'The target is not the desired proxy, try to decorate her with @Bind?',
            code: 101
        };
    }
    static bindlist(source, target, componentType, handled, createTarget, triggerImmediately = true, bindType) {
        if (SyReflect.isProxy(source)) {
            const tree = SyBindUtility.getOrCreateHead(source);
            if (tree !== undefined) {
                return SyBind._bindlist(tree, target, componentType, handled, createTarget, triggerImmediately, bindType);
            }
            return undefined;
        }
        return undefined;
    }
    static _bindlist(tree, target, componentType, handled, createTarget, triggerImmediately = true, bindType) {
        const headpipe = tree.pipe;
        const container = SyBindUtility.getOrCreateContainer(headpipe).data;
        const containerMethods = container.getContainerMethods(target, componentType, createTarget);
        const targetList = target.getComponentsInChildren(componentType);
        const targetfirst = (targetList.length > 0 ? targetList[0] : createTarget());
        SyBind._bindMutant(tree, targetfirst, handled, containerMethods, triggerImmediately, bindType);
        //如果是object，判断是否
        return new SyListResult(containerMethods);
    }
    static _bindMutant(tree, target, handled, containerMethods, triggerImmediately = true, bindType) {
        Object.keys(target).forEach(targetKey => {
            if (SyReflect.isMarked(target[targetKey])) {
                SyBind._bindMutant(tree, target[targetKey], handled, containerMethods, triggerImmediately, bindType);
            }
            else {
                const bindKey = SyReflect.getPropMetada(target, targetKey);
                if (bindKey === undefined)
                    return;
                bindKey.forEach(key => {
                    if (key.indexOf('/') !== -1) {
                        containerMethods.addPush((node, c_target) => {
                            const c_source = node.obj;
                            const updateStrategy = SyBindUtility.resolveUpdateStrategy(handled, c_target[targetKey])
                                ?? ((value) => { }); // 使用 ?? 运算符兜底
                            const sourcePath = SyBindUtility.parsePropertyPath(c_source, key);
                            if (sourcePath.parent !== undefined && sourcePath.target !== undefined) {
                                if (sourcePath.prop in sourcePath.parent) {
                                    const childList = key.split('/');
                                    const finalNode = SyBindUtility.applyIndexChain(tree, node, c_source, childList);
                                    if (finalNode === null) {
                                        throw new Error();
                                    }
                                    SyBindUtility.lListen(finalNode, sourcePath.prop, updateStrategy, triggerImmediately, bindType);
                                }
                            }
                        });
                    }
                    else {
                        //if(key in source){
                        containerMethods.addPush((node, c_target) => {
                            const updateStrategy = SyBindUtility.resolveUpdateStrategy(handled, c_target[targetKey])
                                ?? ((value) => { }); // 使用 ?? 运算符兜底
                            SyBindUtility.lListen(node, key, updateStrategy, triggerImmediately, bindType);
                        });
                    }
                });
            }
        });
    }
    static onChange(source, sourceProp, handled, triggerImmediately = true, bindType) {
        if (SyReflect.isProxy(source)) {
            return SyBindUtility.listen(source, sourceProp, handled, triggerImmediately, bindType);
        }
        return {
            success: false,
            error: 'The target is not the desired proxy, try to decorate her with @Bind?',
            code: 101
        };
    }
    static onLChange(source, sourceProp, handled, leader, triggerImmediately = true, bindType) {
        if (SyReflect.isProxy(source)) {
            const t_leader = leader ? leader : source;
            const node = SyBindUtility.rlResolve(t_leader, source);
            if (node === undefined)
                return {
                    success: false,
                    error: 'An unexpected situation occurred while initializing the pipeline',
                    code: 202
                };
            return SyBindUtility.lListen(node, sourceProp, handled, triggerImmediately, bindType);
        }
        return {
            success: false,
            error: 'The target is not the desired proxy, try to decorate her with @Bind?',
            code: 101
        };
    }
    static unBind(source, prop, bindType) {
        return SyBindUtility.unlisten(source, prop, bindType);
    }
}
//# sourceMappingURL=SyBind.js.map