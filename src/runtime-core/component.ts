import { proxyRefs } from "../reactivity";
import { shallowReadonly } from "../reactivity/reactive";
import { initProps } from "./componentProps";
import { PublicInstanceProxyHandlers } from "./componentPublicInstance";
import { initSlots } from "./componentSlots";
import { emit } from "./componentsEmit";

export function createComponentInstance(vnode, parent){
    console.log('vnode',parent)
    const component = {
        vnode,
        type: vnode.type,
        props:{},
        setupState:{},
        slots:{},
        emit:()=>{},
        parent,
        subTree:{},
        isMounted:false,
        provides:parent?parent.provides:{},
    }
   //闭包，虽然目前component是一个空对象，但是后续会被赋值
    component.emit =emit.bind(null,component) as any
    return  component 
}
export function setupComponent(instance){
    initProps(instance,instance.vnode.props);
    initSlots(instance,instance.vnode.children);
    //initSlots(instance);
    //有状态的 组件？
    setupStatefulComponent(instance)



}

function setupStatefulComponent(instance) {
    setCurrentInstance(instance);
    //拿到配置
    const component = instance.type;
    //ctx
    instance.proxy = new Proxy({_:instance},PublicInstanceProxyHandlers)
    const {setup} = component;
    if(setup){
        //setup返回值 可能是function 也可能是对象,如果是对象，那么就是setup的返回值，如果是函数，那么就是render函数


        const setupResult = setup(shallowReadonly(instance.props),{emit:instance.emit});
        handleSetupResult(instance,setupResult)
    }
}
function handleSetupResult(instance,setupResult: any) {
    if(typeof setupResult === 'function'){
        //todo,setup返回的是render函数
    }else if(typeof setupResult === 'object'){
        //setup返回的是对象
        instance.setupState = proxyRefs(setupResult);

    }
    finishComponentSetup(instance)
}

function finishComponentSetup(instance: any) {
    const Component = instance.type;
    //todo
    
    if(Component.render){
        instance.render = Component.render;
    }
}
let currentInstance = null
export function getCurrentInstance(){
    return currentInstance
}
function setCurrentInstance(instance){
    currentInstance = instance
}




