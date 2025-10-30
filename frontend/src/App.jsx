import React, { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';

import LocationSelector from './components/LocationSelector.jsx';
import CurrentPerformance from './components/CurrentPerformance.jsx';
import PastPerformance from './components/PastPerformance.jsx';
import Loader from './components/ui/Loader.jsx';
import ErrorMessage from './components/ui/ErrorMessage.jsx';

const API_URL = import.meta.env.VITE_API_BASE_URL;

// State → Language map
const stateToLangMap = {
  'ANDAMAN AND NICOBAR': 'hi', 'BIHAR': 'hi', 'CHANDIGARH': 'hi', 'CHHATTISGARH': 'hi',
  'DELHI': 'hi', 'HARYANA': 'hi', 'HIMACHAL PRADESH': 'hi', 'JHARKHAND': 'hi',
  'MADHYA PRADESH': 'hi', 'RAJASTHAN': 'hi', 'UTTAR PRADESH': 'hi', 'UTTARAKHAND': 'hi',
  'ANDHRA PRADESH': 'te', 'ARUNACHAL PRADESH': 'en', 'ASSAM': 'as', 'DN HAVELI AND DD': 'gu',
  'GOA': 'kok', 'GUJARAT': 'gu', 'JAMMU AND KASHMIR': 'ur', 'KARNATAKA': 'kn', 'KERALA': 'ml',
  'LADAKH': 'en', 'LAKSHADWEEP': 'ml', 'MAHARASHTRA': 'mr', 'MANIPUR': 'mni', 'MEGHALAYA': 'en',
  'MIZORAM': 'lus', 'NAGALAND': 'en', 'ODISHA': 'or', 'PUDUCHERRY': 'ta', 'PUNJAB': 'pa',
  'SIKKIM': 'ne', 'TAMIL NADU': 'ta', 'TELANGANA': 'te', 'TRIPURA': 'bn', 'WEST BENGAL': 'bn',
  'DEFAULT': 'en'
};

const langFullNames = {
  en: 'English', hi: 'Hindi', te: 'Telugu', as: 'Assamese', gu: 'Gujarati',
  kok: 'Konkani', ur: 'Urdu', kn: 'Kannada', ml: 'Malayalam', mr: 'Marathi',
  mni: 'Manipuri', lus: 'Mizo', or: 'Odia', ta: 'Tamil', pa: 'Punjabi', ne: 'Nepali', bn: 'Bengali'
};

const getLanguageForState = (stateName, supportedLanguages, fallbackLang = 'en') => {
  const upper = stateName ? String(stateName).toUpperCase() : 'DEFAULT';
  const target = stateToLangMap[upper] || fallbackLang;
  return supportedLanguages.includes(target) ? target : fallbackLang;
};

function App() {
  const { t, i18n, ready: i18nReady } = useTranslation();
  const isMountedRef = useRef(true);

  const [allStates, setAllStates] = useState([]);
  const [selectedState, setSelectedState] = useState(null);
  const [districtsForState, setDistrictsForState] = useState([]);
  const [selectedDistrict, setSelectedDistrict] = useState(null);
  const [view, setView] = useState('current');
  const [loadingStates, setLoadingStates] = useState(true);
  const [loadingDistricts, setLoadingDistricts] = useState(false);
  const [loadingPerformance, setLoadingPerformance] = useState(false);
  const [error, setError] = useState(null);
  const [geoTarget, setGeoTarget] = useState({ state: null, district: null });
  const [currentData, setCurrentData] = useState(null);
  const [historyData, setHistoryData] = useState(null);
  const [isChangingLanguage, setIsChangingLanguage] = useState(false);

  // ✅ Safe Language Change Function
  const changeLanguageAndWait = useCallback(async (lang) => {
    if (!i18nReady || i18n.language === lang || !i18n.options.supportedLngs.includes(lang)) return;
    setIsChangingLanguage(true);
    try {
      await i18n.changeLanguage(lang);
    } catch (err) {
      console.error("Language change error:", err);
      await i18n.changeLanguage('en');
    } finally {
      if (isMountedRef.current) setIsChangingLanguage(false);
    }
  }, [i18n, i18nReady]);

  // ✅ Manual Toggle (only when button clicked)
  const handleLanguageToggle = useCallback(() => {
    if (!selectedState || isChangingLanguage) return;
    const stateLang = getLanguageForState(selectedState, i18n.options.supportedLngs);
    const targetLang = i18n.language === 'en' ? stateLang : 'en';
    changeLanguageAndWait(targetLang);
  }, [selectedState, i18n.language, isChangingLanguage, changeLanguageAndWait, i18n.options.supportedLngs]);

  // ✅ Fetch Performance Data
  const fetchPerformanceData = useCallback(async (districtToFetch) => {
    if (!districtToFetch || !selectedState || !i18nReady) return;
    setLoadingPerformance(true);
    try {
      const [cur, hist] = await Promise.all([
        axios.get(`${API_URL}/performance/${districtToFetch}`),
        axios.get(`${API_URL}/performance/history/${districtToFetch}`)
      ]);
      if (isMountedRef.current) {
        setCurrentData(cur.data.data);
        setHistoryData(hist.data.data);
        localStorage.setItem(`selectedDistrict_${selectedState}`, districtToFetch);
        localStorage.setItem('selectedState', selectedState);
      }
    } catch (err) {
      setError(t('errorFailedPerformanceData', { districtName: districtToFetch }));
    } finally {
      setLoadingPerformance(false);
    }
  }, [selectedState, t, i18nReady]);

  // ✅ Initial State Load
  useEffect(() => {
    isMountedRef.current = true;
    if (!i18nReady) return;
    const fetchStates = async () => {
      try {
        const res = await axios.get(`${API_URL}/performance/states`);
        const states = res.data.states.filter(Boolean);
        setAllStates(states);
        const saved = localStorage.getItem('selectedState');
        const init = saved && states.includes(saved) ? saved : states[0];
        setSelectedState(init);
      } catch (err) {
        setError(t('errorFailedStateList'));
      } finally {
        setLoadingStates(false);
      }
    };
    fetchStates();
    return () => { isMountedRef.current = false; };
  }, [i18nReady, t]);

  // ✅ Fetch Districts on State Change (no auto language change)
  useEffect(() => {
    if (!selectedState) return;
    const fetchDistricts = async () => {
      setLoadingDistricts(true);
      try {
        const res = await axios.get(`${API_URL}/performance/districts?state=${encodeURIComponent(selectedState)}`);
        const districts = res.data.districts.filter(Boolean);
        setDistrictsForState(districts);
        let districtToSelect = districts[0];
        const savedDistrict = localStorage.getItem(`selectedDistrict_${selectedState}`);
        if (savedDistrict && districts.includes(savedDistrict)) districtToSelect = savedDistrict;
        setSelectedDistrict(districtToSelect);
      } catch (err) {
        setError(t('errorFailedDistrictList', { stateName: selectedState }));
      } finally {
        setLoadingDistricts(false);
      }
    };
    fetchDistricts();
  }, [selectedState, t]);

  // ✅ Fetch Performance Data on District Change
  useEffect(() => {
    if (selectedDistrict && selectedState) fetchPerformanceData(selectedDistrict);
  }, [selectedDistrict, selectedState, fetchPerformanceData]);

  // ✅ Geolocation (same logic as before)
  const handleGeoLocationSuccess = (state, district) => {
    const matchedState = allStates.find(s => s.toLowerCase() === state.toLowerCase());
    if (matchedState) {
      setGeoTarget({ state: matchedState, district });
      if (selectedState !== matchedState) {
        setSelectedState(matchedState);
      } else {
        const matchedDistrict = districtsForState.find(d => d.toLowerCase() === district.toLowerCase());
        if (matchedDistrict) {
          setSelectedDistrict(matchedDistrict);
          setGeoTarget({ state: null, district: null });
        }
      }
    } else {
      setError(t('errorGeoStateNotFound', { stateName: state }));
    }
  };

  const showData = !loadingPerformance && currentData && !error;
  const currentStateLang = getLanguageForState(selectedState, i18n.options.supportedLngs);
  const isEnglish = i18n.language === 'en';
  const showToggle = selectedState && currentStateLang !== 'en';
  const toggleLabel = isEnglish ? langFullNames[currentStateLang] || 'Other' : 'English';

  return (
    <div className="min-h-screen bg-slate-100 font-sans text-slate-900">
      {/* Header */}
      <header className="bg-slate-900 shadow-xl sticky top-0">
        <div className="max-w-5xl mx-auto flex items-center justify-between p-4">
          <div className="flex items-center gap-3 text-white">
            <h1 className="text-xl font-bold">{t('appTitle')}</h1>
          </div>
          {showToggle && (
            <button
              onClick={handleLanguageToggle}
              disabled={isChangingLanguage}
              className={`px-4 py-2 rounded-full border-2 ${
                isEnglish ? 'bg-white text-slate-700 border-slate-300' : 'bg-emerald-500 text-white border-emerald-400'
              }`}
            >
              {isChangingLanguage ? '...' : toggleLabel}
            </button>
          )}
        </div>
      </header>

      {/* Main */}
      <main className="max-w-5xl mx-auto p-6">
        <LocationSelector
          states={allStates}
          selectedState={selectedState}
          onStateChange={setSelectedState}
          districts={districtsForState}
          selectedDistrict={selectedDistrict}
          onDistrictSelect={setSelectedDistrict}
          loadingStates={loadingStates}
          loadingDistricts={loadingDistricts}
          onGeoSuccess={handleGeoLocationSuccess}
          setError={setError}
          onFetchPerformance={() => fetchPerformanceData(selectedDistrict)}
          isFetchingPerformance={loadingPerformance}
        />

        <div className="mt-8 bg-white p-6 rounded-xl shadow-md border">
          {error && <ErrorMessage message={error} />}
          {loadingPerformance && <Loader message={t('loadingPerformance')} />}
          {showData && (
            <>
              <h2 className="text-2xl font-bold text-center mb-4">
                {t('performanceHeading', { district: selectedDistrict })}
              </h2>
              <div className="flex justify-center mb-6">
                <button
                  className={`px-4 py-2 rounded-l-full ${
                    view === 'current' ? 'bg-emerald-600 text-white' : 'bg-gray-200'
                  }`}
                  onClick={() => setView('current')}
                >
                  {t('currentSnapshotTab')}
                </button>
                <button
                  className={`px-4 py-2 rounded-r-full ${
                    view === 'past' ? 'bg-emerald-600 text-white' : 'bg-gray-200'
                  }`}
                  onClick={() => setView('past')}
                >
                  {t('pastPerformanceTab')}
                </button>
              </div>
              {view === 'current' && <CurrentPerformance data={currentData} />}
              {view === 'past' && <PastPerformance data={historyData} />}
            </>
          )}
        </div>
      </main>

      <footer className="text-center py-6 text-slate-500 border-t">{t('footerText')}</footer>
    </div>
  );
}

export default App;
