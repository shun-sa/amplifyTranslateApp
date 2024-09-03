import './App.css'
import Menu from './Menu'

import { Authenticator } from '@aws-amplify/ui-react'
import '@aws-amplify/ui-react/styles.css';

function App() {

  return (
    <Authenticator>
      {({ signOut }) => (

        <Menu signOut={signOut} />

      )}
    </Authenticator>
  )
}

export default App;
