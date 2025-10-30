import React from 'react';
import InfoCard from './ui/InfoCard.jsx';
import { useTranslation } from 'react-i18next'; // Import translation hook

// Helper function to format large numbers into Indian numbering system (Lakhs, Crores)
// Safely handles null, undefined, or non-numeric input by returning 'N/A' or 0 representation.
const formatIndianCurrency = (num) => {
  const n = parseFloat(num); // Attempt to parse the input number
  // If parsing fails or input is null/undefined, return 'N/A'
  if (isNaN(n)) return 'N/A';
  if (n === 0) return '₹0'; // Explicitly return ₹0 for zero values
  // Format into Crores if >= 100 Lakhs
  if (n >= 100) {
    return `₹${(n / 100).toFixed(2)} Crore`;
  }
  // Format into Lakhs if >= 1 Lakh
  return `₹${n.toFixed(2)} Lakhs`;
};

// Helper function to format numbers with Indian locale separators (e.g., 1,25,343)
// Safely handles null, undefined, or non-numeric input.
const formatIndianNumber = (num) => {
  const n = parseInt(num); // Attempt to parse the input integer
  // If parsing fails or input is null/undefined, return 'N/A'
  if (isNaN(n)) return 'N/A';
  if (n === 0) return '0'; // Explicitly return 0 for zero values
  // Use toLocaleString with 'en-IN' for Indian number formatting
  return new Number(n).toLocaleString('en-IN');
};

// Component to display the grid of performance cards for the current snapshot
function CurrentPerformance({ data }) {
  const { t } = useTranslation(); // Get translation function

  // --- Safe Calculations for UI ---
  // Parse numeric values safely, defaulting to 0 if null, undefined, or invalid
  const wages = parseFloat(data?.wages_lakhs) || 0;
  const material = parseFloat(data?.material_skilled_wages_lakhs) || 0;
  const admin = parseFloat(data?.admin_exp_lakhs) || 0;
  const totalAllocated = parseFloat(data?.total_exp_lakhs) || 0; // Use total_exp_lakhs as allocated/total budget for the period
  const totalSpent = wages + material + admin;
  // Calculate percentage, handle division by zero
  const fundsUsedPercent = totalAllocated > 0 ? (totalSpent / totalAllocated) * 100 : 0;

  // Determine status ('good', 'poor', 'neutral') based on percentage
  let fundsStatus = 'neutral';
  if (fundsUsedPercent > 80) fundsStatus = 'good';
  if (fundsUsedPercent < 40) fundsStatus = 'poor';

  // Safely parse average days work and determine status
  const avgDaysWork = parseFloat(data?.avg_days_employment_per_hh) || 0;
  const avgDaysWorkFormatted = avgDaysWork.toFixed(0); // Format to integer string
  const avgDaysStatus = avgDaysWork > 50 ? 'good' : 'poor';

  return (
    // Grid layout for the info cards, responsive columns
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {/* Funds Used Card */}
      <InfoCard
        icon="💰" // Emoji icon
        title={t('fundsUsedTitle')} // Translated title
        metric={`${fundsUsedPercent.toFixed(0)}%`} // Calculated metric
        // Translated subtext showing spent vs allocated amounts
        subtext={t('fundsSubtext', { spent: formatIndianCurrency(totalSpent), allocated: formatIndianCurrency(totalAllocated) })}
        status={fundsStatus} // Pass status for border color
      />
      {/* People Employed Card */}
      <InfoCard
        icon="👩‍🌾" // Emoji icon
        title={t('peopleEmployedTitle')} // Translated title
        metric={formatIndianNumber(data?.total_individuals_worked)} // Formatted metric from data
        // Translated subtext with household count using interpolation
        subtext={t('householdsCount', { count: formatIndianNumber(data?.total_households_worked) })}
        status="neutral" // Default status
      />
      {/* Work Projects Card */}
      <InfoCard
        icon="🚧" // Emoji icon
        title={t('workProjectsTitle')} // Translated title
        metric={formatIndianNumber(data?.completed_works)} // Formatted metric (completed works)
        // Translated subtext with ongoing works count using interpolation
        subtext={t('ongoingCount', { count: formatIndianNumber(data?.ongoing_works) })}
        // Status based on comparison (more completed is good)
        status={(parseInt(data?.completed_works) || 0) > (parseInt(data?.ongoing_works) || 0) ? 'good' : 'neutral'}
      />
      {/* Agriculture Work Card */}
      <InfoCard
        icon="🌾" // Emoji icon
        title={t('agricultureWorkTitle')} // Translated title
        metric={`${(parseFloat(data?.pct_agri_expenditure) || 0).toFixed(0)}%`} // Safely parsed and formatted metric
        subtext={t('ofTotalSpending')} // Translated subtext
        status="neutral"
      />
      {/* Average Days Work Card */}
      <InfoCard
        icon="⏳" // Emoji icon
        title={t('avgDaysWorkTitle')} // Translated title
        // Translated metric using interpolation for the number
        metric={t('daysValue', { count: avgDaysWorkFormatted })}
        subtext={t('perHousehold')} // Translated subtext
        status={avgDaysStatus} // Pass calculated status
      />
      {/* Average Wage Rate Card */}
      <InfoCard
        icon="💸" // Emoji icon
        title={t('avgWageRateTitle')} // Translated title
        metric={`₹${(parseFloat(data?.avg_wage_rate) || 0).toFixed(2)}`} // Safely parsed and formatted metric
        subtext={t('perDay')} // Translated subtext
        status="neutral"
      />
    </div>
  );
}

export default CurrentPerformance;

