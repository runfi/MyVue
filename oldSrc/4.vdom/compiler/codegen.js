// gencode 的作用就是生成将 parse 生成的 ast，通过上面 render 函数生成 VNode 的字符串代码。

// 通过 gencode 生成的代码需要结合前面的 render 函数的参数来阅读，比如 _c 第一个参数是 tag，第二个参数是元素属性，第三个是子节点。

// 生成的代码也是类似 dom 树的嵌套结构，最外层是一个 node.type === 1 元素节点，使用 _c 函数，将元素属性通过第二个参数传入 VNode，其余元素按结构保存到第三个 children 参数中。

// 如果 node.type === 3 说明是纯文本节点，直接使用JSON.stringify(node.text)。

// 如果 node.type === 2 说明是带有变量的文本节点，使用 parse 生成的 node.expression。

export function generate(ast) {
    const code = ast ? genElement(ast) : '_c("div")'
    return `with(this){return ${code}}`
}

function genElement(el) {
    let code
    let data = genData(el)
    const children = el.inlineTemplate ? null : genChildren(el, true)
    code = `_c('${el.tag}'${
      data ? `,${data}` : '' // data
    }${
      children ? `,${children}` : '' // children
    })`
    return code
}


export function genChildren(el) {
    const children = el.children
    if (children.length) {
        const el = children[0]
        return `[${children.map(c => genNode(c)).join(',')}]`
    }
}

function genNode(node) {
    if (node.type === 1) {
        return genElement(node)
    } else if (node.type === 3 && node.isComment) {
        return `_e(${JSON.stringify(node.text)})`
    } else {
        return `_v(${node.type === 2
        ? node.expression
        :JSON.stringify(node.text)
      })`
    }
}

function genData(el) {
    let data = '{'
    if (el.attrs) {
        data += `attrs:${genProps(el.attrs)},`
    }
    if (el.props) {
        data += `domProps:${genProps(el.props)},`
    }
    if (el.events) {
        data += `on:${genHandlers(el.events)},`
    }
    data = data.replace(/,$/, '') + '}'
    return data
}

function genProps(props) {
    let staticProps = ``
    for (let i = 0; i < props.length; i++) {
        const prop = props[i]
        const value = prop.value
        staticProps += `"${prop.name}":${value},`
    }
    staticProps = `{${staticProps.slice(0, -1)}}`
    return staticProps
}

function genHandlers(events) {
    let res = '{'
    for (let key in events) {
        res += key + ':' + events[key].value
    }
    res += '}'
    return res
}