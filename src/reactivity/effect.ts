


class ReactiveEffect{
  private _fn:any;
  deps = []
  constructor(fn, public scheduler){
    this._fn = fn;
  }
  run(){
    activeEffect = this;
    return this._fn()

  }
  stop(){
    this.deps.forEach((dep:any) => {
      //为什么这里这么写就可以删除全局targetMap中的dep,是因为activeEffect.deps.push的时候是整个引用，所以这里删除的时候也是删除的全局的targetMap中的dep
      dep.delete(this);
    });
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
   //这里是有问题的，存在依赖收集冗余。因为每次effect执行的时候都会执行一次track，所以会存在重复的依赖收集
   activeEffect.deps.push(dep);
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


  _effect.run();
  const runner:any = _effect.run.bind(_effect);
  runner.effect = _effect
  return  runner
}

export function stop(runner){
  runner.effect.stop();
}