
import { createVNode } from "./vnode";
//render
export function createAppAPI(render) {
    return function createApp(rootComponent) {
        return { 
            mount(rootContainer) {
                
                const vnode = createVNode(rootComponent);
                
                render(vnode, rootContainer);
                
            }
        }
    }
}


