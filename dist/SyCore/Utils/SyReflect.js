import { bindHandler } from "../../src/constants/SyConstant.js";
export class SyReflect {
    //存储@CBind配置的数据
    static propMetadataStore = new Map();
    static boundMethods = new WeakMap();
    //存储可复用的Proxy，key：原始值，value:proxy
    static proxyMap = new WeakMap();
    //存储是否存在proxy key:proxy,value:boolean
    static isProxyWeakMap = new WeakMap();
    static isMarked(obj) {
        const constructor = obj?.constructor;
        return constructor && SyReflect.propMetadataStore.has(constructor);
    }
    static isObject(value) {
        return typeof value === 'object' && value !== null;
    }
    static isProxy(obj) {
        return !!obj && SyReflect.isProxyWeakMap.has(obj);
    }
    static setProxy(proxy) {
        SyReflect.isProxyWeakMap.set(proxy, true);
    }
    static getOrCreateProxy(obj) {
        if (SyReflect.isProxy(obj)) {
            return obj;
        }
        else {
            let value = SyReflect.proxyMap.get(obj);
            if (value === undefined) {
                value = SyReflect.getOrCreateProxy(obj);
            }
            return value;
        }
    }
    static createProxy(value) {
        const proxy = new Proxy(value, bindHandler);
    }
    static getOrCreateBoundMethods(target) {
        let methods = SyReflect.boundMethods.get(target);
        if (methods === undefined) {
            SyReflect.boundMethods.set(target, methods = new Map());
        }
        return methods;
    }
    //创建全局元数据存储
    static setPropMetadata(target, propertyKey, targetClassOrProperty) {
        const classConstructor = target.constructor;
        const classMetadata = this.propMetadataStore.get(classConstructor) ?? {};
        if (!classMetadata[propertyKey]) {
            classMetadata[propertyKey] = new Set();
        }
        //将元数据保存到对应的属性上
        classMetadata[propertyKey].add(targetClassOrProperty);
        //更新元数据存储
        this.propMetadataStore.set(classConstructor, classMetadata);
    }
    static getPropMetada(target, propertyKey) {
        return this.propMetadataStore.get(target.constructor)?.[propertyKey];
    }
}
//# sourceMappingURL=SyReflect.js.map