export enum BindType{
    level0 = 1,
    Level1 = 2,
    Level2 = 4,
    Level3 = 8,
    Level4 = 16,
    Level5 = 32,
    Level6 = 64,
    Level7 = 128,
    Level8 = 256,
    Level9 = 512,
    Level10 = 1024,
    Level11 = 2048,
}

export enum Code{
    
}

export enum StrategiesType{
    normal = 101,
    customer = 202,
    special = 303
}


export enum ListMethodType{
    push = 'push',
    pop = 'pop',
    change = 'indexchange'
}

export enum ListType{
    primitive = "primitive",
    class = "class"
}

export enum CompileStatus{
    compiled = 'done',
    uncompiled = 'not',
    new = 'new'
}