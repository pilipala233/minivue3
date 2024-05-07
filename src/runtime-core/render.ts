import { effect } from "../reactivity/effect";
import { ShapeFlags } from "../shared/shapeFlags";
import { createComponentInstance, setupComponent } from "./component";
import { createAppAPI } from "./createApp";
import { Fragment,Text } from "./vnode";
import { Empty_OBJ } from "../shared";
import { shouldUpdateComponent } from "./componentUpdateUtils";
import { queueJobs } from "./scheduler";
export function createRender(options) {

    const {
        createElement,
        patchProp,
        insert,
        remove,
        setElementText,
    } = options



 function render(vnode, container) {
    //patch
    patch(null,vnode, container,null,null);
}
function patch(n1,n2, container,parentComponent,anchor) {
    const {shapeFlag,type} = n2;

    switch(type){
        case Fragment:
            processFragment(n1,n2, container,parentComponent,anchor);
            break;
        case Text:
            processText(n1,n2, container);
            break;
        default:
            // todo ,判断是组件还是元素
            if(shapeFlag & ShapeFlags.ELEMENT){
                processElement(n1,n2, container,parentComponent,anchor);
            }else if(shapeFlag & ShapeFlags.STATEFUL_COMPONENT){
                processComponent(n1,n2, container,parentComponent,anchor);
            }
            break;
    }



   
   
   
}

function processComponent(n1,n2, container,parentComponent,anchor) {
    if(n1 === null){
        //初始化
        mountComponent(n2, container,parentComponent,anchor);
    }else{
        debugger
        //更新
        updateComponent(n1,n2);
    }

}
function updateComponent(n1,n2) {
    const instance = (n2.component = n1.component);
    if (shouldUpdateComponent(n1, n2)) {
        instance.next = n2;
        instance.update();
    } else {
        n2.el = n1.el;
        instance.vnode = n2;
    }
}
function mountComponent(initialVNode: any, container,parentComponent,anchor) {
    const instance = initialVNode.component = createComponentInstance(initialVNode,parentComponent);
    setupComponent(instance);
    setupRenderEffect(instance,initialVNode, container,anchor);
}
function setupRenderEffect(instance,vnode, container,anchor) {
    instance.update = effect(()=>{
        if(!instance.isMounted){
            console.log('init')
            const {proxy} = instance;
            const subTree = instance.subTree= instance.render.call(proxy,proxy);
            console.log('subTree',subTree)
            //vnode -> patch
            //vnode -> element -> mountele
            patch(null,subTree, container,instance,anchor);
            vnode.el = subTree.el; 
            instance.isMounted = true;
        }else{
            
            console.log('update')
            const { next, vnode, } = instance;
            if (next) {
                next.el = vnode.el;
                updateComponentPreRender(instance, next);
            }
            const {proxy} = instance;
            const subTree =  instance.render.call(proxy,proxy);
            const prevSubTree = instance.subTree;
            instance.subTree = subTree;
    
            patch(prevSubTree,subTree, container,instance,anchor);
        }
       
    }, {
        scheduler() {
            // console.log("update - scheduler ")
            queueJobs(instance.update);
        }
    })

}

function processElement(n1,n2: any, container: any,parentComponent,anchor) {
    if(!n1){
        moutElement(n2, container,parentComponent,anchor);
    }else{
        patchElement(n1,n2, container,anchor)
    }
    
}
function patchElement(n1,n2, container,parentComponent){
    console.log("patchElement")
    console.log(n1)
    console.log(n2)
   
    const oldProps = n1.props||Empty_OBJ;
    const newProps = n2.props||Empty_OBJ;
    const el = n2.el = n1.el;
    patchProps( el,oldProps,newProps);
    patchChildren(n1,n2,el,parentComponent,null)
}
function patchProps(el,oldProps,newProps){
    if(oldProps === newProps) return;
    for(const key in newProps){
        const prev = oldProps[key];
        const next = newProps[key];
        if(prev !== next){
            patchProp(el,key,prev,next)
        }
    }
    if(oldProps===Empty_OBJ) return;
    for(const key in oldProps){
        if(!(key in newProps)){
            patchProp(el,key,oldProps[key],null)
        }
    }

}
function moutElement(vnode: any, container: any,parentComponent,anchor) {
     
    const el =vnode.el= createElement(vnode.type);
    const {children}    = vnode;
    if(ShapeFlags.TEXT_CHILDREN & vnode.shapeFlag){
        el.textContent = children;
    }else if(ShapeFlags.ARRAY_CHILDREN & vnode.shapeFlag){
        mountChildren(vnode.children,el,parentComponent,anchor)
    
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
        patchProp(el,key,null,value)
        
    }

   // container.append(el);
   insert(el,container,anchor)
}

function mountChildren(children, container,parentComponent,anchor) {

    children.forEach(child => {
        patch(null,child, container,parentComponent,anchor);
    });
}

function processFragment(n1,n2: any, container: any,parentComponent,anchor) {
    mountChildren(n2.children, container,parentComponent,anchor)
}
function processText(n1,n2: any, container: any) {
    const {children} = n2;
    const textNode = n2.el = document.createTextNode(children);
    container.append(textNode);
}
function patchChildren(n1: any, n2: any ,container: any, parentComponent: any, anchor) {
    const prevShapeFlag = n1.shapeFlag;
    //新的
    const { shapeFlag } = n2;

    const c1 = n1.children;
    const c2 = n2.children;
    if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
        //array -> text
        if (prevShapeFlag & ShapeFlags.ARRAY_CHILDREN) {
            //1.把老的children清空
            unmountChildren(n1.children);

        }
        //text -> text || array->text
        if (c1 !== c2) {
            setElementText(container, c2)
        }
    } else {
        //text -> array
        if (prevShapeFlag & ShapeFlags.TEXT_CHILDREN) {
            setElementText(container, "");
            mountChildren(c2, container, parentComponent,anchor)

        } else {
           patchKeyedChildren(c1, c2,container, parentComponent,anchor);
        }
    }
}
function unmountChildren(children: any) {
    for (let i = 0; i < children.length; i++) {
        const el = children[i].el;
        
        remove(el);
    }
}
function patchKeyedChildren(c1: any, c2: any, container, parentComponent, parentAnchor) {

    const l2 = c2.length;
    let i = 0;
    let e1 = c1.length - 1;//老
    let e2 = l2 - 1;//新
    function isSameVNodeType(n1, n2) {
        //type  //key 
        return n1.type === n2.type && n1.key === n2.key;
    }
    
    //如果是左侧有共同的，求出共同的最大索引
    while (i <= e1 && i <= e2) {
        const n1 = c1[i]
        const n2 = c2[i]
        if (isSameVNodeType(n1, n2)) {
            patch(n1, n2, container, parentComponent, parentAnchor)
        } else {
            break;
        }
        i++;
    }
    //如果是右侧有共同的，求出共同的最大索引
    while (i <= e1 && i <= e2) {
        const n1 = c1[e1];
        const n2 = c2[e2];
        if (isSameVNodeType(n1, n2)) {
            patch(n1, n2, container, parentComponent, parentAnchor);
        } else {
            break;
        }
        e1--;
        e2--;
    }

    //3. 经过上面两部之后，得出的不同的区间，
    //先处理端点的情况，当新的比老的多，创建
    if (i > e1) {
        if (i <= e2) {

            // const nextPos = i + 1;
            // const anchor = i+1 > c2.length?null : c2[nextPos].el;
            // patch(null, c2[i], container, parentComponent, anchor)
            const nextPos = e2 + 1;
            const anchor = nextPos < l2 ? c2[nextPos].el : null;
            while (i <= e2) {
                patch(null, c2[i], container, parentComponent, anchor)
                i++;
            }
        }
    }else if (i >= e2) {
        while (i <= e1) {
            remove(c1[i].el);
            i++;
        }
    }else{
        //乱序区间
        debugger
        let s1 = i;//老节点开始
        let s2 = i;
        const tobePatched = e2 - s2 + 1;// 新接口右侧 e2 - 左侧索引 s2   结果需要+1；长度
        let patched = 0;
        const keyToNewIndexMap = new Map();
        const newIndexToOldIndexMap = new Array(tobePatched);
        let moved = false;
        let maxNewIndexSoFar = 0;
        newIndexToOldIndexMap[i] = 0;
        for (let i = 0; i < tobePatched; i++) {
            newIndexToOldIndexMap[i] = 0;
        }
        for (let i = s2; i <= e2; i++) {
            const nextChild = c2[i];
            keyToNewIndexMap.set(nextChild.key, i);
        }
        // null undefined 
        for (let i = s1; i <= e1; i++) {
            //c1是老的
            const prevChild = c1[i];
            if (patched >= tobePatched) {
                remove(prevChild.el)
                continue;
            }
            let newIndex;
            if (prevChild.key != null) {
                newIndex = keyToNewIndexMap.get(prevChild.key);
            } else {
                for (let j = s2; j <= e2; j++) {
                    //c2是现在的
                    if (isSameVNodeType(prevChild, c2[j])) {
                        newIndex = j;
                        break;
                    }
                }
            }
            if (newIndex === undefined) {
                remove(prevChild.el)
            } else {
                if (newIndex >= maxNewIndexSoFar) {
                    maxNewIndexSoFar = newIndex;
                } else {
                    moved = true
                }
                newIndexToOldIndexMap[newIndex - s2] = i + 1;
                patch(prevChild, c2[newIndex], container, parentComponent, null);
                patched++;
            }
        }
        // 最长递增子序列
        const increasingNewIndexSequence = moved ? getSequence(newIndexToOldIndexMap) : [];
        let j = increasingNewIndexSequence.length - 1;
        for (let i = (tobePatched - 1); i >= 0; i--) {
            const nextindex = i + s2;
            const nextChild = c2[nextindex];
            const anchor = nextindex + 1 < l2 ? c2[nextindex + 1].el : null;
            if (newIndexToOldIndexMap[i] === 0) {
                patch(null, nextChild, container, parentComponent, anchor);
            } else if (moved) {
                if (j < 0 || i !== increasingNewIndexSequence[j]) {
                    console.log("移动位置")
                    insert(nextChild.el, container, anchor);
                } else {
                    j--;
                }
            }
        }
    }  
}
function updateComponentPreRender(instance, nextVNode) {
    instance.vnode = nextVNode;
    instance.next = null;
    instance.props = nextVNode.props;
}
return {
    createApp:createAppAPI(render)
}




}

//  [4,2,3,1,5]  --->[2,3,5]
function getSequence(arr: number[]): number[] {
    const p = arr.slice();
    const result = [0];
    let i, j, u, v, c;
    const len = arr.length;
    for (i = 0; i < len; i++) {
        const arrI = arr[i];
        if (arrI !== 0) {
            j = result[result.length - 1];
            if (arr[j] < arrI) {
                p[i] = j;
                result.push(i);
                continue;
            }
            u = 0;
            v = result.length - 1;
            while (u < v) {
                c = (u + v) >> 1;
                if (arr[result[c]] < arrI) {
                    u = c + 1;
                } else {
                    v = c;
                }
            }
            if (arrI < arr[result[u]]) {
                if (u > 0) {
                    p[i] = result[u - 1];
                }
                result[u] = i;
            }
        }
    }
    u = result.length;
    v = result[u - 1];
    while (u-- > 0) {
        result[u] = v;
        v = p[v];
    }
    return result;
}



