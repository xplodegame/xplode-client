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

export default function App() {
  return (
    <header>
      <SignedOut>
        <SignInButton />
      </SignedOut>
      <SignedIn>
        <UserButton />
        <nav>
          <Link to="/home">Go to Home</Link>
        </nav>
      </SignedIn>
    </header>
  )
}