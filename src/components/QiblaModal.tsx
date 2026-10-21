import React from 'react';
import { X, Navigation, Compass, MapPin } from 'lucide-react';
import { calculateQibla } from '../utils/prayerTimes';

interface QiblaModalProps {
  isOpen: boolean;
  onClose: () => void;
  latitude: number;
  longitude: number;
  cityName: string;
}

export const QiblaModal: React.FC<QiblaModalProps> = ({
  isOpen,
  onClose,
  latitude,
  longitude,
  cityName
}) => {
  if (!isOpen) return null;

  const qiblaAngle = calculateQibla(latitude, longitude);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="glass-panel w-full max-w-sm p-6 relative bg-slate-900/95 border border-white/10 shadow-2xl rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
        >
          <X size={16} />
        </button>

        <div className="flex items-center gap-2 text-emerald-400 mb-1">
          <Compass size={18} />
          <h3 className="font-bold text-base text-white">Qibla Direction</h3>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-6">
          <MapPin size={12} className="text-emerald-400" />
          <span>Calculated for {cityName}</span>
        </div>

        {/* Compass Visual */}
        <div className="flex flex-col items-center justify-center my-4">
          <div className="relative w-48 h-48 rounded-full border-2 border-dashed border-emerald-500/30 flex items-center justify-center bg-gradient-to-b from-emerald-950/20 to-slate-900/60 shadow-inner">
            {/* Cardinal Marks */}
            <span className="absolute top-2 text-[10px] font-bold text-slate-400">N (0°)</span>
            <span className="absolute right-2 text-[10px] font-bold text-slate-400">E (90°)</span>
            <span className="absolute bottom-2 text-[10px] font-bold text-slate-400">S (180°)</span>
            <span className="absolute left-2 text-[10px] font-bold text-slate-400">W (270°)</span>

            {/* Dial circle */}
            <div className="w-32 h-32 rounded-full border border-white/10 flex items-center justify-center bg-white/[0.02]">
              {/* Rotating Pointer */}
              <div
                className="w-full h-full flex items-center justify-center transition-transform duration-700 ease-out"
                style={{ transform: `rotate(${qiblaAngle}deg)` }}
              >
                <div className="flex flex-col items-center">
                  <div className="w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-b-[24px] border-b-emerald-400 filter drop-shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                  <div className="w-1.5 h-10 bg-emerald-500/50 rounded-full" />
                </div>
              </div>
            </div>

            {/* Center Kaaba Badge */}
            <div className="absolute w-7 h-7 rounded-full bg-slate-900 border border-emerald-400/50 flex items-center justify-center text-[10px] font-bold text-emerald-300 shadow-md">
              🕋
            </div>
          </div>

          {/* Angle Readout */}
          <div className="mt-5 text-center">
            <div className="text-2xl font-black text-white font-mono flex items-center justify-center gap-1">
              <span>{qiblaAngle}°</span>
              <Navigation size={16} className="text-emerald-400" />
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Clockwise from True North towards the Kaaba
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full mt-4 py-2.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs uppercase tracking-wider transition-colors shadow-lg shadow-emerald-500/20"
        >
          Close
        </button>
      </div>
    </div>
  );
};
