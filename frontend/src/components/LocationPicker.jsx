import React, { useState } from 'react';
import { MapPin, Navigation, X, AlertCircle, CheckCircle2, ShieldCheck, Map } from 'lucide-react';

export default function LocationPicker({
  value = {},
  onChange,
  category = '',
  isSensitive = false,
  locationHint = ''
}) {
  const [geoState, setGeoState] = useState({
    loading: false,
    status: null, // 'granted' | 'denied' | 'error' | null
    errorMessage: ''
  });

  const selectedMode = value.locationType || (category === 'Electricity and Public Utilities' || category === 'Municipal and Environmental Issues' ? 'manual_address' : 'none');

  // Handle choice selection
  const handleModeChange = (mode) => {
    if (mode === 'none') {
      onChange({
        locationProvided: false,
        locationType: 'none',
        locationContext: 'unspecified',
        coordinates: null,
        addressText: '',
        city: '',
        consentGranted: false
      });
      setGeoState({ loading: false, status: null, errorMessage: '' });
    } else if (mode === 'manual_address') {
      onChange({
        ...value,
        locationProvided: Boolean(value.addressText),
        locationType: 'manual_address',
        coordinates: null,
        consentGranted: true
      });
    } else if (mode === 'current_gps') {
      onChange({
        ...value,
        locationType: 'current_gps'
      });
    }
  };

  // Browser Geolocation trigger
  const requestCurrentLocation = () => {
    if (!navigator.geolocation) {
      setGeoState({
        loading: false,
        status: 'error',
        errorMessage: 'Geolocation is not supported by your current browser.'
      });
      return;
    }

    setGeoState({ loading: true, status: null, errorMessage: '' });

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        setGeoState({
          loading: false,
          status: 'granted',
          errorMessage: ''
        });

        onChange({
          ...value,
          locationProvided: true,
          locationType: 'current_gps',
          consentGranted: true,
          coordinates: {
            latitude: parseFloat(latitude.toFixed(6)),
            longitude: parseFloat(longitude.toFixed(6)),
            accuracy: Math.round(accuracy)
          },
          addressText: value.addressText || `GPS Location (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`
        });
      },
      (error) => {
        let msg = 'Unable to retrieve location.';
        if (error.code === error.PERMISSION_DENIED) {
          msg = 'Location permission was denied. You can enter an address manually instead.';
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          msg = 'Location information is unavailable on your device.';
        } else if (error.code === error.TIMEOUT) {
          msg = 'Location request timed out. Please try again or type the address.';
        }
        setGeoState({
          loading: false,
          status: 'denied',
          errorMessage: msg
        });
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  const removeLocation = () => {
    onChange({
      locationProvided: false,
      locationType: 'none',
      locationContext: 'unspecified',
      coordinates: null,
      addressText: '',
      city: '',
      consentGranted: false
    });
    setGeoState({ loading: false, status: null, errorMessage: '' });
  };

  return (
    <div className="space-y-4">
      {/* Category guidance note */}
      {locationHint && (
        <div className="text-xs text-slate-600 bg-slate-50 border border-slate-200 rounded-lg p-3 flex items-start gap-2">
          <MapPin className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
          <span>{locationHint}</span>
        </div>
      )}

      {/* 3 Privacy-Aware Choices */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Choice 1: Current GPS */}
        <button
          type="button"
          onClick={() => handleModeChange('current_gps')}
          className={`p-4 rounded-xl border text-left transition-all flex flex-col justify-between ${
            selectedMode === 'current_gps'
              ? 'border-teal-600 bg-teal-50/50 ring-2 ring-teal-500/20'
              : 'border-slate-200 bg-white hover:border-slate-300'
          }`}
        >
          <div className="flex items-center gap-2 mb-2">
            <Navigation className={`w-4 h-4 ${selectedMode === 'current_gps' ? 'text-teal-700' : 'text-slate-500'}`} />
            <span className="font-semibold text-sm text-slate-900">1. Current Location</span>
          </div>
          <p className="text-xs text-slate-500">Detect device GPS coordinates with explicit browser permission.</p>
        </button>

        {/* Choice 2: Manual Address */}
        <button
          type="button"
          onClick={() => handleModeChange('manual_address')}
          className={`p-4 rounded-xl border text-left transition-all flex flex-col justify-between ${
            selectedMode === 'manual_address'
              ? 'border-teal-600 bg-teal-50/50 ring-2 ring-teal-500/20'
              : 'border-slate-200 bg-white hover:border-slate-300'
          }`}
        >
          <div className="flex items-center gap-2 mb-2">
            <Map className={`w-4 h-4 ${selectedMode === 'manual_address' ? 'text-teal-700' : 'text-slate-500'}`} />
            <span className="font-semibold text-sm text-slate-900">2. Enter Address</span>
          </div>
          <p className="text-xs text-slate-500">Provide landmark, campus, street or affected service address.</p>
        </button>

        {/* Choice 3: Continue Without Location */}
        <button
          type="button"
          onClick={() => handleModeChange('none')}
          className={`p-4 rounded-xl border text-left transition-all flex flex-col justify-between ${
            selectedMode === 'none'
              ? 'border-teal-600 bg-teal-50/50 ring-2 ring-teal-500/20'
              : 'border-slate-200 bg-white hover:border-slate-300'
          }`}
        >
          <div className="flex items-center gap-2 mb-2">
            <ShieldCheck className={`w-4 h-4 ${selectedMode === 'none' ? 'text-teal-700' : 'text-slate-500'}`} />
            <span className="font-semibold text-sm text-slate-900">3. Skip Location</span>
          </div>
          <p className="text-xs text-slate-500">Do not attach location data (ideal for safety & exam cases).</p>
        </button>
      </div>

      {/* Distinction of Location Context */}
      {selectedMode !== 'none' && (
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
          <label className="block text-xs font-semibold text-slate-700">
            What does this location represent?
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {[
              { id: 'user_current', label: "My Current Location" },
              { id: 'incident_site', label: "Where Incident Occurred" },
              { id: 'affected_address', label: "Affected Service / Utility Address" }
            ].map((ctx) => (
              <label
                key={ctx.id}
                className={`flex items-center gap-2 p-2 rounded-lg border text-xs cursor-pointer transition ${
                  value.locationContext === ctx.id
                    ? 'border-teal-600 bg-white text-teal-900 font-medium shadow-sm'
                    : 'border-slate-200 bg-slate-100/60 text-slate-600 hover:bg-white'
                }`}
              >
                <input
                  type="radio"
                  name="locationContext"
                  checked={value.locationContext === ctx.id}
                  onChange={() => onChange({ ...value, locationContext: ctx.id })}
                  className="text-teal-600 focus:ring-teal-500"
                />
                <span>{ctx.label}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Mode 1: Current GPS details */}
      {selectedMode === 'current_gps' && (
        <div className="p-4 border border-teal-200 rounded-xl bg-teal-50/30 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-sm font-semibold text-slate-800">Browser Geolocation</span>
            <button
              type="button"
              onClick={requestCurrentLocation}
              disabled={geoState.loading}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-teal-700 hover:bg-teal-800 text-white rounded-lg text-xs font-medium transition shadow-sm disabled:opacity-50"
            >
              <Navigation className="w-3.5 h-3.5" />
              <span>{geoState.loading ? 'Requesting Permission...' : value.coordinates?.latitude ? 'Re-detect Location' : 'Fetch GPS Location'}</span>
            </button>
          </div>

          {geoState.status === 'granted' && (
            <div className="flex items-center gap-2 text-xs text-emerald-800 bg-emerald-50 border border-emerald-200 p-2.5 rounded-lg">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Permission granted. Coordinates successfully recorded.</span>
            </div>
          )}

          {geoState.status === 'denied' && (
            <div className="flex items-start gap-2 text-xs text-rose-800 bg-rose-50 border border-rose-200 p-2.5 rounded-lg">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{geoState.errorMessage}</span>
            </div>
          )}

          {value.coordinates?.latitude && (
            <div className="bg-white p-3 rounded-lg border border-slate-200 text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-medium text-slate-700">Recorded Coordinates:</span>
                <button
                  type="button"
                  onClick={removeLocation}
                  className="text-rose-600 hover:text-rose-700 text-xs inline-flex items-center gap-1"
                >
                  <X className="w-3 h-3" /> Remove
                </button>
              </div>
              <p className="font-mono text-slate-600">
                Latitude: <strong className="text-slate-900">{value.coordinates.latitude}</strong> | Longitude: <strong className="text-slate-900">{value.coordinates.longitude}</strong> (Accuracy: ~{value.coordinates.accuracy}m)
              </p>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Optional landmark or street name for this GPS pin:
                </label>
                <input
                  type="text"
                  placeholder="e.g. Near Main Substation, Gate 3"
                  value={value.addressText || ''}
                  onChange={(e) => onChange({ ...value, addressText: e.target.value })}
                  className="w-full text-xs px-3 py-1.5 border border-slate-300 rounded-md focus:ring-1 focus:ring-teal-600"
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Mode 2: Manual Address */}
      {selectedMode === 'manual_address' && (
        <div className="p-4 border border-slate-200 rounded-xl bg-white space-y-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Address / Area / Landmark <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Sector 5, 2nd Cross Road, Opposite District Hospital"
              value={value.addressText || ''}
              onChange={(e) =>
                onChange({
                  ...value,
                  locationProvided: Boolean(e.target.value.trim()),
                  locationType: 'manual_address',
                  addressText: e.target.value,
                  consentGranted: true
                })
              }
              className="w-full text-sm px-3.5 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">City / Town</label>
              <input
                type="text"
                placeholder="e.g. Bangalore, Delhi, Pune"
                value={value.city || ''}
                onChange={(e) => onChange({ ...value, city: e.target.value })}
                className="w-full text-sm px-3.5 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">State / Province</label>
              <input
                type="text"
                placeholder="State or Region"
                value={value.state || ''}
                onChange={(e) => onChange({ ...value, state: e.target.value })}
                className="w-full text-sm px-3.5 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
              />
            </div>
          </div>
        </div>
      )}

      {/* Mode 3: Skip notice */}
      {selectedMode === 'none' && (
        <div className="p-3 bg-slate-100 rounded-xl text-xs text-slate-600 flex items-center justify-between">
          <span>No location will be shared. Your complaint will proceed without spatial reference.</span>
          <button
            type="button"
            onClick={() => handleModeChange('manual_address')}
            className="text-teal-700 hover:text-teal-800 font-semibold underline text-xs"
          >
            Add address
          </button>
        </div>
      )}

      {/* Privacy Guarantee Footer */}
      <div className="flex items-center gap-2 text-[11px] text-slate-500 px-1">
        <ShieldCheck className="w-3.5 h-3.5 text-teal-600 shrink-0" />
        <span>Privacy Protection: Exact GPS coordinates and residential addresses are strictly redacted in public tracking queries.</span>
      </div>
    </div>
  );
}
