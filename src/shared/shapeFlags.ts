// 组件的类型
export const enum ShapeFlags {
    // 最后要渲染的 element 类型
    ELEMENT = 1,
    // 组件类型
    STATEFUL_COMPONENT = 1 << 1, //10
    // vnode 的 children 为 string 类型
    TEXT_CHILDREN = 1 << 2,//100
    // vnode 的 children 为数组类型
    ARRAY_CHILDREN = 1 << 3,//1000
    // vnode 的 children 为对象类型
    SLOT_CHILDREN = 1 << 4,//10000
  }
  