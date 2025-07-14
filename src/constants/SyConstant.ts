import { SyReflect } from "../../SyCore/Utils/SyReflect";
import { SyNotify } from "../../SyCore/SyNotifys/SyNotify";
import { ListMethodType } from "../enums/SyEnums";
import { sy_types } from "../types/SyTypes";

type Proxiable = sy_types.Proxiable;

//define a proxy constant
//all agent are based on this constant
export const bindHandler:ProxyHandler<Proxiable> = {
    get(target:Proxiable,prop:string | symbol,receiver:any){
        // handling special attributes
        if (prop === Symbol.toStringTag) {
            return Object.prototype.toString.call(target).slice(8, -1);
        }

        //Obtain the original value
        const value = Reflect.get(target,prop,receiver);
        if(SyReflect.isProxy(value)) {
            return value;
            //Perform interrupt handling
         } 

         // 处理this绑定
        if (typeof value === 'function' && target.constructor.prototype[prop as keyof {}] === value) {
            let methods = SyReflect.getOrCreateBoundMethods(target)

            if(Array.isArray(target)){
                if(!methods.has(prop)){
                    methods.set(prop,value.bind(receiver));
                }

                if(prop === 'prop'){
                    let arrLength = target.length - 1;
                    if(arrLength >= 0){
                        SyNotify.htrigger(receiver,ListMethodType.pop,arrLength.toString(),null);
                    }
                }
            }else{
                if(!methods.has(prop)){
                    methods.set(prop,value.bind(target));
                }
            }

            return methods.get(prop);
        }

        if(SyReflect.isObject(value)){
            //跳过不需要代理的内置对象
            const type = Object.prototype.toString.call(value);
            if (type === '[object Date]' || 
                type === '[object RegExp]' || 
                type === '[object Promise]') {
              
                return value;
            }

            return SyReflect.getOrCreateProxy(value);
        }

        return value;
    },

    set(target: any, prop: string | symbol, value: any, receiver: any) {

        let success:boolean;
        if(SyReflect.isObject(value)){
            //跳过不需要代理的内置对象
            const type = Object.prototype.toString.call(value);
            if (type === '[object Date]' || 
                type === '[object RegExp]' || 
                type === '[object Promise]') {
              
                success = Reflect.set(target,prop,value,receiver);
            }else{
                const oldValue = receiver[prop];
                const proxyValue = SyReflect.isProxy(value)?value:SyReflect.getOrCreateProxy(value);

                let isArray = Array.isArray(target);
                let arrLength = isArray ? target.length : 9;

                success = Reflect.set(target,prop,proxyValue,receiver);

                if(success){

                    if(isArray && typeof prop === 'string' && /^(0|[1-9]\d*)$/.test(prop)){
                        // if oldValue is undefined and length equal it is considered a push
                        if(oldValue === undefined && arrLength == prop){
                            SyNotify.htrigger(receiver,ListMethodType.push,prop,proxyValue)
                        }else if(oldValue !== undefined && arrLength > prop){
                            SyNotify.htrigger(receiver,ListMethodType.change,prop,proxyValue)
                        }
                    }else{
                        //SyNotify.trigger(receiver, prop, proxyValue);
                        SyNotify.ltrigger(receiver, oldValue, proxyValue);
                    }
                }
            }
        }else{
            success = Reflect.set(target,prop,value,receiver);
            if(success){
                SyNotify.trigger(receiver,prop,value)
            }
        }

        return success;
    },

    // 处理其他以保持代理透明性
    has(target, prop) {
        return Reflect.has(target, prop);
    },

    deleteProperty(target, prop) {
        return Reflect.deleteProperty(target, prop);
    },

    ownKeys(target) {
        return Reflect.ownKeys(target);
    },

    getOwnPropertyDescriptor(target, prop) {
        return Reflect.getOwnPropertyDescriptor(target, prop);
    },

    defineProperty(target, prop, descriptor) {
        return Reflect.defineProperty(target, prop, descriptor);
    },

    apply(target, thisArg, argArray) {
        return Reflect.apply(target as any, thisArg, argArray);
    },

    
}