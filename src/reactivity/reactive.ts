import { mutableHandlers, readonlyHandlers } from "./baseHandlers"
import { track ,trigger} from "./effect"



export function reactive(raw){
    return createActiveObject(raw, mutableHandlers)
} 
export function readonly(raw){
    return createActiveObject(raw, readonlyHandlers)
   
} 

function createActiveObject(raw,baseHandlers){
    return new Proxy(raw, baseHandlers)
}