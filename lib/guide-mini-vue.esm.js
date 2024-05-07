const Fragment = Symbol('Fragment');
const Text = Symbol('Text');
function createVNode(type, props, children) {
    const vnode = {
        el: null,
        type,
        props,
        key: props && props.key,
        children,
        shapeFlag: getShapeFlag(type),
    };
    if (typeof children === 'string') {
        vnode.shapeFlag = vnode.shapeFlag | 4 /* ShapeFlags.TEXT_CHILDREN */;
    }
    else if (Array.isArray(children)) {
        vnode.shapeFlag = vnode.shapeFlag | 8 /* ShapeFlags.ARRAY_CHILDREN */;
    }
    // 组件+children object
    if (vnode.shapeFlag & 2 /* ShapeFlags.STATEFUL_COMPONENT */ && typeof children === 'object') {
        vnode.shapeFlag = vnode.shapeFlag | 16 /* ShapeFlags.SLOT_CHILDREN */;
    }
    return vnode;
}
function createTextVnode(text) {
    debugger;
    return createVNode(Text, {}, text);
}
function getShapeFlag(type) {
    return typeof type === 'string' ? 1 /* ShapeFlags.ELEMENT */ : 2 /* ShapeFlags.STATEFUL_COMPONENT */;
}

function h(type, props, children) {
    return createVNode(type, props, children);
}

function renderSlots(slots, name, props) {
    const slot = slots[name];
    if (slot) {
        if (typeof slot === 'function') {
            return createVNode(Fragment, {}, slot(props));
        }
    }
}

function toDisplayString(value) {
    return String(value);
}

const extend = Object.assign;
const Empty_OBJ = {};
const isObject = (val) => {
    return val !== null && typeof val === "object";
};
const isString = (value) => typeof value === "string";
const hasChanged = (val, newValue) => {
    return !Object.is(val, newValue);
};
const camelize = (str) => {
    return str.replace(/-(\w)/g, (_, c) => c ? c.toUpperCase() : "");
};
const capitalize = str => str.charAt(0).toUpperCase() + str.slice(1);
const toHandlerKey = (str) => {
    return str ? "on" + capitalize(str.slice(str)) : "";
};

let activeEffect;
let shouldTrack;
class ReactiveEffect {
    constructor(fn, scheduler) {
        this.scheduler = scheduler;
        this.deps = [];
        this.active = true;
        this._fn = fn;
    }
    run() {
        //1.会收集依赖
        // shouldTrack  做区分
        if (!this.active) {
            //执行过stop会跑这个
            return this._fn();
        }
        else {
            activeEffect = this;
            //console.dir(activeEffect._fn)
            shouldTrack = true;
            const result = this._fn();
            shouldTrack = false;
            return result;
        }
    }
    stop() {
        if (this.active) {
            cleanupEffect(this);
            if (this.onStop) {
                this.onStop();
            }
            this.active = false;
        }
    }
}
const targetMap = new Map();
function track(target, key) {
    if (!isTracking())
        return;
    // target -> key -> dep
    let depsMap = targetMap.get(target);
    if (!depsMap) {
        depsMap = new Map();
        targetMap.set(target, depsMap);
    }
    let dep = depsMap.get(key);
    if (!dep) {
        dep = new Set();
        depsMap.set(key, dep);
    }
    trackEffects(dep);
}
function isTracking() {
    return shouldTrack && activeEffect !== undefined;
}
function cleanupEffect(effect) {
    effect.deps.forEach((dep) => {
        dep.delete(effect);
    });
    effect.deps.length = 0;
}
function trackEffects(dep) {
    if (dep.has(activeEffect))
        return;
    dep.add(activeEffect);
    activeEffect.deps.push(dep);
}
function trigger(target, key) {
    let depsMap = targetMap.get(target);
    let deps = depsMap.get(key);
    triggerEffects(deps);
}
function triggerEffects(deps) {
    for (const effect of deps) {
        if (effect.scheduler) {
            effect.scheduler();
        }
        else {
            effect.run();
        }
    }
}
function effect(fn, options = {}) {
    //fn
    const _effect = new ReactiveEffect(fn, options.scheduler);
    // 把用户传过来的值合并到 _effect 对象上去
    // 缺点就是不是显式的，看代码的时候并不知道有什么值
    extend(_effect, options);
    _effect.run();
    const runner = _effect.run.bind(_effect);
    runner.effect = _effect;
    return runner;
}

const get = createGetter();
const set = createSetter();
const readonlyGet = createGetter(true);
const shallowReadonlyGet = createGetter(true, true);
function createGetter(isReadonly = false, shallow = false) {
    return function get(target, key) {
        if (key === "_v_isReactive" /* ReactiveFlags.IS_REACTIVE */) {
            return !isReadonly;
        }
        else if (key === "_v_isReadonly" /* ReactiveFlags.IS_READONLY */) {
            return isReadonly;
        }
        const res = Reflect.get(target, key);
        if (shallow) {
            return res;
        }
        if (isObject(res)) {
            return isReadonly ? readonly(res) : reactive(res);
        }
        if (!isReadonly) {
            //依赖收集
            track(target, key);
        }
        return res;
    };
}
function createSetter() {
    return function set(target, key, value) {
        const res = Reflect.set(target, key, value);
        //触发依赖
        trigger(target, key);
        return res;
    };
}
const mutableHandlers = {
    get,
    set
};
const readonlyHandlers = {
    get: readonlyGet,
    set(target, key, vlue) {
        console.warn(`Set operation on key ${String(key)} failed: target is readonly.`);
        return true;
    }
};
const shallowReadonlyHandlers = extend({}, readonlyHandlers, {
    get: shallowReadonlyGet
});

function reactive(raw) {
    return createActiveObject(raw, mutableHandlers);
}
function readonly(raw) {
    return createActiveObject(raw, readonlyHandlers);
}
function shallowReadonly(raw) {
    return createActiveObject(raw, shallowReadonlyHandlers);
}
function createActiveObject(raw, baseHandlers) {
    return new Proxy(raw, baseHandlers);
}

class RefImpl {
    constructor(value) {
        this._v_isRef = true;
        this._rawValue = value;
        this._value = convert(value);
        this.dep = new Set();
    }
    get value() {
        // 收集依赖 
        trackRefValue(this);
        return this._value;
    }
    set value(newValue) {
        // 当新的值不等于老的值的话，还要考虑初始化时已经变成了代理对象，而set时是普通对象，所以不能直接hasChanged(newValue, this._value)了
        // 那么才需要触发依赖
        if (hasChanged(newValue, this._rawValue)) {
            // 更新值
            this._rawValue = newValue;
            this._value = convert(newValue);
            // 触发依赖
            triggerEffects(this.dep);
        }
    }
}
function convert(value) {
    //优化
    return isObject(value) ? reactive(value) : value;
}
function trackRefValue(ref) {
    if (isTracking()) {
        trackEffects(ref.dep);
    }
}
function ref(value) {
    return new RefImpl(value);
}
const shallowUnwrapHandlers = {
    get(target, key, receiver) {
        // 如果里面是一个 ref 类型的话，那么就返回 .value
        // 如果不是的话，那么直接返回value 就可以了
        return unRef(Reflect.get(target, key, receiver));
    },
    set(target, key, value, receiver) {
        const oldValue = target[key];
        //旧值是ref类型，新值不是ref类型
        if (isRef(oldValue) && !isRef(value)) {
            return (target[key].value = value);
        }
        else {
            return Reflect.set(target, key, value, receiver);
        }
    },
};
// 这里没有处理 objectWithRefs 是 reactive 类型的时候
// TODO reactive 里面如果有 ref 类型的 key 的话， 那么也是不需要调用 ref.value 的
// （but 这个逻辑在 reactive 里面没有实现）
function proxyRefs(objectWithRefs) {
    return new Proxy(objectWithRefs, shallowUnwrapHandlers);
}
function unRef(ref) {
    return isRef(ref) ? ref.value : ref;
}
function isRef(ref) {
    return !!ref._v_isRef;
}

function initProps(instance, rawProps) {
    console.log("initProps");
    // TODO
    // 应该还有 attrs 的概念
    instance.props = rawProps || {};
}

const publicPropertiesMap = {
    $el: (i) => i.vnode.el,
    $slots: (i) => i.slots,
    $props: (i) => i.props,
};
const PublicInstanceProxyHandlers = {
    get({ _: instance }, key) {
        const { setupState, props } = instance;
        const hasOwn = (o, k) => Object.prototype.hasOwnProperty.call(o, k);
        if (hasOwn(setupState, key)) {
            return setupState[key];
        }
        else if (hasOwn(props, key)) {
            return props[key];
        }
        // if(setupState !== undefined && key in setupState){
        //     return setupState[key];
        // }
        const publicGetter = publicPropertiesMap[key];
        if (publicGetter) {
            return publicGetter(instance);
        }
    }
};

function initSlots(instance, children) {
    const { vnode } = instance;
    if (vnode.shapeFlag & 16 /* ShapeFlags.SLOT_CHILDREN */) {
        normalizeObjectSlots(children, instance.slots);
    }
    normalizeObjectSlots(children, instance.slots);
}
function normalizeObjectSlots(children, slots) {
    for (const key in children) {
        const value = children[key];
        slots[key] = (props) => normalizeSlotValue(value(props));
    }
}
function normalizeSlotValue(value) {
    return Array.isArray(value) ? value : [value];
}

function emit(instance, event, ...args) {
    console.log("emit", event);
    const { props } = instance;
    const key = toHandlerKey(camelize(event));
    const handler = props[key];
    handler && handler(...args);
}

function createComponentInstance(vnode, parent) {
    console.log('vnode', parent);
    const component = {
        vnode,
        type: vnode.type,
        props: {},
        setupState: {},
        slots: {},
        emit: () => { },
        parent,
        subTree: {},
        isMounted: false,
        provides: parent ? parent.provides : {},
    };
    //闭包，虽然目前component是一个空对象，但是后续会被赋值
    component.emit = emit.bind(null, component);
    return component;
}
function setupComponent(instance) {
    initProps(instance, instance.vnode.props);
    initSlots(instance, instance.vnode.children);
    //initSlots(instance);
    //有状态的 组件？
    setupStatefulComponent(instance);
}
function setupStatefulComponent(instance) {
    setCurrentInstance(instance);
    //拿到配置
    const component = instance.type;
    //ctx
    instance.proxy = new Proxy({ _: instance }, PublicInstanceProxyHandlers);
    const { setup } = component;
    if (setup) {
        //setup返回值 可能是function 也可能是对象,如果是对象，那么就是setup的返回值，如果是函数，那么就是render函数
        const setupResult = setup(shallowReadonly(instance.props), { emit: instance.emit });
        handleSetupResult(instance, setupResult);
    }
}
function handleSetupResult(instance, setupResult) {
    if (typeof setupResult === 'function') ;
    else if (typeof setupResult === 'object') {
        //setup返回的是对象
        instance.setupState = proxyRefs(setupResult);
    }
    finishComponentSetup(instance);
}
function finishComponentSetup(instance) {
    const Component = instance.type;
    if (compiler && !Component.render) {
        if (Component.template) {
            Component.render = compiler(Component.template);
        }
    }
    instance.render = Component.render;
}
let currentInstance = null;
function getCurrentInstance() {
    return currentInstance;
}
function setCurrentInstance(instance) {
    currentInstance = instance;
}
let compiler;
function registerRuntimeCompiler(_comiler) {
    compiler = _comiler;
}

function provide(key, value) {
    const currentInstance = getCurrentInstance();
    if (currentInstance) {
        let { provides } = currentInstance;
        const parentprovides = currentInstance.parent;
        if (parentprovides === provides) {
            provides = currentInstance.provides = Object.create(parentprovides);
        }
        provides[key] = value;
    }
}
function inject(key, defaultVal) {
    const currentInstance = getCurrentInstance();
    if (currentInstance) {
        const { provides } = currentInstance;
        if (key in provides) {
            return provides[key];
        }
        else if (defaultVal) {
            if (typeof defaultVal === 'function') {
                return defaultVal();
            }
            return defaultVal;
        }
    }
}

//render
function createAppAPI(render) {
    return function createApp(rootComponent) {
        return {
            mount(rootContainer) {
                const vnode = createVNode(rootComponent);
                render(vnode, rootContainer);
            }
        };
    };
}

function shouldUpdateComponent(prevVNode, nextVNode) {
    const { props: prevProps } = prevVNode;
    const { props: nextProps } = nextVNode;
    for (const key in nextProps) {
        if (nextProps[key] !== prevProps[key]) {
            return true;
        }
    }
    return false;
}

const queue = [];
const p = Promise.resolve();
//控制当前微任务时只创建一个promise
let isFlushPending = false;
function nextTick(fn) {
    return fn ? p.then(fn) : p;
}
function queueJobs(job) {
    if (!queue.includes(job)) {
        queue.push(job);
    }
    queueFlush();
}
function queueFlush() {
    if (isFlushPending)
        return;
    isFlushPending = true;
    nextTick(flushJobs);
}
function flushJobs() {
    isFlushPending = false;
    let job;
    // 取出头部
    while (job = queue.shift()) {
        job && job();
    }
}

function createRender(options) {
    const { createElement, patchProp, insert, remove, setElementText, } = options;
    function render(vnode, container) {
        //patch
        patch(null, vnode, container, null, null);
    }
    function patch(n1, n2, container, parentComponent, anchor) {
        const { shapeFlag, type } = n2;
        switch (type) {
            case Fragment:
                processFragment(n1, n2, container, parentComponent, anchor);
                break;
            case Text:
                processText(n1, n2, container);
                break;
            default:
                // todo ,判断是组件还是元素
                if (shapeFlag & 1 /* ShapeFlags.ELEMENT */) {
                    processElement(n1, n2, container, parentComponent, anchor);
                }
                else if (shapeFlag & 2 /* ShapeFlags.STATEFUL_COMPONENT */) {
                    processComponent(n1, n2, container, parentComponent, anchor);
                }
                break;
        }
    }
    function processComponent(n1, n2, container, parentComponent, anchor) {
        if (n1 === null) {
            //初始化
            mountComponent(n2, container, parentComponent, anchor);
        }
        else {
            debugger;
            //更新
            updateComponent(n1, n2);
        }
    }
    function updateComponent(n1, n2) {
        const instance = (n2.component = n1.component);
        if (shouldUpdateComponent(n1, n2)) {
            instance.next = n2;
            instance.update();
        }
        else {
            n2.el = n1.el;
            instance.vnode = n2;
        }
    }
    function mountComponent(initialVNode, container, parentComponent, anchor) {
        const instance = initialVNode.component = createComponentInstance(initialVNode, parentComponent);
        setupComponent(instance);
        setupRenderEffect(instance, initialVNode, container, anchor);
    }
    function setupRenderEffect(instance, vnode, container, anchor) {
        instance.update = effect(() => {
            if (!instance.isMounted) {
                console.log('init');
                const { proxy } = instance;
                const subTree = instance.subTree = instance.render.call(proxy, proxy);
                console.log('subTree', subTree);
                //vnode -> patch
                //vnode -> element -> mountele
                patch(null, subTree, container, instance, anchor);
                vnode.el = subTree.el;
                instance.isMounted = true;
            }
            else {
                console.log('update');
                const { next, vnode, } = instance;
                if (next) {
                    next.el = vnode.el;
                    updateComponentPreRender(instance, next);
                }
                const { proxy } = instance;
                const subTree = instance.render.call(proxy, proxy);
                const prevSubTree = instance.subTree;
                instance.subTree = subTree;
                patch(prevSubTree, subTree, container, instance, anchor);
            }
        }, {
            scheduler() {
                // console.log("update - scheduler ")
                queueJobs(instance.update);
            }
        });
    }
    function processElement(n1, n2, container, parentComponent, anchor) {
        if (!n1) {
            moutElement(n2, container, parentComponent, anchor);
        }
        else {
            patchElement(n1, n2, container, anchor);
        }
    }
    function patchElement(n1, n2, container, parentComponent) {
        console.log("patchElement");
        console.log(n1);
        console.log(n2);
        const oldProps = n1.props || Empty_OBJ;
        const newProps = n2.props || Empty_OBJ;
        const el = n2.el = n1.el;
        patchProps(el, oldProps, newProps);
        patchChildren(n1, n2, el, parentComponent, null);
    }
    function patchProps(el, oldProps, newProps) {
        if (oldProps === newProps)
            return;
        for (const key in newProps) {
            const prev = oldProps[key];
            const next = newProps[key];
            if (prev !== next) {
                patchProp(el, key, prev, next);
            }
        }
        if (oldProps === Empty_OBJ)
            return;
        for (const key in oldProps) {
            if (!(key in newProps)) {
                patchProp(el, key, oldProps[key], null);
            }
        }
    }
    function moutElement(vnode, container, parentComponent, anchor) {
        const el = vnode.el = createElement(vnode.type);
        const { children } = vnode;
        if (4 /* ShapeFlags.TEXT_CHILDREN */ & vnode.shapeFlag) {
            el.textContent = children;
        }
        else if (8 /* ShapeFlags.ARRAY_CHILDREN */ & vnode.shapeFlag) {
            mountChildren(vnode.children, el, parentComponent, anchor);
        }
        const { props } = vnode;
        for (const key in props) {
            const value = props[key];
            // const isOn = (key)=>/^on[A-z]/.test(key);
            // if(isOn(key)){
            //     el.addEventListener(key.slice(2).toLowerCase(),value);
            // }else{
            //     el.setAttribute(key, value);
            // }
            patchProp(el, key, null, value);
        }
        // container.append(el);
        insert(el, container, anchor);
    }
    function mountChildren(children, container, parentComponent, anchor) {
        children.forEach(child => {
            patch(null, child, container, parentComponent, anchor);
        });
    }
    function processFragment(n1, n2, container, parentComponent, anchor) {
        mountChildren(n2.children, container, parentComponent, anchor);
    }
    function processText(n1, n2, container) {
        const { children } = n2;
        const textNode = n2.el = document.createTextNode(children);
        container.append(textNode);
    }
    function patchChildren(n1, n2, container, parentComponent, anchor) {
        const prevShapeFlag = n1.shapeFlag;
        //新的
        const { shapeFlag } = n2;
        const c1 = n1.children;
        const c2 = n2.children;
        if (shapeFlag & 4 /* ShapeFlags.TEXT_CHILDREN */) {
            //array -> text
            if (prevShapeFlag & 8 /* ShapeFlags.ARRAY_CHILDREN */) {
                //1.把老的children清空
                unmountChildren(n1.children);
            }
            //text -> text || array->text
            if (c1 !== c2) {
                setElementText(container, c2);
            }
        }
        else {
            //text -> array
            if (prevShapeFlag & 4 /* ShapeFlags.TEXT_CHILDREN */) {
                setElementText(container, "");
                mountChildren(c2, container, parentComponent, anchor);
            }
            else {
                patchKeyedChildren(c1, c2, container, parentComponent, anchor);
            }
        }
    }
    function unmountChildren(children) {
        for (let i = 0; i < children.length; i++) {
            const el = children[i].el;
            remove(el);
        }
    }
    function patchKeyedChildren(c1, c2, container, parentComponent, parentAnchor) {
        const l2 = c2.length;
        let i = 0;
        let e1 = c1.length - 1; //老
        let e2 = l2 - 1; //新
        function isSameVNodeType(n1, n2) {
            //type  //key 
            return n1.type === n2.type && n1.key === n2.key;
        }
        //如果是左侧有共同的，求出共同的最大索引
        while (i <= e1 && i <= e2) {
            const n1 = c1[i];
            const n2 = c2[i];
            if (isSameVNodeType(n1, n2)) {
                patch(n1, n2, container, parentComponent, parentAnchor);
            }
            else {
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
            }
            else {
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
                    patch(null, c2[i], container, parentComponent, anchor);
                    i++;
                }
            }
        }
        else if (i >= e2) {
            while (i <= e1) {
                remove(c1[i].el);
                i++;
            }
        }
        else {
            //乱序区间
            debugger;
            let s1 = i; //老节点开始
            let s2 = i;
            const tobePatched = e2 - s2 + 1; // 新接口右侧 e2 - 左侧索引 s2   结果需要+1；长度
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
                    remove(prevChild.el);
                    continue;
                }
                let newIndex;
                if (prevChild.key != null) {
                    newIndex = keyToNewIndexMap.get(prevChild.key);
                }
                else {
                    for (let j = s2; j <= e2; j++) {
                        //c2是现在的
                        if (isSameVNodeType(prevChild, c2[j])) {
                            newIndex = j;
                            break;
                        }
                    }
                }
                if (newIndex === undefined) {
                    remove(prevChild.el);
                }
                else {
                    if (newIndex >= maxNewIndexSoFar) {
                        maxNewIndexSoFar = newIndex;
                    }
                    else {
                        moved = true;
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
                }
                else if (moved) {
                    if (j < 0 || i !== increasingNewIndexSequence[j]) {
                        console.log("移动位置");
                        insert(nextChild.el, container, anchor);
                    }
                    else {
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
        createApp: createAppAPI(render)
    };
}
//  [4,2,3,1,5]  --->[2,3,5]
function getSequence(arr) {
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
                }
                else {
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

function createElement(type) {
    return document.createElement(type);
}
function patchProp(el, key, preVal, nextValue) {
    const isOn = (key) => /^on[A-z]/.test(key);
    if (isOn(key)) {
        el.addEventListener(key.slice(2).toLowerCase(), nextValue);
    }
    else {
        if (nextValue === null || nextValue === undefined) {
            el.removeAttribute(key);
        }
        else {
            el.setAttribute(key, nextValue);
        }
    }
}
function insert(el, container, anchor) {
    container.insertBefore(el, anchor || null);
}
function remove(child) {
    const parent = child.parentNode;
    if (parent) {
        parent.removeChild(child);
    }
}
function setElementText(el, text) {
    el.textContent = text;
}
const render = createRender({ createElement, patchProp, insert, remove, setElementText });
function createApp(...args) {
    return render.createApp(...args);
}

var runtimeDom = /*#__PURE__*/Object.freeze({
    __proto__: null,
    createApp: createApp,
    createElementVNode: createVNode,
    createRender: createRender,
    createTextVnode: createTextVnode,
    getCurrentInstance: getCurrentInstance,
    h: h,
    inject: inject,
    nextTick: nextTick,
    provide: provide,
    proxyRefs: proxyRefs,
    ref: ref,
    registerRuntimeCompiler: registerRuntimeCompiler,
    renderSlots: renderSlots,
    toDisplayString: toDisplayString
});

const TO_DISPLAY_STRING = Symbol("toDisplayString");
const CREATE_ELEMENT_VNODE = Symbol("createElementVNode");
const helperMapName = {
    [TO_DISPLAY_STRING]: "toDisplayString",
    [CREATE_ELEMENT_VNODE]: "createElementVNode"
};

function generate(ast) {
    const context = createCodegenContext();
    const { push } = context;
    genFunctionPreamble(ast, context);
    const functionName = "render";
    const args = ["_ctx", "_cache"];
    const signature = args.join(',');
    push(`function ${functionName}(${signature}){`);
    // code += `function ${functionName}(${signature}){`
    push("return ");
    // code += `return`;
    genNode(ast.codegenNode, context);
    push("}");
    // code += "}"
    return {
        code: context.code,
    };
}
function genFunctionPreamble(ast, context) {
    const { push } = context;
    const VueBinging = "Vue";
    const aliasHelper = (s) => `${helperMapName[s]}:_${helperMapName[s]}`;
    if (ast.helpers.length > 0) {
        push(`const { ${ast.helpers.map(aliasHelper).join(', ')} } = ${VueBinging}`);
    }
    push('\n');
    push("return ");
}
function genNode(node, context) {
    switch (node.type) {
        case 3 /* NodeTypes.TEXT */:
            genText(node, context);
            break;
        case 0 /* NodeTypes.INTERPOLATION */:
            genInterpolation(node, context);
            break;
        case 1 /* NodeTypes.SIMPLE_EXPRESSION */:
            genExpression(node, context);
            break;
        case 2 /* NodeTypes.ELEMENT */:
            genElement(node, context);
            break;
        case 5 /* NodeTypes.COMPOUND_EXPRESSION */:
            genCompoundExpression(node, context);
            break;
    }
}
function genElement(node, context) {
    const { push, helper } = context;
    const { tag, children, props } = node;
    debugger;
    push(`${helper(CREATE_ELEMENT_VNODE)}(`);
    genNodeList(genNullable([tag, props, children]), context);
    // genNode(children, context);
    push(")");
}
function genNodeList(nodes, context) {
    const { push } = context;
    for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];
        if (isString(node)) {
            push(node);
        }
        else {
            genNode(node, context);
        }
        if (i < nodes.length - 1) {
            push(",");
        }
    }
}
function genText(node, context) {
    const { push } = context;
    push(`'${node.content}'`);
}
function genInterpolation(node, context) {
    const { push, helper } = context;
    // console.log(node)
    push(`${helper(TO_DISPLAY_STRING)}(`);
    genNode(node.content, context);
    push(")");
}
function createCodegenContext() {
    const context = {
        code: "",
        push(source) {
            context.code += source;
        },
        helper(key) {
            return `_${helperMapName[key]}`;
        }
    };
    return context;
}
function genExpression(node, context) {
    const { push } = context;
    push(`${node.content}`);
}
function genCompoundExpression(node, context) {
    const children = node.children;
    const { push } = context;
    for (let i = 0; i < children.length; i++) {
        const child = children[i];
        if (isString(child)) {
            push(child);
        }
        else {
            genNode(child, context);
        }
    }
}
function genNullable(arg0) {
    return arg0.map((arg) => arg || "null");
}

function baseParse(content) {
    const context = createParserContext(content);
    return createRoot(parseChildren(context, []));
}
function parseChildren(context, ancestors) {
    const nodes = [];
    while (!isEnd(context, ancestors)) {
        //其实还需要解析props,minivue 并没有实现
        let node;
        const s = context.source;
        if (s.startsWith("{{")) {
            node = parseInterpolation(context);
        }
        else if (s[0] === "<") {
            if (/[a-z]/i.test(s[1])) {
                node = parseElement(context, ancestors);
            }
        }
        if (!node) {
            node = parseText(context);
        }
        nodes.push(node);
    }
    return nodes;
}
function isEnd(context, ancestors) {
    const s = context.source;
    //2.当遇到结束标签的时候
    if (s.startsWith("</")) {
        for (let i = ancestors.length - 1; i >= 0; i--) {
            const tag = ancestors[i].tag;
            if (startsWithEndTagOpen(s, tag)) {
                return true;
            }
        }
    }
    // if (parentTag && s.startsWith(`</${parentTag}>`)) {
    //     return true;
    // }
    //1.souce 有值的时候
    return !s;
}
function parseInterpolation(context) {
    // {{message}}
    const openDelimiter = "{{";
    const closeDelimiter = "}}";
    const closeIndex = context.source.indexOf("}}", openDelimiter.length);
    advaceBy(context, openDelimiter.length);
    const rawContentLength = closeIndex - openDelimiter.length;
    const rawContent = parseTextData(context, rawContentLength); //context.source.slice(0, rawContentLength);
    const content = rawContent.trim();
    advaceBy(context, closeDelimiter.length);
    // context.source = context.source.slice(rawContentLength + closeDelimiter.length);
    return {
        type: 0 /* NodeTypes.INTERPOLATION */,
        content: {
            type: 1 /* NodeTypes.SIMPLE_EXPRESSION */,
            content: content,
        }
    };
}
function advaceBy(context, length) {
    context.source = context.source.slice(length);
}
function createRoot(children) {
    return {
        children,
        type: 4 /* NodeTypes.ROOT */,
        helpers: []
    };
}
function createParserContext(content) {
    return {
        source: content
    };
}
function parseElement(context, ancestors) {
    // Implement 
    //1. 解析 tag
    const element = parseTag(context, 0 /* TagType.Start */);
    ancestors.push(element);
    element.children = parseChildren(context, ancestors);
    ancestors.pop();
    if (startsWithEndTagOpen(context.source, element.tag)) {
        parseTag(context, 1 /* TagType.End */);
    }
    else {
        throw new Error(`缺少结束标签:${element.tag}`);
    }
    return element;
}
function startsWithEndTagOpen(source, tag) {
    return source.startsWith("</") && source.slice(2, 2 + tag.length).toLowerCase() === tag.toLowerCase();
}
function parseTag(context, type) {
    const match = /^<\/?([a-z]*)/i.exec(context.source);
    const tag = match[1];
    //2. 删除处理完成的代码
    advaceBy(context, match[0].length);
    advaceBy(context, 1);
    if (type === 1 /* TagType.End */)
        return;
    return {
        type: 2 /* NodeTypes.ELEMENT */,
        tag
    };
}
function parseText(context) {
    let endIndex = context.source.length;
    let endTokens = ["<", "{{"];
    for (let i = 0; i < endTokens.length; i++) {
        const index = context.source.indexOf(endTokens[i]);
        if (index !== -1 && endIndex > index) {
            endIndex = index;
        }
    }
    const content = parseTextData(context, endIndex);
    return {
        type: 3 /* NodeTypes.TEXT */,
        content
    };
}
function parseTextData(context, length) {
    //1.获取content
    const content = context.source.slice(0, length);
    //2. 推进
    advaceBy(context, length);
    return content;
}

function transform(root, options = {}) {
    const context = createTransformContext(root, options);
    //1.遍历 - 深度优先搜索
    traverseNode(root, context);
    //2. 修改 text content 
    createRootCodegen(root);
    root.helpers = [...context.helpers.keys()];
}
function traverseNode(node, context) {
    const nodeTransforms = context.nodeTransforms;
    const exitFns = [];
    for (let i = 0; i < nodeTransforms.length; i++) {
        const transform = nodeTransforms[i];
        const onExit = transform(node, context);
        if (onExit)
            exitFns.push(onExit);
    }
    switch (node.type) {
        case 0 /* NodeTypes.INTERPOLATION */:
            context.helper(TO_DISPLAY_STRING);
            break;
        case 4 /* NodeTypes.ROOT */:
        case 2 /* NodeTypes.ELEMENT */:
            traverseChildren(node, context);
            break;
    }
    let i = exitFns.length;
    while (i--) {
        exitFns[i]();
    }
}
function traverseChildren(node, context) {
    const children = node.children;
    for (let i = 0; i < children.length; i++) {
        const node = children[i];
        traverseNode(node, context);
    }
}
function createTransformContext(root, options) {
    const context = {
        root,
        nodeTransforms: options.nodeTransforms || [],
        helpers: new Map(),
        helper(key) {
            context.helpers.set(key, 1);
        }
    };
    return context;
}
function createRootCodegen(root) {
    const child = root.children[0];
    if (child.type === 2 /* NodeTypes.ELEMENT */) {
        root.codegenNode = child.codegenNode;
    }
    else {
        root.codegenNode = root.children[0];
    }
    // root.codegenNode = root.children[0];
}

function createVNodeCall(context, tag, props, children) {
    context.helper(CREATE_ELEMENT_VNODE);
    return {
        type: 2 /* NodeTypes.ELEMENT */,
        tag,
        props,
        children
    };
}

function transformElement(node, context) {
    if (node.type === 2 /* NodeTypes.ELEMENT */) {
        return () => {
            //中间处理层
            //tag
            const vnodeTag = `'${node.tag}'`;
            // props 
            let vnodeProps;
            debugger;
            //children
            const children = node.children;
            let vnodeChildren = children[0];
            node.codegenNode = createVNodeCall(context, vnodeTag, vnodeProps, vnodeChildren);
        };
    }
}

function transformExpression(node) {
    if (node.type === 0 /* NodeTypes.INTERPOLATION */) {
        node.content = processExprssion(node.content);
    }
}
function processExprssion(node) {
    node.content = `_ctx.${node.content}`;
    return node;
}

function isText(node) {
    return (node.type === 3 /* NodeTypes.TEXT */ || node.type === 0 /* NodeTypes.INTERPOLATION */);
}

function transformText(node) {
    if (node.type === 2 /* NodeTypes.ELEMENT */) {
        return () => {
            const { children } = node;
            let currentContainer;
            for (let i = 0; i < children.length; i++) {
                const child = children[i];
                if (isText(child)) {
                    for (let j = i + 1; j < children.length; j++) {
                        const next = children[j];
                        if (isText(next)) {
                            if (!currentContainer) {
                                currentContainer = children[i] = {
                                    type: 5 /* NodeTypes.COMPOUND_EXPRESSION */,
                                    children: [child]
                                };
                            }
                            currentContainer.children.push(" + ");
                            currentContainer.children.push(next);
                            children.splice(j, 1);
                            j--;
                        }
                        else {
                            currentContainer = undefined;
                            break;
                        }
                    }
                }
            }
        };
    }
}

function baseCompile(template) {
    const ast = baseParse(template);
    transform(ast, {
        nodeTransforms: [transformExpression, transformElement, transformText]
    });
    return generate(ast);
}

function compileToFunction(template) {
    const { code } = baseCompile(template);
    const render = new Function("Vue", code)(runtimeDom);
    return render;
}
registerRuntimeCompiler(compileToFunction);

export { createApp, createVNode as createElementVNode, createRender, createTextVnode, getCurrentInstance, h, inject, nextTick, provide, proxyRefs, ref, registerRuntimeCompiler, renderSlots, toDisplayString };
