# js基础



## 原型链

js中万物皆对象，每个对象都可以有一个原型_proto_，这个原型还可以有它自己的原型，以此类推，形成一个原型链。查找特定属性的时候，我们先去这个对象里去找，如果没有的话就去它的原型对象里面去，如果还是没有的话再去向原型对象的原型对象里去寻找...... 这个操作被委托在整个原型链上，这个就是我们说的原型链了。



原型 __proto\_\_

原型对象 prototype

![构造函数-原型对象-实例关系图By@若川](https://p1-jj.byteimg.com/tos-cn-i-t2oaga2asx/gold-user-assets/2019/2/18/169014cf74620047~tplv-t2oaga2asx-watermark.awebp)

```javascript
class Person {}
const person = new Person()
// 实例只有__proto__没有prototype
// 构造函数才有prototype
person.__proto__ // ->Person.prototype
Person.__proto__ // ->Function.prototype
Person.prototype.__proto__ // ->Object.prototype
Function.prototype.__proto__ // ->Obejct.prototype
Object.prototype.__proto__ // ->null
```









## 继承

实现继承

###### 原型链继承

父类的实例作为子类的原型

```javascript
function Person(){
    this.name = 'xin'
}
Person.prototype.sayHi = function(){
    console.log('hi')
}

function Student(){
	this.score = 100
}
Student.prototype = new Person()
Student.prototype.constructor = Student


```



###### 构造函数继承

```javascript
function Person(){
    this.name = 'xin'
}
Person.prototype.sayHi = function(){
    console.log('hi')
}

function Student(){
    Person.call(this)
	this.score = 100
}
Student.prototype = new Person()

```





## 代理



## 用js写个多维数组

arguments使用



## call / apply / bind

都是改变this指向

call 直接写参数

apply参数写成数组

bind返回的是函数



## eventLoop

Event Loop即事件循环，是指浏览器或Node的一种解决javaScript**单线程运行时不会阻塞的一种机制**，也就是我们经常使用异步的原理。

JavaScript代码的执行过程中，除了依靠函数调用栈来搞定函数的执行顺序外，还依靠任务队列(task queue)(先进先出)来搞定另外一些代码的执行

Javascript单线程任务被分为同步任务和异步任务，同步任务会在调用栈中按照顺序等待主线程依次执行（代码从上到下的执行），异步任务会在同步任务有了结果后，将注册的回调函数放入任务队列中等待主线程空闲的时候（调用栈被清空），被读取到栈内等待主线程的执行。

一个线程中，事件循环是唯一的，但是任务队列可以拥有多个。

任务队列又分为<u>macro-task</u>（宏任务）与<u>micro-task</u>（微任务），在最新标准中，它们被分别称为task与jobs。

macro-task大概包括：script(整体代码), setTimeout, setInterval, setImmediate, I/O, UI rendering。

micro-task大概包括: process.nextTick, Promise, Object.observe(已废弃), MutationObserver(html5新特性)

setTimeout/Promise等我们称之为任务源。而进入任务队列的是他们指定的具体执行任务。

来自不同任务源的任务会进入到不同的任务队列。其中setTimeout与setInterval是同源的。

事件循环的顺序，决定了JavaScript代码的执行顺序。它从script(整体代码)开始第一次循环（即宏任务）。之后全局上下文进入函数调用栈。直到调用栈清空(只剩全局)，然后执行所有的micro-task（微任务）。当所有可执行的micro-task（微任务）执行完毕之后。循环再次从macro-task（宏任务）开始，找到其中一个任务队列执行完毕，然后再执行所有的micro-task（微任务），这样一直循环下去。

一个简单的例子：

```javascript
setTimeout(function(){

      console.log('timeout1');

})

new Promise(function(resolve){

       console.log('promise1');
     
       for(var i =0; i <1000; i++) {
     
              i ==99&& resolve();
     
       }

console.log('promise2');

}).then(function(){

       console.log('then1');

})

console.log('global1')
//打印的顺序
// promise1

// promise2

// global1

// then1timeout1





```





```javascript
var a = '123'
var b = '456'

if(window.a){
	var c = '789'
}

console.log(a,b,c)
```



## ES6新特性

###### var，let，const

var / let 作用域

只有var允许重复声明



var声明的变量有变量提升，所以在声明前使用会报undefined

let声明的变量存在暂存死区，创建变量时并不会初始化，故会报错ReferenceError



const相对于let，声明的是一个只读变量，声明时需要初始化，声明后不允许改变值

但const只是保证变量指向的内存地址保存的数据不改动。对于原始值类型（undefined，null，boolean，number，string），值就直接保存在栈中，因此const声明的变量相当于常量；但对于对象类型（object，array，function），变量指向的内存地址实际上只保存了一个指针，const只保证指针不会被修改，但指针指向的数据可能被修改，如：

```javascript
const obj = {
  value: 1
}

obj.value = 2

console.log(obj) // { value: 2 }

obj = {} // TypeError: Assignment to constant variable
```





###### Promise



###### Class 类

类似java语法？



###### () => {} 箭头函数





###### Proxy(拦截器)





###### Reflect





## Promise

Promise是js中异步编程的一种解决方式，可以解决以往回调地狱的问题，把他们转化成链式并行的关系



Promise.all() 将多个Promise实例包装并返回一个新的Promise实例。只要多个实例中由出现任何一个reject，返回后就会直接进入reject状态。



Promise.race() 最先完成或者最先被拒绝的Promise会被采用作为返回值

Promise.then()







## 算法

###### 数组去重

1. indexOf+新数组

2. 对象属性唯一

`obj[arr[i]]`

3. es6的set

`return Array.from(new Set(arr))`



## Object.assign

只深拷贝一层（伪深拷贝）





## addEventListener相比于onxxxx(比如onmousedown)有什么优势？

相当于事件委托，可为同一对象定义许多依次执行且不覆盖的处理函数
