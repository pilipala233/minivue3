import { NodeTypes } from "./ast";

const enum TagType {
    Start,
    End
}

export function baseParse(content: string) {

    const context = createParserContext(content);

    return createRoot(parseChildren(context, []));
}

function parseChildren(context, ancestors) {

    const nodes: any = [];

    while (!isEnd(context, ancestors)) {
        let node;
        const s = context.source;
        if (s.startsWith("{{")) {
            node = parseInterpolation(context);
        } else if (s[0] === "<") {
            if (/[a-z]/i.test(s[1])) {
                // console.log("parse element ");
                node = parseElement(context, ancestors);
            }
        }

        if (!node) {
            node = parseText(context);
        }
        nodes.push(node);
    }


    return nodes;
}

function isEnd(context, ancestors) {
    const s = context.source;
    //2.当遇到结束标签的时候

    if (s.startsWith("</")) {

        for (let i = ancestors.length - 1; i >= 0; i--) {
            const tag = ancestors[i].tag;

            if (startsWithEndTagOpen(s, tag)) {
                return true;
            }
        }
    }


    // if (parentTag && s.startsWith(`</${parentTag}>`)) {
    //     return true;
    // }

    //1.souce 有值的时候
    return !s;
}

function parseInterpolation(context) {

    // {{message}}
    const openDelimiter = "{{"
    const closeDelimiter = "}}"

    const closeIndex = context.source.indexOf("}}", openDelimiter.length);
    advaceBy(context, openDelimiter.length);
    const rawContentLength = closeIndex - openDelimiter.length;


    const rawContent = parseTextData(context, rawContentLength);  //context.source.slice(0, rawContentLength);
    const content = rawContent.trim();

    advaceBy(context, closeDelimiter.length);
    // context.source = context.source.slice(rawContentLength + closeDelimiter.length);


    return {
        type: NodeTypes.INTERPOLATION,
        content: {
            type: NodeTypes.SIMPLE_EXPRESSION,
            content: content,
        }
    }
}

function advaceBy(context: any, length: number) {
    context.source = context.source.slice(length);
}

function createRoot(children: any) {
    return {
        children,
    }
}

function createParserContext(content: string): any {
    return {
        source: content
    }
}

function parseElement(context: any, ancestors) {
    // Implement 
    //1. 解析 tag
    const element: any = parseTag(context, TagType.Start);
    ancestors.push(element);

    element.children = parseChildren(context, ancestors);
    ancestors.pop()


    console.log("---------------");
    console.log(element.tag);
    console.log(context.source);

    if (startsWithEndTagOpen(context.source, element.tag)) {
        parseTag(context, TagType.End);
    } else {
        throw new Error(`缺少结束标签:${element.tag}`);
    }

    console.log("------------------", context.source)
    return element;
}


function startsWithEndTagOpen(source, tag) {
    return source.startsWith("</") && source.slice(2, 2 + tag.length).toLowerCase() === tag.toLowerCase();
}



function parseTag(context: any, type: TagType) {
    const match: any = /^<\/?([a-z]*)/i.exec(context.source);
    console.log(match);
    const tag = match[1];
    //2. 删除处理完成的代码
    advaceBy(context, match[0].length);

    advaceBy(context, 1);
    if (type === TagType.End) return;

    return {
        type: NodeTypes.ELEMENT,
        tag
    };
}

function parseText(context: any): any {

    let endIndex = context.source.length;
    let endTokens = ["<", "{{"];

    for (let i = 0; i < endTokens.length; i++) {
        const index = context.source.indexOf(endTokens[i]);
        if (index !== -1 && endIndex > index) {
            endIndex = index;
        }

    }




    const content = parseTextData(context, endIndex);
    return {
        type: NodeTypes.TEXT,
        content
    }
}

function parseTextData(context: any, length: number) {
    //1.获取content
    const content = context.source.slice(0, length);
    //2. 推进
    advaceBy(context, length);
    return content;
}

