import React from 'react';
import SpeakButton from './SpeakButton.jsx';
import { useTranslation } from 'react-i18next'; // <-- Import translation hook

// Component to display a single metric card
function InfoCard({ icon, title, metric, subtext, status = 'neutral', small = false }) {
  // Get translation function (t) - not used directly here as props should be translated by parent
  const { t } = useTranslation();

  // Ensure title, metric, and subtext are strings for speech synthesis and display
  const cardTitle = typeof title === 'string' ? title : ''; // Use title passed as prop
  const cardMetric = typeof metric === 'string' ? metric : String(metric); // Convert numbers/nulls to string
  const cardSubtext = typeof subtext === 'string' ? subtext : ''; // Use subtext passed as prop

  // Create the text that will be read aloud by the SpeakButton
  const textToSpeak = `${cardTitle}. ${cardMetric}. ${cardSubtext}.`;

  // Map the status prop ('good', 'poor', 'neutral') to Tailwind CSS border color classes
  const statusClasses = {
    good: 'border-green-500', // Green border for good status
    poor: 'border-red-500',   // Red border for poor status
    neutral: 'border-blue-500', // Blue border for neutral status
  };

  // Adjust Tailwind classes for padding, font sizes based on the 'small' prop
  // This allows the card to be used in different contexts (e.g., smaller size in expanded rows)
  const cardPadding = small ? 'p-4' : 'p-6'; // Smaller padding if 'small' is true
  const iconSize = small ? 'text-2xl' : 'text-3xl'; // Smaller icon if 'small' is true
  const titleSize = small ? 'text-sm' : 'text-base'; // Smaller title font size if 'small' is true
  const metricSize = small ? 'text-3xl md:text-4xl' : 'text-4xl md:text-5xl'; // Smaller metric font size if 'small' is true
  const subtextSize = small ? 'text-sm' : 'text-base'; // Smaller subtext font size if 'small' is true
  const minSubtextHeight = small ? 'min-h-[2rem]' : 'min-h-[2.5rem]'; // Ensure minimum height for subtext area

  return (
    // Main card container div
    // Applies base styles, dynamic padding, status border, and hover effects
    <div
      className={`bg-white rounded-xl shadow-lg border-b-8 ${cardPadding} transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${statusClasses[status]}`}
    >
      {/* Card header section with icon and title */}
      <div className="flex items-center gap-3 mb-2">
        {/* Icon display */}
        <span className={iconSize} role="img" aria-label={cardTitle}>{icon}</span>
        {/* Title display (already translated by parent component) */}
        <h3 className={`${titleSize} font-semibold text-slate-500 uppercase tracking-wider`}>
          {cardTitle}
        </h3>
      </div>
      {/* Main metric display */}
      <p className={`${metricSize} font-bold text-slate-800 truncate`}>
        {cardMetric}
      </p>
      {/* Subtext display */}
      <p className={`${subtextSize} text-slate-500 mt-1 ${minSubtextHeight}`}>
        {cardSubtext}
      </p>
      {/* Speak button component, passing the combined text to be spoken */}
      <SpeakButton textToSpeak={textToSpeak} />
    </div>
  );
}

export default InfoCard;

