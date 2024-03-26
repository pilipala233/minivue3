import { extend } from "./shared";
let activeEffect;
let shouldTrack;

class ReactiveEffect{
  private _fn:any;
  deps = []
  active = true;
  onStop?:() => void;
  constructor(fn, public scheduler){
    this._fn = fn;
  }
  run(){
   
    //1.会收集依赖
    // shouldTrack  做区分
    
    if(!this.active){
      //执行过stop会跑这个
      return this._fn()
    }else {
      activeEffect = this;
      //console.dir(activeEffect._fn)
      shouldTrack = true;
      const result = this._fn();
      shouldTrack = false;
      return result;
    }


  }
  stop(){

    if(this.active){
      cleanupEffect(this);
      if(this.onStop){
        this.onStop();
      }
      this.active = false;
    }

  }

}

const targetMap = new Map();
export function track(target,key){
  if(!isTracking())return

  // target -> key -> dep
  let depsMap = targetMap.get(target);
  if(!depsMap){
    depsMap = new Map();
    targetMap.set(target,depsMap);  
  }
  let dep = depsMap.get(key);
  if(!dep){
    dep = new Set();
    depsMap.set(key,dep)
  }

  trackEffects(dep)

}

export function isTracking(){
  return shouldTrack && activeEffect !== undefined;
}

function cleanupEffect(effect){
  effect.deps.forEach((dep:any) => {
    dep.delete(effect);
  });
  effect.deps.length = 0;
}
export function trackEffects(dep){
  if(dep.has(activeEffect)) return;
   dep.add(activeEffect);
  
   
   activeEffect.deps.push(dep);
}
export function trigger(target,key){
    let depsMap = targetMap.get(target);
    let deps = depsMap.get(key);
    triggerEffects(deps)
}

export function triggerEffects(deps){
  for(const effect of deps){

    if(effect.scheduler){
      effect.scheduler();
    } else {
      effect.run();
    }
    
  }
}

export function effect(fn,options: any= {}){
  //fn
  
  const _effect = new ReactiveEffect(fn,options.scheduler);

  // 把用户传过来的值合并到 _effect 对象上去
  // 缺点就是不是显式的，看代码的时候并不知道有什么值
  extend(_effect, options);

  _effect.run();
  const runner:any = _effect.run.bind(_effect);
  runner.effect = _effect
  return  runner
}

export function stop(runner){
  runner.effect.stop();
}