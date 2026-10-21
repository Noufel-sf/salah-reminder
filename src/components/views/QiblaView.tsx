import React, { useState } from 'react';
import { Compass, MapPin, Navigation, RotateCw, CheckCircle2 } from 'lucide-react';
import { calculateQibla } from '../../utils/prayerTimes';
import { AppSettings } from '../../types/prayer';

interface QiblaViewProps {
  settings: AppSettings;
}

export const QiblaView: React.FC<QiblaViewProps> = ({ settings }) => {
  const [isCalibrating, setIsCalibrating] = useState(false);
  const qiblaAngle = calculateQibla(settings.latitude, settings.longitude);

  const handleCalibrate = () => {
    setIsCalibrating(true);
    setTimeout(() => setIsCalibrating(false), 800);
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="bg-white rounded-2xl p-8 border border-slate-200/90 shadow-sm text-center max-w-xl mx-auto">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Compass size={22} className="text-[#164e3c]" />
          <h2 className="text-xl font-bold text-slate-900 font-readex">اتجاه القبلة</h2>
        </div>
        <p className="text-xs text-slate-500 mb-8 font-readex">
          محاذاة دقيقة باتجاه الكعبة المشرفة بمكة المكرمة محسوبة وفق المثلثات الكروية
        </p>

        {/* Circular Compass Dial */}
        <div className="relative w-72 h-72 mx-auto rounded-full border-2 border-emerald-200 flex items-center justify-center bg-emerald-50/30 shadow-inner mb-8">
          {/* Degree circle markings */}
          <span className="absolute top-3 font-bold text-xs text-emerald-800 font-readex">الشمال (0°)</span>
          <span className="absolute right-3 font-bold text-xs text-slate-500 font-readex">الشرق (90°)</span>
          <span className="absolute bottom-3 font-bold text-xs text-slate-500 font-readex">الجنوب (180°)</span>
          <span className="absolute left-3 font-bold text-xs text-slate-500 font-readex">الغرب (270°)</span>

          {/* Internal concentric ring */}
          <div className="w-52 h-52 rounded-full border border-emerald-100 flex items-center justify-center bg-white shadow-xs">
            {/* Rotating Needle pointing towards Qibla */}
            <div
              className={`w-full h-full flex items-center justify-center transition-transform duration-1000 ease-out ${
                isCalibrating ? 'animate-spin' : ''
              }`}
              style={{ transform: `rotate(${qiblaAngle}deg)` }}
            >
              <div className="flex flex-col items-center">
                <div className="w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-b-[36px] border-b-emerald-800 filter drop-shadow-md" />
                <div className="w-2 h-14 bg-emerald-500 rounded-full" />
              </div>
            </div>

            {/* Central Kaaba Marker */}
            <div className="absolute w-10 h-10 rounded-2xl bg-[#113829] border border-emerald-400 flex items-center justify-center text-sm shadow-md">
              🕋
            </div>
          </div>
        </div>

        {/* Card info below compass */}
        <div className="bg-emerald-50/60 border border-emerald-200/90 rounded-2xl p-4 max-w-sm mx-auto mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 text-right">
              <div className="w-8 h-8 rounded-xl bg-emerald-800 text-white flex items-center justify-center">
                <Navigation size={16} />
              </div>
              <div>
                <h4 className="font-bold text-sm text-slate-900 font-readex">درجة الانحراف</h4>
                <p className="text-xs text-emerald-800 font-semibold font-mono">{qiblaAngle}° من جهة الشمال</p>
              </div>
            </div>
            <div className="flex items-center gap-1 text-xs text-slate-500 font-readex">
              <MapPin size={12} className="text-emerald-700" />
              <span>{settings.city}</span>
            </div>
          </div>
        </div>

        {/* Calibrate Button */}
        <button
          onClick={handleCalibrate}
          disabled={isCalibrating}
          className="w-full max-w-sm py-3 px-6 rounded-2xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-900 font-bold text-xs transition-colors flex items-center justify-center gap-2 shadow-xs cursor-pointer font-readex mx-auto"
        >
          <RotateCw size={14} className={isCalibrating ? 'animate-spin text-emerald-700' : ''} />
          <span>{isCalibrating ? 'جاري ضبط البوصلة...' : 'إعادة ضبط البوصلة'}</span>
        </button>

        <p className="text-[11px] text-slate-500 mt-3 flex items-center justify-center gap-1.5 font-readex">
          <CheckCircle2 size={12} className="text-emerald-600" />
          <span>الإحداثيات الحالية: {settings.latitude.toFixed(4)}° شمالاً، {settings.longitude.toFixed(4)}° شرقاً</span>
        </p>
      </div>
    </div>
  );
};
