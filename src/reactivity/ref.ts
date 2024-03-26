
import { isTracking, trackEffects, triggerEffects } from "./effect";
import { reactive } from "./reactive";
import { hasChanged, isObject } from "./shared";

export class RefImpl {

  private _value: any;
  public dep;
  private _rawValue
  constructor(value) {
    this._rawValue = value;
    this._value = convert(value) ;

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

export function proxyRefs(objectWithRefs) {
  
}

// 把 ref 里面的值拿到
export function unRef(ref) {
  
}

export function isRef(value) {
  
}


