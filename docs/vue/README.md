# Vue

## 设计模式

MVVM？（vue，react，angular）

Model View View-Model，核心枢纽是View-Model这一层，使得各部分之间通信都是双向的（双向绑定）；

MVC则是单向的数据传递



## *生命周期

- beforeCreate
- created
- beforeMount
- mounted
- beforeUpdate
- updated
- beforeDestroy
- destroyed



通常在created或mounted进行数据请求，created此时已经拿到data了



## 组件间通信

###### 父传子

父组件使用v-bind，<child v-bind="xxx"/>，子组件中使用props接收

###### 子传父

子组件使用$emit触发一个事件进行传值，父组件使用v-on，<child v-on="changeVal">进行事件监听，在回调函数中取值

###### EventBus

利用一个新的Event作为Vue空实例，将$emit和$on挂载上去，实现任意两个组件传值

###### Vuex







## **Vue的响应式原理

### 什么是响应式？

数据驱动视图的自动更新，修改数据也会更新用到这份数据的视图

### Vue2/Vue3实现响应式的区别

- Vue2的响应式是基于`Object.defineProperty`实现的
- Vue3的响应式是基于ES6的`Proxy`来实现的

### Vue2

##### 核心思想

用`Obejct.defineProperty`为对象每个属性设置getter/setter实现数据拦截

##### 实现

```js
const data = {
    name: {
        value: "123"
    },
    age: 189,
    arr: [1, 2, 3],
};

const oldArrayProto = Array.prototype;
const newArrayProto = Object.create(oldArrayProto);
const arrayMethods = ["push", "pop", "shift", "unshift", "splice"];
arrayMethods.forEach((method) => {
    newArrayProto[method] = function () {
        // 绑定到Array.prototype上的方法，相当于加一层拦截器，Vue3中用Proxy
        console.log("更新视图操作...")
        oldArrayProto[method].call(this, ...arguments);
    }
});

function observer (target) {
    if (typeof target !== "object" || target === null) {
        return target
    }
    for (const key in target) {
        if (typeof target[key] === "object") {
            if (Array.isArray(target[key])) {
                target[key].__proto__ = newArrayProto;
            } else {
                // 递归深度监听，处理嵌套对象
                observer(target[key]);
            }
        } else {
            defineReactive(target, key);
        }
    }
}

// 响应式数据处理
function defineReactive (target, key) {
    Object.defineProperty(target, key, {
        get () {
            return target[key];
        },
        set (newValue) {
            target[key] = newValue;
            console.log("更新视图操作...");
        }
    })
}

// 变成响应式数据
observer(data);

data.arr.pop();
```

局限性：

在删除或者添加对象属性时(`delete data.age`,`data.test = "..."`)，`Object.defineProperty`无法处理

解决方案：

使用`Vue.delete`和`Vue.set`



### Vue3（读了源码的getter, track等方法）

##### 核心思想

基于effect, track, trigger, Proxy的发布-订阅模式，用es6的Proxy+Reflect实现数据拦截，自动收集依赖+自动通知更新

##### 实现

```js
const reactive = (target) => {
    const handler = {
        get(target, key, receiver) {
            track(target, key) // 属性被get时，触发track方法
            return Reflect.get(target, key, receiver) // 将Proxy中的receiver传入Reflect，保证Reflect中的this指向的是Proxy代理的对象
        },
        set(target, key, value, receiver) {
            if (target[key] === value) return
            Reflect.set(target, key, value, receiver)
            // 属性被set后（重点），调用trigger方法触发依赖更新
            // FIXME: 一定要先Reflect.set再trigger，否则trigger触发的effect使用的值是更新前的
            trigger(target, key)
        }
    }
    return new Proxy(target, handler)
}

// 1. 使用reactive
// const ref = (initValue) => {
//     return reactive({ value: initValue })
// }

// 2. 使用对象访问器object accessors(源码方式，优点是除了value，添加其他东西的操作空间更大)
const ref = (raw) => {
    const r = {
        get value() {
            track(r, 'value')
            return raw
        },
        set value(newVal) {
            if (newVal === raw) return

            raw = newVal
            trigger(r, 'value')
        }
    }
    return r
}

const targetMap = new WeakMap(); // WeakMap可以使用Object作为key
let product = reactive({ price: 5, quantity: 2 })
let salePrice = ref(0)
let total = 0

let activeEffect = null

const effect = (eff) => {
    activeEffect = eff // set activeEffect
    activeEffect() // run it
    activeEffect = null // unset activeEffect
}

const track = (target, key) => {
    if (!activeEffect) return

    let depsMap = targetMap.get(target)
    if (!depsMap) {
        targetMap.set(target, depsMap = new Map())
    }
    let dep = depsMap.get(key)
    if (!dep) {
        depsMap.set(key, dep = new Set())
    }

    dep.add(activeEffect)
}

const trigger = (target, key) => {
    let depsMap = targetMap.get(target)
    if (!depsMap) return
    let dep = depsMap.get(key)
    if (!dep) return

    dep.forEach(effect => effect())
}


effect(() => { total = salePrice.value * product.quantity }) // 通过传参的方式执行副作用函数
effect(() => { salePrice.value = product.price * 0.8 }) // 通过传参的方式执行副作用函数

console.log(`total: ${total}, salePrice: ${salePrice.value}`) // total: 8, salePrice: 4
product.quantity = 5
console.log(`total: ${total}, salePrice: ${salePrice.value}`) // total: 20, salePrice: 4
product.price = 10
console.log(`total: ${total}, salePrice: ${salePrice.value}`) // total: 40, salePrice: 8, salePrice和total实现了响应式更新
```



##### 为什么在Proxy拦截的get/set中使用Reflect.get/set替代target[key]?

简单来说，是为了控制target中this的指向，确保目标代理对象中访问器（getter/setter）使用this时指向的是被Proxy包过的代理对象而非原始对象（指向原始对象无法实现响应式）。Proxy中receiver的作用类似于this，传给Reflect后this就会指向Proxy代理对象，从而形成响应式的逻辑闭环。

**总而言之，Proxy是为了形成代理可以监听到get set，reflect是为了控制this保证监听一定能触发**





## Virtual DOM

Vue1.x   没有虚拟DOM，更新时直接操作真实DOM，性能损耗严重



Vue2.x  引入虚拟DOM，更重视**js的动态性**，手写render function，对更新性能、初始化性能更友好。

更新性能：Diff算法来查找差异

使用模板html，内含编译器，以此来检测哪些是静态内容（不变化的）

（1）开发者心智负担降低，

（2）静态的信息

静态节点标注可以加速Diff算法





#### 传统操作

数据改变 → 操作DOM →视图更新

#### 虚拟DOM

数据改变 → 虚拟DOM（计算变更） → 操作真实DOM（patch vnode到真实dom树上） → 视图更新

**总结：使用virtual DOM时，在对比前后节点后，程序会最大限度地寻找并复用老节点中现有的DOM元素，不变的不变，变化的移动或者更新，缺少的补上，多余的删除**

用js表达DOM结构，结构如下：

```js
{
    tag: 'div',
    props: {
        id: 'app',
        classname: 'container'
    },
    children: [
        {
            ....
        }
    ]
}
```



#### 虚拟DOM的好处（可以用snabbdom做实验）

1. 在节点更新时，一次性比较并修改真实DOM中需要修改的部分，最后再在真实DOM中进行重排和重绘，减少原本多次重排重绘的性能消耗和对于新dom结构的子节点解析时间
2. 虚拟DOM本质是js，因而可以更方便地跨平台操作





## Diff算法

#### Diff算法简述（虚拟DOM的核心）

![diff](./diff.png)

##### 流程

1. 遍历老虚拟dom
2. 遍历新虚拟dom
3. 重新排序

假设有1000个节点，就要计算1000^3次，开销太大！所以Vue中的Diff算法做了优化

##### 优化

1. 只比较树中同一层级（深度），不跨级比较

2. 标签名不同，直接删除，不继续深度比较
3. 标签名相同时，key相同，则认为是相同节点，不继续深度比较

1000个节点只用计算1000次





#### h函数（生成VNode）

![h函数](./h函数.png)

sel：选择器，data：属性值，children：子节点



#### patch函数（对于vNode关联上DOM元素，并插入新的DOM，删除旧的DOM）

##### 执行时期

1. 首次渲染时把vNode给patch上去
2. 在diff时把新的vNode给patch上去

##### patchVNode

1. 关联DOM
2. 判断新旧vNode结构异同







## Vue3特性

### Composition API

#### 1. setup()函数 -> Vue2.x中写在method和data中的可以写在里面

```typescript
import {defineComponent} from 'vue'
...
export default defineComponent({
	// created实例被完全初始化之前
	setup(props, context){

	}
})
```

###### setup函数的执行时期

![Vue2,3生命周期对比](./Vue2,3生命周期对比.png)





#### 2. ref() reactive()实现响应式引用(通过Vue3包了一层Proxy实现响应式)

ref: Proxy({value: xxx})这样



ref用于基本数据类型(number, boolean, string, null, undefined)

reactive用于引用数据类型(Object，其中包含Function, Array, Date)

```typescript
import {ref, reactive, defineComponent} from 'vue'
...

export default defineComponent({
	setup(props, context){
        let temp = ref(1)
        setTimeout(() => {
            temp.value = 2
        }, 1000)
	}
})
```



#### 3. toRefs()实现响应式解构赋值





## 面试题



### v-model和v-bind(:xxx="xx")的区别？

v-bind是**单向绑定**，只能由Vue实例的属性单向渲染到视图上，如:class="xxx", :class="xxx", :src="xxx"；

v-model是**双向绑定**，可以在视图更新时同时将更新传回属性更新属性，如input，textarea等表单元素可以使用v-model双向绑定来实时更新属性数据。
