import { sy_types } from "../../src/types/SyTypes";
type Proxiable = sy_types.Proxiable;
type bind_target = sy_types.bind_target;
export declare class SyReflect {
    private static propMetadataStore;
    private static boundMethods;
    private static proxyMap;
    private static isProxyWeakMap;
    static isMarked(obj: any): boolean;
    static isObject(value: unknown): value is object;
    static isProxy(obj: any): boolean;
    static setProxy(proxy: any): void;
    static getOrCreateProxy(obj: object): any;
    static createProxy(value: any): void;
    static getOrCreateBoundMethods(target: Proxiable): Map<PropertyKey, Function>;
    static setPropMetadata(target: bind_target, propertyKey: string, targetClassOrProperty: string): void;
    static getPropMetada(target: bind_target, propertyKey: string): Set<string> | undefined;
}
export {};
