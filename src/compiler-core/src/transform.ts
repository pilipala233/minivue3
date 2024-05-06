

export function transform(root, options?: any) {

    const context = createTransformContext(root, options)
    //1.遍历 - 深度优先搜索
    traversNode(root, context);

    //2. 修改 text content 


}

function traversNode(node: any, context) {


    const nodeTransforms = context.nodeTransforms;
    for (let i = 0; i < nodeTransforms.length; i++) {
        const fn = nodeTransforms[i];
        fn(node);

    }

    traverseChildren(node, context);
}
function traverseChildren(node: any, context: any) {
    const children = node.children;
    if (children) {
        for (let i = 0; i < children.length; i++) {
            const node = children[i];
            traversNode(node, context);
        }
    }
}

function createTransformContext(root: any, options: any) {
    const context = {
        root,
        nodeTransforms: options.nodeTransforms || [],
    }

    return context;
}

