import React from 'react';
import { useTranslation } from 'react-i18next'; // <-- Import translation hook

// Simple loading indicator component
function Loader({ message }) { // Accept an optional 'message' prop
  const { t } = useTranslation(); // <-- Get translation function

  // Use the provided message, or fallback to the default translated 'loading' key
  const displayMessage = message || t('loading'); // Use prop or default translation

  return (
    // Container for the loader with ARIA attributes for accessibility
    <div className="text-center py-12 text-slate-600" aria-live="polite" aria-busy="true">
      {/* Spinning animation element */}
      <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
      {/* Display the loading message (either passed prop or default translation) */}
      <p className="text-lg font-semibold">{displayMessage}</p>
    </div>
  );
}
export default Loader;

