import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { LanguageProvider } from './i18n/LanguageContext';
import { auth, isFirebaseConfigured } from './services/firebaseApp';
import { signInAnonymously } from 'firebase/auth';

// Sign in anonymously so Firestore security rules (require auth != null) work.
// This gives every visitor a stable UID without a sign-up screen.
if (isFirebaseConfigured()) {
  signInAnonymously(auth).catch(err =>
    console.warn('[Firebase] Anonymous sign-in failed:', err),
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <LanguageProvider>
      <App />
    </LanguageProvider>
  </React.StrictMode>
);
