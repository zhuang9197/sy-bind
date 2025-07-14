import { ListMethodType } from "../../src/enums/SyEnums";
import { sy_pipe_types } from "../../src/types/SyPipeTypes";
import { ISyListResult } from "./ISyResult";
import { SyContainerMethods } from "./SyContainer";

type pushMethod<K,C> = sy_pipe_types.pushMethod<K,C>;
type popMethod<C> = sy_pipe_types.popMethod<C>;

export class SyListResult<K,C> implements ISyListResult<K,C>{

    private containerMethods:SyContainerMethods<K,C>;
    constructor(containerMethods:SyContainerMethods<K,C>){
        this.containerMethods = containerMethods;
    }

    pop(method: popMethod<C>,callback:(popValue:C) => void): ISyListResult<K,C> {
        this.containerMethods.addPop(method);
        return this;
    }
    push(method:pushMethod<K,C>): ISyListResult<K,C> {
        this.containerMethods.addPush(method)

        return this;
    }

    clear(listMethodType?:ListMethodType):ISyListResult<K,C>{
        this.containerMethods.clear(listMethodType);

        return this;
    }


}