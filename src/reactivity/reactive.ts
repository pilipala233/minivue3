import { mutableHandlers, readonlyHandlers, shallowReadonlyHandlers } from "./baseHandlers"


export const enum ReactiveFlags {
    IS_REACTIVE = "_v_isReactive",
    IS_READONLY = "_v_isReadonly"
  }

export function reactive(raw){
    return createActiveObject(raw, mutableHandlers)
} 
export function readonly(raw){
    return createActiveObject(raw, readonlyHandlers)
   
} 
export function shallowReadonly(raw){
    return createActiveObject(raw, shallowReadonlyHandlers)
}
export function isReactive(value){
    return !!value[ReactiveFlags.IS_REACTIVE]
}
export function isReadonly (value) {
    return !!value[ReactiveFlags.IS_READONLY]
}

function createActiveObject(raw,baseHandlers){
    return new Proxy(raw, baseHandlers)
}