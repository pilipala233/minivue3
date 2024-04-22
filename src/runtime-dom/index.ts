import  {createRender} from '../runtime-core'
function createElement(type) {
    return document.createElement(type);
}
function patchProp(el, key,preVal,nextValue) {
 
    const isOn = (key)=>/^on[A-z]/.test(key);
    if(isOn(key)){
        el.addEventListener(key.slice(2).toLowerCase(),nextValue);
    }else{
        if(nextValue === null||nextValue === undefined){
            el.removeAttribute(key);
        }else{
            el.setAttribute(key, nextValue);
        }
        
    }
}
function insert(el, container) {
    container.append(el);
}

const render:any = createRender({createElement,patchProp, insert});

export function createApp(...args) {
    return render.createApp(...args);

}
export * from '../runtime-core';