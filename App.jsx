// App.js
import React, { useState } from 'react';
import Index from './app/index.jsx';
import HomePage from './app/HomePage.jsx';
import SignInPage from './app/SignIn.jsx';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState('index'); // 'index', 'home', or 'signin'

  return (
    <>
      {currentScreen === 'index' && (
        <Index 
          onGoToHome={() => setCurrentScreen('home')}
          onGoToSignIn={() => setCurrentScreen('signin')}
        />
      )}
      {currentScreen === 'home' && (
        <HomePage onGoToSignIn={() => setCurrentScreen('signin')} />
      )}
      {currentScreen === 'signin' && (
        <SignInPage onGoToHome={() => setCurrentScreen('home')} />
      )}
    </>
  );
}