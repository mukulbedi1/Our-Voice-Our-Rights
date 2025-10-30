import React, { useState } from 'react';
import { useTranslation } from 'react-i18next'; // <-- Import translation hook
import InfoCard from './ui/InfoCard.jsx'; // Import InfoCard to display details

// Helper function to format numbers as Indian currency (Lakhs/Crores)
// Ensures safe parsing by treating null/undefined/NaN as 0
const formatIndianCurrency = (num) => {
    const n = parseFloat(num) || 0; // Default to 0 if parsing fails
    if (n === 0) return '₹0';
    if (n >= 100) return `₹${(n / 100).toFixed(2)} Crore`; // Format as Crore if >= 100 Lakhs
    return `₹${n.toFixed(2)} Lakhs`; // Format as Lakhs otherwise
};

// Helper function to format numbers with Indian comma separators
// Ensures safe parsing by treating null/undefined/NaN as 0
const formatIndianNumber = (num) => {
    const n = parseInt(num) || 0; // Default to 0 if parsing fails
    if (n === 0) return '0';
    return new Number(n).toLocaleString('en-IN'); // Use Indian locale for formatting
};

// Component to display a single row of historical performance data
function PastPerformanceRow({ record }) {
  // Get translation function (t) and i18n instance from the hook
  const { t, i18n } = useTranslation();
  // State to manage whether the details section is expanded or collapsed
  const [isExpanded, setIsExpanded] = useState(false);

  // --- Calculations (with safe parsing using || 0 fallback) ---
  const wages = parseFloat(record.wages_lakhs) || 0;
  const material = parseFloat(record.material_skilled_wages_lakhs) || 0;
  const admin = parseFloat(record.admin_exp_lakhs) || 0;
  const totalAllocated = parseFloat(record.total_exp_lakhs) || 0;
  const totalSpent = wages + material + admin;
  // Calculate percentage, handle division by zero
  const fundsUsedPercent = totalAllocated > 0 ? (totalSpent / totalAllocated) * 100 : 0;

  // Determine Tailwind CSS classes based on funds usage percentage for visual indication
  let fundsStatusClass = 'text-slate-700 bg-slate-200'; // Default/neutral style
  if (fundsUsedPercent > 80) fundsStatusClass = 'text-green-800 bg-green-100'; // Good performance style
  if (fundsUsedPercent < 40) fundsStatusClass = 'text-red-800 bg-red-100'; // Poor performance style

  // --- Format date based on the current language selected in i18next ---
  // Map i18next language codes (e.g., 'hi') to BCP 47 locale codes (e.g., 'hi-IN') for Intl.DateTimeFormat
  const localeMap = {
      en: 'en-IN', hi: 'hi-IN', mr: 'mr-IN', ta: 'ta-IN', bn: 'bn-IN',
      te: 'te-IN', gu: 'gu-IN', kn: 'kn-IN', ml: 'ml-IN', pa: 'pa-IN',
      ur: 'ur-IN', as: 'as-IN', kok: 'kok-IN', mni: 'en-IN', // mni might need specific setup or fallback
      lus: 'en-IN', or: 'or-IN', ne: 'ne-NP', // Mizo fallback, Nepali
      // Add other language mappings corresponding to your supportedLngs in i18n.js
  }
  // Get the current language, find its locale, or fallback to 'en-IN'
  const currentLocale = localeMap[i18n.language] || 'en-IN';

  // Format the date object from the record using the determined locale
  const formattedDate = new Date(record.data_for_date).toLocaleString(currentLocale, {
    month: 'long', year: 'numeric' // Display format like "December 2024"
  });
  // -----------------------------------------------------------

  return (
    // Row container with styling and hover effect
    <div className="bg-white rounded-lg p-5 shadow-sm border border-slate-100 transition-shadow duration-200 hover:shadow-md">
      {/* Collapsed View: Always visible summary */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Month and Year */}
        <div className="font-semibold text-lg text-blue-700 w-full md:w-auto text-center md:text-left">
          {formattedDate}
        </div>
        {/* Summary Metrics */}
        <div className="flex gap-6 md:gap-8 justify-center md:justify-start flex-grow">
          {/* Total Spent */}
          <div className="text-center md:text-left">
            <div className="text-lg font-semibold text-slate-800">
              {formatIndianCurrency(totalSpent)}
            </div>
            {/* Translated Label */}
            <div className="text-sm text-slate-500">{t('totalSpentLabel')}</div>
          </div>
          {/* People Worked */}
          <div className="text-center md:text-left">
            <div className="text-lg font-semibold text-slate-800">
              {formatIndianNumber(record.total_individuals_worked)}
            </div>
            {/* Translated Label */}
            <div className="text-sm text-slate-500">{t('peopleWorkedLabel')}</div>
          </div>
        </div>
        {/* Funds Used % Badge */}
        <div
          className={`font-bold text-base md:text-lg px-3 py-1.5 rounded-full ${fundsStatusClass} whitespace-nowrap`}
        >
          {/* Translated Label */}
          {fundsUsedPercent.toFixed(0)}% {t('fundsUsedLabel')}
        </div>
        {/* Expand/Collapse Button */}
        <button
          onClick={() => setIsExpanded(!isExpanded)} // Toggle the isExpanded state
          className="text-blue-600 hover:text-blue-800 font-semibold text-sm md:text-base flex items-center focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 rounded"
          aria-expanded={isExpanded} // Accessibility: informs screen readers if details are shown
          aria-controls={`details-${record.id}`} // Accessibility: links button to the details section
        >
          {/* Translated Button Text */}
          {isExpanded ? t('hideDetailsButton') : t('showDetailsButton')}
          {/* Arrow Icon indicating state */}
          <svg className={`w-4 h-4 ml-1 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
        </button>
      </div>

      {/* Expanded Details View: Conditionally rendered based on isExpanded state */}
      {isExpanded && (
        // Container for details with animation and accessibility attributes
        <div
            id={`details-${record.id}`} // ID linked by aria-controls
            className="mt-6 pt-6 border-t border-slate-200 animate-fade-in"
            role="region" // Defines this as a distinct section
            aria-label={t('rowDetailsTitle', { monthYear: formattedDate })} // Provides a label for the region
        >
           {/* Inline style for the fade-in animation */}
           <style>{`
            @keyframes fade-in {
              from { opacity: 0; transform: translateY(-10px); }
              to { opacity: 1; transform: translateY(0); }
            }
            .animate-fade-in { animation: fade-in 0.3s ease-out; }
          `}</style>
           {/* Title for the details section */}
           <h4 className="text-lg font-semibold text-slate-700 mb-4 text-center">
               {/* Translated Title */}
               {t('rowDetailsTitle', { monthYear: formattedDate })}
           </h4>
          {/* Grid layout for displaying details using InfoCard */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* InfoCard for Work Projects */}
            <InfoCard
                icon="🚧"
                title={t('workProjectsTitle')} // Translated title
                metric={formatIndianNumber(record.completed_works)}
                subtext={t('ongoingCount', { count: formatIndianNumber(record.ongoing_works) })} // Translated subtext with count
                status={ (parseInt(record.completed_works) || 0) > (parseInt(record.ongoing_works) || 0) ? 'good' : 'neutral'} // Determine status
                small // Use the smaller variant of InfoCard
            />
             {/* InfoCard for Agriculture Work */}
             <InfoCard
                icon="🌾"
                title={t('agricultureWorkTitle')}
                metric={`${(parseFloat(record.pct_agri_expenditure) || 0).toFixed(0)}%`}
                subtext={t('ofTotalSpending')}
                status="neutral"
                small
             />
             {/* InfoCard for Average Days Work */}
             <InfoCard
                icon="⏳"
                title={t('avgDaysWorkTitle')}
                metric={t('daysValue', { count: (parseFloat(record.avg_days_employment_per_hh) || 0).toFixed(0) })} // Translated metric with count
                subtext={t('perHousehold')}
                status={(parseFloat(record.avg_days_employment_per_hh) || 0) > 50 ? 'good' : 'poor'} // Determine status
                small
             />
             {/* InfoCard for Average Wage Rate */}
             <InfoCard
                icon="💸"
                title={t('avgWageRateTitle')}
                metric={`₹${(parseFloat(record.avg_wage_rate) || 0).toFixed(2)}`}
                subtext={t('perDay')}
                status="neutral"
                small
             />
             {/* Add more InfoCards here for other relevant details if needed */}
          </div>
        </div>
      )}
    </div>
  );
}

export default PastPerformanceRow;

