import { h } from "../../lib/guide-mini-vue.esm.js";

export const Foo = {
    setup(props) {
        //return {
            console.log(props)
            props.count++
            // console.log(props)
            //count: props
       // }
    },
    render(){
        return h("div",{},"foo:"+this.count)
    }
}