// App.jsx
import React, { useState } from 'react';
import Index from './app/index.jsx';
import HomePage from './app/HomePage.jsx';
import SignInPage from './app/SignIn.jsx';
import SignUpPage from './app/SignUp.jsx';
import ProfilePage from './app/Profile.jsx';
import Layout from './app/layout.jsx';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState('index'); // 'index', 'home', 'signin', 'signup', 'profile'

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
          onGoToProfile={() => setCurrentScreen('profile')}
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
      {currentScreen === 'profile' && (
        <ProfilePage onGoToHome={() => setCurrentScreen('home')} />
      )}
    </Layout>
  );
}