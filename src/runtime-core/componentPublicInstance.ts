const publicPropertiesMap = {

    $el: (i) => i.vnode.el,

  };

export const PublicInstanceProxyHandlers = {
    get({_:instance},key){
        const {setupState} = instance;
        if(setupState !== undefined && key in setupState){
            return setupState[key];
        }
        const publicGetter = publicPropertiesMap[key];

        if (publicGetter) {
          return publicGetter(instance);
        }
    }
}
