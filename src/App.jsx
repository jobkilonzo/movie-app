import { useState } from 'react'

function App() {
  const [count, setCount] = useState(0)

  return (
    <main>
      <div className='pattern'>
        <div className='wrapper'>
          <header>
            <h1>Find <span className='text-gradient'>Movies</span> Your'll Enjoy Without the Hassle</h1>
          </header>
        </div>
      </div>
    </main>
  )
}

export default App
