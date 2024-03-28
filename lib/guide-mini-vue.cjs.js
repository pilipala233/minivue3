'use strict';

const publicPropertiesMap = {
    $el: (i) => i.vnode.el,
};
const PublicInstanceProxyHandlers = {
    get({ _: instance }, key) {
        const { setupState } = instance;
        if (setupState !== undefined && key in setupState) {
            return setupState[key];
        }
        const publicGetter = publicPropertiesMap[key];
        if (publicGetter) {
            return publicGetter(instance);
        }
    }
};

function createComponentInstance(vnode) {
    const component = {
        vnode,
        type: vnode.type,
    };
    return component;
}
function setupComponent(instance) {
    //initProps(instance);
    //initSlots(instance);
    //有状态的 组件？
    setupStatefulComponent(instance);
}
function setupStatefulComponent(instance) {
    //拿到配置
    const component = instance.type;
    //ctx
    instance.proxy = new Proxy({ _: instance }, PublicInstanceProxyHandlers);
    const { setup } = component;
    if (setup) {
        //setup返回值 可能是function 也可能是对象,如果是对象，那么就是setup的返回值，如果是函数，那么就是render函数
        const setupResult = setup();
        handleSetupResult(instance, setupResult);
    }
}
function handleSetupResult(instance, setupResult) {
    if (typeof setupResult === 'function') ;
    else if (typeof setupResult === 'object') {
        //setup返回的是对象
        instance.setupState = setupResult;
    }
    finishComponentSetup(instance);
}
function finishComponentSetup(instance) {
    const Component = instance.type;
    //todo
    if (Component.render) {
        instance.render = Component.render;
    }
}

function render(vnode, container) {
    //patch
    patch(vnode, container);
}
function patch(vnode, container) {
    // todo ,判断是组件还是元素
    if (typeof (vnode.type) === "string") {
        processElement(vnode, container);
    }
    else {
        processComponent(vnode, container);
    }
}
function processComponent(vnode, container) {
    // ...
    mountComponent(vnode, container);
}
function mountComponent(initialVNode, container) {
    const instance = createComponentInstance(initialVNode);
    setupComponent(instance);
    setupRenderEffect(instance, initialVNode, container);
}
function setupRenderEffect(instance, vnode, container) {
    const { proxy } = instance;
    const subTree = instance.render.call(proxy);
    //vnode -> patch
    //vnode -> element -> mountele
    patch(subTree, container);
    vnode.el = subTree.el;
}
function processElement(vnode, container) {
    moutElement(vnode, container);
}
function moutElement(vnode, container) {
    const el = vnode.el = document.createElement(vnode.type);
    const { children } = vnode;
    if (typeof children === 'string') {
        el.textContent = children;
    }
    else {
        mountChildren(vnode, el);
    }
    const { props } = vnode;
    for (const key in props) {
        const value = props[key];
        el.setAttribute(key, value);
    }
    container.append(el);
}
function mountChildren(vnode, container) {
    vnode.children.forEach(child => {
        patch(child, container);
    });
}

function createVNode(type, props, children) {
    const vnode = {
        el: null,
        type,
        props,
        children
    };
    return vnode;
}

function createApp(rootComponent) {
    return {
        mount(rootContainer) {
            debugger;
            const vnode = createVNode(rootComponent);
            render(vnode, rootContainer);
        }
    };
}

function h(type, props, children) {
    return createVNode(type, props, children);
}

exports.createApp = createApp;
exports.h = h;
