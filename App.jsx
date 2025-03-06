// App.js
import React, { useState } from 'react';
import Index from './app/index.jsx';
import HomePage from './app/HomePage.jsx';
import SignInPage from './app/SignIn.jsx';
import SignUpPage from './app/SignUp.jsx';
import Layout from './app/layout 2.jsx';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState('index'); // 'index', 'home', 'signin', or 'signup'

  return (
    <Layout>
      {currentScreen === 'index' && (
        <Index 
          onGoToHome={() => setCurrentScreen('home')}
          onGoToSignIn={() => setCurrentScreen('signin')}
          onGoToSignUp={() => setCurrentScreen('signup')}
        />
      )}
      {currentScreen === 'home' && (
        <HomePage 
          onGoToSignIn={() => setCurrentScreen('signin')}
          onGoToSignUp={() => setCurrentScreen('signup')}
        />
      )}
      {currentScreen === 'signin' && (
        <SignInPage 
          onGoToHome={() => setCurrentScreen('home')}
          onGoToSignUp={() => setCurrentScreen('signup')}
        />
      )}
      {currentScreen === 'signup' && (
        <SignUpPage 
          onGoToHome={() => setCurrentScreen('home')}
          onGoToSignIn={() => setCurrentScreen('signin')}
        />
      )}
    </Layout>
  );
}