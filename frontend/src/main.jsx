import React, { Suspense } from 'react'; // <-- 1. Import Suspense
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import './i18n.js'; // This starts the language loading

// Import the Loader to show while languages load
import Loader from './components/ui/Loader.jsx';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* 2. Wrap your App in Suspense */}
    <Suspense fallback={
      // Show this loader while i18next is fetching
      // the first 'translation.json' file (e.g., 'en' or 'hi')
      <div className="flex justify-center items-center min-h-screen">
        <Loader message="Loading Language..." />
      </div>
    }>
      <App />
    </Suspense>
  </React.StrictMode>,
);

