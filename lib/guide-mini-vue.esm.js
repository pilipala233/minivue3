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
    const { shapeFlag } = vnode;
    // todo ,判断是组件还是元素
    if (shapeFlag & 1 /* ShapeFlags.ELEMENT */) {
        processElement(vnode, container);
    }
    else if (shapeFlag & 4 /* ShapeFlags.STATEFUL_COMPONENT */) {
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
    if (8 /* ShapeFlags.TEXT_CHILDREN */ & vnode.shapeFlag) {
        el.textContent = children;
    }
    else if (16 /* ShapeFlags.ARRAY_CHILDREN */ & vnode.shapeFlag) {
        mountChildren(vnode, el);
    }
    const { props } = vnode;
    for (const key in props) {
        const value = props[key];
        const isOn = (key) => /^on[A-z]/.test(key);
        if (isOn(key)) {
            el.addEventListener(key.slice(2).toLowerCase(), value);
        }
        else {
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

function createVNode(type, props, children) {
    const vnode = {
        el: null,
        type,
        props,
        children,
        shapeFlag: getShapeFlag(type),
    };
    if (typeof children === 'string') {
        vnode.shapeFlag = vnode.shapeFlag | 8 /* ShapeFlags.TEXT_CHILDREN */;
    }
    else if (Array.isArray(children)) {
        vnode.shapeFlag = vnode.shapeFlag | 16 /* ShapeFlags.ARRAY_CHILDREN */;
    }
    return vnode;
}
function getShapeFlag(type) {
    return typeof type === 'string' ? 1 /* ShapeFlags.ELEMENT */ : 4 /* ShapeFlags.STATEFUL_COMPONENT */;
}

function createApp(rootComponent) {
    return {
        mount(rootContainer) {
            const vnode = createVNode(rootComponent);
            render(vnode, rootContainer);
        }
    };
}

function h(type, props, children) {
    return createVNode(type, props, children);
}

export { createApp, h };
