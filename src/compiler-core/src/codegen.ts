import { NodeTypes } from "./ast";
import { TO_DISPLAY_STRING, helperMapName } from "./runtimeHelpers";


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
        default:
            break;
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

