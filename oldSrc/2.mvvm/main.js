import MyVue from './instance'

new MyVue({
    el: '#app',
    data: {
        count: 0,
        message: '这是一个message'
    },
    template: `
      <div>
          <h4>{{message}}</h4>
          <div>{{count}}</div>
          <button @click="addCount">addCount</button>
          <button @click="decCount">decCount</button>
      </div>
  `,
    methods: {
        // 相对第一篇 这里直接使用了this.count来修改值
        addCount() {
            this.count += 1
        },
        decCount() {
            this.count -= 1
        }
    }
})