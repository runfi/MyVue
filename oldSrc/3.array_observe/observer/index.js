/*** 
 * 依赖收集流程
 * observe ->
 * walk ->
 * defineReactive ->
 * get ->
 * dep.depend() ->
 * watcher.addDep(new Dep()) ->
 * watcher.newDeps.push(dep) ->
 * dep.addSub(new Watcher()) ->
 * dep.subs.push(wathcer)
 * 最终watcher.newDeps数组中存放dep列表，dep.subs数组中存放watcher列表。
 * 参考：https://segmentfault.com/a/1190000014360080
 * ***/

import {
    Dep
} from './dep'
import { def, arrayMethods } from './array'

class Observer {
    constructor(value) {
        this.value = value
        this.dep = new Dep()
        def(value, '__ob__', this)
        if(Array.isArray(value)) {  // 相对2 在这里加多了数组的判断以及数组观察的处理
            value.__proto__ = arrayMethods
            this.observeArray(value)
        } else {
          this.walk(value)  
        }
    }

    walk(value) {
        // 遍历data，对data的每个属性都进行defineReactive
        Object.keys(value).forEach(function(key) {
            // 观测对象数据，defineReactive 为数据定义 get 和 set ，即数据劫持
            defineReactive(value, key, value[key])
        })
    }

    observeArray(value){
        value.forEach(item => {
            observe(item)
        })
    }
}

export function observe(value) {
    if(!value || typeof value !== 'object') {
        return;
    }
    return new Observer(value)
}

function defineReactive(value, key, val) {
    // 依赖收集器，属性都会有一个dep，方便发生变化时能够找到对应的依赖触发更新
    // value 中的每个 key 都会 new 一个 dep 作为消息分发器
    // 当有 watcher get 该数据时，会将当前 watcher 订阅到该 dep 上，当数据发生改变时（set），通过 dep 触发所有订阅 watcher 的 update 函数。
    const dep = new Dep();
    let childOb = observe(val)  // 递归处理data.obj
    // 重新get和set
    Object.defineProperty(value, key, {
        enumerable: true,
        configurable: true,
        get: function() {
            if(Dep.target) {
                // 这个dep是闭包对象
                dep.depend();
                if(childOb) {
                    childOb.dep.depend()
                }
            }
            return val;
        },
        set: function(newVal) {
            if(newVal === val) {
                return;
            }
            val = newVal
            dep.notify()
        }
    })
}