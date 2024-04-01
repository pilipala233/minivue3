# minivue3
一个跟着催学社学vue3源码的练习项目，目标是打造一个minivue


### Tasking

#### runtime-core

- [x] 支持组件类型
- [x] 支持 element 类型
- [x] 初始化 props
- [ ] setup 可获取 props 和 context
- [ ] 支持 component emit
- [ ] 支持 proxy
- [ ] 可以在 render 函数中获取 setup 返回的对象
- [ ] nextTick 的实现
- [ ] 支持 getCurrentInstance
- [ ] 支持 provide/inject
- [ ] 支持最基础的 slots
- [ ] 支持 Text 类型节点
- [x] 支持 $el api
- [ ] 支持 watch
- [ ] 支持 watchEffect


#### reactivity

目标是用自己的 reactivity 支持现有的 demo 运行

- [x] reactive 的实现
- [x] ref 的实现
- [x] readonly 的实现
- [x] computed 的实现
- [x] track 依赖收集
- [x] trigger 触发依赖
- [x] 支持 isReactive
- [x] 支持嵌套 reactive
- [x] 支持 toRaw
- [x] 支持 effect.scheduler
- [x] 支持 effect.stop
- [x] 支持 isReadonly
- [x] 支持 isProxy
- [x] 支持 shallowReadonly
- [x] 支持 proxyRefs

### compiler-core
- [ ] 解析插值
- [ ] 解析 element
- [ ] 解析 text

### runtime-dom
- [ ] 支持 custom renderer 

### runtime-test
- [x] 支持测试 runtime-core 的逻辑


### example

通过 server 的方式打开 example/\* 下的 index.html 即可


### 从零到一实现一遍

课程目录如下:

1. vue3 源码结构的介绍
2. reactivity 的核心流程
3. runtime-core 初始化的核心流程
4. runtime-core 更新的核心流程
5. setup 环境 -> 集成 jest 做单元测试 & 集成 typescript
6. 实现 effect 返回 runner
7. 实现 effect 的 scheduler 功能
8. 实现 effect 的 stop 功能
9. 实现 readonly 功能
10. 实现 isReactive 和 isReadonly 
11. 优化 stop 功能
12. 实现 reactive 和 readonly 嵌套对象转换功能
13. 实现 shallowReadonly 功能
14. 实现 isProxy 功能
15. 实现 isProxy 功能
16. 实现 ref 功能
17. 实现 isRef 和 unRef 功能
18. 实现 proxyR 功能
19. 实现 computed 计算属性功能
20. 实现初始化 component 主流程
21. 实现 rollup 打包
22. 实现初始化 element 主流程
23. 实现组件代理对象
24. 实现 shapeFlags
25. 实现注册事件功能
26. 实现组件 props 功能
27. 实现组件 emit 功能
28. 实现组件 slots 功能
29. 实现 Fragment 和 Text 类型节点
30. 实现 getCurrentInstance 
31. 实现依赖注入功能 provide/inject
32. 实现自定义渲染器 custom renderer
33. 更新 element 流程搭建
34. 更新 element 的props
35. 更新 element 的 children
36. 双端对比 diff 算法1
37. 双端对比 diff 算法2 - key 的作用
38. 双端对比 diff 算法3 - 最长子序列的作用
39. 学习尤大解决 bug 的处理方式
40. 实现组件更新功能
41. 实现 nextTick 功能
42. 编译模块概述
43. 实现解析插值功能
44. 实现解析 element 标签
45. 实现解析 text 功能
46. 实现解析三种联合类型 template
47. parse 的实现原理&有限状态机
48. 实现 transform 功能
49. 实现代码生成 string 类型
50. 实现代码生成插值类型
51. 实现代码生成三种联合类型
52. 实现编译 template 成 render 函数


课程内部包含了 vue3 的三大核心模块：reactivity、runtime 以及 compiler 模块

