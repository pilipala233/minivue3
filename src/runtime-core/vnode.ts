import { ShapeFlags } from "../shared/shapeFlags";
export const Fragment = Symbol('Fragment');
export const Text = Symbol('Text');
export function createVNode(type,props?,children?){
    
    const vnode =  {
        el:null,
        type,
        props,
        key:props && props.key,
        children,
        shapeFlag:getShapeFlag(type),
        
    }

    if(typeof children === 'string'){
        vnode.shapeFlag = vnode.shapeFlag|ShapeFlags.TEXT_CHILDREN;
    }else if(Array.isArray(children)){

        vnode.shapeFlag = vnode.shapeFlag|ShapeFlags.ARRAY_CHILDREN;
    }
    // 组件+children object
    if(vnode.shapeFlag & ShapeFlags.STATEFUL_COMPONENT && typeof children === 'object'){
        vnode.shapeFlag = vnode.shapeFlag|ShapeFlags.SLOT_CHILDREN;
    }
    return vnode
}

export function createTextVnode(text){
    debugger
    return createVNode(Text,{},text)
}
function getShapeFlag(type){
    return typeof type === 'string' ? ShapeFlags.ELEMENT : ShapeFlags.STATEFUL_COMPONENT;
}