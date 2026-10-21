import React, { useState } from 'react';
import { 
  BookOpen, 
  Sun, 
  Moon, 
  Heart, 
  Bed, 
  Sparkles, 
  ShieldCheck, 
  Copy, 
  Check 
} from 'lucide-react';

interface DuaItem {
  id: string;
  category: 'morning' | 'evening' | 'sleep' | 'parents' | 'hardship';
  title: string;
  subtitle: string;
  arabic: string;
  transliteration: string;
  translation: string;
  reference: string;
  icon: React.ReactNode;
  bgTint: string;
}

const DUAS_DATA: DuaItem[] = [
  {
    id: '1',
    category: 'morning',
    title: 'Morning Dua',
    subtitle: 'For a blessed day & protection',
    arabic: 'أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، لاَ إِلَهَ إِلاَّ اللَّهُ وَحْدَهُ لاَ شَرِيكَ لَهُ',
    transliteration: 'Asbahna wa-asbahal-mulku lillah, walhamdu lillah, la ilaha illallahu wahdahu la shareeka lah',
    translation: 'We have entered upon the morning and the whole kingdom belongs to Allah, praise be to Allah. There is none worthy of worship except Allah, alone with no partner.',
    reference: 'Sahih Muslim 2723',
    icon: <Sun size={18} className="text-[#f59e0b]" />,
    bgTint: 'bg-amber-50 border-amber-100'
  },
  {
    id: '2',
    category: 'evening',
    title: 'Evening Dua',
    subtitle: 'For peace and divine security',
    arabic: 'أَمْسَيْنَا وَأَمْسَى الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ',
    transliteration: 'Amsayna wa-amsal-mulku lillah, walhamdu lillah',
    translation: 'We have reached the evening and the kingdom belongs to Allah, and all praise is for Allah.',
    reference: 'Sahih Muslim',
    icon: <Moon size={18} className="text-[#6366f1]" />,
    bgTint: 'bg-indigo-50 border-indigo-100'
  },
  {
    id: '3',
    category: 'sleep',
    title: 'Before Sleep',
    subtitle: 'For a peaceful night and protection',
    arabic: 'بِاسْمِكَ رَبِّي وَضَعْتُ جَنْبِي، وَبِكَ أَرْفَعُهُ',
    transliteration: 'Bismika Rabbi wada’tu janbi, wa bika arfa’uh',
    translation: 'In Your name my Lord, I lie down, and in Your name I rise.',
    reference: 'Sahih Al-Bukhari 6320',
    icon: <Bed size={18} className="text-[#3b82f6]" />,
    bgTint: 'bg-blue-50 border-blue-100'
  },
  {
    id: '4',
    category: 'parents',
    title: 'For Parents',
    subtitle: 'Supplication for mercy upon father & mother',
    arabic: 'رَّبِّ ارْحَمْهُمَا كَمَا رَبَّيَانِي صَغِيرًا',
    transliteration: 'Rabbi irhamhuma kama rabbayani sagheera',
    translation: 'My Lord, have mercy upon them as they brought me up when I was small.',
    reference: 'Surah Al-Isra 17:24',
    icon: <Heart size={18} className="text-[#ef4444]" />,
    bgTint: 'bg-rose-50 border-rose-100'
  },
  {
    id: '5',
    category: 'hardship',
    title: 'For Difficult Times',
    subtitle: 'Strength, patience and ease in hardship',
    arabic: 'حَسْبُنَا اللَّهُ وَنِعْمَ الْوَكِيلُ',
    transliteration: 'Hasbunallahu wa ni’mal-wakeel',
    translation: 'Allah is sufficient for us, and He is the best disposer of affairs.',
    reference: 'Surah Ali Imran 3:173',
    icon: <ShieldCheck size={18} className="text-[#10b981]" />,
    bgTint: 'bg-emerald-50 border-emerald-100'
  }
];

export const DuasView: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filtered = selectedCategory === 'all'
    ? DUAS_DATA
    : DUAS_DATA.filter((d) => d.category === selectedCategory);

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-6">
      {/* Hadith Feature Card matching image */}
      <div className="mosque-banner rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
        <div className="max-w-2xl relative z-10">
          <div className="flex items-center gap-2 mb-2 text-xs font-bold uppercase tracking-wider text-[#a3e4c0]">
            <Sparkles size={14} />
            Hadith of the Prophet ﷺ
          </div>
          <p className="text-xl font-bold italic text-white/95 leading-relaxed my-3">
            "The best among you are those who learn the Qur'an and teach it."
          </p>
          <span className="text-xs text-[#b7e4c7] font-semibold bg-white/10 px-3 py-1 rounded-full border border-white/15">
            Sahih Al-Bukhari 5027
          </span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {[
          { id: 'all', label: 'All Duas' },
          { id: 'morning', label: 'Morning' },
          { id: 'evening', label: 'Evening' },
          { id: 'sleep', label: 'Before Sleep' },
          { id: 'parents', label: 'For Parents' },
          { id: 'hardship', label: 'For Hardship' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setSelectedCategory(tab.id)}
            className={`px-4 py-2 rounded-2xl text-xs font-semibold whitespace-nowrap transition-all ${
              selectedCategory === tab.id
                ? 'bg-[#164e3c] text-white shadow-sm'
                : 'bg-white border border-[#e4eee6] text-[#486356] hover:bg-[#f0f7f2]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Duas List Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((dua) => (
          <div key={dua.id} className="sage-card p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-2xl border flex items-center justify-center ${dua.bgTint}`}>
                    {dua.icon}
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-[#114232]">{dua.title}</h4>
                    <p className="text-xs text-[#74897f]">{dua.subtitle}</p>
                  </div>
                </div>
                <button
                  onClick={() => handleCopy(dua.id, `${dua.arabic}\n\n${dua.translation}`)}
                  className="p-1.5 rounded-xl border border-[#edf3ee] text-[#74897f] hover:text-[#114232] hover:bg-[#f0f7f2] transition-colors"
                  title="Copy Dua"
                >
                  {copiedId === dua.id ? <Check size={14} className="text-[#52b788]" /> : <Copy size={14} />}
                </button>
              </div>

              {/* Arabic */}
              <div className="bg-[#f9fcf9] border border-[#edf3ee] rounded-2xl p-4 my-3 text-right">
                <p className="arabic-calligraphy text-2xl font-bold text-[#114232] leading-loose">
                  {dua.arabic}
                </p>
              </div>

              {/* Transliteration & Translation */}
              <p className="text-xs text-[#40916c] font-medium italic mb-2">
                "{dua.transliteration}"
              </p>
              <p className="text-xs text-[#3c5248] leading-relaxed">
                {dua.translation}
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-[#edf3ee] flex items-center justify-between text-[11px] text-[#74897f]">
              <span className="flex items-center gap-1">
                <BookOpen size={11} className="text-[#52b788]" />
                {dua.reference}
              </span>
              <span className="capitalize text-[#2d6a4f] font-semibold">{dua.category}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
