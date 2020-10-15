import YourVue from './instance'

new YourVue({
    el: '#app',
    data: {
        count: 0,
        message: 'message'
    },
    template: `
      <div>
          <div>{{count}}</div>
          <button @click="addCount">addCount</button>
          <h4>{{message}}</h4>
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