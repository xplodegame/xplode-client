import React from 'react'
import ReactDOM from 'react-dom/client'
import { PrivyProvider } from '@privy-io/react-auth'
import MainApp from './MainApp'  // Updated from App

const PRIVVY_APP_ID = import.meta.env.VITE_PRIVVY_APP_ID

if (!PRIVVY_APP_ID) {
  throw new Error('Missing Privvy App ID')
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    {/* <PrivyProvider appId={PRIVVY_APP_ID}> */}
    <PrivyProvider
      appId={PRIVVY_APP_ID}
      config={{
        embeddedWallets: { 
          ethereum: { 
            createOnLogin: 'users-without-wallets', // defaults to 'off'
          }, 
        }, 
      }}
    >
      <MainApp />
    </PrivyProvider>
  </React.StrictMode>
)
