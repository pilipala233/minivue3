import { h ,ref} from "../../lib/guide-mini-vue.esm.js";


export const App ={
  name: "App",
  setup() {
    const msg = ref("0");
    const onClick = () => {
      msg.value++;
    };


    return { msg, onClick };
  },

  render() {
    return h("div", {
      id:"root"
    }, [
      h("div", {}, "count: " + this.msg),
      h(
        "button",
        {
          onClick: this.onClick ,
        },
        "click"
      )
    ]);
  },
};
