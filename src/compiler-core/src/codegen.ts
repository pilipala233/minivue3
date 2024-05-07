import { isString } from "../../shared";
import { NodeTypes } from "./ast";
import { CREATE_ELEMENT_VNODE, TO_DISPLAY_STRING, helperMapName } from "./runtimeHelpers";


export function generate(ast: any) {

    const context: any = createCodegenContext();
    const { push } = context;

    genFunctionPreamble(ast, context);

    let code = "";
    code += "return"
    const functionName = "render"
    const args = ["_ctx", "_cache"]
    const signature = args.join(',')


    push(`function ${functionName}(${signature}){`)
    // code += `function ${functionName}(${signature}){`

    push("return ")
    // code += `return`;

    genNode(ast.codegenNode, context);

    push("}")
    // code += "}"

    return {
        code: context.code,
    }
}

function genFunctionPreamble(ast: any, context: any) {
    const { push } = context;
    const VueBinging = "Vue";
    const aliasHelper = (s) => `${helperMapName[s]}:_${helperMapName[s]}`;
    if (ast.helpers.length > 0) {
        push(`const { ${ast.helpers.map(aliasHelper).join(', ')} } = ${VueBinging}`);
    }

    push('\n');
    push("return ");
}

function genNode(node: any, context: any) {

    switch (node.type) {
        case NodeTypes.TEXT:
            genText(node, context);
            break;

        case NodeTypes.INTERPOLATION:
            genInterpolation(node, context);
            break;
        case NodeTypes.SIMPLE_EXPRESSION:
            genExpression(node, context);
            break;

        case NodeTypes.ELEMENT:
            genElement(node, context)
            break;

        case NodeTypes.COMPOUND_EXPRESSION:
            genCompoundExpression(node, context)
            break;
        default:
            break;
    }
}

function genElement(node: any, context: any) {

    const { push, helper } = context;
    const { tag, children, props } = node;
debugger
    push(`${helper(CREATE_ELEMENT_VNODE)}(`);
    genNodeList(genNullable([tag, props, children]), context);

    // genNode(children, context);

    push(")")
}
function genNodeList(nodes: any, context: any) {
    const { push } = context;
    for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];

        if (isString(node)) {
            push(node);
        } else {
            genNode(node, context);
        }

        if (i < nodes.length - 1) {
            push(",")
        }

    }
}

function genText(node: any, context: any) {
    const { push } = context;
    push(`'${node.content}'`);
}

function genInterpolation(node: any, context: any) {
    const { push, helper } = context;
    // console.log(node)
    push(`${helper(TO_DISPLAY_STRING)}(`)
    genNode(node.content, context)
    push(")")

}

function createCodegenContext(): any {

    const context = {
        code: "",
        push(source) {
            context.code += source;
        },
        helper(key) {
            return `_${helperMapName[key]}`
        }
    }

    return context;
}

function genExpression(node: any, context: any) {

    const { push } = context;

    push(`${node.content}`);
}

function genCompoundExpression(node: any, context: any) {

    const children = node.children;
    const { push } = context;
    for (let i = 0; i < children.length; i++) {
        const child = children[i];
        if (isString(child)) {

            push(child);
        } else {
            genNode(child, context);
        }
    }
}

function genNullable(arg0: any[]) {

    return arg0.map((arg) => arg || "null")
}

