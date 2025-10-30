import React, { useState } from "react";
import axios from "axios";
import { useTranslation } from "react-i18next";

// Simple spinner component for buttons
const ButtonSpinner = () => (
  <svg
    className="animate-spin -ml-1 mr-2 h-5 w-5 text-current inline-block"
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
  >
    <circle
      className="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="4"
    ></circle>
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 
      5.373 0 12h4zm2 5.291A7.962 7.962 0 014 
      12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
    ></path>
  </svg>
);

// Location Selector Component
function LocationSelector({
  states,
  selectedState,
  onStateChange,
  districts,
  selectedDistrict,
  onDistrictSelect,
  loadingStates,
  loadingDistricts,
  onGeoSuccess,
  setError,
  onFetchPerformance,
  isFetchingPerformance,
}) {
  const { t } = useTranslation();

  // Local state for geolocation
  const [isGeolocating, setIsGeolocating] = useState(false);
  const [geoStatusMessage, setGeoStatusMessage] = useState("");

  // --- Geolocation Handler ---
  const handleGeoLocate = () => {
    if (!navigator.geolocation) {
      setError(t("errorGeoNotSupported"));
      return;
    }

    setIsGeolocating(true);
    setGeoStatusMessage(t("errorGeoFinding"));
    setError(null);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        setGeoStatusMessage(t("errorGeoChecking"));
        const { latitude, longitude } = position.coords;

        try {
          const response = await axios.get(
            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}&accept-language=en`
          );

          const address = response.data?.address || {};
          const stateName = address.state;
          const districtName =
            address.state_district ||
            address.county ||
            address.city_district ||
            address.city ||
            address.town ||
            address.village;

          console.log("Geolocation found:", { stateName, districtName, address });

          if (stateName && districtName) {
            setGeoStatusMessage(t("errorGeoSuccess"));
            onGeoSuccess(
              stateName,
              districtName.replace(" District", "").trim()
            );
            setTimeout(() => setGeoStatusMessage(""), 1500);
          } else {
            setGeoStatusMessage("");
            setError(t("errorGeoStateDistrictNotFound"));
            console.warn(
              "Could not extract state/district from address:",
              address
            );
          }
        } catch (err) {
          setGeoStatusMessage("");
          setError(t("errorGeoReverseGeocoding"));
          console.error("Geolocation reverse geocoding error:", err);
        } finally {
          setIsGeolocating(false);
        }
      },
      (geoError) => {
        setIsGeolocating(false);
        setGeoStatusMessage("");

        if (geoError.code === geoError.PERMISSION_DENIED) {
          setError(t("errorGeoPermissionDenied"));
        } else {
          setError(t("errorGeoUnavailable"));
        }
        console.error("Geolocation error:", geoError);
      },
      {
        enableHighAccuracy: false,
        timeout: 10000,
        maximumAge: 60000,
      }
    );
  };

  // --- Handlers for Dropdown Changes ---
  const handleStateChange = (e) => {
    console.log("State Changed To:", e.target.value);
    onStateChange(e.target.value);
  };

  const handleDistrictChange = (e) => {
    console.log("District Changed To:", e.target.value);
    onDistrictSelect(e.target.value);
  };

  // --- Determine Disabled States for UI Elements ---
  const isStateDisabled = loadingStates || states.length === 0;
  const isDistrictDisabled =
    loadingDistricts || districts.length === 0 || !selectedState;
  const isFetchButtonDisabled =
    isDistrictDisabled ||
    !selectedDistrict ||
    isFetchingPerformance ||
    isGeolocating;

  return (
    <div className="bg-white p-6 md:p-8 rounded-xl shadow-lg border border-slate-100 text-center transition-all duration-300">
      {/* Title */}
      <h3 className="text-xl md:text-2xl font-semibold mb-6 text-slate-700">
        {t("selectLocationTitle")}
      </h3>

      {/* Geolocation Button */}
      <button
        type="button"
        className="w-full relative py-3 px-4 bg-blue-50 text-blue-700 font-semibold rounded-lg border-2 border-blue-200 hover:bg-blue-100 hover:border-blue-300 transition-all duration-200 text-lg mb-6 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        onClick={handleGeoLocate}
        disabled={loadingStates || isGeolocating}
      >
        {isGeolocating ? (
          <>
            <ButtonSpinner />
            <span className="ml-2">
              {t(geoStatusMessage) || geoStatusMessage || t("loading")}...
            </span>
          </>
        ) : (
          <>
            <span
              role="img"
              aria-label={t("findMyLocationButtonLabel")}
              className="mr-2 text-xl"
            >
              📍
            </span>
            <span>{t("findMyLocationButton")}</span>
          </>
        )}
        {!isGeolocating && geoStatusMessage === t("errorGeoSuccess") && (
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-green-600 text-2xl animate-pulse">
            ✅
          </span>
        )}
      </button>

      {/* Separator Text */}
      <div className="my-6 text-sm font-semibold text-slate-400 uppercase tracking-wide">
        {t("orManualSelect")}
      </div>

      {/* Manual Selection Area */}
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* State Selector */}
          <div>
            <label
              htmlFor="state-select"
              className="block text-lg font-semibold text-slate-600 mb-2 text-left"
            >
              {t("stateLabel")}
            </label>

            <select
              id="state-select"
              value={selectedState || ""}
              onChange={handleStateChange}
              disabled={isStateDisabled}
              className="w-full text-lg p-3 border border-slate-300 rounded-lg 
              focus:ring-2 focus:ring-blue-500 focus:outline-none 
              disabled:bg-slate-100 disabled:cursor-not-allowed appearance-none 
              bg-no-repeat bg-right pr-8"
              style={{
                backgroundImage:
                  "url(\"data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e\")",
                backgroundPosition: "right 0.75rem center",
                backgroundSize: "1.5em 1.5em",
              }}
            >
              {loadingStates ? (
                <option disabled value="">
                  {t("loadingStates")}
                </option>
              ) : states.length === 0 ? (
                <option disabled value="">
                  {t("noStatesFound")}
                </option>
              ) : (
                <>
                  {!selectedState && (
                    <option value="" disabled>
                      {t("selectStatePlaceholder")}
                    </option>
                  )}
                  {states.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </>
              )}
            </select>
          </div>

          {/* District Selector */}
          <div>
            <label
              htmlFor="district-select"
              className="block text-lg font-semibold text-slate-600 mb-2 text-left"
            >
              {t("districtLabel")}
            </label>

            <select
              id="district-select"
              value={selectedDistrict || ""}
              onChange={handleDistrictChange}
              disabled={isDistrictDisabled}
              className="w-full text-lg p-3 border border-slate-300 rounded-lg 
              focus:ring-2 focus:ring-blue-500 focus:outline-none 
              disabled:bg-slate-100 disabled:cursor-not-allowed appearance-none 
              bg-no-repeat bg-right pr-8"
              style={{
                backgroundImage:
                  "url(\"data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e\")",
                backgroundPosition: "right 0.75rem center",
                backgroundSize: "1.5em 1.5em",
              }}
            >
              {loadingDistricts ? (
                <option disabled value="">
                  {t("loadingDistricts")}
                </option>
              ) : !selectedState ? (
                <option disabled value="">
                  {t("selectStateFirst")}
                </option>
              ) : districts.length === 0 ? (
                <option disabled value="">
                  {t("noDistrictsFound")}
                </option>
              ) : (
                <>
                  {!selectedDistrict && (
                    <option value="" disabled>
                      {t("selectDistrictPlaceholder")}
                    </option>
                  )}
                  {districts.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </>
              )}
            </select>
          </div>
        </div>

        {/* Get Performance Button */}
        <button
          type="button"
          onClick={onFetchPerformance}
          disabled={isFetchButtonDisabled}
          className="w-full md:w-auto mt-6 px-8 py-3 
          bg-gradient-to-r from-blue-600 to-blue-700 text-white text-lg 
          font-semibold rounded-lg shadow-md hover:from-blue-700 hover:to-blue-800 
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 
          transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed 
          flex items-center justify-center"
        >
          {isFetchingPerformance ? (
            <>
              <svg
                className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 
                  0 0 5.373 0 12h4zm2 5.291A7.962 
                  7.962 0 014 12H0c0 3.042 1.135 
                  5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              <span>{t("loading")}...</span>
            </>
          ) : (
            <span>{t("getPerformanceButton")}</span>
          )}
        </button>
      </div>
    </div>
  );
}

export default LocationSelector;
