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
  categoryLabel: string;
  title: string;
  subtitle: string;
  arabic: string;
  explanation: string;
  reference: string;
  icon: React.ReactNode;
  bgTint: string;
}

const DUAS_DATA: DuaItem[] = [
  {
    id: '1',
    category: 'morning',
    categoryLabel: 'أذكار الصباح',
    title: 'دعاء الصباح واستفتاح اليوم',
    subtitle: 'لحفظ اليوم والبركة فيه',
    arabic: 'أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، لاَ إِلَهَ إِلاَّ اللَّهُ وَحْدَهُ لاَ شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ',
    explanation: 'تجديد للتوحيد وتسليم الأمر كله لله مع إشراقة كل صباح.',
    reference: 'صحيح مسلم (٢٧٢٣)',
    icon: <Sun size={18} className="text-amber-600" />,
    bgTint: 'bg-amber-50 border-amber-200'
  },
  {
    id: '2',
    category: 'evening',
    categoryLabel: 'أذكار المساء',
    title: 'دعاء حلول المساء',
    subtitle: 'للسكينة والأمان وحفظ الأهل',
    arabic: 'أَمْسَيْنَا وَأَمْسَى الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، لاَ إِلَهَ إِلاَّ اللَّهُ وَحْدَهُ لاَ شَرِيكَ لَهُ',
    explanation: 'استشعار لعظمة الله وحفظه بعد انقضاء النهار ودخول الليل.',
    reference: 'صحيح مسلم',
    icon: <Moon size={18} className="text-indigo-600" />,
    bgTint: 'bg-indigo-50 border-indigo-200'
  },
  {
    id: '3',
    category: 'sleep',
    categoryLabel: 'أذكار النوم',
    title: 'دعاء قبل النوم',
    subtitle: 'لراحة البال وحفظ النفس في المنام',
    arabic: 'بِاسْمِكَ رَبِّي وَضَعْتُ جَنْبِي، وَبِكَ أَرْفَعُهُ، فَإِنْ أَمْسَكْتَ نَفْسِي فَارْحَمْهَا، وَإِنْ أَرْسَلْتَهَا فَاحْفَظْهَا بِمَا تَحْفَظُ بِهِ عِبَادَكَ الصَّالِحِينَ',
    explanation: 'تفويض النفس والروح إلى بارئها عند النوم.',
    reference: 'صحيح البخاري (٦٣٢٠)',
    icon: <Bed size={18} className="text-blue-600" />,
    bgTint: 'bg-blue-50 border-blue-200'
  },
  {
    id: '4',
    category: 'parents',
    categoryLabel: 'بر الوالدين',
    title: 'دعاء للوالدين بالرحمة والمغفرة',
    subtitle: 'أعظم البر وأوفى الوفاء للأبوين',
    arabic: 'رَّبِّ ارْحَمْهُمَا كَمَا رَبَّيَانِي صَغِيرًا',
    explanation: 'دعاء قرآني جامع لطلب الرحمة الواسعة للوالدين جزاء إحسانهما.',
    reference: 'سورة الإسراء - الآية ٢٤',
    icon: <Heart size={18} className="text-rose-600" />,
    bgTint: 'bg-rose-50 border-rose-200'
  },
  {
    id: '5',
    category: 'hardship',
    categoryLabel: 'تفريج الكروب',
    title: 'دعاء الكرب والشدائد',
    subtitle: 'لتفريج الهموم وجلب الطمأنينة واليسر',
    arabic: 'حَسْبُنَا اللَّهُ وَنِعْمَ الْوَكِيلُ، نِعْمَ الْمَوْلَىٰ وَنِعْمَ النَّصِيرُ',
    explanation: 'التوكل المطلق على الله، وهو سلاح المؤمن في دفع كل كرب وهم.',
    reference: 'سورة آل عمران - الآية ١٧٣',
    icon: <ShieldCheck size={18} className="text-emerald-700" />,
    bgTint: 'bg-emerald-50 border-emerald-200'
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
    <div className="p-8 max-w-5xl mx-auto space-y-6 text-right font-readex">
      {/* Hadith Feature Card */}
      <div className="bg-gradient-to-l from-[#113829] via-[#164e3c] to-[#205c47] rounded-3xl p-8 text-white shadow-md relative overflow-hidden select-none">
        <div className="max-w-2xl relative z-10">
          <div className="flex items-center gap-2 mb-2 text-xs font-bold uppercase tracking-wider text-emerald-200">
            <Sparkles size={14} />
            <span>من هدي النبي المصطفى ﷺ</span>
          </div>
          <p className="font-amiri text-2xl font-bold text-white leading-loose my-2">
            « خَيْرُكُمْ مَنْ تَعَلَّمَ الْقُرْآنَ وَعَلَّمَهُ »
          </p>
          <span className="text-xs text-emerald-100 font-semibold bg-white/10 px-3 py-1 rounded-full border border-white/15">
            صحيح البخاري - حديث ٥٠٢٧
          </span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {[
          { id: 'all', label: 'جميع الأدعية' },
          { id: 'morning', label: 'أذكار الصباح' },
          { id: 'evening', label: 'أذكار المساء' },
          { id: 'sleep', label: 'أذكار النوم' },
          { id: 'parents', label: 'بر الوالدين' },
          { id: 'hardship', label: 'تفريج الكروب' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setSelectedCategory(tab.id)}
            className={`px-4 py-2 rounded-2xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              selectedCategory === tab.id
                ? 'bg-emerald-800 text-white shadow-xs font-bold'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Duas List Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((dua) => (
          <div key={dua.id} className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-2xl border flex items-center justify-center shrink-0 ${dua.bgTint}`}>
                    {dua.icon}
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-900 font-readex">{dua.title}</h4>
                    <p className="text-xs text-slate-500 font-readex">{dua.subtitle}</p>
                  </div>
                </div>
                <button
                  onClick={() => handleCopy(dua.id, `${dua.arabic}\n\n${dua.explanation}`)}
                  className="p-1.5 rounded-xl border border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-colors cursor-pointer"
                  title="نسخ الدعاء"
                >
                  {copiedId === dua.id ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                </button>
              </div>

              {/* Arabic Calligraphy */}
              <div className="bg-emerald-50/40 border border-emerald-100 rounded-2xl p-4 my-3 text-right">
                <p className="font-amiri text-2xl font-bold text-slate-900 leading-loose">
                  {dua.arabic}
                </p>
              </div>

              {/* Virtue / Explanation */}
              <p className="text-xs text-emerald-800 font-medium font-readex leading-relaxed">
                {dua.explanation}
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-readex">
              <span className="flex items-center gap-1">
                <BookOpen size={11} className="text-emerald-700" />
                <span>{dua.reference}</span>
              </span>
              <span className="font-semibold text-emerald-800">{dua.categoryLabel}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
