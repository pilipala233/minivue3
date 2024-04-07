const publicPropertiesMap = {

    $el: (i) => i.vnode.el,
    $slots: (i) => i.slots,

  };

export const PublicInstanceProxyHandlers = {
    get({_:instance},key){
        const {setupState,props} = instance;
        const hasOwn = (o,k)=>Object.prototype.hasOwnProperty.call(o,k);
        if(hasOwn(setupState,key)){
            return setupState[key];
        }else if(hasOwn(props,key)){
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
    
}
