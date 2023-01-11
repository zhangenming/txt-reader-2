import './debug'
import './App.css'
import React, {
  Component,
  createContext,
  memo,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import ReactDOM from 'react-dom/client'
import App_1 from './App'
import App_2 from './App2'
import App_3 from './App3'
import { hasFeature } from './utils'

setTimeout(() => {
  ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
    // App()
    hasFeature('app2') ? <App4 /> : <App_1 />
  )
})
function App5(params: type) {
  const [count, setCount] = useState(0)
  return (
    <>
      <button onClick={() => setCount(count + 1)}>Increment</button>
      <button onClick={() => setCount(count - 1)}>Decrement</button>
      <CountLabel count={count} />
    </>
  )
}

function CountLabel({ count }) {
  const r = useRef(count)

  const x =
    r.current !== count
      ? count > r.current
        ? 'increasing'
        : 'decreasing'
      : undefined

  r.current = count

  return (
    <>
      <h1>{count}</h1>
      {x && <p>The count is {x}</p>}
    </>
  )
}
function AppQ1() {
  const [s, setS] = useState(0)
  setS(0)
  // useEffect(()=>{
  //   setS(0)
  // })
  console.log(11)

  return s
}

function App4() {
  const [value, setValue] = React.useState(0)

  return (
    <div>
      <button onClick={() => setValue(v => v + 1)}>{value}</button>
      <App441 v={value} />
      {/* <App442 v={value} /> */}
      {/* <App443 v={value} /> */}
    </div>
  )
}
function App441({ v }) {
  let [myV, setMyV] = React.useState(v)

  // console.log(1)
  useEffect(() => {
    // console.log(2)
    setMyV(v)
  }, [v])
  // console.log(3)

  const oldV = React.useRef(v)
  const oldV2 = oldV.current
  oldV.current = v
  if (v !== oldV2) {
    return
    return (
      <div>
        <img
          src="https://image.zhangxinxu.com/image/blog/202211/leisa.jpg" //两次render 会渲染出来
          alt=""
        />
      </div>
    )
  }
  return (
    <div>
      <div> v:{v} </div>
      <div>myV: {myV} </div>
      <button
        onClick={() => {
          setMyV(v => v + 1)
        }}
      >
        btn
      </button>
    </div>
  )
}
function App442({ v }) {
  let [myV, setMyV] = React.useState(v)

  console.log(1)
  useMemo(() => {
    console.log(2)
    setMyV(v)
  }, [v])

  console.log(3)
  // 下面的jsx 无论如何都会执行两次, 只不过render执行了一次

  return (
    <div>
      <div> v:{v} </div>
      <div>myV: {myV} </div>
      <button
        onClick={() => {
          setMyV(v => v + 1)
        }}
      >
        btn
      </button>
    </div>
  )
}
function App443({ v }) {
  let [myV, setMyV] = React.useState(v)

  const oldV = React.useRef(v)
  const oldV2 = oldV.current
  oldV.current = v
  if (v !== oldV2) {
    setMyV(v) // 设置后下面的jsx已经失效state过期, 不需要执行
    return (
      <div>
        <img
          src="https://image.zhangxinxu.com/image/blog/202211/leisa.jpg" //只render第二次, 第一次render取消 所以这里不加载
          alt=""
        />
      </div>
    )
  }

  console.log(1)
  return (
    <>
      <div> v:{v} </div>
      <div>myV: {myV} </div>
      <button
        onClick={() => {
          setMyV(v => v + 1)
        }}
      >
        btn
      </button>
    </>
  )
}
function App3() {
  const [flag, setFlag] = React.useState(false)
  const [value, setValue] = React.useState(0)

  console.log('render')

  useEffect(() => {
    if (flag && !value) {
      console.log('init')
      setValue(1)
    }
  }, [flag])

  return (
    <div>
      <button onClick={() => setFlag(f => !f)}>setFlag</button>
      {flag ? <div>value{value}</div> : <div>no value</div>}
    </div>
  )
}
// 1 处理自/子
// 2 寻找父/兄 没有子元素就会2 complete

function A() {
  console.log('-----3')

  return React.createElement(
    'div',
    null,
    React.createElement('div', null, '11')
  )

  return (
    <div>
      <div>11</div>
    </div>
  )
}
function Apps() {
  const x = A()
  return (
    <>
      {x}
      {x}
      {x}
    </>
  )
  /*
  
  <></> 112

  <>1</> 1112
  
    <>
      <div></div>
    </>

    <>
      <div>1</div>
    </>



111212
 <>
      <div></div>
      <div></div>
    </>
    <>
      <div>1</div>1
    </> 

11112
<>
      <div>
        <div></div>
      </div>
    </>
 <>
      <div>
        <div>1</div>
      </div>
    </>

1111212
    <>
      <div>
        1<div>1</div>
      </div>
    </>
  */
}
function useImmer(initValue) {
  const [val, updateValue] = useState(initValue)

  return [
    val,
    updater => {
      updater(val)
      updateValue({ ...val })
    },
  ]
}
function Appdd({ user }) {
  const { username, avatarSrc } = user

  return (
    <main>
      <Navbar>
        <Avatar username={username} avatarSrc={avatarSrc} />
      </Navbar>
    </main>
  )
}

function Navbar({ children }) {
  return <nav>{children}</nav>
}

function Avatar({ username, avatarSrc }) {
  return <img src={avatarSrc} alt={username} />
}
