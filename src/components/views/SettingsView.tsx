import React, { useState } from 'react';
import { 
  Settings as SettingsIcon, 
  MapPin, 
  Compass, 
  Volume2, 
  Play, 
  Square, 
  RotateCcw, 
  Check, 
  Sparkles 
} from 'lucide-react';
import { AppSettings, CalculationMethodKey, SoundOption } from '../../types/prayer';
import { audioService } from '../../utils/audio';

interface SettingsViewProps {
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
  { city: 'Lahore', country: 'Pakistan', lat: 31.5204, lng: 74.3587, method: 'Karachi' }
];

export const SettingsView: React.FC<SettingsViewProps> = ({ settings, onSave }) => {
  const [formData, setFormData] = useState<AppSettings>(settings);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [isDetecting, setIsDetecting] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const handlePreset = (p: typeof CITY_PRESETS[0]) => {
    setFormData((prev) => ({
      ...prev,
      city: p.city,
      country: p.country,
      latitude: p.lat,
      longitude: p.lng,
      calculationMethod: p.method as CalculationMethodKey
    }));
  };

  const handleAutoDetect = async () => {
    setIsDetecting(true);
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
      alert('Could not auto-detect location. Please use manual coordinates or presets.');
    } finally {
      setIsDetecting(false);
    }
  };

  const handleTestSound = () => {
    if (isPlayingAudio) {
      audioService.stop();
      setIsPlayingAudio(false);
    } else {
      setIsPlayingAudio(true);
      audioService.playSound(formData.soundOption, formData.adhanVolume);
      setTimeout(() => setIsPlayingAudio(false), 7000);
    }
  };

  const handleSaveAll = () => {
    audioService.stop();
    onSave(formData);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6">
      <div className="sage-card p-8">
        <div className="flex items-center justify-between pb-4 border-b border-[#edf3ee] mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#164e3c] text-[#52b788] flex items-center justify-center">
              <SettingsIcon size={20} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-[#114232]">Application Settings</h2>
              <p className="text-xs text-[#74897f]">Configure prayer calculations, audio, and system preferences</p>
            </div>
          </div>

          <button
            onClick={handleSaveAll}
            className="flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-[#164e3c] hover:bg-[#205c47] text-white font-bold text-xs shadow-md shadow-[#164e3c]/20 transition-all cursor-pointer"
          >
            {isSaved ? <Check size={14} className="text-[#52b788]" /> : <Sparkles size={14} />}
            <span>{isSaved ? 'Settings Saved!' : 'Save Changes'}</span>
          </button>
        </div>

        <div className="space-y-6">
          {/* Location & Coordinates */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-sm text-[#114232] flex items-center gap-2">
                <MapPin size={16} className="text-[#2d6a4f]" />
                Location & Coordinates
              </h3>
              <button
                onClick={handleAutoDetect}
                disabled={isDetecting}
                className="text-xs font-semibold text-[#2d6a4f] hover:text-[#114232] flex items-center gap-1.5 bg-[#f0f7f2] px-3 py-1.5 rounded-xl border border-[#d8e6dc]"
              >
                <RotateCcw size={12} className={isDetecting ? 'animate-spin' : ''} />
                <span>{isDetecting ? 'Detecting via IP...' : 'Auto-Detect Location'}</span>
              </button>
            </div>

            {/* Quick presets */}
            <div className="flex flex-wrap gap-2 mb-4">
              {CITY_PRESETS.map((p) => (
                <button
                  key={p.city}
                  onClick={() => handlePreset(p)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    formData.city === p.city
                      ? 'bg-[#164e3c] text-white shadow-sm'
                      : 'bg-[#fafbfa] border border-[#edf3ee] text-[#486356] hover:bg-[#f0f7f2]'
                  }`}
                >
                  {p.city}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div>
                <label className="text-xs font-semibold text-[#74897f]">City</label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="w-full mt-1 bg-[#fafbfa] border border-[#d8e6dc] rounded-xl px-3 py-2 text-xs font-semibold text-[#114232] focus:outline-none focus:border-[#2d6a4f]"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-[#74897f]">Country</label>
                <input
                  type="text"
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  className="w-full mt-1 bg-[#fafbfa] border border-[#d8e6dc] rounded-xl px-3 py-2 text-xs font-semibold text-[#114232] focus:outline-none focus:border-[#2d6a4f]"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-[#74897f]">Latitude</label>
                <input
                  type="number"
                  step="any"
                  value={formData.latitude}
                  onChange={(e) => setFormData({ ...formData, latitude: parseFloat(e.target.value) || 0 })}
                  className="w-full mt-1 bg-[#fafbfa] border border-[#d8e6dc] rounded-xl px-3 py-2 text-xs font-mono font-semibold text-[#114232] focus:outline-none focus:border-[#2d6a4f]"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-[#74897f]">Longitude</label>
                <input
                  type="number"
                  step="any"
                  value={formData.longitude}
                  onChange={(e) => setFormData({ ...formData, longitude: parseFloat(e.target.value) || 0 })}
                  className="w-full mt-1 bg-[#fafbfa] border border-[#d8e6dc] rounded-xl px-3 py-2 text-xs font-mono font-semibold text-[#114232] focus:outline-none focus:border-[#2d6a4f]"
                />
              </div>
            </div>
          </div>

          {/* Calculation Method */}
          <div className="pt-4 border-t border-[#edf3ee]">
            <h3 className="font-bold text-sm text-[#114232] flex items-center gap-2 mb-3">
              <Compass size={16} className="text-[#2d6a4f]" />
              Calculation Method & Juristic School
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-[#74897f]">Calculation Method</label>
                <select
                  value={formData.calculationMethod}
                  onChange={(e) => setFormData({ ...formData, calculationMethod: e.target.value as CalculationMethodKey })}
                  className="w-full mt-1 bg-[#fafbfa] border border-[#d8e6dc] rounded-xl px-3 py-2 text-xs font-semibold text-[#114232] focus:outline-none focus:border-[#2d6a4f]"
                >
                  <option value="MuslimWorldLeague">Muslim World League (MWL)</option>
                  <option value="Egyptian">Egyptian General Authority of Survey</option>
                  <option value="Karachi">University of Islamic Sciences, Karachi</option>
                  <option value="UmmAlQura">Umm al-Qura University, Makkah</option>
                  <option value="Dubai">Dubai & UAE General Authority</option>
                  <option value="Qatar">Qatar</option>
                  <option value="Kuwait">Kuwait</option>
                  <option value="MoonsightingCommittee">Moonsighting Committee Worldwide</option>
                  <option value="Singapore">Singapore (MUIS)</option>
                  <option value="NorthAmerica">ISNA (North America)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-[#74897f]">Asr Juristic Method</label>
                <div className="grid grid-cols-2 gap-2 mt-1">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, madhab: 'shafi' })}
                    className={`py-2 px-3 rounded-xl border text-center text-xs font-semibold transition-all ${
                      formData.madhab === 'shafi'
                        ? 'bg-[#164e3c] border-[#164e3c] text-white'
                        : 'bg-[#fafbfa] border-[#d8e6dc] text-[#486356] hover:bg-[#f0f7f2]'
                    }`}
                  >
                    Standard (Shafi'i, Maliki)
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, madhab: 'hanafi' })}
                    className={`py-2 px-3 rounded-xl border text-center text-xs font-semibold transition-all ${
                      formData.madhab === 'hanafi'
                        ? 'bg-[#164e3c] border-[#164e3c] text-white'
                        : 'bg-[#fafbfa] border-[#d8e6dc] text-[#486356] hover:bg-[#f0f7f2]'
                    }`}
                  >
                    Hanafi
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Sound & Audio */}
          <div className="pt-4 border-t border-[#edf3ee]">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-sm text-[#114232] flex items-center gap-2">
                <Volume2 size={16} className="text-[#2d6a4f]" />
                Prayer Call & Sound Settings
              </h3>
              <button
                type="button"
                onClick={handleTestSound}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#eaf4ee] text-[#2d6a4f] text-xs font-semibold hover:bg-[#d8f3dc] transition-colors"
              >
                {isPlayingAudio ? <Square size={12} /> : <Play size={12} />}
                <span>{isPlayingAudio ? 'Stop Sound' : 'Test Sound'}</span>
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-2 mb-4">
              {[
                { id: 'takbeer', label: 'Takbeer Call' },
                { id: 'soft_chime', label: 'Peaceful Chime' },
                { id: 'full_adhan', label: 'Full Adhan' },
                { id: 'beep', label: 'Subtle Beep' },
                { id: 'silent', label: 'Silent Mode' }
              ].map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setFormData({ ...formData, soundOption: s.id as SoundOption })}
                  className={`p-3 rounded-xl border text-xs font-semibold transition-all ${
                    formData.soundOption === s.id
                      ? 'bg-[#164e3c] border-[#164e3c] text-white shadow-sm'
                      : 'bg-[#fafbfa] border-[#d8e6dc] text-[#486356] hover:bg-[#f0f7f2]'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold text-[#74897f] mb-1.5">
                <span>Alert Volume</span>
                <span>{Math.round(formData.adhanVolume * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={formData.adhanVolume}
                onChange={(e) => setFormData({ ...formData, adhanVolume: parseFloat(e.target.value) })}
                className="w-full accent-[#2d6a4f]"
              />
            </div>
          </div>

          {/* Autostart */}
          <div className="pt-4 border-t border-[#edf3ee] flex items-center justify-between">
            <div>
              <h4 className="font-bold text-sm text-[#114232]">Launch at Windows Startup</h4>
              <p className="text-xs text-[#74897f]">Start Noor quietly in the system tray when your computer boots</p>
            </div>
            <input
              type="checkbox"
              checked={formData.autoStart}
              onChange={(e) => {
                const checked = e.target.checked;
                setFormData({ ...formData, autoStart: checked });
                window.electronAPI?.setStartup(checked);
              }}
              className="w-5 h-5 accent-[#2d6a4f] rounded-lg cursor-pointer"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
