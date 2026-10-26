import React, { useState, useMemo, useEffect } from 'react';
import { 
  BookMarked, 
  Search, 
  Copy, 
  Check, 
  ChevronRight, 
  ChevronLeft, 
  BookOpen, 
  Bookmark, 
  BookmarkCheck, 
  RotateCw, 
  ZoomIn, 
  ZoomOut,
  Info,
  ListOrdered
} from 'lucide-react';
import nawawiData from '../../data/nawawi40.json';

export interface NawawiHadith {
  id: number;
  number: number;
  numberName: string;
  title: string;
  text: string;
  explanation: string;
}

const HADITHS = nawawiData as NawawiHadith[];
const NAWAWI_BOOKMARKS_KEY = 'noor_nawawi_bookmarks';
const NAWAWI_LAST_READ_KEY = 'noor_nawawi_last_read';

export const NawawiView: React.FC = () => {
  const [selectedId, setSelectedId] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(NAWAWI_LAST_READ_KEY);
      if (saved) {
        const num = parseInt(saved, 10);
        if (num >= 1 && num <= HADITHS.length) return num;
      }
    } catch {}
    return 1;
  });

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showExplanation, setShowExplanation] = useState<boolean>(true);
  const [fontSizeLevel, setFontSizeLevel] = useState<number>(1); // 0: sm, 1: base, 2: lg, 3: xl
  const [copied, setCopied] = useState<boolean>(false);
  const [onlyFavorites, setOnlyFavorites] = useState<boolean>(false);

  const [bookmarks, setBookmarks] = useState<number[]>(() => {
    try {
      const saved = localStorage.getItem(NAWAWI_BOOKMARKS_KEY);
      if (saved) return JSON.parse(saved);
    } catch {}
    return [];
  });

  // Save last read hadith
  useEffect(() => {
    try {
      localStorage.setItem(NAWAWI_LAST_READ_KEY, selectedId.toString());
    } catch {}
  }, [selectedId]);

  // Save bookmarks
  const toggleBookmark = (id: number) => {
    setBookmarks((prev) => {
      const exists = prev.includes(id);
      const next = exists ? prev.filter((item) => item !== id) : [...prev, id];
      try {
        localStorage.setItem(NAWAWI_BOOKMARKS_KEY, JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  // Filtered hadiths based on search query and bookmarks filter
  const filteredHadiths = useMemo(() => {
    return HADITHS.filter((h) => {
      if (onlyFavorites && !bookmarks.includes(h.id)) return false;
      if (!searchQuery.trim()) return true;
      const q = searchQuery.trim().toLowerCase();
      return (
        h.title.toLowerCase().includes(q) ||
        h.text.toLowerCase().includes(q) ||
        h.numberName.toLowerCase().includes(q) ||
        h.number.toString().includes(q)
      );
    });
  }, [searchQuery, onlyFavorites, bookmarks]);

  const currentHadith = useMemo(() => {
    return HADITHS.find((h) => h.id === selectedId) || HADITHS[0];
  }, [selectedId]);

  const isCurrentBookmarked = bookmarks.includes(currentHadith.id);

  const handleCopy = () => {
    const content = `«${currentHadith.numberName}: ${currentHadith.title}»\n\n${currentHadith.text}\n\n— من الأربعين النووية للإمام النووي`;
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleNext = () => {
    const nextIndex = currentHadith.id < HADITHS.length ? currentHadith.id + 1 : 1;
    setSelectedId(nextIndex);
  };

  const handlePrev = () => {
    const prevIndex = currentHadith.id > 1 ? currentHadith.id - 1 : HADITHS.length;
    setSelectedId(prevIndex);
  };

  const handleRandom = () => {
    const rand = Math.floor(Math.random() * HADITHS.length) + 1;
    setSelectedId(rand);
  };

  const hadithFontSizes = [
    'text-base leading-relaxed',
    'text-lg sm:text-xl leading-loose',
    'text-xl sm:text-2xl leading-loose',
    'text-2xl sm:text-3xl leading-loose'
  ];

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6 text-right font-readex">
      {/* 1. Header Banner */}
      <div className="bg-[#0b1f16] border border-emerald-500/40 p-6 text-white shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
        <div className="flex items-center gap-4">
          <div className="w-13 h-13 bg-emerald-900 border border-emerald-400/40 flex items-center justify-center shrink-0 text-emerald-300 shadow-inner">
            <BookMarked size={28} />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 bg-emerald-800/80 border border-emerald-500/30 text-[11px] font-bold text-emerald-200">
                موسوعة الحديث الشريف
              </span>
              <span className="text-[11px] text-amber-300 font-mono font-bold">
                ٤٢ حديثاً نبوياً صحيحاً
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold font-readex text-slate-100">
              متن الأربعين النووية للإمام النووي
            </h2>
            <p className="text-xs text-emerald-200/90 font-readex mt-1">
              جمع الإمام يحيى بن شرف النووي (رحمه الله) — أحاديث صحيحة تدور عليها قواعد الدين ومباني الإسلام
            </p>
          </div>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap self-stretch md:self-auto justify-end">
          <button
            type="button"
            onClick={handleRandom}
            className="px-3.5 py-2 bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-500/40 text-emerald-100 text-xs font-semibold flex items-center gap-2 cursor-pointer transition-colors shadow-xs"
            title="اختيار حديث عشوائي للتدبر اليومي"
          >
            <RotateCw size={13} />
            <span>حديث عشوائي للتدبر</span>
          </button>

          <button
            type="button"
            onClick={() => setOnlyFavorites((prev) => !prev)}
            className={`px-3.5 py-2 border text-xs font-semibold flex items-center gap-2 cursor-pointer transition-colors shadow-xs ${
              onlyFavorites
                ? 'bg-amber-600 border-amber-400 text-white font-bold'
                : 'bg-emerald-950/80 hover:bg-emerald-900 border-emerald-500/40 text-emerald-100'
            }`}
          >
            <BookmarkCheck size={13} />
            <span>المفضلة ({bookmarks.length})</span>
          </button>
        </div>
      </div>

      {/* 2. Search & Filter Bar */}
      <div className="bg-white dark:bg-[#0c1611] p-4 border border-slate-200/90 dark:border-[#1a2c25] shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative w-full md:max-w-md">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ابحث في نصوص الأحاديث، العناوين، أو الرواة..."
            className="w-full bg-slate-50 dark:bg-[#15231e] border border-slate-200 dark:border-[#233b31] pl-4 pr-10 py-2.5 text-xs font-semibold text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-emerald-600 transition-colors"
          />
          <Search size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        </div>

        {/* Quick Dropdown Picker + Font Controls */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 hidden sm:inline">
              انتقال سريع:
            </span>
            <select
              value={selectedId}
              onChange={(e) => setSelectedId(parseInt(e.target.value, 10))}
              className="bg-slate-50 dark:bg-[#15231e] border border-slate-200 dark:border-[#233b31] px-3 py-2 text-xs font-semibold text-slate-800 dark:text-slate-100 focus:outline-none focus:border-emerald-600 cursor-pointer"
            >
              {HADITHS.map((h) => (
                <option key={h.id} value={h.id}>
                  {h.number}. {h.title}
                </option>
              ))}
            </select>
          </div>

          {/* Font Resizer */}
          <div className="flex items-center border border-slate-200 dark:border-[#233b31] bg-slate-50 dark:bg-[#15231e]">
            <button
              type="button"
              onClick={() => setFontSizeLevel((prev) => Math.max(0, prev - 1))}
              disabled={fontSizeLevel <= 0}
              className="px-2.5 py-1.5 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 disabled:opacity-30 cursor-pointer border-l border-slate-200 dark:border-[#233b31]"
              title="تصغير حجم الخط"
            >
              <ZoomOut size={13} />
            </button>
            <span className="px-2.5 text-[11px] font-mono font-bold text-slate-700 dark:text-slate-300">
              خط {fontSizeLevel + 1}
            </span>
            <button
              type="button"
              onClick={() => setFontSizeLevel((prev) => Math.min(3, prev + 1))}
              disabled={fontSizeLevel >= 3}
              className="px-2.5 py-1.5 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 disabled:opacity-30 cursor-pointer"
              title="تكبير حجم الخط"
            >
              <ZoomIn size={13} />
            </button>
          </div>
        </div>
      </div>

      {/* 3. Main Master-Detail Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left / Detailed Hadith Reader (lg:col-span-8) */}
        <div className="lg:col-span-8 space-y-5">
          <div className="bg-white dark:bg-[#0c1611] p-6 sm:p-8 border border-slate-200/90 dark:border-[#1a2c25] shadow-sm space-y-6">
            {/* Hadith Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-[#1a2c25] flex-wrap gap-3">
              <div className="flex items-center gap-3">
                <span className="w-10 h-10 bg-emerald-900 border border-emerald-500/40 text-emerald-300 font-mono font-extrabold flex items-center justify-center text-sm shadow-xs">
                  {currentHadith.number}
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold text-emerald-800 dark:text-emerald-400">
                      {currentHadith.numberName}
                    </span>
                    <span className="text-slate-300 dark:text-slate-700">•</span>
                    <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                      متن صحيح
                    </span>
                  </div>
                  <h3 className="font-extrabold text-lg sm:text-xl text-slate-900 dark:text-slate-100 font-readex">
                    {currentHadith.title}
                  </h3>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => toggleBookmark(currentHadith.id)}
                  className={`p-2 border cursor-pointer transition-colors ${
                    isCurrentBookmarked
                      ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-400 text-amber-600 dark:text-amber-300'
                      : 'bg-slate-50 dark:bg-[#15231e] border-slate-200 dark:border-[#233b31] text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-100'
                  }`}
                  title={isCurrentBookmarked ? 'إزالة من المفضلة' : 'حفظ في المفضلة'}
                >
                  <Bookmark size={15} fill={isCurrentBookmarked ? 'currentColor' : 'none'} />
                </button>

                <button
                  type="button"
                  onClick={handleCopy}
                  className="px-3 py-2 bg-slate-50 dark:bg-[#15231e] border border-slate-200 dark:border-[#233b31] text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#1a2c25] text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
                  title="نسخ نص الحديث"
                >
                  {copied ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                  <span>{copied ? 'تم النسخ' : 'نسخ الحديث'}</span>
                </button>
              </div>
            </div>

            {/* Hadith Matn / Arabic Text Card */}
            <div className="bg-gradient-to-b from-emerald-50/50 to-transparent dark:from-emerald-950/20 dark:to-transparent p-6 sm:p-7 border border-emerald-100 dark:border-emerald-900/40 relative">
              <p className={`font-amiri font-bold text-slate-900 dark:text-slate-100 select-text ${hadithFontSizes[fontSizeLevel]}`}>
                « {currentHadith.text} »
              </p>
            </div>

            {/* Toggle Explanation Button */}
            <div className="pt-2 flex items-center justify-between border-t border-slate-100 dark:border-[#1a2c25]">
              <button
                type="button"
                onClick={() => setShowExplanation((prev) => !prev)}
                className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold flex items-center gap-2 cursor-pointer transition-colors shadow-xs"
              >
                <BookOpen size={14} />
                <span>{showExplanation ? 'إخفاء الشرح والفوائد' : 'عرض الشرح والفوائد الفقهية والتربوية'}</span>
              </button>

              <span className="text-xs text-slate-400 font-mono font-medium">
                حديث رقم {currentHadith.number} من ٤٢
              </span>
            </div>

            {/* Sharh / Explanation Section */}
            {showExplanation && currentHadith.explanation && (
              <div className="bg-slate-50 dark:bg-[#15231e] border border-slate-200 dark:border-[#233b31] p-6 space-y-4 animate-fade-in">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-200 dark:border-[#233b31]">
                  <span className="w-7 h-7 bg-emerald-100 dark:bg-emerald-900/60 border border-emerald-300 dark:border-emerald-700 text-emerald-800 dark:text-emerald-300 flex items-center justify-center text-xs">
                    <Info size={14} />
                  </span>
                  <div>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100 font-readex">
                      شرح وفوائد الحديث
                    </h4>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400">
                      مستفاد من شروح أئمة الحديث (ابن دقيق العيد، النووي، وابن عثيمين)
                    </span>
                  </div>
                </div>

                <div className="space-y-3.5 text-xs sm:text-[13px] text-slate-700 dark:text-slate-200 leading-relaxed font-readex select-text">
                  {currentHadith.explanation.split('\n\n').map((paragraph, pIdx) => (
                    <p key={pIdx} className="whitespace-pre-line text-justify">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </div>
            )}

            {/* Previous / Next Navigation Bar */}
            <div className="pt-4 border-t border-slate-100 dark:border-[#1a2c25] flex items-center justify-between">
              <button
                type="button"
                onClick={handlePrev}
                className="px-4 py-2 bg-slate-50 dark:bg-[#15231e] border border-slate-200 dark:border-[#233b31] text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#1a2c25] text-xs font-bold flex items-center gap-2 cursor-pointer transition-colors"
              >
                <ChevronRight size={15} />
                <span>الحديث السابق</span>
              </button>

              <div className="text-center">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 font-mono">
                  {currentHadith.number} / {HADITHS.length}
                </span>
              </div>

              <button
                type="button"
                onClick={handleNext}
                className="px-4 py-2 bg-slate-50 dark:bg-[#15231e] border border-slate-200 dark:border-[#233b31] text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#1a2c25] text-xs font-bold flex items-center gap-2 cursor-pointer transition-colors"
              >
                <span>الحديث التالي</span>
                <ChevronLeft size={15} />
              </button>
            </div>
          </div>
        </div>

        {/* Right / Hadiths List Directory (lg:col-span-4) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white dark:bg-[#0c1611] p-5 border border-slate-200/90 dark:border-[#1a2c25] shadow-sm space-y-3">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-[#1a2c25]">
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 flex items-center justify-center text-xs">
                  <ListOrdered size={14} />
                </span>
                <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100 font-readex">
                  فهرس الأحاديث
                </h4>
              </div>
              <span className="text-[11px] font-mono font-bold text-emerald-800 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 border border-emerald-200 dark:border-emerald-800">
                {filteredHadiths.length} حديث
              </span>
            </div>

            {/* Scrollable list */}
            <div className="max-h-[640px] overflow-y-auto space-y-1.5 pr-1">
              {filteredHadiths.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-xs">
                  لا توجد أحاديث مطابقة لبحثك.
                </div>
              ) : (
                filteredHadiths.map((h) => {
                  const isSelected = h.id === selectedId;
                  const isBookmarked = bookmarks.includes(h.id);

                  return (
                    <button
                      key={h.id}
                      type="button"
                      onClick={() => {
                        setSelectedId(h.id);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className={`w-full p-3 text-right flex items-start gap-3 transition-all cursor-pointer border ${
                        isSelected
                          ? 'bg-emerald-800 border-emerald-700 text-white shadow-xs'
                          : 'bg-slate-50/80 dark:bg-[#15231e]/80 border-slate-200/80 dark:border-[#233b31] text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#1a2c25]'
                      }`}
                    >
                      <span
                        className={`w-6 h-6 shrink-0 flex items-center justify-center text-xs font-mono font-bold mt-0.5 ${
                          isSelected
                            ? 'bg-amber-500 text-slate-950'
                            : 'bg-slate-200 dark:bg-[#233b31] text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {h.number}
                      </span>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1 mb-0.5">
                          <h5 className="font-bold text-xs truncate font-readex">
                            {h.title}
                          </h5>
                          {isBookmarked && (
                            <Bookmark size={11} className={isSelected ? 'text-amber-300' : 'text-amber-500'} fill="currentColor" />
                          )}
                        </div>
                        <p className={`text-[10px] line-clamp-1 leading-relaxed ${
                          isSelected ? 'text-emerald-100' : 'text-slate-500 dark:text-slate-400'
                        }`}>
                          {h.text}
                        </p>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
