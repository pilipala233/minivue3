
import { isTracking, trackEffects, triggerEffects } from "./effect";
import { reactive } from "./reactive";
import { hasChanged, isObject } from "../shared";

export class RefImpl {

  private _value: any;
  public dep;
  private _rawValue
  public _v_isRef = true;
  constructor(value) {
    this._rawValue = value;
    this._value = convert(value) ;

    this.dep = new Set();
  }r

  get value() {
    // 收集依赖 
   trackRefValue(this);
    return this._value;
  }

  set value(newValue) {
    // 当新的值不等于老的值的话，还要考虑初始化时已经变成了代理对象，而set时是普通对象，所以不能直接hasChanged(newValue, this._value)了
    // 那么才需要触发依赖
    if(hasChanged(newValue, this._rawValue)){
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

export function trackRefValue(ref) {
  if (isTracking()) {
    trackEffects(ref.dep);
  }
}


export function ref(value) {
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
    } else {
      return Reflect.set(target, key, value, receiver);
    }
  },
};

// 这里没有处理 objectWithRefs 是 reactive 类型的时候
// TODO reactive 里面如果有 ref 类型的 key 的话， 那么也是不需要调用 ref.value 的
// （but 这个逻辑在 reactive 里面没有实现）
export function proxyRefs(objectWithRefs) {
  return new Proxy(objectWithRefs, shallowUnwrapHandlers);
}


export function unRef(ref) {
  return isRef(ref) ? ref.value : ref;
}

export function isRef(ref) {
  return !!ref._v_isRef
}


