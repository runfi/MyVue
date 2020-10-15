/*
 * not type checking this file because flow doesn't play well with
 * dynamically accessing methods on Array prototype
 */

/**
 * Define a property.
 */

export function def(obj, key, val, enumerable) {
    /*方法说明
     *@method defineProperty
     *@param obj 必需，目标对象
     *@prarm prop 必需。需要定义或修改的属性的名字
     *@param descriptor 必需。目标属性所拥有的特性
     *@return {返回值类型} 返回值说明
     */
    Object.defineProperty(obj, key, {
        value: val,
        enumerable: !!enumerable,
        writable: true,
        configurable: true,
    })
}

const arrayProto = Array.prototype
// Object.create方法创建一个新对象，使用现有的对象来提供新创建的对象的__proto__。
export const arrayMethods = Object.create(arrayProto)


const methodsToPatch = [
    // 这些方法会改变数组本身，而concat等是返回新数组
    'push',
    'pop',
    'shift',
    'unshift',
    'splice',
    'sort',
    'reverse'
]

/**
 * Intercept mutating methods and emit events
 */
methodsToPatch.forEach(function (method) {
    // cache original method
    const original = arrayProto[method]
    def(arrayMethods, method, function mutator(...args) {
        const result = original.apply(this, args)
        const ob = this.__ob__
        let inserted
        switch (method) {
            case 'push':
            case 'unshift':
                inserted = args
                break
            case 'splice':
                inserted = args.slice(2)
                break
        }
        if (inserted) ob.observeArray(inserted)
        // notify change
        ob.dep.notify()
        return result
    })
})