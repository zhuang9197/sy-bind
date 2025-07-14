export namespace sy_types {
    export type ComponentUpdateStrategy<T> = (component: T, value: any) => void;
    export type PropMetadata = {
            [propertyName: string]: Set<string>;
        };
    export type Proxiable = object | any[];
    export type SyList<T> = T[] ;

    export type comm_property_name = string | symbol | number;
    export type bind_func = Set<Function>;
    export type bind_target = object;

}

