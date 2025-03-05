import React, { useState } from 'react';
import Index from './app/index.jsx';
import HomePage from './app/HomePage.jsx';
import Layout from './app/layout.jsx';

export default function App() {
  const [showHome, setShowHome] = useState(false);

  return (
    <Layout>
      {showHome ? (
        <HomePage />
      ) : (
        <Index onGoToHome={() => setShowHome(true)} />
      )}
    </Layout>
  );
}