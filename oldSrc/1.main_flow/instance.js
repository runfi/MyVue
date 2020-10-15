/*** 
MyVue 需要解决三个问题
1. 实现data和methods通过this访问
2. 实现template模版转换为dom元素
3. 将事件绑定到dom元素上面
****/

import { templateToDom } from './compiler.js'

export default class MyVue {
    constructor(options) {
        // 这里就是传参进来myVue然后，进行实例化的方法啦
        this._init(options)
    }

    _init(options) {
        this.$options = options
        if(options.data) initData(this)  // 处理data对象
        if(options.methods) initMethod(this) // 处理methods对象
        if(options.el) {    // 判断挂载点
            this.$mount()
        }
    }

    $mount() {
        this.update()
    }

    update() {
        let el = this.$options.el
        el = el && query(el) // 直接使用某个节点挂载，或者通过id寻找节点，el是一个节点对象

        if(this.$options.template) {  
            // 注意 这里是this.el，而不是el
            // 把模版解析问dom对象，并挂载到根节点上
            this.el = templateToDom(this.$options.template, this) 
            el.innerHTML = ''
            el.appendChild(this.el)
        }
    }

    setState(data) {
        Object.keys(data).forEach(key => {
            this[key] = data[key]
        })
        // 每次更新data，要触发页面渲染
        this.update()
    }
}


function query(el){
    if(typeof el === 'string'){
        const selected = document.querySelector(el)
        if(!selected){
            return document.createElement('div')
        }
        return selected
    }else{
        return el
    }
}

// 问题一 （实现data和methods通过this访问）
// Vue 是通过 Object.defineProperty 修改了 this 的 get 和 set 函数，这样当访问 this.count 的时候，其实ijiushi访问this._data.count

function initData(vm) {
    let data = vm.$options.data
    vm._data = data

    // call方法调用一个对象的一个方法，以另一个对象替换当前对象。
    // 特定的作用域中调用函数，等于设置函数体内this对象的值，以扩充函数赖以运行的作用域。
    // data.call(vm) 使用vm的上下文代替了data的上下文，这时候的this指向vm
    // call方法的第一个参数是this的指向对象，之后的参数是 function data(p1, p2, p3)的p1, p2, p3 按顺序
    data = vm._data = typeof data === 'function'
        ? data.call(vm, vm)  // 同时导入data方法的上下文this和函数参数
        : data || {}
    Object.keys(data).forEach(key => {
        proxy(vm, '_data', key)
    })
}

function initMethod(vm) {
    const event  = vm.$options.methods
    Object.keys(event).forEach(key => {

        // bind方法调用一个对象的一个方法，以另一个对象替换当前对象。
        // 特定的作用域中调用函数，等于设置函数体内this对象的值，以扩充函数赖以运行的作用域。
        // event.bin(vm) 使用vm的上下文代替了event的上下文，这时候的this指向event
        // bind跟call不一样的是，bind返回的是一个函数，call返回的是函数执行后的结果
        vm[key] = event[key].bind(vm)
    })
}

function noop () {}
const sharedPropertyDefinition = {
    enumerable: true,
    configurable: true,
    get: noop,
    set: noop
}

function proxy(target, sourceKey, key) {
    
    sharedPropertyDefinition.get = function proxyGetter() {
        return this[sourceKey][key]
    }
    sharedPropertyDefinition.set = function proxySetter(val) {
        this[sourceKey][key] = val
    }
    
    /*方法说明
    *@method defineProperty
    *@param obj 必需，目标对象
    *@prarm prop 必需。需要定义或修改的属性的名字
    *@param descriptor 必需。目标属性所拥有的特性
    *@return {返回值类型} 返回值说明
    */
    // 值得注意的是，这里是key 就是this.data.xxx的xxx
    // 可以大致这么理解在这里改写成为了vm.key = sharedPropertyDefinition
    // 从而可以通过 this.xxx / vm.xxxx 进行访问
    Object.defineProperty(target, key, sharedPropertyDefinition)
}

// 问题二 （实现template模版转换为dom元素）
// 问题三（将事件绑定到dom元素上面）
// 解析templte ---> compiler.js
// https://www.yuque.com/docs/share/484b9d01-91f2-4525-93d6-9a674a86c736?#（密码：uoow） 《template 模板是怎样通过 Compile 编译的》