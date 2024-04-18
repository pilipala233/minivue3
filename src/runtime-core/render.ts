import { effect } from "../reactivity/effect";
import { ShapeFlags } from "../shared/shapeFlags";
import { createComponentInstance, setupComponent } from "./component";
import { createAppAPI } from "./createApp";
import { Fragment,Text } from "./vnode";
export function createRender(options) {

    const {
        createElement,
        patchProp,
        insert,
    } = options



 function render(vnode, container) {
    //patch
    patch(null,vnode, container,null);
}
function patch(n1,n2, container,parentComponent) {
    const {shapeFlag,type} = n2;

    switch(type){
        case Fragment:
            processFragment(n1,n2, container,parentComponent);
            break;
        case Text:
            processText(n1,n2, container);
            break;
        default:
            // todo ,判断是组件还是元素
            if(shapeFlag & ShapeFlags.ELEMENT){
                processElement(n1,n2, container,parentComponent);
            }else if(shapeFlag & ShapeFlags.STATEFUL_COMPONENT){
                processComponent(n1,n2, container,parentComponent);
            }
            break;
    }



   
   
   
}

function processComponent(n1,n2, container,parentComponent) {
    // ...
    mountComponent(n2, container,parentComponent);
}

function mountComponent(initialVNode: any, container,parentComponent) {
    const instance = createComponentInstance(initialVNode,parentComponent);
    setupComponent(instance);
    setupRenderEffect(instance,initialVNode, container);
}
function setupRenderEffect(instance,vnode, container) {
    effect(()=>{
        if(!instance.isMounted){
            console.log('init')
            const {proxy} = instance;
            const subTree = instance.subTree= instance.render.call(proxy);
            console.log('subTree',subTree)
            //vnode -> patch
            //vnode -> element -> mountele
            patch(null,subTree, container,instance);
            vnode.el = subTree.el; 
            instance.isMounted = true;
        }else{
            console.log('update')
            const {proxy} = instance;
            const subTree =  instance.render.call(proxy);
            const prevSubTree = instance.subTree;
            instance.subTree = subTree;
    
            patch(prevSubTree,subTree, container,instance);
        }
       
    })

}

function processElement(n1,n2: any, container: any,parentComponent) {
    if(!n1){
        moutElement(n2, container,parentComponent);
    }else{
        patchElement(n1,n2, container)
    }
    
}
function patchElement(n1,n2, container){
    console.log("patchElement")
    console.log(n1)
    console.log(n2)
}
function moutElement(vnode: any, container: any,parentComponent) {
     
    const el =vnode.el= createElement(vnode.type);
    const {children}    = vnode;
    if(ShapeFlags.TEXT_CHILDREN & vnode.shapeFlag){
        el.textContent = children;
    }else if(ShapeFlags.ARRAY_CHILDREN & vnode.shapeFlag){
        mountChildren(vnode,el,parentComponent)
    
    }

    
    const {props} = vnode;
    for(const key in props){
        
        const value = props[key];
        // const isOn = (key)=>/^on[A-z]/.test(key);
        // if(isOn(key)){
        //     el.addEventListener(key.slice(2).toLowerCase(),value);
        // }else{
        //     el.setAttribute(key, value);
        // }
        patchProp(el,key,value)
        
    }

   // container.append(el);
   insert(el,container)
}

function mountChildren(vnode, container,parentComponent) {

    vnode.children.forEach(child => {
        patch(null,child, container,parentComponent);
    });
}

function processFragment(n1,n2: any, container: any,parentComponent) {
    mountChildren(n2, container,parentComponent)
}
function processText(n1,n2: any, container: any) {
    const {children} = n2;
    const textNode = n2.el = document.createTextNode(children);
    container.append(textNode);
}

return {
    createApp:createAppAPI(render)
}
}
