import { h,  } from "../../lib/guide-mini-vue.esm.js";
import {foo} from "./foo.js";

export const App ={
  name: "App",
  setup() {
    return {}
  },

  render() {
    const app = h("div", {}, "App");
    //const fooc = h(foo, {}, [h("p", {}, "123"),h("p", {}, "456")]);
    const fooc = h(foo, {}, {
      header: ({age})=>h("p", {}, "123"+age),
      footer:()=>h("p", {}, "456")
    });
    //const fooc = h(foo, {}, h("p", {}, "123"));
    return h("div", {}, [app,fooc]);
  },
};
