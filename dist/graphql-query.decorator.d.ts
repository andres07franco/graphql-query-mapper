import 'reflect-metadata';
interface GenericConstructor<T> {
    new (): T;
}
export declare function GraphqlQuery<T>(uri: string, ctor: GenericConstructor<T>): (target: any, key: any, descriptor: any) => any;
export declare function GraphqlMutation<T>(uri: string, ctor: GenericConstructor<T>): (target: any, key: any, descriptor: any) => any;
export declare function GraphqlComplexQuery<T>(uri: string): (target: any, key: any, descriptor: any) => void;
export declare function parseGraphEnum(value: string): string;
export {};
