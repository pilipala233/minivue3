
import { ref } from "../../../lib/guide-mini-vue.esm.js";

export default{
    name: "App",
    template: `<div>h1,{{count}}</div>`,
    setup() {
        const count = window.count = ref(100);
        return {
            count,
        }
    }
}
