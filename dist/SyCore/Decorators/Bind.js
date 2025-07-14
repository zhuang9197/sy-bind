import { bindHandler } from "../../src/constants/SyConstant.js";
import { SyReflect } from "../Utils/SyReflect.js";
// }
export function CBind(targetClassOrProperty) {
    return function (target, propertyKey) {
        SyReflect.setPropMetadata(target, propertyKey, targetClassOrProperty);
    };
}
export function Bind() {
    return function (constructor) {
        return class extends constructor {
            constructor(...args) {
                super(...args);
                const proxy = new Proxy(this, bindHandler);
                SyReflect.setProxy(proxy);
                return proxy;
            }
        };
    };
}
//# sourceMappingURL=Bind.js.map