let uid = 0

export class Dep {
    constructor() {
        this.id = uid++
        this.subs = []  // Dep 中，subs 用来存储所有订阅者。
    }
    
    // 添加 watcher 到数组中，也就是添加依赖
    addSub(sub) {
        // 最终在dep执行了以下内容，也就是在subs数组中push了一个Watcher对象
        this.subs.push(sub)
    }

    // 属性在变化时会调用 notify 方法，通知每一个依赖进行更新
    // 修改其中的数据时 (set)，会执行dep.notify()，执行所有订阅 watcher 的update函数。
    // this.subs 保存的是所有订阅者
    notify() {
        this.subs.forEach(sub => sub.update())
    }

    // 当读取该数据时 (get)，会执行dep.depend()，执行当前 watcher 的addDep函数。
    // 数据收集依赖的主要方法，Dep.target 是一个 watcher 实例
    depend() {
        if(Dep.target) { // 这个Dep.target是一个实例化的全局watcher对象
            // 这里调用了watcher.addDep(this)方法，传入了刚刚闭包中的dep对象
            // watcher.addDep(this) 这样理解会好些
            // 这个this 我传递我自己
            Dep.target.addDep(this)
        }
    }
}

// Dep.target 用来记录 watcher 实例，是全局唯一的，主要作用是为了在收集依赖的过程中找到相应的 watcher
Dep.target = null
const targetStack = []

export function pushTarget(_target) {
    if(Dep.target) targetStack.push(Dep.target) // 把传进来的watcher对象复制给Dep.target
    Dep.target = _target
}

export function popTarget() {
    Dep.target = targetStack.pop()
}