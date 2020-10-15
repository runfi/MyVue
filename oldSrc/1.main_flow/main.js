// main.js
import MyVue from './instance.js'

// 一个基础的Vue模版，总得有个MyVue的Class吧
new MyVue({
    el: "#app",
    data: {
        count: 0,
    },
    // 一个简单的增加数字的模版
    template: `
        <div>
            <div>{{count}}</div>
            <button @click="addCount">addCount</button>
        </div>
    `,
    methods: {
        addCount() {
            const count = this.count + 1
            this.setState({  // 现在还没有双向绑定，先通过setState更新
                count
            })
        }
    }
})