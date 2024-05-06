

export function generate(ast: any) {

    const context: any = createCodegenContext();
    const { push } = context;
    push("return ")
    let code = "";
    code += "return"
    const functionName = "render"
    const args = ["_ctx", "_cache"]
    const signature = args.join(',')


    push(`function ${functionName}(${signature}){`)
    // code += `function ${functionName}(${signature}){`

    push("return")
    // code += `return`;

    genNode(ast.codegenNode, context);

    push("}")
    // code += "}"

    return {
        code: context.code,
    }
}

function genNode(node: any, context: any) {

    const { push } = context;
    push(` '${node.content}'`)

}


function createCodegenContext(): any {

    const context = {
        code: "",
        push(source) {
            context.code += source;
        }
    }

    return context;
}

