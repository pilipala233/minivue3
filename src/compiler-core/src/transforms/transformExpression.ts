import { NodeTypes } from "../ast";


export function transformExpression(node) {
    if (node.type === NodeTypes.INTERPOLATION) {
        node.content = processExprssion(node.content);
    }
}

function processExprssion(node: any) {
    node.content = `_ctx.${node.content}`;
    return node;
}