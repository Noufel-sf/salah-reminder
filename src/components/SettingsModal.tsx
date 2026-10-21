import React, { useState } from 'react';
import { 
  X, 
  Settings as SettingsIcon, 
  MapPin, 
  Volume2, 
  Play, 
  Square, 
  RotateCcw,
  Compass
} from 'lucide-react';
import { AppSettings, CalculationMethodKey, SoundOption } from '../types/prayer';
import { audioService } from '../utils/audio';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onSave: (newSettings: AppSettings) => void;
}

const CITY_PRESETS = [
  { city: 'Algiers', country: 'Algeria', lat: 36.7538, lng: 3.0588, method: 'MuslimWorldLeague' },
  { city: 'Mecca', country: 'Saudi Arabia', lat: 21.4225, lng: 39.8262, method: 'UmmAlQura' },
  { city: 'Medina', country: 'Saudi Arabia', lat: 24.5247, lng: 39.5692, method: 'UmmAlQura' },
  { city: 'Cairo', country: 'Egypt', lat: 30.0444, lng: 31.2357, method: 'Egyptian' },
  { city: 'Istanbul', country: 'Turkey', lat: 41.0082, lng: 28.9784, method: 'MuslimWorldLeague' },
  { city: 'Dubai', country: 'UAE', lat: 25.2048, lng: 55.2708, method: 'Dubai' },
  { city: 'London', country: 'United Kingdom', lat: 51.5074, lng: -0.1278, method: 'MuslimWorldLeague' },
  { city: 'Paris', country: 'France', lat: 48.8566, lng: 2.3522, method: 'MuslimWorldLeague' },
  { city: 'New York', country: 'USA', lat: 40.7128, lng: -74.006, method: 'NorthAmerica' },
  { city: 'Kuala Lumpur', country: 'Malaysia', lat: 3.139, lng: 101.6869, method: 'Singapore' }
];

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSave
}) => {
  const [formData, setFormData] = useState<AppSettings>(settings);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);

  if (!isOpen) return null;

  const handlePresetSelect = (preset: typeof CITY_PRESETS[0]) => {
    setFormData((prev) => ({
      ...prev,
      city: preset.city,
      country: preset.country,
      latitude: preset.lat,
      longitude: preset.lng,
      calculationMethod: preset.method as CalculationMethodKey
    }));
  };

  const handleAutoDetect = async () => {
    setIsDetectingLocation(true);
    try {
      const res = await fetch('https://ipapi.co/json/');
      const data = await res.json();
      if (data.city && data.latitude && data.longitude) {
        setFormData((prev) => ({
          ...prev,
          city: data.city,
          country: data.country_name || prev.country,
          latitude: parseFloat(data.latitude),
          longitude: parseFloat(data.longitude)
        }));
      }
    } catch {
      alert('Could not auto-detect location. Please enter coordinates or choose a preset.');
    } finally {
      setIsDetectingLocation(false);
    }
  };

  const handleTestSound = () => {
    if (isPlayingAudio) {
      audioService.stop();
      setIsPlayingAudio(false);
    } else {
      setIsPlayingAudio(true);
      audioService.playSound(formData.soundOption, formData.adhanVolume);
      setTimeout(() => {
        setIsPlayingAudio(false);
      }, 7000);
    }
  };

  const handleSave = () => {
    audioService.stop();
    onSave(formData);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="glass-panel w-full max-w-md max-h-[85vh] overflow-y-auto p-6 relative bg-slate-900/95 border border-white/10 shadow-2xl rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/[0.08] mb-5">
          <div className="flex items-center gap-2">
            <SettingsIcon size={18} className="text-emerald-400" />
            <h3 className="font-bold text-base text-white">App Settings</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        <div className="space-y-5 text-xs text-slate-300">
          {/* Section 1: Location */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="font-semibold text-white flex items-center gap-1.5">
                <MapPin size={13} className="text-emerald-400" />
                Location & Coordinates
              </label>
              <button
                onClick={handleAutoDetect}
                disabled={isDetectingLocation}
                className="text-[11px] text-emerald-400 hover:text-emerald-300 font-medium flex items-center gap-1"
              >
                <RotateCcw size={10} className={isDetectingLocation ? 'animate-spin' : ''} />
                {isDetectingLocation ? 'Detecting...' : 'Auto Detect (IP)'}
              </button>
            </div>

            {/* Quick Presets */}
            <div className="flex flex-wrap gap-1.5 mb-3">
              {CITY_PRESETS.slice(0, 5).map((p) => (
                <button
                  key={p.city}
                  type="button"
                  onClick={() => handlePresetSelect(p)}
                  className={`px-2 py-1 rounded-md text-[10px] font-medium transition-colors ${
                    formData.city === p.city
                      ? 'bg-emerald-500 text-slate-950 font-bold'
                      : 'bg-white/[0.05] hover:bg-white/[0.1] text-slate-300'
                  }`}
                >
                  {p.city}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="text-[10px] text-slate-400">City</span>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="w-full mt-1 bg-white/[0.05] border border-white/10 rounded-lg px-2.5 py-1.5 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <span className="text-[10px] text-slate-400">Country</span>
                <input
                  type="text"
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  className="w-full mt-1 bg-white/[0.05] border border-white/10 rounded-lg px-2.5 py-1.5 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <span className="text-[10px] text-slate-400">Latitude</span>
                <input
                  type="number"
                  step="any"
                  value={formData.latitude}
                  onChange={(e) => setFormData({ ...formData, latitude: parseFloat(e.target.value) || 0 })}
                  className="w-full mt-1 bg-white/[0.05] border border-white/10 rounded-lg px-2.5 py-1.5 text-white focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>
              <div>
                <span className="text-[10px] text-slate-400">Longitude</span>
                <input
                  type="number"
                  step="any"
                  value={formData.longitude}
                  onChange={(e) => setFormData({ ...formData, longitude: parseFloat(e.target.value) || 0 })}
                  className="w-full mt-1 bg-white/[0.05] border border-white/10 rounded-lg px-2.5 py-1.5 text-white focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Calculation Method & Madhab */}
          <div className="pt-3 border-t border-white/[0.08]">
            <label className="font-semibold text-white flex items-center gap-1.5 mb-2">
              <Compass size={13} className="text-emerald-400" />
              Calculation Method & Juristic School
            </label>

            <div className="space-y-2">
              <div>
                <span className="text-[10px] text-slate-400">Method</span>
                <select
                  value={formData.calculationMethod}
                  onChange={(e) => setFormData({ ...formData, calculationMethod: e.target.value as CalculationMethodKey })}
                  className="w-full mt-1 bg-slate-800 border border-white/10 rounded-lg px-2.5 py-1.5 text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="MuslimWorldLeague">Muslim World League (MWL)</option>
                  <option value="Egyptian">Egyptian General Authority of Survey</option>
                  <option value="Karachi">University of Islamic Sciences, Karachi</option>
                  <option value="UmmAlQura">Umm al-Qura University, Makkah</option>
                  <option value="Dubai">Dubai / UAE General Authority</option>
                  <option value="Qatar">Qatar</option>
                  <option value="Kuwait">Kuwait</option>
                  <option value="MoonsightingCommittee">Moonsighting Committee Worldwide</option>
                  <option value="Singapore">Singapore (MUIS)</option>
                  <option value="NorthAmerica">ISNA (North America)</option>
                </select>
              </div>

              <div>
                <span className="text-[10px] text-slate-400">Asr Juristic Method</span>
                <div className="grid grid-cols-2 gap-2 mt-1">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, madhab: 'shafi' })}
                    className={`py-1.5 px-3 rounded-lg border text-center transition-colors ${
                      formData.madhab === 'shafi'
                        ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300 font-medium'
                        : 'bg-white/[0.03] border-white/10 text-slate-400 hover:text-white'
                    }`}
                  >
                    Standard (Shafi'i, Maliki, Hanbali)
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, madhab: 'hanafi' })}
                    className={`py-1.5 px-3 rounded-lg border text-center transition-colors ${
                      formData.madhab === 'hanafi'
                        ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300 font-medium'
                        : 'bg-white/[0.03] border-white/10 text-slate-400 hover:text-white'
                    }`}
                  >
                    Hanafi
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Audio & Notification Sound */}
          <div className="pt-3 border-t border-white/[0.08]">
            <div className="flex items-center justify-between mb-2">
              <label className="font-semibold text-white flex items-center gap-1.5">
                <Volume2 size={13} className="text-emerald-400" />
                Notification Audio
              </label>
              <button
                type="button"
                onClick={handleTestSound}
                className="px-2.5 py-1 rounded-md bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-[10px] font-semibold flex items-center gap-1 transition-colors"
              >
                {isPlayingAudio ? <Square size={10} /> : <Play size={10} />}
                {isPlayingAudio ? 'Stop Preview' : 'Test Sound'}
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 mb-3">
              {[
                { id: 'takbeer', label: 'Takbeer Call' },
                { id: 'soft_chime', label: 'Peaceful Chime' },
                { id: 'full_adhan', label: 'Full Adhan' },
                { id: 'beep', label: 'Subtle Beep' },
                { id: 'silent', label: 'Muted / Silent' }
              ].map((sound) => (
                <button
                  key={sound.id}
                  type="button"
                  onClick={() => setFormData({ ...formData, soundOption: sound.id as SoundOption })}
                  className={`py-1.5 px-3 rounded-lg border text-left transition-colors ${
                    formData.soundOption === sound.id
                      ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300 font-medium'
                      : 'bg-white/[0.03] border-white/10 text-slate-400 hover:text-white'
                  }`}
                >
                  {sound.label}
                </button>
              ))}
            </div>

            {/* Volume Slider */}
            <div>
              <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                <span>Sound Volume</span>
                <span>{Math.round(formData.adhanVolume * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={formData.adhanVolume}
                onChange={(e) => setFormData({ ...formData, adhanVolume: parseFloat(e.target.value) })}
                className="w-full accent-emerald-500"
              />
            </div>
          </div>

          {/* Section 4: System Startup */}
          <div className="pt-3 border-t border-white/[0.08] flex items-center justify-between">
            <div>
              <span className="font-semibold text-white block">Start with Windows</span>
              <span className="text-[10px] text-slate-500">Launch quietly in the background tray at startup</span>
            </div>
            <input
              type="checkbox"
              checked={formData.autoStart}
              onChange={(e) => {
                const checked = e.target.checked;
                setFormData({ ...formData, autoStart: checked });
                window.electronAPI?.setStartup(checked);
              }}
              className="w-4 h-4 accent-emerald-500 rounded cursor-pointer"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 mt-6 pt-4 border-t border-white/[0.08]">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2 px-3 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] text-slate-300 font-semibold text-xs transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="flex-1 py-2 px-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs transition-colors shadow-lg shadow-emerald-500/20"
          >
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
};
