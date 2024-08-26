import React from 'react'
import ReactDOM from 'react-dom/client'
//import App from './App.tsx'
import { AppRoutes }  from './Route.tsx';
import './index.css'

import { Amplify } from 'aws-amplify';
import outputs from '../amplify_outputs.json';
import { BrowserRouter } from 'react-router-dom';

Amplify.configure(outputs);

ReactDOM.createRoot(document.getElementById('root')!).render(
  // StrictModeを使うことで、非推奨のAPIを使っている箇所を検出することができるが、
  // useEffectやuseLayoutEffectなどの副作用を持つ関数を2回呼び出すことがあるため、
  // テスト実行時にはコメントアウトをすることを推奨(本番環境には影響しない。)
 //<React.StrictMode>
    <BrowserRouter>
      <AppRoutes/>
    </BrowserRouter>
  //</React.StrictMode>,
)
