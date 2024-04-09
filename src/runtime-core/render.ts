import { ShapeFlags } from "../shared/shapeFlags";
import { createComponentInstance, setupComponent } from "./component";
import { Fragment,Text } from "./vnode";

export function render(vnode, container) {
    //patch
    patch(vnode, container,null);
}
function patch(vnode, container,parentComponent) {
    const {shapeFlag,type} = vnode;

    switch(type){
        case Fragment:
            processFragment(vnode, container,parentComponent);
            break;
        case Text:
            processText(vnode, container);
            break;
        default:
            // todo ,判断是组件还是元素
            if(shapeFlag & ShapeFlags.ELEMENT){
                processElement(vnode, container,parentComponent);
            }else if(shapeFlag & ShapeFlags.STATEFUL_COMPONENT){
                processComponent(vnode, container,parentComponent);
            }
            break;
    }



   
   
   
}

function processComponent(vnode, container,parentComponent) {
    // ...
    mountComponent(vnode, container,parentComponent);
}

function mountComponent(initialVNode: any, container,parentComponent) {
    const instance = createComponentInstance(initialVNode,parentComponent);
    setupComponent(instance);
    setupRenderEffect(instance,initialVNode, container);
}
function setupRenderEffect(instance,vnode, container) {
    const {proxy} = instance;
   const subTree =  instance.render.call(proxy);

   //vnode -> patch
   //vnode -> element -> mountele
    patch(subTree, container,instance);
    vnode.el = subTree.el;
}

function processElement(vnode: any, container: any,parentComponent) {
    moutElement(vnode, container,parentComponent);
}

function moutElement(vnode: any, container: any,parentComponent) {
    const el =vnode.el= document.createElement(vnode.type);
    const {children}    = vnode;
    if(ShapeFlags.TEXT_CHILDREN & vnode.shapeFlag){
        el.textContent = children;
    }else if(ShapeFlags.ARRAY_CHILDREN & vnode.shapeFlag){
        mountChildren(vnode,el,parentComponent)
    
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

function mountChildren(vnode, container,parentComponent) {

    vnode.children.forEach(child => {
        patch(child, container,parentComponent);
    });
}

function processFragment(vnode: any, container: any,parentComponent) {
    mountChildren(vnode, container,parentComponent)
}
function processText(vnode: any, container: any) {
    const {children} = vnode;
    const textNode = vnode.el = document.createTextNode(children);
    container.append(textNode);
}

