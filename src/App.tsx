import './App.css'
import Menu from './menu'

import { Authenticator } from '@aws-amplify/ui-react'
import { Amplify } from 'aws-amplify';
import outputs from '../amplify_outputs.json';
import '@aws-amplify/ui-react/styles.css';

Amplify.configure(outputs);

function App() {

  return (
    <Authenticator>
      {({ signOut }) => (  //, user }) => (

        <Menu signOut={signOut} />

      )}
    </Authenticator>
  )
}

export default App
