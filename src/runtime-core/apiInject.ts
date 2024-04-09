import { getCurrentInstance } from "./component";

export function provide(key, value) {
    const currentInstance:any = getCurrentInstance();
    if(currentInstance){
        let {provides} = currentInstance;
        const parentprovides = currentInstance.parent;
        if(parentprovides === provides){
           provides = currentInstance.provides = Object.create(parentprovides);
        }
       
        provides[key] = value;
    }
}
export function inject(key,defaultVal) {
    const currentInstance:any = getCurrentInstance();
    if(currentInstance){
        const {provides} = currentInstance;
        if(key in provides){
            return provides[key];
        }else if(defaultVal){
            if(typeof defaultVal === 'function'){
                return defaultVal();
            }
            return defaultVal;

        }

    }


}