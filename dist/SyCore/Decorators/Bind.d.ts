export declare function CBind(targetClassOrProperty: string): (target: any, propertyKey: string) => void;
export declare function Bind(): <T extends new (...args: any[]) => {}>(constructor: T) => {
    new (...args: any[]): {};
} & T;
