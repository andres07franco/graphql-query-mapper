import { Observable, from } from "rxjs";
import 'reflect-metadata'

interface GenericConstructor<T> {
    new(): T;
}

function getParamsName(func): string[] {
    var originalMethod = func.value!;
    return ((originalMethod + "").split("{")[0].replace(")", "").replace("(", "").replace("function", "")).split(", ")
}


function toArrayObject(names, values) {

    var result = [];
    for (var i = 0; i < names.length; i++)
        result.push({
                    name: [names[i]],
                    value: values[i]
        });
    return result;
}

class GraphgqlQueryStore{
    static query:string = "";
    static runningComplexQuery:boolean = false;
}

/**
 * Decorador para armar queries de graphql
 * @param uri 
 * @param ctor 
 */
export function GraphqlQuery<T>(uri: string, ctor: GenericConstructor<T>) {

    var objReturn = new ctor();

 
    return function (target, key, descriptor) {
        let paramTypesw = Reflect.getMetadata("design:returntype", target, key) + "";
        const returnObs = paramTypesw.includes("Observable");

        if (descriptor === undefined) {
            descriptor = Object.getOwnPropertyDescriptor(target, key);
        }
       
        var types = Reflect.getMetadata("design:paramtypes", target, key);
        var returnNames = Object.keys(objReturn).map(key => key).join(" ")
        var paramTypes = types.map(a =>  a.name)
        var paramNames = getParamsName(descriptor).map(a => a)

        descriptor.value = function () {

            var args = [];

            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i - 0] = arguments[_i];
            }

            var params = [];
            paramNames.forEach(param => params.push({
                name: param
            }));

            var paramValues = args.map(function (a) {

                return  JSON.stringify(a).replace(/\"([^(\")"]+)\":/g,"$1:")
                                         .replace("\"$EM","")
                                         .replace("$EM\"","")
                ;
            })


            const paramNameAndValue = toArrayObject(paramNames, paramValues)
            const paramNameAndValueStr = paramNameAndValue.map(a => `${a.name}:${a.value}`).join(",");
            const query = `{ ${key}(${paramNameAndValueStr}) { ${returnNames} } }`;
            GraphgqlQueryStore.query += ` ${key}(${paramNameAndValueStr}) { ${returnNames} } ` + "\n";
            
            if(GraphgqlQueryStore.runningComplexQuery ) return;
            if(returnObs)
                return sendRequestObservable(uri,query,key) 
            return sendRequestPromise(uri,query,key) 
        };
        return descriptor;
    }
}
/**
 * Decorador para armar mutations de graphql
 * @param uri 
 * @param ctor 
 */
export function GraphqlMutation<T>(uri: string, ctor: GenericConstructor<T>) {

    var objReturn = new ctor();

 
    return function (target, key, descriptor) {
        let paramTypesw = Reflect.getMetadata("design:returntype", target, key) + "";
        const returnObs = paramTypesw.includes("Observable");

        if (descriptor === undefined) {
            descriptor = Object.getOwnPropertyDescriptor(target, key);
        }
       
        var types = Reflect.getMetadata("design:paramtypes", target, key);
        var returnNames = Object.keys(objReturn).map(key => key).join(" ")
        var paramTypes = types.map(a =>  a.name)
        var paramNames = getParamsName(descriptor).map(a => a)

        descriptor.value = function () {

            var args = [];

            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i - 0] = arguments[_i];
            }

            var params = [];
            paramNames.forEach(param => params.push({
                name: param
            }));

            var paramValues = args.map(function (a) {
                return  JSON.stringify(a).replace(/\"([^(\")"]+)\":/g,"$1:")
                                         .replace("\"$EM","")
                                         .replace("$EM\"","")
            })


            const paramNameAndValue = toArrayObject(paramNames, paramValues)
            const paramNameAndValueStr = paramNameAndValue.map(a => `${a.name}:${a.value}`).join(",");
            const query = `mutation { ${key}(${paramNameAndValueStr}) { ${returnNames} } }`;
            GraphgqlQueryStore.query += ` ${key}(${paramNameAndValueStr}) { ${returnNames} } ` + "\n";
    
            if(GraphgqlQueryStore.runningComplexQuery ) return;
            if(returnObs)
                return sendRequestObservable(uri,query,key) 
            return sendRequestPromise(uri,query,key) 
        };
        return descriptor;
    }
}
/**
 * Decorador para armar queries complejos de graphql
 */
export function GraphqlComplexQuery<T>(uri: string){
    
    return function (target, key, descriptor) {
        let paramTypesw = Reflect.getMetadata("design:returntype", target, key) + "";
        const returnObs = paramTypesw.includes("Observable");

        descriptor.value = function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i - 0] = arguments[_i];
            }
                
            GraphgqlQueryStore.runningComplexQuery = true;
            args.map(function (a) { a() });
            GraphgqlQueryStore.runningComplexQuery = false

            var query = `query ${key}{ ${GraphgqlQueryStore.query} }`; 
            GraphgqlQueryStore.query = ""
            
            
            if(returnObs)
                return sendRequestObservable(uri,query,null) 
            return sendRequestPromise(uri,query,null) 

        };

    }
}

function sendRequestObservable(uri,query,key):Observable<any>{
    return  from(fetch(uri, {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            query: query
        })
    })
    .then(response => {

            if (!response.ok) {
                throw new Error(response.statusText)
            }

            return response.json().then((data) => {
                if(key == null)
                     return Promise.resolve(data.data)
                return Promise.resolve(data.data[key])
            })

        }))
}

function sendRequestPromise(uri,query,key):Promise<any>{
  return  fetch(uri, {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            query: query
        })
    })
    .then(response => {

            if (!response.ok) {
                throw new Error(response.statusText)
            }

            return response.json().then((data) => {              
                if(key == null)
                     return Promise.resolve(data.data)
                return Promise.resolve(data.data[key])
            })

        })
}

export function parseGraphEnum(value:string):string{
    return "$EM" + value + "$EM";
}