// function App() {

//   return (
//     <>
//       <p>
//         Click on the Vite and React logos to learn more
//       </p>
//     </>
//   )
// }

// export default App


// import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/clerk-react'
// import Home from './Home'

// export default function App() {
//   return (
//     <header>
//       <SignedOut>
//         <SignInButton />
//       </SignedOut>
//       <SignedIn>
//         <UserButton />
//         <Home />
//       </SignedIn>
//     </header>
//   )
// }

import { SignedOut, SignedIn, SignInButton, UserButton } from '@clerk/clerk-react'
import { Link } from 'react-router-dom'
import Home from './Home'

export default function App() {
  return (
    <header>
      <h1 className="text-3xl font-bold underline">
        Hello world!
      </h1>
      <SignedOut>
        <SignInButton />
        <Home />
      </SignedOut>
      <SignedIn>
        <UserButton />
        <Home />
        <nav>
          <Link to="/play">play mines</Link>
        </nav>
      </SignedIn>
    </header>
  )
}