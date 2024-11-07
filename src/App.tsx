import './App.css'
import Header from './Header';
import { Outlet } from 'react-router-dom';

import { Authenticator } from '@aws-amplify/ui-react'
import '@aws-amplify/ui-react/styles.css';

function App() {

  return (
    //jsxでは親コンポーネントで1つの要素で囲む必要がある
    <>
      
      <Authenticator>
        {({ signOut }) => (

          <>
            {/* //ヘッダーを表示する */}
            <Header signOut={signOut} />
            
            {/* //メインコンテンツを表示する */}
            <Outlet />
          </>

        )}
      </Authenticator>
    </>
  )
}

export default App;
