import { h } from "../../lib/guide-mini-vue.esm.js";
import {Foo} from './foo.js'
 window.self =null
export const App ={
    name:'App',
    render(){
       window.self=this
        return h("div", {
            id:'root',
            class: ['red','hard'],
            onClick:()=>{console.log('click',this.msg)},
            onmousedown:()=>{console.log('mousedown')},
        },
        [h("div",{},'hi'+this.msg),h(Foo,{count:1}),])
        //    "hi, "+this.msg)
        //[h("p",{class:'red'},'hi'),h("p",{class:'blue'},'mini-vue'),])

    },
    setup(){
        return {
            msg: "mini-vue-haha"
        }
    }
}