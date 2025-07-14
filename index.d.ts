
declare module 'sy-bind' {
    //export namespace sy{
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

        export enum StrategiesType{
            normal = 101,
            customer = 202,
            special = 303
        }
        
        /**
         * @zh 框架的返回值
         */
        export interface ISyResult<T = void>{
            success: boolean;     // 表示操作是否成功
            data?: T;             // 成功时的数据
            error?: string;            // 失败时的错误信息
            code?: number;        // 可选的错误/成功代码
        } 

        export interface ISyListResult<K,C>{
            push(method:sy_pipe_types.pushMethod<K,C>):ISyListResult<K,C>;
            pop(method:sy_pipe_types.popMethod<C>,callback:(popValue:C) => void):ISyListResult<K,C>;
        }

        /**
         * @zh 
         */
        export class SyBind{

            /**
             * @en  Automatically bind the source data model with UI components using the properties specified by @ CBind
             * @zh  将源数据模型与UI组件通过 @ CBind 指定的属性自动绑定
             * @param source    @en Binding source data
             *                  @zh 绑定的源数据 
             * @param target    @en Responsive UI components
             *                  @zh 响应的 UI 组件
             * @param handled   @en Response strategy or specified Function
             *                  @zh 响应的策略或指定的方法
             * @param triggerImmediately    @en Should it be triggered immediately
             *                              @zh 是否立即触发
             * @param bindType  @en classification
             *                  @zh 分类
             */
            public static bind<
                T extends sy_types.bind_target
            >(
                source:T,
                target:any,
                handled:Map<Function,sy_types.ComponentUpdateStrategy<any>> | ((value:any) => void),
                triggerImmediately?:boolean,
                bindType?:BindType
            ):ISyResult;


            /**
             * @en  Bind the source data model with UI components through specified properties
             * @zh  将源数据模型与UI组件通过指定的属性绑定
             * @param source    @en Binding source data
             *                  @zh 绑定的源数据 
             * @param sourceProp    @en Property of source data
             *                      @zh 源数据的属性
             * @param target    @en Responsive UI components
             *                  @zh 响应的 UI 组件
             * @param handled   @en Response strategy or specified Function
             *                  @zh 响应的策略或指定的方法
             * @param triggerImmediately    @en Should it be triggered immediately
             *                              @zh 是否立即触发
             * @param bindType  @en classification
             *                  @zh 分类
             */
            public static pbind<
                T extends sy_types.bind_target,
                K extends keyof T,
                C extends object
            >(
                source:T,
                sourceProp:K,
                target:C,
                handled:Map<Function,sy_types.ComponentUpdateStrategy<any>> | ((value: T[K]) => void),
                triggerImmediately?:boolean,
                bindType?:BindType
            ):ISyResult;

            /**
             * @en  Automatically bind the source data model with UI components using the properties specified by @ CBind
             * @zh  将源数据模型与UI组件通过 @ CBind 指定的属性自动绑定
             * @param source    @en Binding source data
             *                  @zh 绑定的源数据 
             * @param target    @en Responsive UI components
             *                  @zh 响应的 UI 组件
             * @param handled   @en Response strategy or specified Function
             *                  @zh 响应的策略或指定的方法
             * @param leader    @en The monitoring leader always holds the monitoring. If no leader is configured, the source data will be assumed to be the first leader
             *                  @zh 监听的领导者，始终拥有持有该监听，若未配置领导者，会默认源数据为第一领导人
             * @param triggerImmediately    @en Should it be triggered immediately
             *                              @zh 是否立即触发
             * @param bindType  @en classification
             *                  @zh 分类
             */
            public static lbind<
                L extends sy_pipe_types.t_pipe_leader,
                T extends sy_pipe_types.t_pipe_target
            >(
                source : T,
                target:any,
                handled:Map<Function,sy_types.ComponentUpdateStrategy<any>> | ((value: any) => void),
                leader? : L,
                triggerImmediately?:boolean,
                bindType?:BindType
            ):ISyResult;

            /**
             * @en  Bind the source data model with UI components through specified properties
             * @zh  将源数据模型与UI组件通过指定的属性绑定
             * @param source    @en Binding source data
             *                  @zh 绑定的源数据 
             * @param sourceProp    @en Property of source data
             *                      @zh 源数据的属性
             * @param target    @en Responsive UI components
             *                  @zh 响应的 UI 组件
             * @param handled   @en Response strategy or specified Function
             *                  @zh 响应的策略或指定的方法
             * @param leader    @en The monitoring leader always holds the monitoring. If no leader is configured, the source data will be assumed to be the first leader
             *                  @zh 监听的领导者，始终拥有持有该监听，若未配置领导者，会默认源数据为第一领导人
             * @param triggerImmediately    @en Should it be triggered immediately
             *                              @zh 是否立即触发
             * @param bindType  @en classification
             *                  @zh 分类
             */
            public static lpbind<
                T extends sy_pipe_types.t_pipe_target,
                K extends keyof T,
                L extends sy_pipe_types.t_pipe_leader,
                C extends object
            >(
                source: T,
                sourceProp: K,
                target: C,
                handled: Map<Function,sy_types.ComponentUpdateStrategy<any>> | ((value: T[K]) => void),
                leader?: L,
                triggerImmediately?: boolean,
                bindType?:BindType 
            ): ISyResult;

            public static bindlist<
                K extends any,
                LK extends sy_types.SyList<K>,
                C extends object,
                LC
            >(
                source:LK,
                target:LC,
                componentType: new (...args: any[]) => C,
                handled: Map<Function,sy_types.ComponentUpdateStrategy<any>> | ((value: C) => void),
                createTarget: ()=> C,
                triggerImmediately?: boolean,
                bindType?:BindType,
            ):ISyListResult<K,C>;

            /**
             * @en  Add change monitoring for source data
             * @zh  为源数据添加变更监听
             * @param source    @en Binding source data
             *                  @zh 绑定的源数据 
             * @param sourceProp    @en Property of source data
             *                      @zh 源数据的属性
             * @param handled   @en Response strategy or specified Function
             *                  @zh 响应的策略或指定的方法
             * @param triggerImmediately    @en Should it be triggered immediately
             *                              @zh 是否立即触发
             * @param bindType  @en classification
             *                  @zh 分类
             */
            public static onChange<
                T extends sy_types.bind_target,
                K extends keyof T
            >(
                source:T,
                sourceProp:K,
                handled:(value:T[K]) => void,
                triggerImmediately?: boolean,
                bindType?: BindType
            ):ISyResult;
            
            /**
             * @en  Add change monitoring for source data
             * @zh  为源数据添加变更监听
             * @param source    @en Binding source data
             *                  @zh 绑定的源数据 
             * @param sourceProp    @en Property of source data
             *                      @zh 源数据的属性
             * @param handled   @en Response strategy or specified Function
             *                  @zh 响应的策略或指定的方法
             * @param leader    @en The monitoring leader always holds the monitoring. If no leader is configured, the source data will be assumed to be the first leader
             *                  @zh 监听的领导者，始终拥有持有该监听，若未配置领导者，会默认源数据为第一领导人
             * @param triggerImmediately    @en Should it be triggered immediately
             *                              @zh 是否立即触发
             * @param bindType  @en classification
             *                  @zh 分类
             */
            public static onLChange<
                T extends sy_pipe_types.t_pipe_target,
                K extends keyof T,
                L extends sy_pipe_types.t_pipe_leader
            >(
                source: T,
                sourceProp: K,
                handled: (value: T[K]) => void,
                leader?:L,
                triggerImmediately?: boolean,
                bindType?: BindType
            ) :ISyResult;

            /**
             * @en Remove bind
             * @zh 移除监听
             * @param source  
             * @param prop 
             * @param bindType 
             */
            public static unBind<
                T extends sy_types.bind_target,
                K extends keyof T
            >(
                source:T,
                prop: K,
                bindType?:BindType
            ):ISyResult;
        }

        // 定义一个类型来表示任何构造函数
        type Constructor<T = {}> = new (...args: any[]) => T;




        // 定义装饰器函数的类型
        export type sy_bind_class = <T extends Constructor>(
            target: T
        ) => {
            new (...args: ConstructorParameters<T>): InstanceType<T>;
        };
        export type sy_bind_property = (target: any, propertyKey: string) => void;
        

        //装饰器
       // export namespace sy_decorator{
            /**
             * @zh 将模型类封装为响应类 
             */
            export function Bind(): <T extends {
        new (...args: any[]): {};
    }>(constructor: T) => {
        new (...args: any[]): {};
    } & T;

            /**
             * @zh 标注属性为 监听属性，监听属性可以配置为响应属性
             */
    //        export function BindProperty(option:BindType):sy_bind_property;

            /**
             * @zh 挂载在组件上 标注属性为 受监听组件，会匹配同名字段
             * @param targetClassOrProperty 
             */
            export function CBind(targetClassOrProperty: string): sy_bind_property;
        //}

        export namespace sy_types{
            type ComponentUpdateStrategy<T> = (component: T, value: any) => void;
            type PropMetadata = {
                [propertyName: string]: Set<string>;
            };
            type Proxiable = object | any[];
            type SyList<T> = T[] ;

            type comm_property_name = string | symbol | number;
            type bind_func = Set<Function>;
            type bind_target = object;
        }

        

        export namespace sy_pipe_types{
            type t_pipe = object;
            type t_pipes = Set<t_pipe>
            type t_head_pipe = object;
            type t_index_pipe = object;
            type t_index_pipes = Set<t_index_pipe>;
            type t_container_pipe = object;

            type t_pipe_leader = object;

            type t_pipe_target = object;
            type t_pipe_entrance = object;
            type t_pipe_node = object;

            type t_list_source = any;

            //list
            type t_pipe_head<T> = T[];

            type t_pipe_index = object;

            type listMethods = 'push' | 'pop';

            type pushMethod<K,C> = (node:ISyTreeNode,target:C) => void;
            type popMethod<C> = (popNode:C) => void;
        }
        
        export class SyPipeTree<Root extends object>{

        }

        export interface ISyTreeNode {
            root:SyPipeTree<any>;
            obj:object;
            pipe:sy_pipe_types.t_pipe;
            prop: sy_types.comm_property_name;
            parent: ISyTreeNode | null;
            children: Set<ISyTreeNode>;
            trigger(prop:sy_types.comm_property_name,value:any):void;
            addChild<C extends object>(tree:SyPipeTree<any>, childObj:C,prop:sy_types.comm_property_name,pipe?:sy_pipe_types.t_index_pipe):ISyTreeNode;
            getOrCreateChild<C extends object>(tree:SyPipeTree<any>,childObj:C,prop:sy_types.comm_property_name):ISyTreeNode;
            getChild<C extends object>(childObj:C):ISyTreeNode | undefined;

            changeObj(newObj:object):void;

            listen(prop:sy_types.comm_property_name,fn:Function,triggerImmediately?:Boolean,bindType?:BindType):ISyResult;
        }   

        export interface ITempPushMethod<K,C> {
            method: sy_pipe_types.pushMethod<K,C>;         // 替换any为具体的方法类型，例如: () => void
            save: boolean;    // 控制是否执行的标志位
        }

        export interface ITempPopMethod<C> {
            method: sy_pipe_types.popMethod<C>;         // 替换any为具体的方法类型，例如: () => void
            save: boolean;    // 控制是否执行的标志位
        }
    //} 
    

    

    
}
//export{}