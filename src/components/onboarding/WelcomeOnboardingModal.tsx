import React, { useState } from 'react';
import { 
  Sparkles, 
  MapPin, 
  Volume2, 
  Square,
  ArrowLeft, 
  ArrowRight, 
  Clock, 
  BookOpen, 
  AppWindow, 
  CheckCircle2,
  Search
} from 'lucide-react';
import { AppSettings, CalculationMethodKey, SoundOption } from '../../types/prayer';
import { audioService } from '../../utils/audio';

interface WelcomeOnboardingModalProps {
  currentSettings: AppSettings;
  onComplete: (updatedSettings: AppSettings) => void;
}

const PRESET_CITIES = [
  // الجزائر
  { city: 'الجزائر العاصمة', country: 'الجزائر', lat: 36.7538, lng: 3.0588, method: 'Algeria' as CalculationMethodKey, flag: '🇩🇿' },
  { city: 'وهران', country: 'الجزائر', lat: 35.6987, lng: -0.6349, method: 'Algeria' as CalculationMethodKey, flag: '🇩🇿' },
  { city: 'قسنطينة', country: 'الجزائر', lat: 36.3650, lng: 6.6147, method: 'Algeria' as CalculationMethodKey, flag: '🇩🇿' },
  { city: 'سطيف', country: 'الجزائر', lat: 36.1911, lng: 5.4137, method: 'Algeria' as CalculationMethodKey, flag: '🇩🇿' },
  { city: 'عنابة', country: 'الجزائر', lat: 36.9000, lng: 7.7667, method: 'Algeria' as CalculationMethodKey, flag: '🇩🇿' },
  { city: 'باتنة', country: 'الجزائر', lat: 35.5559, lng: 6.1741, method: 'Algeria' as CalculationMethodKey, flag: '🇩🇿' },
  { city: 'تلمسان', country: 'الجزائر', lat: 34.8783, lng: -1.3150, method: 'Algeria' as CalculationMethodKey, flag: '🇩🇿' },
  { city: 'بسكرة', country: 'الجزائر', lat: 34.8500, lng: 5.7333, method: 'Algeria' as CalculationMethodKey, flag: '🇩🇿' },
  // مدن دولية
  { city: 'مكة المكرمة', country: 'السعودية', lat: 21.4225, lng: 39.8262, method: 'UmmAlQura' as CalculationMethodKey, flag: '🇸🇦' },
  { city: 'المدينة المنورة', country: 'السعودية', lat: 24.5247, lng: 39.5692, method: 'UmmAlQura' as CalculationMethodKey, flag: '🇸🇦' },
  { city: 'القدس الشريف', country: 'فلسطين', lat: 31.7683, lng: 35.2137, method: 'MuslimWorldLeague' as CalculationMethodKey, flag: '🇵🇸' },
  { city: 'القاهرة', country: 'مصر', lat: 30.0444, lng: 31.2357, method: 'Egyptian' as CalculationMethodKey, flag: '🇪🇬' },
  { city: 'الرباط', country: 'المغرب', lat: 34.0209, lng: -6.8416, method: 'MuslimWorldLeague' as CalculationMethodKey, flag: '🇲🇦' },
  { city: 'تونس', country: 'تونس', lat: 36.8065, lng: 10.1815, method: 'MuslimWorldLeague' as CalculationMethodKey, flag: '🇹🇳' },
  { city: 'دبي', country: 'الإمارات', lat: 25.2048, lng: 55.2708, method: 'Dubai' as CalculationMethodKey, flag: '🇦🇪' },
  { city: 'إسطنبول', country: 'تركيا', lat: 41.0082, lng: 28.9784, method: 'MuslimWorldLeague' as CalculationMethodKey, flag: '🇹🇷' },
  { city: 'باريس', country: 'فرنسا', lat: 48.8566, lng: 2.3522, method: 'France12' as CalculationMethodKey, flag: '🇫🇷' },
  { city: 'لندن', country: 'بريطانيا', lat: 51.5074, lng: -0.1278, method: 'MuslimWorldLeague' as CalculationMethodKey, flag: '🇬🇧' }
];

const ADHAN_OPTIONS: { id: SoundOption; label: string; desc: string }[] = [
  { id: 'adhan_makkah', label: 'أذان مكة المكرمة', desc: 'أذان الحرم المكي الشريف بصوت شجي ومهيب' },
  { id: 'adhan_madinah', label: 'أذان المدينة المنورة', desc: 'أذان المسجد النبوي الشريف بروحانية عالية' },
  { id: 'adhan_algeria', label: 'الأذان الجزائري', desc: 'الأذان الأصيل على الطريقة المغاربية الجزائرية' },
  { id: 'full_adhan', label: 'أذان كلاسيكي', desc: 'التكبير والأذان الكامل' },
  { id: 'soft_chime', label: 'رنين هادئ وقصير', desc: 'نغمات إسلامية هادئة مناسبة لأجواء العمل والمكاتب' }
];

export const WelcomeOnboardingModal: React.FC<WelcomeOnboardingModalProps> = ({
  currentSettings,
  onComplete
}) => {
  const [step, setStep] = useState<number>(1);
  const [formData, setFormData] = useState<AppSettings>({
    ...currentSettings,
    autoStart: true,
    miniWidgetEnabled: true,
    randomDhikrEnabled: true,
    remindMinutesBefore: 10
  });

  const [citySearch, setCitySearch] = useState('');
  const [previewingSound, setPreviewingSound] = useState<SoundOption | null>(null);

  const filteredCities = PRESET_CITIES.filter((c) =>
    c.city.toLowerCase().includes(citySearch.toLowerCase()) ||
    c.country.toLowerCase().includes(citySearch.toLowerCase())
  );

  const handleSelectCity = (cityItem: typeof PRESET_CITIES[0]) => {
    setFormData((prev) => ({
      ...prev,
      city: cityItem.city,
      country: cityItem.country,
      latitude: cityItem.lat,
      longitude: cityItem.lng,
      calculationMethod: cityItem.method
    }));
  };

  const handleToggleAudioPreview = (soundId: SoundOption) => {
    if (previewingSound === soundId) {
      audioService.stop();
      setPreviewingSound(null);
    } else {
      audioService.stop();
      audioService.playSound(soundId, formData.adhanVolume);
      setPreviewingSound(soundId);
    }
  };

  const handleFinish = () => {
    audioService.stop();
    audioService.playChime(0.5);
    localStorage.setItem('noor_onboarding_completed', 'true');
    onComplete(formData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-fade-in font-readex select-none" dir="rtl">
      <div className="bg-white dark:bg-[#0e1914] w-full max-w-3xl max-h-[92vh] flex flex-col shadow-2xl border-2 border-emerald-800 rounded-none relative overflow-hidden text-right">
        {/* Top Accent Ribbon */}
        <div className="h-1.5 bg-emerald-700 w-full shrink-0" />

        {/* Modal Header */}
        <div className="p-6 bg-slate-50 dark:bg-[#12221b] border-b border-slate-200 dark:border-emerald-900/40 flex items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-emerald-800 border border-emerald-600 flex items-center justify-center text-white shrink-0 shadow-xs">
              <span className="font-amiri font-bold text-2xl">ن</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 font-readex">
                  مرحباً بك في تطبيق نُور
                </h2>
                <span className="text-[11px] font-bold px-2 py-0.5 bg-emerald-800 text-emerald-100">
                  الإصدار 1.0
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-readex mt-0.5">
                رفيقك اليومي لمواقيت الصلاة، والمصحف الشريف، والأذكار والسنن النبوية
              </p>
            </div>
          </div>

          {/* Stepper Indicator */}
          <div className="flex items-center gap-1.5">
            {[1, 2, 3].map((num) => (
              <div 
                key={num}
                className={`w-7 h-7 flex items-center justify-center font-bold text-xs transition-colors ${
                  step === num
                    ? 'bg-emerald-800 text-white'
                    : step > num
                    ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700/60'
                    : 'bg-slate-200 dark:bg-[#1c2e27] text-slate-400'
                }`}
              >
                {step > num ? '✓' : num}
              </div>
            ))}
          </div>
        </div>

        {/* Modal Body: Dynamic Step Content */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6">
          {/* STEP 1: Welcome & Features Tour */}
          {step === 1 && (
            <div className="space-y-6 animate-fade-in">
              <div className="p-4 bg-emerald-50/60 dark:bg-emerald-950/30 border-r-4 border-emerald-800 text-center sm:text-right">
                <p className="font-amiri text-xl sm:text-2xl font-bold text-emerald-950 dark:text-emerald-200 leading-relaxed">
                  «إِنَّ الصَّلَاةَ كَانَتْ عَلَى الْمُؤْمِنِينَ كِتَابًا مَوْقُوتًا»
                </p>
                <p className="text-xs text-slate-600 dark:text-slate-400 font-readex mt-1">
                  صُمم تطبيق «نُور» ليكون خفيفاً وسريعاً على سطح المكتب، يذكرك بالصلوات في وقتها ويجعل لسانك رطباً بذكر الله طوال ساعات عملك.
                </p>
              </div>

              {/* 4 Feature Pillars Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="p-4 bg-slate-50 dark:bg-[#14231d] border border-slate-200/80 dark:border-emerald-900/40 space-y-1.5">
                  <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-400 font-bold text-xs">
                    <Clock size={16} />
                    <span>مواقيت دقيقة وأذان كامل</span>
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                    حساب دقيق لجميع الصلوات والإقامة، مع أصوات الأذان الشرعية للحرمين الشريفين والجزائر.
                  </p>
                </div>

                <div className="p-4 bg-slate-50 dark:bg-[#14231d] border border-slate-200/80 dark:border-emerald-900/40 space-y-1.5">
                  <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-400 font-bold text-xs">
                    <AppWindow size={16} />
                    <span>ودجت عائم مصغر لسطح المكتب</span>
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                    شريط مصغر شفاف يمكنك تثبيته دائماً أثناء التصفح والعمل لمعرفة الوقت المتبقي، واختصار <span className="font-mono text-emerald-700 dark:text-emerald-300 font-bold">Ctrl+Shift+P</span>.
                  </p>
                </div>

                <div className="p-4 bg-slate-50 dark:bg-[#14231d] border border-slate-200/80 dark:border-emerald-900/40 space-y-1.5">
                  <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-400 font-bold text-xs">
                    <BookOpen size={16} />
                    <span>المصحف الشريف والورد اليومي</span>
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                    آية اليوم وتفسيرها الميسر، المصحف كاملاً، وقارئ مدمج لسورة الكهف لنور يوم الجمعة.
                  </p>
                </div>

                <div className="p-4 bg-slate-50 dark:bg-[#14231d] border border-slate-200/80 dark:border-emerald-900/40 space-y-1.5">
                  <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-400 font-bold text-xs">
                    <Sparkles size={16} />
                    <span>الأذكار وسنن الصيام</span>
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                    مسبحة إلكترونية بنقر ناعم، تذكير دوري بالأذكار المأثورة، وعد تنازلي لأذان المغرب والإفطار.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Location & Adhan Preferences */}
          {step === 2 && (
            <div className="space-y-6 animate-fade-in">
              {/* Location Picker */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-xs text-slate-900 dark:text-slate-100 flex items-center gap-1.5 font-readex">
                    <MapPin size={15} className="text-emerald-800 dark:text-emerald-400" />
                    <span>اختر مدينتك لحساب مواقيت الصلاة بدقة:</span>
                  </label>
                  <span className="text-[11px] font-semibold text-emerald-800 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 border border-emerald-200 dark:border-emerald-800/40">
                    المدينة المحددة: {formData.city} ({formData.country})
                  </span>
                </div>

                {/* City Search Bar */}
                <div className="relative">
                  <input
                    type="text"
                    value={citySearch}
                    onChange={(e) => setCitySearch(e.target.value)}
                    placeholder="ابحث عن مدينتك أو دولتك (مثال: الجزائر، مكة، وهران، القاهرة...)"
                    className="w-full pl-3 pr-9 py-2 bg-slate-50 dark:bg-[#162520] border border-slate-200 dark:border-[#233b31] text-xs font-readex text-slate-900 dark:text-slate-100 focus:outline-hidden focus:border-emerald-600"
                  />
                  <Search size={14} className="absolute right-3 top-2.5 text-slate-400" />
                </div>

                {/* City Buttons Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 max-h-44 overflow-y-auto p-1 bg-slate-50/50 dark:bg-[#0c1611] border border-slate-200/80 dark:border-emerald-900/40">
                  {filteredCities.map((item) => {
                    const isSelected = formData.city === item.city;
                    return (
                      <button
                        key={`${item.city}-${item.country}`}
                        type="button"
                        onClick={() => handleSelectCity(item)}
                        className={`p-2 text-right text-xs transition-all cursor-pointer flex items-center justify-between border ${
                          isSelected
                            ? 'bg-emerald-800 border-emerald-800 text-white font-bold shadow-xs'
                            : 'bg-white dark:bg-[#14231d] border-slate-200 dark:border-[#233b31] text-slate-700 dark:text-slate-300 hover:border-emerald-500'
                        }`}
                      >
                        <span className="truncate">{item.city}</span>
                        <span className="text-sm shrink-0 mr-1">{item.flag}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Adhan Sound Picker */}
              <div className="space-y-3 pt-4 border-t border-slate-200 dark:border-emerald-900/40">
                <label className="font-bold text-xs text-slate-900 dark:text-slate-100 flex items-center gap-1.5 font-readex">
                  <Volume2 size={15} className="text-emerald-800 dark:text-emerald-400" />
                  <span>صوت الأذان المفضل عند حلول وقت الصلاة:</span>
                </label>

                <div className="space-y-2">
                  {ADHAN_OPTIONS.map((opt) => {
                    const isSelected = formData.soundOption === opt.id;
                    const isPlaying = previewingSound === opt.id;

                    return (
                      <div
                        key={opt.id}
                        onClick={() => setFormData({ ...formData, soundOption: opt.id })}
                        className={`p-3 border flex items-center justify-between cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-emerald-50/80 dark:bg-emerald-950/40 border-emerald-600 dark:border-emerald-500'
                            : 'bg-white dark:bg-[#14231d] border-slate-200 dark:border-[#233b31] hover:border-emerald-300'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <input
                            type="radio"
                            name="adhan-choice"
                            checked={isSelected}
                            onChange={() => setFormData({ ...formData, soundOption: opt.id })}
                            className="accent-emerald-700 w-4 h-4 cursor-pointer"
                          />
                          <div>
                            <span className={`text-xs font-bold block ${isSelected ? 'text-emerald-900 dark:text-emerald-300' : 'text-slate-800 dark:text-slate-200'}`}>
                              {opt.label}
                            </span>
                            <span className="text-[11px] text-slate-500 dark:text-slate-400">
                              {opt.desc}
                            </span>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleAudioPreview(opt.id);
                          }}
                          className={`px-3 py-1.5 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border ${
                            isPlaying
                              ? 'bg-rose-700 border-rose-600 text-white animate-pulse'
                              : 'bg-slate-100 dark:bg-[#1a2c25] border-slate-300 dark:border-[#2d493e] text-slate-700 dark:text-slate-200 hover:bg-emerald-100 dark:hover:bg-emerald-900/40'
                          }`}
                        >
                          {isPlaying ? <Square size={12} /> : <Volume2 size={12} />}
                          <span>{isPlaying ? 'إيقاف' : 'تجربة الصوت'}</span>
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Final Preferences & Confirmation */}
          {step === 3 && (
            <div className="space-y-6 animate-fade-in">
              <div className="p-4 bg-emerald-50/60 dark:bg-emerald-950/30 border-r-4 border-emerald-800 space-y-2">
                <div className="flex items-center gap-2 text-emerald-900 dark:text-emerald-300 font-bold text-xs">
                  <CheckCircle2 size={16} />
                  <span>تم تجهيز الإعدادات بنجاح! مراجعة التهيئة الأولية:</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1">
                  <div className="p-2 bg-white dark:bg-[#14231d] border border-emerald-200/60 dark:border-emerald-800/40 flex justify-between">
                    <span className="text-slate-500 dark:text-slate-400">المدينة والدولة:</span>
                    <span className="font-bold text-slate-900 dark:text-slate-100">{formData.city} ({formData.country})</span>
                  </div>
                  <div className="p-2 bg-white dark:bg-[#14231d] border border-emerald-200/60 dark:border-emerald-800/40 flex justify-between">
                    <span className="text-slate-500 dark:text-slate-400">صوت الأذان:</span>
                    <span className="font-bold text-slate-900 dark:text-slate-100">
                      {ADHAN_OPTIONS.find((a) => a.id === formData.soundOption)?.label || 'أذان مكة المكرمة'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Essential Switches */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 font-readex">
                  خيارات التنبيه الموصى بها لسطح المكتب:
                </h4>

                <div className="space-y-2">
                  <label className="p-3 bg-slate-50 dark:bg-[#14231d] border border-slate-200/80 dark:border-emerald-900/40 flex items-center justify-between cursor-pointer">
                    <div>
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                        تشغيل التطبيق تلقائياً مع بدء تشغيل الويندوز
                      </span>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400">
                        يبدأ مصغراً في صينية النظام بجوار الساعة دون أي إزعاج
                      </span>
                    </div>
                    <input
                      type="checkbox"
                      checked={formData.autoStart}
                      onChange={(e) => setFormData({ ...formData, autoStart: e.target.checked })}
                      className="w-5 h-5 accent-emerald-700 cursor-pointer"
                    />
                  </label>

                  <label className="p-3 bg-slate-50 dark:bg-[#14231d] border border-slate-200/80 dark:border-emerald-900/40 flex items-center justify-between cursor-pointer">
                    <div>
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                        التنبيه المسبق قبل الأذان (الاستعداد والوضوء)
                      </span>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400">
                        إشعار ورنين خفيف قبل الأذان بـ 10 دقائق للتجهز للصلاة
                      </span>
                    </div>
                    <input
                      type="checkbox"
                      checked={(formData.remindMinutesBefore || 0) > 0}
                      onChange={(e) => setFormData({ ...formData, remindMinutesBefore: e.target.checked ? 10 : 0 })}
                      className="w-5 h-5 accent-emerald-700 cursor-pointer"
                    />
                  </label>

                  <label className="p-3 bg-slate-50 dark:bg-[#14231d] border border-slate-200/80 dark:border-emerald-900/40 flex items-center justify-between cursor-pointer">
                    <div>
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                        تفعيل التذكير الدوري العشوائي بالأذكار المأثورة
                      </span>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400">
                        بطاقة لطيفة ونقرة سبحة هادئة تظهر كل فترة لتذكيرك بذكر الله
                      </span>
                    </div>
                    <input
                      type="checkbox"
                      checked={formData.randomDhikrEnabled !== false}
                      onChange={(e) => setFormData({ ...formData, randomDhikrEnabled: e.target.checked })}
                      className="w-5 h-5 accent-emerald-700 cursor-pointer"
                    />
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Navigation Footer */}
        <div className="p-5 bg-slate-50 dark:bg-[#12221b] border-t border-slate-200 dark:border-emerald-900/40 flex items-center justify-between gap-3 shrink-0">
          <div>
            {step > 1 ? (
              <button
                type="button"
                onClick={() => {
                  audioService.stop();
                  setPreviewingSound(null);
                  setStep((prev) => prev - 1);
                }}
                className="px-4 py-2 bg-white dark:bg-[#162520] border border-slate-300 dark:border-[#233b31] text-slate-700 dark:text-slate-200 font-semibold text-xs flex items-center gap-1.5 cursor-pointer hover:bg-slate-100 transition-colors"
              >
                <ArrowRight size={14} />
                <span>السابق</span>
              </button>
            ) : (
              <span className="text-xs text-slate-400 font-readex">
                الخطوة {step} من 3
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {step < 3 ? (
              <button
                type="button"
                onClick={() => {
                  audioService.stop();
                  setPreviewingSound(null);
                  setStep((prev) => prev + 1);
                }}
                className="px-6 py-2.5 bg-emerald-800 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-2 cursor-pointer transition-colors shadow-sm"
              >
                <span>المتابعة وضبط المدينة</span>
                <ArrowLeft size={14} />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleFinish}
                className="px-7 py-2.5 bg-emerald-800 hover:bg-emerald-700 active:scale-98 text-white font-bold text-sm flex items-center gap-2 cursor-pointer transition-all shadow-md font-readex"
              >
                <Sparkles size={16} />
                <span>ابدأ استخدام تطبيق نُور 🌿</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
