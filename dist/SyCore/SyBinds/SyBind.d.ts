import { sy_pipe_types } from "../../src/types/SyPipeTypes";
import { sy_types } from "../../src/types/SyTypes";
import { BindType } from "../../src/enums/SyEnums";
import { ISyListResult, ISyResult } from "../Utils/ISyResult";
type bind_target = sy_types.bind_target;
type ComponentUpdateStrategy<T> = sy_types.ComponentUpdateStrategy<T>;
type SyList<K> = sy_types.SyList<K>;
type t_pipe_target = sy_pipe_types.t_pipe_target;
type t_pipe_leader = sy_pipe_types.t_pipe_leader;
export declare class SyBind {
    static bind<T extends bind_target>(source: T, target: any, handled: Map<Function, ComponentUpdateStrategy<any>> | ((value: any) => void), triggerImmediately?: boolean, bindType?: BindType): ISyResult;
    private static _bind;
    static pbind<T extends bind_target, K extends keyof T, C extends object>(source: T, sourceProp: K, target: C, handled: Map<Function, ComponentUpdateStrategy<any>> | ((value: T[K]) => void), triggerImmediately?: boolean, bindType?: BindType): ISyResult;
    static lbind<L extends t_pipe_leader, T extends t_pipe_target>(source: T, target: any, handled: Map<Function, ComponentUpdateStrategy<any>> | ((value: any) => void), leader?: L, triggerImmediately?: boolean, bindType?: BindType): ISyResult;
    private static _lbind;
    static lpbind<T extends t_pipe_target, K extends keyof T, L extends t_pipe_leader, C extends object>(source: T, sourceProp: K, target: C, handled: Map<Function, ComponentUpdateStrategy<any>> | ((value: T[K]) => void), leader?: L, triggerImmediately?: boolean, bindType?: BindType): ISyResult;
    static bindlist<K extends object, LK extends SyList<K>, C extends object, LC>(source: LK, target: LC, componentType: new (...args: any[]) => C, handled: Map<Function, ComponentUpdateStrategy<any>> | ((value: C) => void), createTarget: () => C, triggerImmediately?: boolean, bindType?: BindType): ISyListResult<K, C> | undefined;
    private static _bindlist;
    private static _bindMutant;
    static onChange<T extends bind_target, K extends keyof T>(source: T, sourceProp: K, handled: (value: T[K]) => void, triggerImmediately?: boolean, bindType?: BindType): ISyResult;
    static onLChange<T extends t_pipe_target, K extends keyof T, L extends t_pipe_leader>(source: T, sourceProp: K, handled: (value: T[K]) => void, leader?: L, triggerImmediately?: boolean, bindType?: BindType): ISyResult;
    static unBind<T extends bind_target, K extends keyof T>(source: T, prop: K, bindType?: BindType): ISyResult;
}
export {};
