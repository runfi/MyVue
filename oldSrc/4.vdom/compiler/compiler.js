import {
    generate
} from './codegen'

const vueCompiler = require('./vueCompiler')

const parse = vueCompiler.parse

export function templateToCode(template) {
    const ast = parse(template, {})  // 解析为ast
    return generate(ast)    // 生成VNode
}