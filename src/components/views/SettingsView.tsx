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
  Minus,
  Bell,
  Clock,
  Hourglass,
  AppWindow
} from 'lucide-react';
import { AppSettings, CalculationMethodKey, SoundOption, PrayerName } from '../../types/prayer';
import { audioService } from '../../utils/audio';
import { DEFAULT_IQAMAH_MINUTES } from '../../utils/prayerTimes';
import { sendDhikrNotification } from '../../utils/dhikrNotifications';

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

const OBLIGATORY_PRAYERS_LIST: { id: PrayerName; label: string }[] = [
  { id: 'Fajr', label: 'الفجر' },
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

  const handleIqamahDurationChange = (prayerId: PrayerName, delta: number) => {
    setFormData((prev) => {
      const current = prev.iqamahDurations?.[prayerId] ?? DEFAULT_IQAMAH_MINUTES[prayerId] ?? 15;
      const updated = Math.max(1, Math.min(60, current + delta));
      return {
        ...prev,
        iqamahDurations: {
          ...DEFAULT_IQAMAH_MINUTES,
          ...prev.iqamahDurations,
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

  React.useEffect(() => {
    const handleStop = () => setIsPlayingAudio(false);
    window.addEventListener('adhan-stopped', handleStop);
    return () => window.removeEventListener('adhan-stopped', handleStop);
  }, []);

  const handleTestSound = () => {
    if (isPlayingAudio) {
      audioService.stop();
      setIsPlayingAudio(false);
    } else {
      setIsPlayingAudio(true);
      audioService.playSound(formData.soundOption, formData.adhanVolume);
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

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => window.dispatchEvent(new CustomEvent('open-onboarding'))}
              className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-none bg-slate-100 dark:bg-[#162520] hover:bg-slate-200 dark:hover:bg-[#20362c] text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-[#233b31] font-semibold text-xs transition-colors cursor-pointer font-readex"
              title="إعادة فتح شاشة الترحيب والتهيئة الأولى"
            >
              <Sparkles size={13} className="text-emerald-700 dark:text-emerald-400" />
              <span>جولة الترحيب 🌿</span>
            </button>

            <button
              onClick={handleSaveAll}
              className="flex items-center gap-2 px-6 py-2.5 rounded-none bg-emerald-800 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition-all cursor-pointer font-readex"
            >
              {isSaved ? <Check size={14} className="text-emerald-300" /> : <Sparkles size={14} />}
              <span>{isSaved ? 'تم الحفظ بنجاح!' : 'حفظ التغييرات'}</span>
            </button>
          </div>
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

            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-4">
              {[
                { id: 'full_adhan', label: 'الأذان كاملاً (الحرم المكي)' },
                { id: 'adhan_algeria', label: 'الأذان كاملاً (الجزائري)' },
                { id: 'adhan_madinah', label: 'الأذان كاملاً (الحرم المدني)' },
                { id: 'soft_chime', label: 'رنين هادئ' },
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

          {/* Pre-Adhan Preparation & Iqamah Countdown Timers */}
          <div className="pt-4 border-t border-slate-100 space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2 font-readex">
                  <Clock size={16} className="text-emerald-700" />
                  <span>تنبيه الاستعداد للصلاة (قبل الأذان)</span>
                </h3>
                <button
                  type="button"
                  onClick={() => {
                    window.dispatchEvent(
                      new CustomEvent('trigger-test-preadhan', {
                        detail: { prayerName: 'الظهر', minutes: formData.remindMinutesBefore || 15 }
                      })
                    );
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-none bg-amber-50 text-amber-800 text-xs font-semibold hover:bg-amber-100 transition-colors cursor-pointer font-readex border border-amber-300"
                  title="تجربة إشعار الاستعداد قبل الأذان"
                >
                  <Sparkles size={12} />
                  <span>تجربة تنبيه الاستعداد</span>
                </button>
              </div>

              <p className="text-xs text-slate-500 mb-3 font-readex leading-relaxed">
                إشعار لطيف بصوت خافت «اقترب موعد صلاة الظهر - استعد للوضوء»، ليمنحك وقتاً كافياً للوضوء وأذكار المسجد قبل رفع الأذان:
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {[
                  { value: 0, label: 'إيقاف التنبيه' },
                  { value: 5, label: 'قبل 5 دقائق' },
                  { value: 10, label: 'قبل 10 دقائق' },
                  { value: 15, label: 'قبل 15 دقيقة (موصى به)' },
                  { value: 20, label: 'قبل 20 دقيقة' }
                ].map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, remindMinutesBefore: opt.value })}
                    className={`py-2 px-3 rounded-none border text-center text-xs font-semibold transition-all cursor-pointer font-readex ${
                      formData.remindMinutesBefore === opt.value
                        ? 'bg-emerald-800 border-emerald-800 text-white font-bold shadow-xs'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Iqamah Countdown Section */}
            <div className="pt-3 border-t border-slate-200/70">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Hourglass size={16} className="text-emerald-700" />
                  <div>
                    <h4 className="font-bold text-xs text-slate-900 font-readex">مؤقت إقامة الصلاة في المسجد (Iqamah Countdown)</h4>
                    <p className="text-[11px] text-slate-500 font-readex">
                      يبدأ مؤقت تنازلي بالدقائق والثواني بعد رفع الأذان مع شريط تقدم وتنبيه عند حلول الإقامة
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      window.dispatchEvent(
                        new CustomEvent('trigger-test-iqamah', {
                          detail: { prayerName: 'الظهر' }
                        })
                      );
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-none bg-emerald-50 text-emerald-800 text-xs font-semibold hover:bg-emerald-100 transition-colors cursor-pointer font-readex border border-emerald-300"
                    title="تجربة إشعار حلول وقت الإقامة"
                  >
                    <Sparkles size={12} />
                    <span>تجربة تنبيه الإقامة</span>
                  </button>

                  <input
                    type="checkbox"
                    checked={formData.iqamahEnabled !== false}
                    onChange={(e) => setFormData({ ...formData, iqamahEnabled: e.target.checked })}
                    className="w-5 h-5 accent-emerald-700 rounded-none cursor-pointer"
                  />
                </div>
              </div>

              {formData.iqamahEnabled !== false && (
                <div className="mt-3 p-3 bg-slate-50 border border-slate-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-700 font-readex">
                      تحديد وقت الإقامة لكل صلاة (بالدقائق):
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setFormData((prev) => ({
                          ...prev,
                          iqamahDurations: { ...DEFAULT_IQAMAH_MINUTES }
                        }));
                      }}
                      className="text-xs font-semibold text-slate-500 hover:text-slate-800 underline cursor-pointer font-readex"
                    >
                      استعادة الأوقات الرسمية
                    </button>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                    {OBLIGATORY_PRAYERS_LIST.map((pr) => {
                      const mins = formData.iqamahDurations?.[pr.id] ?? DEFAULT_IQAMAH_MINUTES[pr.id] ?? 15;
                      return (
                        <div key={pr.id} className="p-2 bg-white border border-slate-200 text-center font-readex">
                          <span className="block text-xs font-bold text-slate-800 mb-1">{pr.label}</span>
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleIqamahDurationChange(pr.id, -1)}
                              className="w-6 h-6 bg-slate-100 border border-slate-300 text-slate-700 hover:bg-slate-200 flex items-center justify-center font-bold text-xs cursor-pointer"
                              title="إنقاص دقيقة"
                            >
                              <Minus size={11} />
                            </button>
                            <span className="font-mono text-xs font-bold text-emerald-800 min-w-[2.2rem]">
                              {mins} د
                            </span>
                            <button
                              type="button"
                              onClick={() => handleIqamahDurationChange(pr.id, 1)}
                              className="w-6 h-6 bg-slate-100 border border-slate-300 text-slate-700 hover:bg-slate-200 flex items-center justify-center font-bold text-xs cursor-pointer"
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
              )}
            </div>
          </div>

          {/* Random & Periodic Dhikr Notifications */}
          <div className="pt-4 border-t border-slate-100">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2 font-readex">
                <Bell size={16} className="text-emerald-700" />
                <span>التذكير العشوائي والمجدول بالأذكار</span>
              </h3>
              <button
                type="button"
                onClick={() => sendDhikrNotification()}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-none bg-emerald-50 text-emerald-800 text-xs font-semibold hover:bg-emerald-100 transition-colors cursor-pointer font-readex border border-emerald-200"
                title="إرسال إشعار ذكر فوري لتجربة الصوت والبطاقة"
              >
                <Sparkles size={12} />
                <span>تجربة إشعار الذكر الآن</span>
              </button>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-xs text-slate-900 font-readex">تفعيل إشعارات الأذكار الدورية</h4>
                  <p className="text-[11px] text-slate-500 font-readex">
                    إرسال إشعارات ويندوز مصحوبة برنين هادئ وبطاقة طافية بأذكار مأثورة وفضائلها
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={formData.randomDhikrEnabled !== false}
                  onChange={(e) => setFormData({ ...formData, randomDhikrEnabled: e.target.checked })}
                  className="w-5 h-5 accent-emerald-700 rounded-none cursor-pointer"
                />
              </div>

              {formData.randomDhikrEnabled !== false && (
                <div className="pt-3 border-t border-slate-200">
                  <label className="text-xs font-semibold text-slate-600 block mb-2 font-readex">
                    الفترة الزمنية بين الإشعارات
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
                    {[
                      { value: 0, label: 'عشوائي (15-35 د)' },
                      { value: 5, label: 'كل 5 دقائق (تجربة)' },
                      { value: 15, label: 'كل 15 دقيقة' },
                      { value: 30, label: 'كل 30 دقيقة' },
                      { value: 45, label: 'كل 45 دقيقة' },
                      { value: 60, label: 'كل ساعة' }
                    ].map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setFormData({ ...formData, randomDhikrInterval: opt.value })}
                        className={`p-2.5 rounded-none border text-xs font-semibold transition-all cursor-pointer font-readex text-center ${
                          (formData.randomDhikrInterval ?? 0) === opt.value
                            ? 'bg-emerald-800 border-emerald-800 text-white font-bold shadow-xs'
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Sunnah Fasting Reminders */}
          <div className="pt-4 border-t border-slate-100">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2 font-readex">
                <Moon size={16} className="text-emerald-700" />
                <span>تنبيهات صيام النوافل والأيام البيض (Sunnah Fasting)</span>
              </h3>
              <button
                type="button"
                onClick={() => {
                  window.dispatchEvent(
                    new CustomEvent('trigger-test-fasting', {
                      detail: {
                        title: 'تذكير بصيام الاثنين المبارك 🌙',
                        message: 'غداً يوم الاثنين، ترفع فيه الأعمال إلى الله تعالى. انوِ الصيام ونل الأجر العظيم.',
                        virtue: '«تُعْرَضُ الأَعْمَالُ يَوْمَ الاِثْنَيْنِ وَالْخَمِيسِ فَأُحِبُّ أَنْ يُعْرَضَ عَمَلِي وَأَنَا صَائِمٌ»'
                      }
                    })
                  );
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-none bg-emerald-50 text-emerald-800 text-xs font-semibold hover:bg-emerald-100 transition-colors cursor-pointer font-readex border border-emerald-300"
                title="تجربة إشعار تذكير الصيام"
              >
                <Sparkles size={12} />
                <span>تجربة تنبيه الصيام</span>
              </button>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 space-y-4">
              {/* Monday & Thursday */}
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-xs text-slate-900 font-readex">تنبيه صيام الإثنين والخميس</h4>
                  <p className="text-[11px] text-slate-500 font-readex">
                    إشعار يظهر مساء الأحد ومساء الأربعاء للتذكير بفضل صيام الغد وعقد النية
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={formData.fastingMondayThursdayReminder !== false}
                  onChange={(e) => setFormData({ ...formData, fastingMondayThursdayReminder: e.target.checked })}
                  className="w-5 h-5 accent-emerald-700 rounded-none cursor-pointer"
                />
              </div>

              {/* White Days */}
              <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-xs text-slate-900 font-readex">تنبيه الأيام البيض (13، 14، 15 هجري)</h4>
                  <p className="text-[11px] text-slate-500 font-readex">
                    إشعار تلقائي يعتمد على التقويم الهجري القمري يذكرك بصيام الأيام البيض الثلاثة من كل شهر
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={formData.fastingWhiteDaysReminder !== false}
                  onChange={(e) => setFormData({ ...formData, fastingWhiteDaysReminder: e.target.checked })}
                  className="w-5 h-5 accent-emerald-700 rounded-none cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Blessed Friday (Jumu'ah Mode) Settings */}
          <div className="pt-4 border-t border-slate-100">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2 font-readex">
                <span className="text-base">🕌</span>
                <span>تنبيهات وضع الجمعة المباركة (Jumu'ah Mode)</span>
              </h3>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    window.dispatchEvent(
                      new CustomEvent('trigger-test-jumuah-kahf', {
                        detail: {
                          title: '🕌 نور ما بين الجمعتين - سورة الكهف',
                          message: 'جمعة مباركة! تذكير بقراءة سورة الكهف لنيل النور والبركة.',
                          hadith: '«مَنْ قَرَأَ سُورَةَ الْكَهْفِ فِي يَوْمِ الْجُمُعَةِ أَضَاءَ لَهُ مِنَ النُّورِ مَا بَيْنَ الْجُمُعَتَيْنِ»'
                        }
                      })
                    );
                  }}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-none bg-emerald-50 text-emerald-800 text-xs font-semibold hover:bg-emerald-100 transition-colors cursor-pointer font-readex border border-emerald-300"
                  title="تجربة إشعار سورة الكهف"
                >
                  <Sparkles size={11} />
                  <span>تجربة تنبيه الكهف</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    window.dispatchEvent(
                      new CustomEvent('trigger-test-jumuah-ijabah', {
                        detail: {
                          title: '🤲 ساعة الاستجابة يوم الجمعة',
                          message: 'دخلت الآن آخر ساعة قبل غروب الشمس، تفرغ للدعاء وسؤال الله من فضله.',
                          hadith: '«فِيهَا سَاعَةٌ لَا يُوَافِقُهَا عَبْدٌ مُسْلِمٌ يَسْأَلُ اللَّهَ خَيْراً إِلَّا أَعْطَاهُ إِيَّاهُ»'
                        }
                      })
                    );
                  }}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-none bg-amber-50 text-amber-800 text-xs font-semibold hover:bg-amber-100 transition-colors cursor-pointer font-readex border border-amber-300"
                  title="تجربة إشعار ساعة الاستجابة"
                >
                  <Sparkles size={11} />
                  <span>تجربة ساعة الاستجابة</span>
                </button>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 space-y-4">
              {/* Surah Al-Kahf Reminder */}
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-xs text-slate-900 font-readex">تذكير قراءة سورة الكهف</h4>
                  <p className="text-[11px] text-slate-500 font-readex">
                    إشعار صباح كل يوم جمعة مع زر لقراءة السورة مباشرة بالكامل داخل التطبيق
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={formData.jumuahKahfReminder !== false}
                  onChange={(e) => setFormData({ ...formData, jumuahKahfReminder: e.target.checked })}
                  className="w-5 h-5 accent-emerald-700 rounded-none cursor-pointer"
                />
              </div>

              {/* Hour of Response Reminder */}
              <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-xs text-slate-900 font-readex">تذكير ساعة الاستجابة</h4>
                  <p className="text-[11px] text-slate-500 font-readex">
                    إشعار قبل غروب شمس يوم الجمعة بساعة للتفرغ للدعاء والابتهال لنيل فضل هذه الساعة
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={formData.jumuahIjabahReminder !== false}
                  onChange={(e) => setFormData({ ...formData, jumuahIjabahReminder: e.target.checked })}
                  className="w-5 h-5 accent-emerald-700 rounded-none cursor-pointer"
                />
              </div>

              {/* Friday Salawat Goal */}
              <div className="pt-3 border-t border-slate-200">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-bold text-xs text-slate-900 font-readex">هدف عداد الصلاة على النبي ﷺ يوم الجمعة</h4>
                  <span className="font-mono text-xs font-bold text-emerald-800">
                    {formData.jumuahSalawatGoal || 300} صلاة
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[100, 300, 500, 1000].map((goal) => (
                    <button
                      key={goal}
                      type="button"
                      onClick={() => setFormData({ ...formData, jumuahSalawatGoal: goal })}
                      className={`py-2 px-3 rounded-none border text-center text-xs font-semibold transition-all cursor-pointer font-readex ${
                        (formData.jumuahSalawatGoal || 300) === goal
                          ? 'bg-emerald-800 border-emerald-800 text-white font-bold shadow-xs'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {goal} صلاة
                    </button>
                  ))}
                </div>
              </div>
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

          {/* Desktop Mini-Widget & Tray Section */}
          <div className="pt-4 border-t border-slate-100">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2 font-readex">
                <AppWindow size={16} className="text-emerald-700" />
                <span>شريط الودجت العائم وقائمة شريط المهام (Desktop Mini-Widget & Tray)</span>
              </h3>
              <button
                type="button"
                onClick={() => {
                  if (window.electronAPI?.toggleWidget) {
                    window.electronAPI.toggleWidget();
                  } else {
                    alert('شريط الودجت العائم مخصص لتطبيق سطح المكتب (Always-on-top فوق جميع النوافذ)');
                  }
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-none bg-emerald-50 text-emerald-800 text-xs font-semibold hover:bg-emerald-100 transition-colors cursor-pointer font-readex border border-emerald-300"
              >
                <AppWindow size={12} />
                <span>تشغيل / تبديل الودجت الآن</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="p-3.5 bg-slate-50 border border-slate-200 text-right">
                <span className="block text-xs font-bold text-slate-800 mb-1 font-readex">
                  الودجت العائم (Always-on-top Compact Widget)
                </span>
                <p className="text-[11px] text-slate-500 font-readex leading-relaxed">
                  شريط صغير وأنيق وشفاف يبقى دائماً في الواجهة أثناء استخدامك لأي برنامج أو تصفحك، يعرض اسم الصلاة القادمة والوقت المتبقي بدقة، مع إمكانية تحريكه بالسحب لأي زاوية من الشاشة وزر تسبيح سريع.
                </p>
              </div>

              <div className="p-3.5 bg-slate-50 border border-slate-200 text-right">
                <span className="block text-xs font-bold text-slate-800 mb-1 font-readex">
                  قائمة شريط المهام الذكية (Tray Menu Enhanced)
                </span>
                <p className="text-[11px] text-slate-500 font-readex leading-relaxed">
                  بمجرد تمرير الفأرة فوق أيقونة التطبيق بجانب الساعة في ويندوز، يظهر نص مباشر بالصلاة القادمة والوقت المتبقي. وبالنقر بالزر الأيمن يمكنك كتم الصوت، التسبيح السريع (+1)، أو فتح الودجت.
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
