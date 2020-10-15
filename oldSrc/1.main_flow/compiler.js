/*** 
最终解析出来的ast大概长这样
{
    type: 1
    tag: "div"
    children: [{…}, {…},
        {
            type: 1 
            tag: "button"
            attrsMap: {@click: "addCount"}
            children: [{type: 3, text: "addCount", parent: button}]
            events: {click: ƒ}
            parent: div
        }
    ]
}
 * ****/

// 解析这部分直接用了Vue原本的（太噩梦了这块，我学废了）
const vueCompiler = require('./vueCompiler.js')

const parse = vueCompiler.parse

export function templateToDom(template, app){
    const ast = parse(template, app)
    const root = createDom(ast, app)
    return root
}

// 问题二
// ast 中的 type 分为三种，type 为1表示 dom节点，type 为3表示纯文本节点，type 为2表示带有变量的文本节点。
function createDom(ast, app) {
    if(ast.type === 1) {
        const root = document.createElement(ast.tag) 
        
        // 遍历ast中的子节点ast，生成dom节点
        ast.children.forEach(child => {
            child.parent = root
            createDom(child, app)
        })
        // 如果当前ast存在父节点，挂载
        if(ast.parent){
            ast.parent.appendChild(root)
        }
        if(ast.events){
            // 如果存在事件，则通过下面方法绑定
            // 解决问题三
            updateListeners(root, ast.events, {}, app)
        }
        return root
    }else if(ast.type === 3 && ast.text.trim()) {
        ast.parent.textContent = ast.text
    }else if(ast.type === 2) {
        let res = ''
        ast.tokens.forEach(item => {
            if(typeof item === 'string'){
                res += item
            }else if(typeof item === 'object'){
                res += app[item['@binding']]
            }
        })
        ast.parent.textContent = res
    }
}

// 问题三
// 生成的 ast 中会记录这个元素上的事件和事件对应的函数{click: ƒ}，但是并不是直接把这个函数添加到事件上，而是包装了一层invoker函数，这样当绑定的函数发生变化的时候，不用重新解绑再绑定。而是每次执行该函数的时候去寻找要执行的函数。
//  updateListeners(root, ast.events, {}, app)
function updateListeners(elm, on, oldOn, context) {
    for(let name in on) {   // 遍历事件
        let cur = context[on[name].value]
        let old = oldOn[name]
        if(isUndef(old)) {  // 旧节点不存在
            if(isUndef(cur.fns)) {      // createFunInvoker返回事件最终执行的回调函数
                cur = on[name] = createFnInvoker(cur)
            }
            elm.addEventListener(name, cur)
        }else if (event !== old){
            old.fns = cur
            on[name] = old
        }
    }
    for (let name in oldOn) {   // 旧节点存在，解除旧节点上的绑定事件
        if (isUndef(on[name])) {
             // 移除事件监听
            elm.removeEventListener(name, oldOn[name])
        }
    }
}

function createFnInvoker(fns){
    function invoker () {
        const fns = invoker.fns
        return fns.apply(null, arguments)
    }
    invoker.fns = fns
    return invoker
}

function isDef (v) {
    return v !== undefined && v !== null && v != []
}

function isUndef(v){
    return v === undefined || v === null || v === ''
}