import React from 'react';
import PastPerformanceRow from './PastPerformanceRow.jsx'; // Import the row component
import { useTranslation } from 'react-i18next'; // <-- Import

function PastPerformance({ data }) {
  const { t } = useTranslation(); // <-- Get translation function

  if (!data || data.length === 0) {
    // Use translated string for no data message
    return <p className="text-center text-slate-500 text-lg">{t('noHistoryData')}</p>;
  }

  return (
    <div className="space-y-4">
      <h3 className="text-2xl font-semibold text-slate-700 mb-4 text-center md:text-left">
        {/* Use translated string for the title */}
        {t('pastPerformanceTitle')}
      </h3>
      {/* Map through the data and render a row for each record */}
      {data.map((record) => (
        <PastPerformanceRow key={record.id} record={record} />
      ))}
    </div>
  );
}

export default PastPerformance;

