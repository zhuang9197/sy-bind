export declare namespace sy_types {
    type ComponentUpdateStrategy<T> = (component: T, value: any) => void;
    type PropMetadata = {
        [propertyName: string]: Set<string>;
    };
    type Proxiable = object | any[];
    type SyList<T> = T[];
    type comm_property_name = string | symbol | number;
    type bind_func = Set<Function>;
    type bind_target = object;
}
