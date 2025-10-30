import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next'; // <-- Import translation hook

// Component for the text-to-speech button
function SpeakButton({ textToSpeak }) {
  // Get translation function (t) and i18n instance (for language)
  const { t, i18n } = useTranslation();
  // State to track if speech is currently active
  const [isSpeaking, setIsSpeaking] = useState(false);
  // State to track if the browser supports speech synthesis
  const [canSpeak, setCanSpeak] = useState(false);

  // Check for browser support on component mount
  useEffect(() => {
    if ('speechSynthesis' in window) {
      setCanSpeak(true); // Supported
    } else {
       console.warn("Speech synthesis not supported in this browser."); // Log warning if not supported
    }
    // Cleanup function: Cancel any ongoing speech when the component unmounts
    return () => {
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
        }
    }
  }, []); // Run only once on mount

  // Function to handle button click (start or stop speech)
  const handleSpeak = () => {
    // Do nothing if speech synthesis is not supported or if there's no text
    if (!canSpeak || !textToSpeak) return;

    // If already speaking, cancel the speech and update state
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    // Create a new speech utterance with the provided text
    const utterance = new SpeechSynthesisUtterance(textToSpeak);

    // --- Dynamically Set Language based on current i18n language ---
    // Map i18next language codes (e.g., 'hi') to BCP 47 language codes (e.g., 'hi-IN')
    // required by the Web Speech API. Add more mappings as needed.
    const langMap = {
        en: 'en-IN', // Use Indian English voice
        hi: 'hi-IN', // Use Indian Hindi voice
        mr: 'mr-IN', // Marathi
        ta: 'ta-IN', // Tamil
        bn: 'bn-IN', // Bengali
        te: 'te-IN', // Telugu
        gu: 'gu-IN', // Gujarati
        kn: 'kn-IN', // Kannada
        ml: 'ml-IN', // Malayalam
        pa: 'pa-IN', // Punjabi
        ur: 'ur-IN', // Urdu (voice support may vary)
        as: 'as-IN', // Assamese (voice support may vary)
        kok: 'en-IN', // Konkani fallback to English
        mni: 'en-IN', // Manipuri fallback to English
        lus: 'en-IN', // Mizo fallback to English
        or: 'or-IN',  // Oriya (voice support may vary)
        ne: 'ne-NP',  // Nepali
        // Add other mappings corresponding to your supportedLngs
    };
    // Set the utterance language based on the map, falling back to Indian English
    utterance.lang = langMap[i18n.language] || 'en-IN';
    // -----------------------------------------------------------------

    utterance.rate = 0.9; // Slightly slower speech rate for clarity

    // Event handlers to update the 'isSpeaking' state
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false); // Fired when speech finishes naturally
    utterance.onerror = (event) => { // Fired on error
        console.error("Speech synthesis error:", event.error);
        setIsSpeaking(false); // Reset state on error
    };
    // Ensure onboundary, onpause, onresume also reset if needed, though less common here

    window.speechSynthesis.cancel(); // Stop any speech currently in progress
    window.speechSynthesis.speak(utterance); // Start speaking the new utterance
  };

  // Do not render the button at all if speech synthesis is not supported
  if (!canSpeak) {
    return null;
  }

  // Render the button
  return (
    <button
      className="mt-4 px-4 py-2 text-sm font-semibold text-blue-700 bg-blue-100 rounded-full border border-blue-200 hover:bg-blue-200 hover:border-blue-300 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
      onClick={handleSpeak}
      disabled={!textToSpeak} // Disable button if there is no text to speak
      aria-live="polite" // Announce changes in button text (Speaking/Stopped) for accessibility
      aria-label={isSpeaking ? t('stopButton') : t('listenButton')} // Set accessible label
    >
      <span role="img" aria-hidden="true" className="mr-2">🔊</span> {/* Icon is decorative */}
      {/* Use translated text for button label */}
      {isSpeaking ? t('stopButton') : t('listenButton')}
    </button>
  );
}

export default SpeakButton;

