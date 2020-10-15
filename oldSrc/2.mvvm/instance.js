/*** 
MyVue 需要解决跟第一篇不一样的三个问题（mvvm相关）
1. 通过 Object.defineProperty 修改 get 和 set 方法，实现订阅发布。
2. 为什么要用栈结构的 Dep.target 来存储当前 watcher ？
3. 为什么 watcher 每次更新后要 cleanupDeps，以及是如何 cleanupDeps 的？
****/

import { templateToDom } from './compiler'
import { observe } from './observer/index'
import { Watcher} from './observer/watcher'

export default class YourVue{
    constructor(options){
        this._init(options)
    }
    _init(options){
        this.$options = options
        if (options.data) initData(this)
        if (options.methods) initMethod(this)
        if (options.el) {
            this.$mount()
        }
    }
    $mount(){
        // this.update()
        const vm = this
        new Watcher(vm, vm.update.bind(vm), noop)
    }
    update(){
        let el = this.$options.el
        el = el && query(el)
        if(this.$options.template){
            this.el = templateToDom(this.$options.template, this)
            el.innerHTML = ''
            el.appendChild(this.el)
        }
    }
    setState(data){
        Object.keys(data).forEach(key => {
            this[key] = data[key]
        })
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

function initMethod(vm){
    let event = vm.$options.methods
    Object.keys(event).forEach(key => {
        vm[key] = event[key].bind(vm)
    })
}

function initData(vm){
    let data = vm.$options.data
    vm._data = data
    data = vm._data = typeof data === 'function'
        ? data.call(vm, vm)
        : data || {}
    Object.keys(data).forEach(key => {
        proxy(vm, '_data', key)
    })
    observe(data)   // 2.将data修改为可观测对象
}
function noop () {}
const sharedPropertyDefinition = {
    enumerable: true,
    configurable: true,
    get: noop,
    set: noop
}

function proxy (target, sourceKey, key) {
    sharedPropertyDefinition.get = function proxyGetter () {
        return this[sourceKey][key]
    }
    sharedPropertyDefinition.set = function proxySetter (val) {
        this[sourceKey][key] = val
    }
    Object.defineProperty(target, key, sharedPropertyDefinition)
}