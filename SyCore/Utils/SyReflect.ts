import { bindHandler } from "../../src/constants/SyConstant";
import { sy_types } from "../../src/types/SyTypes";

type Proxiable = sy_types.Proxiable;
type PropMetadata = sy_types.PropMetadata;
type bind_target = sy_types.bind_target;

export class SyReflect{
    
    //存储@CBind配置的数据
    private static propMetadataStore = new Map<Function,PropMetadata>();

    private static boundMethods = new WeakMap<Proxiable,Map<PropertyKey,Function>>();

    //存储可复用的Proxy，key：原始值，value:proxy
    private static proxyMap = new WeakMap<object,any>();

    //存储是否存在proxy key:proxy,value:boolean
    private static isProxyWeakMap = new WeakMap();

    public static isMarked(obj:any):boolean{
        const constructor = obj?.constructor;

        return constructor && SyReflect.propMetadataStore.has(constructor);
    }

    public static isObject(value:unknown):value is object{
        return typeof value === 'object' && value !== null;
    }

    public static isProxy(obj:any):boolean{
        return !!obj && SyReflect.isProxyWeakMap.has(obj);
    }

    public static setProxy(proxy:any){
        SyReflect.isProxyWeakMap.set(proxy,true);
    }



    public static getOrCreateProxy(obj:object):any{
        if(SyReflect.isProxy(obj)){
            return obj;
        }else{
            let value = SyReflect.proxyMap.get(obj);
            if(value === undefined){
                value = SyReflect.getOrCreateProxy(obj)
            }

            return value;
        }
    }

    public static createProxy(value:any){
        const proxy = new Proxy(value,bindHandler)
    }


    public static getOrCreateBoundMethods(target:Proxiable):Map<PropertyKey,Function>{
        let methods = SyReflect.boundMethods.get(target);
        if(methods === undefined){
            SyReflect.boundMethods.set(target,methods = new Map());
        }

        return methods;
    }

     //创建全局元数据存储
     public static setPropMetadata(target:bind_target,propertyKey:string,targetClassOrProperty:string){
        const classConstructor = target.constructor;
        const classMetadata = this.propMetadataStore.get(classConstructor) ?? {};

        if (!classMetadata[propertyKey]) {
            classMetadata[propertyKey] = new Set<string>();
        }

        //将元数据保存到对应的属性上
        classMetadata[propertyKey].add(targetClassOrProperty);

        //更新元数据存储
        this.propMetadataStore.set(classConstructor,classMetadata);
        
    }

    public static getPropMetada(target:bind_target,propertyKey:string):Set<string>|undefined{
        return this.propMetadataStore.get(target.constructor)?.[propertyKey];
    }
}

