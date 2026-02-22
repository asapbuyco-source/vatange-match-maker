import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { LanguageProvider } from './i18n/LanguageContext';
import { auth, isFirebaseConfigured } from './services/firebaseApp';
import { signInAnonymously } from 'firebase/auth';
import { ErrorBoundary } from './components/ErrorBoundary';

// Sign in anonymously so Firestore security rules (require auth != null) work.
// This gives every visitor a stable UID without a sign-up screen.
if (isFirebaseConfigured()) {
  signInAnonymously(auth).catch(err =>
    console.warn('[Firebase] Anonymous sign-in failed:', err),
  );
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Failed to find the root element. Make sure index.html has a div with id="root".');
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <ErrorBoundary>
      <LanguageProvider>
        <App />
      </LanguageProvider>
    </ErrorBoundary>
  </React.StrictMode>
);

