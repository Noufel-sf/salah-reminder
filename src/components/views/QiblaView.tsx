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
      <div className="sage-card p-8 text-center max-w-xl mx-auto">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Compass size={22} className="text-[#2d6a4f]" />
          <h2 className="text-xl font-bold text-[#114232]">Qibla Direction</h2>
        </div>
        <p className="text-xs text-[#74897f] mb-8">
          Accurate Kaaba alignment calculated via spherical trigonometry
        </p>

        {/* Circular Compass Dial (matching the reference image) */}
        <div className="relative w-72 h-72 mx-auto rounded-full border-2 border-[#b7ddc4] flex items-center justify-center bg-[#f9fcf9] shadow-inner mb-8">
          {/* Degree circle markings */}
          <span className="absolute top-3 font-bold text-xs text-[#2d6a4f]">N (0°)</span>
          <span className="absolute right-3 font-bold text-xs text-[#74897f]">E (90°)</span>
          <span className="absolute bottom-3 font-bold text-xs text-[#74897f]">S (180°)</span>
          <span className="absolute left-3 font-bold text-xs text-[#74897f]">W (270°)</span>

          {/* Internal concentric ring */}
          <div className="w-52 h-52 rounded-full border border-[#d8e6dc] flex items-center justify-center bg-white">
            {/* Rotating Needle pointing towards Qibla */}
            <div
              className={`w-full h-full flex items-center justify-center transition-transform duration-1000 ease-out ${
                isCalibrating ? 'animate-spin' : ''
              }`}
              style={{ transform: `rotate(${qiblaAngle}deg)` }}
            >
              <div className="flex flex-col items-center">
                <div className="w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-b-[36px] border-b-[#2d6a4f] filter drop-shadow-md" />
                <div className="w-2 h-14 bg-[#52b788] rounded-full" />
              </div>
            </div>

            {/* Central Kaaba Marker */}
            <div className="absolute w-10 h-10 rounded-2xl bg-[#114232] border border-[#52b788] flex items-center justify-center text-sm shadow-md">
              🕋
            </div>
          </div>
        </div>

        {/* Card info below compass */}
        <div className="bg-[#f0f7f2] border border-[#b7ddc4] rounded-2xl p-4 max-w-sm mx-auto mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#2d6a4f] text-white flex items-center justify-center">
                <Navigation size={16} />
              </div>
              <div className="text-left">
                <h4 className="font-bold text-sm text-[#114232]">Qibla Direction</h4>
                <p className="text-xs text-[#2d6a4f] font-semibold">{qiblaAngle}° from North</p>
              </div>
            </div>
            <div className="flex items-center gap-1 text-xs text-[#74897f]">
              <MapPin size={12} className="text-[#2d6a4f]" />
              <span>{settings.city}</span>
            </div>
          </div>
        </div>

        {/* Calibrate Button */}
        <button
          onClick={handleCalibrate}
          disabled={isCalibrating}
          className="w-full max-w-sm py-3 px-6 rounded-2xl bg-white border border-[#b7ddc4] hover:bg-[#f0f7f2] text-[#114232] font-bold text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-2 shadow-sm"
        >
          <RotateCw size={14} className={isCalibrating ? 'animate-spin text-[#2d6a4f]' : ''} />
          {isCalibrating ? 'Calibrating...' : 'Calibrate Compass'}
        </button>

        <p className="text-[11px] text-[#74897f] mt-3 flex items-center justify-center gap-1">
          <CheckCircle2 size={12} className="text-[#52b788]" />
          Accurate coordinates: {settings.latitude.toFixed(4)}° N, {settings.longitude.toFixed(4)}° E
        </p>
      </div>
    </div>
  );
};
