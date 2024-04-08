import { ShapeFlags } from "../shared/shapeFlags";
import { createComponentInstance, setupComponent } from "./component";
import { Fragment,Text } from "./vnode";

export function render(vnode, container) {
    //patch
    patch(vnode, container);
}
function patch(vnode, container) {
    const {shapeFlag,type} = vnode;

    switch(type){
        case Fragment:
            processFragment(vnode, container);
            break;
        case Text:
            processText(vnode, container);
            break;
        default:
            // todo ,判断是组件还是元素
            if(shapeFlag & ShapeFlags.ELEMENT){
                processElement(vnode, container);
            }else if(shapeFlag & ShapeFlags.STATEFUL_COMPONENT){
                processComponent(vnode, container);
            }
            break;
    }



   
   
   
}

function processComponent(vnode, container) {
    // ...
    mountComponent(vnode, container);
}

function mountComponent(initialVNode: any, container) {
    const instance = createComponentInstance(initialVNode);
    setupComponent(instance);
    setupRenderEffect(instance,initialVNode, container);
}
function setupRenderEffect(instance,vnode, container) {
    const {proxy} = instance;
   const subTree =  instance.render.call(proxy);

   //vnode -> patch
   //vnode -> element -> mountele
    patch(subTree, container);
    vnode.el = subTree.el;
}

function processElement(vnode: any, container: any) {
    moutElement(vnode, container);
}

function moutElement(vnode: any, container: any) {
    const el =vnode.el= document.createElement(vnode.type);
    const {children}    = vnode;
    if(ShapeFlags.TEXT_CHILDREN & vnode.shapeFlag){
        el.textContent = children;
    }else if(ShapeFlags.ARRAY_CHILDREN & vnode.shapeFlag){
        mountChildren(vnode,el)
    
    }

    
    const {props} = vnode;
    for(const key in props){
        const value = props[key];
        const isOn = (key)=>/^on[A-z]/.test(key);
        if(isOn(key)){
            el.addEventListener(key.slice(2).toLowerCase(),value);
        }else{
            el.setAttribute(key, value);
        }
        
    }

    container.append(el);
}

function mountChildren(vnode, container) {

    vnode.children.forEach(child => {
        patch(child, container);
    });
}

function processFragment(vnode: any, container: any) {
    mountChildren(vnode, container)
}
function processText(vnode: any, container: any) {
    const {children} = vnode;
    const textNode = vnode.el = document.createTextNode(children);
    container.append(textNode);
}

