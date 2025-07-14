
export class UniqueIdentifierManager{
    private static instance:UniqueIdentifierManager;

    private uniqueMap = new WeakMap<object,Map<string,string>>();

    public static get Instance():UniqueIdentifierManager{
        return this.instance ??= new UniqueIdentifierManager();
    }

    public generateUniqueId():string{
        return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}-${crypto.randomUUID()}`;
    }

    public setUnique(obj:object,prop:string):string{
        const objMap = this.uniqueMap.get(obj) ?? new Map();

        this.uniqueMap.set(obj,objMap);

        if(!objMap.has(prop)){
            objMap.set(prop,this.generateUniqueId());
        }

        return objMap.get(prop)!;

    }

    public getUnique(obj:object,prop:string):string|undefined{
       return this.uniqueMap.get(obj)?.get(prop);
    }
}