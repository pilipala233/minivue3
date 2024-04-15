import  {createRender} from '../runtime-core'
function createElement(type) {
    return document.createElement(type);
}
function patchProp(el, key,value) {
     const isOn = (key)=>/^on[A-z]/.test(key);
    if(isOn(key)){
        el.addEventListener(key.slice(2).toLowerCase(),value);
    }else{
        el.setAttribute(key, value);
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