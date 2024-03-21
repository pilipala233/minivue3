import { extend } from "./shared";



class ReactiveEffect{
  private _fn:any;
  deps = []
  active = true;
  onStop?:() => void;
  constructor(fn, public scheduler){
    this._fn = fn;
  }
  run(){
    activeEffect = this;
    return this._fn()

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
//   if(dep.has(activeEffect)) return;
   dep.add(activeEffect);
   //todo,这里是有问题的，存在依赖收集冗余。因为每次effect执行的时候都会执行一次track，所以会存在重复的依赖收集
   if(!activeEffect)return
   activeEffect.deps.push(dep);
}

function cleanupEffect(effect){
  effect.deps.forEach((dep:any) => {
    dep.delete(effect);
  });

}
export function trigger(target,key){
    let depsMap = targetMap.get(target);
    let dep = depsMap.get(key);
    for(const effect of dep){

      if(effect.scheduler){
        effect.scheduler();
      } else {
        effect.run();
      }
      
    }
}
let activeEffect;
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