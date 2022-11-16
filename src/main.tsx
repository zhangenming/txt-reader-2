import './debug'
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  // App()
  <App />
)
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
