export function initProps(instance, rawProps) {
  console.log("initProps");

  // TODO
  // 应该还有 attrs 的概念

  instance.props = rawProps||{};
}
