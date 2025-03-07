// App.jsx
import React, { useState } from 'react';
import Index from './app/index.jsx';
import HomePage from './app/HomePage.jsx';
import SignInPage from './app/SignIn.jsx';
import SignUpPage from './app/SignUp.jsx';
import ProfilePage from './app/Profile.jsx';
import ReviewPage from './app/Review.jsx';
import Layout from './app/layout.jsx';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState('review'); // 'index', 'home', 'signin', 'signup', 'profile', 'review'

  return (
    <Layout>
      {currentScreen === 'index' && (
        <Index 
          onGoToHome={() => setCurrentScreen('home')}
          onGoToSignIn={() => setCurrentScreen('signin')}
          onGoToSignUp={() => setCurrentScreen('signup')}
          onGoToReview={() => setCurrentScreen('review')}
        />
      )}
      {currentScreen === 'home' && (
        <HomePage 
          onGoToSignIn={() => setCurrentScreen('signin')}
          onGoToSignUp={() => setCurrentScreen('signup')}
          onGoToProfile={() => setCurrentScreen('profile')}
          onGoToReview={() => setCurrentScreen('review')}
        />
      )}
      {currentScreen === 'signin' && (
        <SignInPage 
          onGoToHome={() => setCurrentScreen('home')}
          onGoToSignUp={() => setCurrentScreen('signup')}
          onGoToReview={() => setCurrentScreen('review')}
        />
      )}
      {currentScreen === 'signup' && (
        <SignUpPage 
          onGoToHome={() => setCurrentScreen('home')}
          onGoToSignIn={() => setCurrentScreen('signin')}
          onGoToReview={() => setCurrentScreen('review')}
        />
      )}
      {currentScreen === 'profile' && (
        <ProfilePage 
          onGoToHome={() => setCurrentScreen('home')}
          onGoToReview={() => setCurrentScreen('review')}
        />
      )}
      {currentScreen === 'review' && (
        <ReviewPage 
          onGoToHome={() => setCurrentScreen('home')}
          onGoToBack={() => setCurrentScreen('index')}
        />
      )}
    </Layout>
  );
}