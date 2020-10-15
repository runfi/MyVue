import {
    VNode
} from '../vdom/vnode'

export function initRender(vm) {
    // _c 创建正常的带有 tag 的 VNode
    vm._c = createElement

    // _v 创建文本节点对应的 VNode
    vm._v = createTextVNode

    //_s 就是将变量转成字符串的 toString 函数
    vm._s = toString

    // _e 用来创建一个空的 VNode 节点
    vm._e = createEmptyVNode
}

// 这其中 createElement 时需要把 children 展开一层，如果 children 中某个子元素是数组，就把子元素数组中的元素 concat 到 children 上。

// 因为 children 中都应该是 VNode，像后面会实现的 v-for 和 slot 都向 children 中添加了数组元素，其实这些数组元素中的 VNode 和 children 中的 VNode 是并列的 dom 元素，所以将子元素只展开了一层。
function createElement(tag, data = {}, children = []) {
    children = simpleNormalizeChildren(children)
    return new VNode(tag, data, children, undefined, undefined)
}

export function createTextVNode(val) {
    return new VNode(undefined, undefined, undefined, String(val))
}

export function toString(val) {
    return val == null ?
        '' :
        Array.isArray(val) ?
        JSON.stringify(val, null, 2) :
        String(val)
}

export function createEmptyVNode(text) {
    const node = new VNode()
    node.text = text
    node.isComment = true
    return node
}

export function simpleNormalizeChildren(children) {
    for (let i = 0; i < children.length; i++) {
        if (Array.isArray(children[i])) {
            return Array.prototype.concat.apply([], children)
        }
    }
    return children
}