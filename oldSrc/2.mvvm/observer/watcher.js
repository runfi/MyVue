import {
    pushTarget,
    popTarget
} from './dep'

export class Watcher {
    constructor(vm, expOrFn, cb) {
        this.cb = cb
        this.vm = vm
        this.getter = expOrFn
        this.deps = []
        this.newDeps = []
        this.depIds = new Set()
        this.newDepIds = new Set()
        this.value = this.get() // 实例化watcher的时候也会触发一次get
    }

    update() {
        this.run()
    }

    run() {
        const value = this.get()
        if (value !== this.value) {
            const oldValue = this.value
            this.value = value
            this.cb.call(this.vm, value, oldValue)
        }
    }

    get() {
        // 触发更新时，会先将当前的 watcher push 到 Dep.target 中，更新结束再 pop 出栈，这是因为当前 watcher 更新过程中，可能会触发另一个 watcher 的更新，比如子组件、computed、watch 也是 watcher。
        pushTarget(this)    // 触发get()的时候给Dep对象target属性赋值，并往栈中加入新的watcher
        const vm = this.vm
        const value = this.getter.call(vm, vm)
        popTarget() // watcher出栈
        this.cleanupDeps()
        return value
    }

    addDep(dep) {
        const id = dep.id
        if (!this.newDepIds.has(id)) {  // 在执行 addDep 时，会先判断是否已经订阅过该发布者，防止重复订阅。
            this.newDepIds.add(id)
            this.newDeps.push(dep)
            if (!this.depIds.has(id)) {
                // 依赖收集的核心，调用了dep.addSub方法传入了一个Watcher对象
                dep.addSub(this)
            }
        }
    }

    // 那么每次更新后为什么要触发 cleanupDeps 呢？因为某一次数据更新后，可能删除了对某个数据的依赖，当前 watcher 就不需要继续订阅该数据了。
    // watcher 中通过 deps 和 depIds 保存已经订阅的 dep，
    // 每次更新还会重新记录需要订阅的 newDeps 和 newDepIds
    // 每次更新完成后如果当前订阅的 dep.id 不在新的 newDepIds 中，就取消订阅。
    cleanupDeps() {
        let i = this.deps.length
        while (i--) {
            const dep = this.deps[i]
            if (!this.newDepIds.has(dep.id)) {
                dep.removeSub(this)
            }
        }
        // 用tmp作为交换赋值的中间变量
        // 把new 赋值给 old 并清空new来预备下次更新
        let tmp = this.depIds
        this.depIds = this.newDepIds
        this.newDepIds = tmp
        this.newDepIds.clear()
        tmp = this.deps
        this.deps = this.newDeps
        this.newDeps = tmp
        this.newDeps.length = 0
    }
}