import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, 
  Sparkles, 
  Copy, 
  Check, 
  Star, 
  RotateCcw,
  CheckCircle2
} from 'lucide-react';
import { 
  fetchAllAdhkar, 
  AdhkarCategory, 
  AdhkarItem,
  getFavoriteAdhkarIds,
  toggleFavoriteAdhkar
} from '../../utils/adhkarService';
import { audioService } from '../../utils/audio';

export const DuasView: React.FC = () => {
  const [categories, setCategories] = useState<AdhkarCategory[]>([]);
  const [selectedCategoryName, setSelectedCategoryName] = useState<string>('أذكار الصباح والمساء');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [favoriteIds, setFavoriteIds] = useState<string[]>(getFavoriteAdhkarIds());
  const [itemProgress, setItemProgress] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Quick preset tabs
  const PRIMARY_TABS = [
    'أذكار الصباح والمساء',
    'أذكار النوم',
    'أذكار الاستيقاظ من النوم',
    'الأذكار بعد السلام من الصلاة',
    'أذكار الآذان',
    'دعاء الذهاب إلى المسجد',
    'المفضلة ⭐'
  ];

  useEffect(() => {
    let isMounted = true;
    fetchAllAdhkar().then((data) => {
      if (isMounted) {
        setCategories(data);
        setIsLoading(false);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  const handleCopy = (uid: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(uid);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleToggleFav = (uid: string) => {
    toggleFavoriteAdhkar(uid);
    setFavoriteIds(getFavoriteAdhkarIds());
  };

  const handleItemTap = (uid: string, targetCount: number) => {
    const current = itemProgress[uid] ?? targetCount;
    audioService.playBeep(0.12);

    if (current <= 1) {
      // Completed cycle!
      setItemProgress({ ...itemProgress, [uid]: 0 });
      audioService.playChime(0.4);
    } else {
      setItemProgress({ ...itemProgress, [uid]: current - 1 });
    }
  };

  const handleResetItem = (uid: string, targetCount: number) => {
    setItemProgress({ ...itemProgress, [uid]: targetCount });
  };

  // Build flattened or filtered list
  const filteredItems = useMemo(() => {
    const list: { categoryTitle: string; item: AdhkarItem; uid: string }[] = [];

    categories.forEach((cat) => {
      const catTitle = cat.category || 'أذكار';
      cat.array?.forEach((item) => {
        const uid = `${catTitle}_${item.id}`;
        list.push({ categoryTitle: catTitle, item, uid });
      });
    });

    // 1. Search Query filter
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      return list.filter(
        (entry) =>
          entry.item.text.toLowerCase().includes(q) ||
          entry.categoryTitle.toLowerCase().includes(q)
      );
    }

    // 2. Favorites Tab
    if (selectedCategoryName === 'المفضلة ⭐') {
      return list.filter((entry) => favoriteIds.includes(entry.uid));
    }

    // 3. Category Tab
    return list.filter((entry) => entry.categoryTitle === selectedCategoryName);
  }, [categories, selectedCategoryName, searchQuery, favoriteIds]);

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-6 text-right font-readex">
      {/* Hadith Feature Card */}
      <div className="bg-gradient-to-l from-[#113829] via-[#164e3c] to-[#205c47] rounded-none p-8 text-white shadow-md relative overflow-hidden select-none">
        <div className="max-w-2xl relative z-10">
          <div className="flex items-center gap-2 mb-2 text-xs font-bold uppercase tracking-wider text-emerald-200">
            <Sparkles size={14} />
            <span>من هدي النبي المصطفى ﷺ</span>
          </div>
          <p className="font-amiri text-2xl font-bold text-white leading-loose my-2">
            « مَثَلُ الَّذِي يَذْكُرُ رَبَّهُ وَالَّذِي لا يَذْكُرُ رَبَّهُ، مَثَلُ الحَيِّ وَالمَيِّتِ »
          </p>
          <span className="text-xs text-emerald-100 font-semibold bg-white/10 px-3 py-1 rounded-none border border-white/15">
            صحيح البخاري - حديث ٦٤٠٧
          </span>
        </div>
      </div>

      {/* Search & Category Selector Bar */}
      <div className="bg-white rounded-none p-4 border border-slate-200/90 shadow-sm space-y-4">
        {/* Search input */}
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ابحث في الأذكار والأدعية (مثال: آية الكرسي، الاستفتاح، النوم، الصباح...)"
            className="w-full bg-slate-50 border border-slate-200 rounded-none px-10 py-2.5 text-xs font-semibold text-slate-900 focus:outline-none focus:border-emerald-600 font-readex text-right"
          />
          <Search size={16} className="absolute right-3.5 top-3 text-slate-400" />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute left-3.5 top-2.5 text-xs text-slate-400 hover:text-slate-700 cursor-pointer"
            >
              مسح
            </button>
          )}
        </div>

        {/* Quick Filter Tabs */}
        {!searchQuery && (
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {PRIMARY_TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setSelectedCategoryName(tab)}
                className={`px-3.5 py-1.5 rounded-none text-xs font-semibold whitespace-nowrap transition-all cursor-pointer font-readex ${
                  selectedCategoryName === tab
                    ? 'bg-emerald-800 text-white shadow-xs font-bold'
                    : 'bg-slate-50 border border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                {tab}
              </button>
            ))}

            {/* Dropdown for All 130+ Categories */}
            <div className="relative shrink-0">
              <select
                value={selectedCategoryName}
                onChange={(e) => setSelectedCategoryName(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-none px-3 py-1.5 text-xs font-semibold text-slate-700 focus:outline-none focus:border-emerald-700 cursor-pointer font-readex"
                title="تصفح جميع أبواب حصن المسلم"
              >
                <option disabled value="">— تصفح جميع أبواب حصن المسلم ({categories.length} باب) —</option>
                {categories.map((cat, i) => (
                  <option key={i} value={cat.category}>
                    {cat.category} ({cat.array?.length || 0})
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Results Header Info */}
      <div className="flex items-center justify-between text-xs text-slate-500 font-readex px-1">
        <span>
          {searchQuery
            ? `نتائج البحث عن "${searchQuery}": ${filteredItems.length} ذكر`
            : `باب: ${selectedCategoryName} (${filteredItems.length} ذكر)`}
        </span>
        <span className="text-[11px] text-slate-400">
          مصدر الأذكار: كتاب حصن المسلم المعتمد
        </span>
      </div>

      {/* Duas List Cards */}
      {isLoading ? (
        <div className="p-12 text-center text-sm text-slate-500 font-readex">
          جاري تحميل وتحديث الأذكار...
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="bg-white rounded-none p-12 text-center border border-slate-200/90 text-slate-500 font-readex">
          لا توجد أذكار مطابقة لبحثك في هذا القسم.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredItems.map(({ item, categoryTitle, uid }) => {
            const isFav = favoriteIds.includes(uid);
            const remaining = itemProgress[uid] !== undefined ? itemProgress[uid] : item.count;
            const isCompleted = remaining === 0;

            return (
              <div
                key={uid}
                className={`bg-white rounded-none p-6 border transition-all ${
                  isCompleted
                    ? 'border-emerald-300 bg-emerald-50/20'
                    : 'border-slate-200/90 shadow-sm'
                }`}
              >
                {/* Header row: Category & Action icons */}
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-none border border-emerald-200 font-readex">
                      {categoryTitle}
                    </span>
                    {item.count > 1 && (
                      <span className="text-xs font-semibold text-slate-500 font-readex">
                        التكرار المستحب: <strong className="font-mono text-slate-800">{item.count}</strong> مرات
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5">
                    {/* Favorite Button */}
                    <button
                      onClick={() => handleToggleFav(uid)}
                      className={`p-1.5 rounded-none border transition-colors cursor-pointer ${
                        isFav
                          ? 'bg-amber-50 border-amber-300 text-amber-500'
                          : 'border-slate-200 text-slate-400 hover:text-slate-600'
                      }`}
                      title={isFav ? 'إزالة من المفضلة' : 'إضافة إلى المفضلة'}
                    >
                      <Star size={14} className={isFav ? 'fill-amber-400' : ''} />
                    </button>

                    {/* Copy Button */}
                    <button
                      onClick={() => handleCopy(uid, item.text)}
                      className="p-1.5 rounded-none border border-slate-200 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                      title="نسخ الذكر"
                    >
                      {copiedId === uid ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                    </button>
                  </div>
                </div>

                {/* Main Quranic / Prophetic Text with Tashkeel */}
                <div className="py-2">
                  <p className="font-amiri text-2xl font-bold text-slate-900 leading-loose text-right">
                    {item.text}
                  </p>
                </div>

                {/* Repetition Countdown & Tap Button */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleItemTap(uid, item.count)}
                      className={`flex items-center gap-2 px-4 py-1.5 rounded-none font-bold text-xs transition-all cursor-pointer font-readex ${
                        isCompleted
                          ? 'bg-emerald-800 text-white'
                          : 'bg-emerald-700 hover:bg-emerald-800 text-white active:scale-95 shadow-sm'
                      }`}
                    >
                      {isCompleted ? (
                        <>
                          <CheckCircle2 size={14} />
                          <span>اكتمل التكرار ✓</span>
                        </>
                      ) : (
                        <>
                          <span>اضغط للعد</span>
                          <span className="font-mono bg-black/20 px-1.5 py-0.2">
                            {remaining} / {item.count}
                          </span>
                        </>
                      )}
                    </button>

                    {remaining < item.count && (
                      <button
                        onClick={() => handleResetItem(uid, item.count)}
                        className="p-1.5 rounded-none border border-slate-200 text-slate-400 hover:text-slate-700 cursor-pointer"
                        title="إعادة التكرار"
                      >
                        <RotateCcw size={12} />
                      </button>
                    )}
                  </div>

                  <span className="text-[11px] text-slate-400 font-readex">
                    {isCompleted ? 'تم ختم هذا الذكر' : `المتبقي: ${remaining} من ${item.count}`}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
