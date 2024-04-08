import { h, getCurrentInstance } from "../../lib/guide-mini-vue.esm.js";
export const foo = {
    name: "foo",
    setup() {
        const instance = getCurrentInstance();
        console.log("Foo:", instance);
        return {};
    },

    render() {
        return h("div", {}, "foo");
    }
} 