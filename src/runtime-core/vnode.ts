export function createVNode(type,props?,children?){
    const vnode =  {
        el:null,
        type,
        props,
        children
    }
    return vnode
}