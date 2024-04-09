// 组件 provide 和 inject 功能
import {
  h,
  provide,
  inject,
} from "../../lib/guide-mini-vue.esm.js";

const ProviderOne = {
  name: "Provider",
  setup() {
    provide("foo", "fooVal");
    provide("bar", "barVal");
    
  },
  render() {
    return h("div", {}, [h("p", {}, "Provider"),h(ProviderTwo)]);
  }
};

const ProviderTwo = {
  name: "ProviderTwo",
  setup() {
    provide("foo", "fooValTwo");
    const foo = inject("foo");
    //provide("bar", "barValTwo");
    return {
      foo
    }
    
  },
  render() {
    return h("div", {}, [h("p", {}, `ProviderTwo foo:${this.foo}`),h(Consumer)]);
  }
};


const Consumer = {
  name: "Consumer",
  setup() {
    const foo = inject("foo");
    const bar = inject("bar");
    const baz = inject("baz",()=>"bazVal");
    return{
      foo,
      bar,
      baz
    }

  },
  render() {
    return h("div", {}, `Consumer:-${this.foo}-${this.bar}-${this.baz}`);
  }
};

export default {
  name: "App",
  setup() {
    
  },
  render() {
    return h("div", {}, [h("p", {}, "apiInject"), h(ProviderOne)]);
  }
};
