import { h, renderSlots } from "../../lib/guide-mini-vue.esm.js";;
export const foo ={
  name: "foo",
  setup(props, context) {},
  render() {
    const foo = h("p",{},"foo")
    console.log(this.$slots)
    const age =18
    return h("div", {}, [
      renderSlots(this.$slots,'header',{
        age
      }),
      foo,
      renderSlots(this.$slots,'footer')
    ]); 
  },
};
