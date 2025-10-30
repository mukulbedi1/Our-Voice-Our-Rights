import React from 'react';
import { useTranslation } from 'react-i18next'; // Import for fallback text

// Component to display error messages
function ErrorMessage({ message }) {
  const { t } = useTranslation(); // Get translation function for fallback

  // The 'message' prop should ideally be translated by the parent component (App.jsx)
  // Add a fallback using a generic translation key in case 'message' is null or undefined
  const displayMessage = message || t('errorUnknown'); // Use a generic error key if message is missing

  return (
    // Container for the error message with appropriate styling and ARIA role
    <div className="flex items-start gap-4 p-5 bg-red-50 border border-red-200 text-red-700 rounded-lg shadow-sm" role="alert"> {/* role="alert" for accessibility */}
      {/* Error icon */}
      <span className="text-2xl mt-1 flex-shrink-0" role="img" aria-label={t('errorLabel') || 'Error'}>❌</span> {/* Use translated aria-label */}
      {/* Display the error message */}
      <p className="text-base font-semibold">{displayMessage}</p>
    </div>
  );
}

export default ErrorMessage;

