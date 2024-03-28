import { PublicInstanceProxyHandlers } from "./componentPublicInstance";

export function createComponentInstance(vnode){
    const component = {
        vnode,
        type: vnode.type,
    }
    return  component 
}
export function setupComponent(instance){
    //initProps(instance);
    //initSlots(instance);
    //有状态的 组件？
    setupStatefulComponent(instance)



}

function setupStatefulComponent(instance) {
    //拿到配置
    const component = instance.type;
    //ctx
    instance.proxy = new Proxy({_:instance},PublicInstanceProxyHandlers)
    const {setup} = component;
    if(setup){
        //setup返回值 可能是function 也可能是对象,如果是对象，那么就是setup的返回值，如果是函数，那么就是render函数


        const setupResult = setup();
        handleSetupResult(instance,setupResult)
    }
}
function handleSetupResult(instance,setupResult: any) {
    if(typeof setupResult === 'function'){
        //todo,setup返回的是render函数
    }else if(typeof setupResult === 'object'){
        //setup返回的是对象
        instance.setupState = setupResult;

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

