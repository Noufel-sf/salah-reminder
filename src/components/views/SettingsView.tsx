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
  Sparkles,
  Sun,
  Moon,
  Keyboard,
  Sliders,
  Plus,
  Minus
} from 'lucide-react';
import { AppSettings, CalculationMethodKey, SoundOption, PrayerName } from '../../types/prayer';
import { audioService } from '../../utils/audio';

interface SettingsViewProps {
  settings: AppSettings;
  onSave: (newSettings: AppSettings) => void;
}

const ALGERIAN_CITIES = [
  { city: 'قسنطينة', country: 'الجزائر', lat: 36.3650, lng: 6.6147, method: 'Algeria' },
  { city: 'الخروب (قسنطينة)', country: 'الجزائر', lat: 36.2625, lng: 6.6917, method: 'Algeria' },
  { city: 'علي منجلي (قسنطينة)', country: 'الجزائر', lat: 36.2411, lng: 6.5708, method: 'Algeria' },
  { city: 'الجزائر العاصمة', country: 'الجزائر', lat: 36.7538, lng: 3.0588, method: 'Algeria' },
  { city: 'وهران', country: 'الجزائر', lat: 35.6987, lng: -0.6349, method: 'Algeria' },
  { city: 'عنابة', country: 'الجزائر', lat: 36.9000, lng: 7.7667, method: 'Algeria' },
  { city: 'سطيف', country: 'الجزائر', lat: 36.1911, lng: 5.4137, method: 'Algeria' },
  { city: 'باتنة', country: 'الجزائر', lat: 35.5559, lng: 6.1741, method: 'Algeria' },
  { city: 'بسكرة', country: 'الجزائر', lat: 34.8500, lng: 5.7333, method: 'Algeria' },
  { city: 'بجاية', country: 'الجزائر', lat: 36.7500, lng: 5.0667, method: 'Algeria' },
  { city: 'تلمسان', country: 'الجزائر', lat: 34.8783, lng: -1.3150, method: 'Algeria' },
  { city: 'البليدة', country: 'الجزائر', lat: 36.4700, lng: 2.8300, method: 'Algeria' },
  { city: 'جيجل', country: 'الجزائر', lat: 36.8206, lng: 5.7667, method: 'Algeria' },
  { city: 'ورقلة', country: 'الجزائر', lat: 31.9500, lng: 5.3333, method: 'Algeria' },
  { city: 'الشلف', country: 'الجزائر', lat: 36.1654, lng: 1.3345, method: 'Algeria' }
];

const INTERNATIONAL_CITIES = [
  { city: 'مكة المكرمة', country: 'السعودية', lat: 21.4225, lng: 39.8262, method: 'UmmAlQura' },
  { city: 'المدينة المنورة', country: 'السعودية', lat: 24.5247, lng: 39.5692, method: 'UmmAlQura' },
  { city: 'القدس الشريف', country: 'فلسطين', lat: 31.7683, lng: 35.2137, method: 'MuslimWorldLeague' },
  { city: 'القاهرة', country: 'مصر', lat: 30.0444, lng: 31.2357, method: 'Egyptian' },
  { city: 'إسطنبول', country: 'تركيا', lat: 41.0082, lng: 28.9784, method: 'MuslimWorldLeague' },
  { city: 'دبي', country: 'الإمارات', lat: 25.2048, lng: 55.2708, method: 'Dubai' },
  { city: 'الرباط', country: 'المغرب', lat: 34.0209, lng: -6.8416, method: 'MuslimWorldLeague' },
  { city: 'تونس', country: 'تونس', lat: 36.8065, lng: 10.1815, method: 'MuslimWorldLeague' },
  { city: 'الدوحة', country: 'قطر', lat: 25.2854, lng: 51.5310, method: 'Qatar' },
  { city: 'الكويت', country: 'الكويت', lat: 29.3759, lng: 47.9774, method: 'Kuwait' }
];

const PRAYERS_LIST: { id: PrayerName; label: string }[] = [
  { id: 'Fajr', label: 'الفجر' },
  { id: 'Sunrise', label: 'الشروق' },
  { id: 'Dhuhr', label: 'الظهر' },
  { id: 'Asr', label: 'العصر' },
  { id: 'Maghrib', label: 'المغرب' },
  { id: 'Isha', label: 'العشاء' }
];

export const SettingsView: React.FC<SettingsViewProps> = ({ settings, onSave }) => {
  const [formData, setFormData] = useState<AppSettings>(settings);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [isDetecting, setIsDetecting] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [presetTab, setPresetTab] = useState<'algeria' | 'international'>('algeria');

  const handlePreset = (p: { city: string; country: string; lat: number; lng: number; method: string }) => {
    setFormData((prev) => ({
      ...prev,
      city: p.city,
      country: p.country,
      latitude: p.lat,
      longitude: p.lng,
      calculationMethod: p.method as CalculationMethodKey
    }));
  };

  const handleAdjustmentChange = (prayerId: PrayerName, delta: number) => {
    setFormData((prev) => {
      const current = prev.prayerAdjustments?.[prayerId] || 0;
      const updated = Math.max(-20, Math.min(20, current + delta));
      return {
        ...prev,
        prayerAdjustments: {
          ...prev.prayerAdjustments,
          [prayerId]: updated
        }
      };
    });
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
      alert('تعذر التحديد التلقائي للموقع. يرجى إدخال الإحداثيات يدوياً أو اختيار مدينة من القائمة.');
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
    <div className="p-8 max-w-4xl mx-auto space-y-6 text-right font-readex">
      <div className="bg-white rounded-none p-8 border border-slate-200/90 shadow-sm">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-none bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center justify-center shrink-0">
              <SettingsIcon size={20} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 font-readex">إعدادات التطبيق</h2>
              <p className="text-xs text-slate-500 font-readex">تهيئة مواقيت الصلاة، الصوت، وتفضيلات النظام</p>
            </div>
          </div>

          <button
            onClick={handleSaveAll}
            className="flex items-center gap-2 px-6 py-2.5 rounded-none bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs shadow-sm transition-all cursor-pointer font-readex"
          >
            {isSaved ? <Check size={14} className="text-emerald-300" /> : <Sparkles size={14} />}
            <span>{isSaved ? 'تم الحفظ بنجاح!' : 'حفظ التغييرات'}</span>
          </button>
        </div>

        <div className="space-y-6">
          {/* Location & Coordinates */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2 font-readex">
                <MapPin size={16} className="text-emerald-700" />
                <span>الموقع الجغرافي والإحداثيات</span>
              </h3>
              <button
                onClick={handleAutoDetect}
                disabled={isDetecting}
                className="text-xs font-semibold text-emerald-800 hover:text-emerald-950 flex items-center gap-1.5 bg-emerald-50 px-3 py-1.5 rounded-none border border-emerald-200 cursor-pointer font-readex"
              >
                <RotateCcw size={12} className={isDetecting ? 'animate-spin' : ''} />
                <span>{isDetecting ? 'جاري التحديد عبر IP...' : 'تحديد الموقع تلقائياً'}</span>
              </button>
            </div>

            {/* Quick presets with Algerian and International tabs */}
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-2.5">
                <button
                  type="button"
                  onClick={() => setPresetTab('algeria')}
                  className={`px-3 py-1 text-xs font-semibold rounded-none cursor-pointer font-readex transition-colors ${
                    presetTab === 'algeria'
                      ? 'bg-emerald-800 text-white font-bold'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  الولايات والمدن الجزائرية
                </button>
                <button
                  type="button"
                  onClick={() => setPresetTab('international')}
                  className={`px-3 py-1 text-xs font-semibold rounded-none cursor-pointer font-readex transition-colors ${
                    presetTab === 'international'
                      ? 'bg-emerald-800 text-white font-bold'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  مدن وعواصم إسلامية
                </button>
              </div>

              <div className="flex flex-wrap gap-2">
                {(presetTab === 'algeria' ? ALGERIAN_CITIES : INTERNATIONAL_CITIES).map((p) => (
                  <button
                    key={p.city}
                    type="button"
                    onClick={() => handlePreset(p)}
                    className={`px-3 py-1.5 rounded-none text-xs font-semibold transition-all cursor-pointer font-readex ${
                      formData.city === p.city
                        ? 'bg-emerald-800 text-white shadow-xs font-bold'
                        : 'bg-slate-50 border border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {p.city}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-600 font-readex">المدينة</label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="w-full mt-1 bg-slate-50 border border-slate-200 rounded-none px-3 py-2 text-xs font-semibold text-slate-900 focus:outline-none focus:border-emerald-600 font-readex text-right"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 font-readex">الدولة</label>
                <input
                  type="text"
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  className="w-full mt-1 bg-slate-50 border border-slate-200 rounded-none px-3 py-2 text-xs font-semibold text-slate-900 focus:outline-none focus:border-emerald-600 font-readex text-right"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 font-readex">خط العرض (Latitude)</label>
                <input
                  type="number"
                  step="any"
                  value={formData.latitude}
                  onChange={(e) => setFormData({ ...formData, latitude: parseFloat(e.target.value) || 0 })}
                  className="w-full mt-1 bg-slate-50 border border-slate-200 rounded-none px-3 py-2 text-xs font-mono font-semibold text-slate-900 focus:outline-none focus:border-emerald-600 text-left"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 font-readex">خط الطول (Longitude)</label>
                <input
                  type="number"
                  step="any"
                  value={formData.longitude}
                  onChange={(e) => setFormData({ ...formData, longitude: parseFloat(e.target.value) || 0 })}
                  className="w-full mt-1 bg-slate-50 border border-slate-200 rounded-none px-3 py-2 text-xs font-mono font-semibold text-slate-900 focus:outline-none focus:border-emerald-600 text-left"
                />
              </div>
            </div>
          </div>

          {/* Calculation Method */}
          <div className="pt-4 border-t border-slate-100">
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2 mb-3 font-readex">
              <Compass size={16} className="text-emerald-700" />
              <span>طريقة الحساب والمذهب الفقهي</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-600 font-readex">طريقة حساب المواقيت</label>
                <select
                  value={formData.calculationMethod}
                  onChange={(e) => setFormData({ ...formData, calculationMethod: e.target.value as CalculationMethodKey })}
                  className="w-full mt-1 bg-slate-50 border border-slate-200 rounded-none px-3 py-2 text-xs font-semibold text-slate-900 focus:outline-none focus:border-emerald-600 font-readex text-right"
                >
                  <option value="Algeria">وزارة الشؤون الدينية والأوقاف - الجزائر (رسمي 18°/17°)</option>
                  <option value="MuslimWorldLeague">رابطة العالم الإسلامي</option>
                  <option value="Egyptian">الهيئة المصرية العامة للمساحة</option>
                  <option value="Karachi">جامعة العلوم الإسلامية بكراتشي</option>
                  <option value="UmmAlQura">جامعة أم القرى - مكة المكرمة</option>
                  <option value="Dubai">دائرة الشؤون الإسلامية بدبي</option>
                  <option value="Qatar">وزارة الأوقاف والشؤون الإسلامية - قطر</option>
                  <option value="Kuwait">وزارة الأوقاف والشؤون الإسلامية - الكويت</option>
                  <option value="MoonsightingCommittee">لجنة رؤية الهلال العالمية</option>
                  <option value="Singapore">المجلس الإسلامي بسنغافورة (MUIS)</option>
                  <option value="NorthAmerica">الجمعية الإسلامية لأمريكا الشمالية (ISNA)</option>
                </select>

                {formData.calculationMethod === 'Algeria' && (
                  <div className="mt-2.5 p-2.5 bg-emerald-50 border border-emerald-200 text-[11px] text-emerald-900 font-readex leading-relaxed">
                    <span className="font-bold">✓ معتمد بالجزائر:</span> زاوية الفجر 18°، زاوية العشاء 17°، واحتياط الغروب +3 دقائق. مطابق لرزنامة وزارة الشؤون الدينية والأوقاف لولاية قسنطينة والمدن الجزائرية.
                  </div>
                )}
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 font-readex">مذهب حساب صلاة العصر</label>
                <div className="grid grid-cols-2 gap-2 mt-1">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, madhab: 'shafi' })}
                    className={`py-2 px-3 rounded-none border text-center text-xs font-semibold transition-all cursor-pointer font-readex ${
                      formData.madhab === 'shafi'
                        ? 'bg-emerald-800 border-emerald-800 text-white font-bold'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    الجمهور (المالكي، الشافعي، الحنبلي)
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, madhab: 'hanafi' })}
                    className={`py-2 px-3 rounded-none border text-center text-xs font-semibold transition-all cursor-pointer font-readex ${
                      formData.madhab === 'hanafi'
                        ? 'bg-emerald-800 border-emerald-800 text-white font-bold'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    المذهب الحنفي
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Manual Prayer Time Adjustments */}
          <div className="pt-4 border-t border-slate-100">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2 font-readex">
                <Sliders size={16} className="text-emerald-700" />
                <span>الضبط اليدوي بالدقائق لمواقيت الصلاة</span>
              </h3>
              <button
                type="button"
                onClick={() => {
                  setFormData((prev) => ({
                    ...prev,
                    prayerAdjustments: { Fajr: 0, Sunrise: 0, Dhuhr: 0, Asr: 0, Maghrib: 0, Isha: 0 }
                  }));
                }}
                className="text-xs font-semibold text-slate-500 hover:text-slate-800 underline cursor-pointer font-readex"
              >
                تصفير التعديلات
              </button>
            </div>
            <p className="text-xs text-slate-500 mb-3 font-readex">
              إذا كان أذان المسجد في منطقتك بقسنطينة يختلف بدقيقة أو دقيقتين، يمكنك تقديم أو تأخير أي صلاة بدقة:
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
              {PRAYERS_LIST.map((pr) => {
                const adj = formData.prayerAdjustments?.[pr.id] || 0;
                return (
                  <div key={pr.id} className="p-2.5 bg-slate-50 border border-slate-200 text-center font-readex">
                    <span className="block text-xs font-bold text-slate-800 mb-1.5">{pr.label}</span>
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleAdjustmentChange(pr.id, -1)}
                        className="w-6 h-6 bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 flex items-center justify-center font-bold text-xs cursor-pointer"
                        title="إنقاص دقيقة"
                      >
                        <Minus size={11} />
                      </button>
                      <span className={`font-mono text-xs font-bold min-w-[2.2rem] ${adj > 0 ? 'text-emerald-700' : adj < 0 ? 'text-amber-700' : 'text-slate-600'}`}>
                        {adj > 0 ? `+${adj}` : adj} د
                      </span>
                      <button
                        type="button"
                        onClick={() => handleAdjustmentChange(pr.id, 1)}
                        className="w-6 h-6 bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 flex items-center justify-center font-bold text-xs cursor-pointer"
                        title="زيادة دقيقة"
                      >
                        <Plus size={11} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Sound & Audio */}
          <div className="pt-4 border-t border-slate-100">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2 font-readex">
                <Volume2 size={16} className="text-emerald-700" />
                <span>أصوات الأذان والتنبيهات</span>
              </h3>
              <button
                type="button"
                onClick={handleTestSound}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-none bg-emerald-50 text-emerald-800 text-xs font-semibold hover:bg-emerald-100 transition-colors cursor-pointer font-readex border border-emerald-200"
              >
                {isPlayingAudio ? <Square size={12} /> : <Play size={12} />}
                <span>{isPlayingAudio ? 'إيقاف الصوت' : 'تجربة الصوت'}</span>
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-2 mb-4">
              {[
                { id: 'takbeer', label: 'تكبيرات الأذان' },
                { id: 'soft_chime', label: 'رنين هادئ' },
                { id: 'full_adhan', label: 'الأذان كاملاً' },
                { id: 'beep', label: 'نغمة تنبيه بسيطة' },
                { id: 'silent', label: 'وضع الصامت' }
              ].map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setFormData({ ...formData, soundOption: s.id as SoundOption })}
                  className={`p-3 rounded-none border text-xs font-semibold transition-all cursor-pointer font-readex ${
                    formData.soundOption === s.id
                      ? 'bg-emerald-800 border-emerald-800 text-white shadow-xs font-bold'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-600 mb-1.5 font-readex">
                <span>مستوى صوت الأذان</span>
                <span className="font-mono">{Math.round(formData.adhanVolume * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={formData.adhanVolume}
                onChange={(e) => setFormData({ ...formData, adhanVolume: parseFloat(e.target.value) })}
                className="w-full accent-emerald-700 cursor-pointer"
              />
            </div>
          </div>

          {/* Theme / Appearance */}
          <div className="pt-4 border-t border-slate-100">
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2 mb-3 font-readex">
              <Sun size={16} className="text-emerald-700" />
              <span>مظهر التطبيق (الوضع النهاري / الليلي)</span>
            </h3>

            <div className="grid grid-cols-2 gap-3 max-w-md">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, theme: 'light' })}
                className={`py-2.5 px-4 rounded-none border flex items-center justify-center gap-2 text-xs font-semibold transition-all cursor-pointer font-readex ${
                  formData.theme !== 'dark'
                    ? 'bg-emerald-800 border-emerald-800 text-white font-bold'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <Sun size={14} />
                <span>الوضع النهاري (فاتح)</span>
              </button>

              <button
                type="button"
                onClick={() => setFormData({ ...formData, theme: 'dark' })}
                className={`py-2.5 px-4 rounded-none border flex items-center justify-center gap-2 text-xs font-semibold transition-all cursor-pointer font-readex ${
                  formData.theme === 'dark'
                    ? 'bg-emerald-800 border-emerald-800 text-white font-bold'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <Moon size={14} />
                <span>الوضع الليلي (داكن)</span>
              </button>
            </div>
          </div>

          {/* Global Hotkeys */}
          <div className="pt-4 border-t border-slate-100">
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2 mb-3 font-readex">
              <Keyboard size={16} className="text-emerald-700" />
              <span>اختصارات لوحة المفاتيح (Global Hotkeys)</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="p-3.5 bg-slate-50 border border-slate-200 text-right">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-800 font-readex">إظهار / إخفاء التطبيق</span>
                  <div className="flex items-center gap-1 font-mono text-xs">
                    <kbd className="px-2 py-0.5 bg-white border border-slate-300 text-slate-800 font-bold shadow-xs">Ctrl</kbd>
                    <span className="text-slate-400">+</span>
                    <kbd className="px-2 py-0.5 bg-white border border-slate-300 text-slate-800 font-bold shadow-xs">Shift</kbd>
                    <span className="text-slate-400">+</span>
                    <kbd className="px-2 py-0.5 bg-emerald-800 text-white font-bold border border-emerald-900 shadow-xs">P</kbd>
                  </div>
                </div>
                <p className="text-[11px] text-slate-500 font-readex leading-relaxed">
                  اختصار عالمي يعمل من أي نافذة أو برنامج في نظام ويندوز لإظهار شاشة الصلاة أو إخفائها فوراً.
                </p>
              </div>

              <div className="p-3.5 bg-slate-50 border border-slate-200 text-right">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-800 font-readex">التسبيح السريع</span>
                  <div className="flex items-center gap-1 font-mono text-xs">
                    <kbd className="px-3 py-0.5 bg-white border border-slate-300 text-slate-800 font-bold shadow-xs">Space</kbd>
                  </div>
                </div>
                <p className="text-[11px] text-slate-500 font-readex leading-relaxed">
                  اضغط مفتاح المسافة في أي مكان داخل التطبيق للعد الفوري مع إشعار طافي وحفظ في الإحصائيات (يتوقف تلقائياً عند الكتابة في الخانات).
                </p>
              </div>
            </div>
          </div>

          {/* Autostart */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <div>
              <h4 className="font-bold text-sm text-slate-900 font-readex">التشغيل التلقائي مع إقلاع النظام</h4>
              <p className="text-xs text-slate-500 font-readex">بدء تشغيل التطبيق في شريط المهام بهدوء عند إقلاع جهاز الكمبيوتر</p>
            </div>
            <input
              type="checkbox"
              checked={formData.autoStart}
              onChange={(e) => {
                const checked = e.target.checked;
                setFormData({ ...formData, autoStart: checked });
                window.electronAPI?.setStartup(checked);
              }}
              className="w-5 h-5 accent-emerald-700 rounded-none cursor-pointer"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
