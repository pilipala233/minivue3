import { render } from "./render";
import { createVNode } from "./vnode";

export function createApp(rootComponent) {
    return { 
        mount(rootContainer) {
            debugger
            const vnode = createVNode(rootComponent);
            
            render(vnode, rootContainer);
            
        }
    }
}
