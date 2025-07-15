import { bindHandler } from "../../src/constants/SyConstant";
import { SyReflect } from "../Utils/SyReflect";

    
// }

export function CBind(targetClassOrProperty: string) {
    return function (target: any, propertyKey: string) {
        SyReflect.setPropMetadata(target,propertyKey,targetClassOrProperty);
        
    };
}

export function Bind(){
    return function<T extends {new(...args:any[]):{}}>(constructor:T){
        return class extends constructor{
            constructor(...args:any[]){
                super(...args);

                const proxy = new Proxy(this,bindHandler)

                SyReflect.setProxy(proxy);

                return proxy;
            }
        }
    }
}












































