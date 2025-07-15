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
        if (typeof value === 'function' ) {
            let methods = SyReflect.getOrCreateBoundMethods(target)

            if(!methods.has(prop)){
                // if(Array.isArray(target)){
                //     methods.set(prop,value.bind(receiver));

                //     if(prop === 'pop'){
                //         let arrLength = target.length - 1;
                //         if(arrLength >= 0){
                //             SyNotify.htrigger(receiver,ListMethodType.pop,arrLength.toString(),null);
                //         }
                //     }
                // }else{
                const methodSource = getMethodSource(target,prop as string);

                switch(methodSource){
                    case 'native':
                        // 原生方法
                        if(Array.isArray(target) && isArrayMutationMethod(prop)){

                            methods.set(prop,createArrayMethodProxy(value,prop as string,target,receiver))
                        }else{
                            methods.set(prop, value.bind(receiver));
                        }
                        
                        break;
                    case 'builtin':
                        //内置类型
                        methods.set(prop,value.bind(target));
                        break;
                    case 'own':
                    case 'parent':
                        //需要防止无限递归循环
                        methods.set(prop,createSafeMethodProxy(target,prop as string,value,receiver));
                        break;
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


function isBuiltinType(target: any): boolean {
    // 检查是否有内部插槽（internal slots）
    const toString = Object.prototype.toString.call(target);
    const builtinPatterns = [
        '[object Map]',
        '[object Set]', 
        '[object WeakMap]',
        '[object WeakSet]',
        '[object Date]',
        '[object RegExp]',
        '[object Promise]',
        '[object ArrayBuffer]',
        '[object DataView]'
    ];
    
    // 检查 TypedArray
    if (ArrayBuffer.isView(target) && !(target instanceof DataView)) {
        return true;
    }
    
    return builtinPatterns.includes(toString);
}

//检查是否为原生方法
function isNativeMethod(target: any, prop: string): boolean {
    // 检查是否为 Object.prototype 上的方法
    const objectMethods = ['toString', 'valueOf', 'hasOwnProperty', 'propertyIsEnumerable'];
    if (objectMethods.includes(prop)) {
        return true;
    }
    
    // 检查方法来源
    let current = target;
    while (current && current !== Object.prototype) {
        const descriptor = Object.getOwnPropertyDescriptor(current, prop);
        if (descriptor) {
            // 如果是原生代码实现的方法
            return /\[native code\]/.test(descriptor.value?.toString?.() || '');
        }
        current = Object.getPrototypeOf(current);
    }
    
    return false;
}

//判定方法来源
function getMethodSource(target: any, prop: string): 'own' | 'parent' | 'builtin' | 'native' {
    // 检查是否为实例自有方法
    if (Object.prototype.hasOwnProperty.call(target, prop)) {
        return 'own';
    }
    
    // 检查是否在直接父类中定义
    const parentProto = Object.getPrototypeOf(target.constructor.prototype);
    if (parentProto && Object.prototype.hasOwnProperty.call(parentProto, prop)) {
        return 'parent';
    }
    
    // 检查是否为内置方法
    if (isBuiltinType(target) && target.constructor.prototype[prop] === target[prop]) {
        return 'builtin';
    }
    
    // 检查是否为原生方法
    if (isNativeMethod(target, prop)) {
        return 'native';
    }
    
    return 'parent'; // 默认认为是父类方法
}
function createSafeMethodProxy(target: any, prop: string, originalMethod: Function, receiver: any) {
    // 防止递归的标记
    const recursionKey = Symbol(`executing_${prop}`);
    
    return function(...args: any[]) {
        // 检查是否已在执行中（防止无限递归）
        if (receiver[recursionKey]) {
            return originalMethod.apply(receiver, args);
        }
        
        // 标记开始执行
        receiver[recursionKey] = true;
        
        try {
            const result = originalMethod.apply(receiver, args);

            
            
            return result;
        } finally {
            // 确保清除标记
            delete receiver[recursionKey];
        }
    };
}



function isArrayMutationMethod(prop: string | symbol): boolean {
    // return typeof prop === 'string' && 
    //        ['pop', 'push', 'shift', 'unshift', 'splice', 'sort', 'reverse'].includes(prop);
    //暂时只在get中处理 pop
    return typeof prop === 'string' && 
           ['pop'].includes(prop);
}

function createArrayMethodProxy(originalMethod: Function, methodName: string,target:any, receiver: any[]) {
    return function(...args: any[]) {
        const arrLength = receiver.length;
        const result = originalMethod.apply(receiver, args);
        
        // 根据不同方法触发不同通知
        switch (methodName) {
            case 'pop':
                let arrLength = target.length - 1;
                if(arrLength >= 0){
                    SyNotify.htrigger(receiver,ListMethodType.pop,arrLength.toString(),null);
                }                
                break;
        }
        
        return result;
    };
}