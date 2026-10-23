export interface DailyVerse {
  id: number;
  arabic: string;
  surah: string;
  surahNumber: number;
  ayah: number;
  juz: number;
  theme: string;
  tafseer: string;
  reflection: string;
  audioReciter?: string;
  audioUrl?: string;
}

export const DAILY_VERSES: DailyVerse[] = [
  {
    id: 1,
    arabic: 'إِنَّ مَعَ الْعُسْرِ يُسْرًا',
    surah: 'الشرح',
    surahNumber: 94,
    ayah: 6,
    juz: 30,
    theme: 'الفرج واليسر',
    tafseer: 'تأكيد من الله تعالى بأن مع الضيق والشدة فرجاً وتيسيراً عظيماً، ولن يغلب عسر يسرين.',
    reflection: 'كلما اشتدت عليك كربات الحياة، تيقن أن الفرج أقرب ما يكون إليك، فثق بتدبير الله ولطفه.',
    audioUrl: 'https://everyayah.com/data/Alafasy_128kbps/094006.mp3'
  },
  {
    id: 2,
    arabic: 'وَإِذَا سَأَلَكَ عِبَادِي عَنِّي فَإِنِّي قَرِيبٌ أُجِيبُ دَعْوَةَ الدَّاعِ إِذَا دَعَانِ',
    surah: 'البقرة',
    surahNumber: 2,
    ayah: 186,
    juz: 2,
    theme: 'إجابة الدعاء',
    tafseer: 'الله جل جلاله قريب من عباده بعلمه ولطفه وإجابته، لا واسطة بينه وبين خلقه في مناجاته وطلبه.',
    reflection: 'ارفع يديك بالدعاء بقلب حاضر موقن بالإجابة، فربك يسمع دبيب النملة ونجوى صدرك.',
    audioUrl: 'https://everyayah.com/data/Alafasy_128kbps/002186.mp3'
  },
  {
    id: 3,
    arabic: 'وَمَن يَتَّقِ اللَّهَ يَجْعَل لَّهُ مَخْرَجًا وَيَرْزُقْهُ مِنْ حَيْثُ لَا يَحْتَسِبُ',
    surah: 'الطلاق',
    surahNumber: 65,
    ayah: 2,
    juz: 28,
    theme: 'التقوى والرزق',
    tafseer: 'من جعل بينه وبين عذاب الله وقاية بفعل أوامره واجتناب نواهيه، فتح الله له أبواب الفرج ورزقه من جهات لم تخطر على باله.',
    reflection: 'التقوى هي مفتاح الأبواب المغلقة وأعظم أسباب سعة الرزق وتفريج الكروب الدنيوية والأخروية.',
    audioUrl: 'https://everyayah.com/data/Alafasy_128kbps/065002.mp3'
  },
  {
    id: 4,
    arabic: 'أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ',
    surah: 'الرعد',
    surahNumber: 13,
    ayah: 28,
    juz: 13,
    theme: 'السكينة والراحة',
    tafseer: 'تسكن القلوب وتستريح النفوس ويزول قلقها باشتغالها بذكر الله ومحبته وتسبيحه واستغفاره.',
    reflection: 'إذا شعرت بشتات أو ضيق في صدرك، فاهرب إلى ذكر الله، ففيه الشفاء والسكينة والراحة الحقيقية.',
    audioUrl: 'https://everyayah.com/data/Alafasy_128kbps/013028.mp3'
  },
  {
    id: 5,
    arabic: 'وَتَوَكَّلْ عَلَى الْحَيِّ الَّذِي لَا يَمُوتُ وَسَبِّحْ بِحَمْدِهِ',
    surah: 'الفرقان',
    surahNumber: 25,
    ayah: 58,
    juz: 19,
    theme: 'التوكل على الله',
    tafseer: 'فوّض جميع أمورك إلى الله الحي الباقي الدائم الذي لا يموت، واقترن توكلك بتمجيده وتسبيحه.',
    reflection: 'الخلق كلهم يفنون ويموتون ولا يملكون لأنفسهم نفعاً ولا ضراً، فوكل أمرك للحي الذي لا تأخذه سنة ولا نوم.',
    audioUrl: 'https://everyayah.com/data/Alafasy_128kbps/025058.mp3'
  },
  {
    id: 6,
    arabic: 'قُلْ يَا عِبَادِيَ الَّذِينَ أَسْرَفُوا عَلَى أَنفُسِهِمْ لَا تَقْنَطُوا مِن رَّحْمَةِ اللَّهِ إِنَّ اللَّهَ يَغْفِرُ الذُّنُوبَ جَمِيعًا',
    surah: 'الزمر',
    surahNumber: 39,
    ayah: 53,
    juz: 24,
    theme: 'سعة الرحمة والمغفرة',
    tafseer: 'أرجى آية في كتاب الله؛ نداء حانٍ للمذنبين ألا ييأسوا من عفو الله ومغفرته مهما بلغت خطاياهم بالتوبة الصادقة.',
    reflection: 'مهما كثرت زلاتك، باب التوبة مفتوح إلى يوم القيامة، فبادر بالرجوع إلى ربك واستغفاره الآن.',
    audioUrl: 'https://everyayah.com/data/Alafasy_128kbps/039053.mp3'
  },
  {
    id: 7,
    arabic: 'وَقَضَى رَبُّكَ أَلَّا تَعْبُدُوا إِلَّا إِيَّاهُ وَبِالْوَالِدَيْنِ إِحْسَانًا',
    surah: 'الإسراء',
    surahNumber: 17,
    ayah: 23,
    juz: 15,
    theme: 'بر الوالدين',
    tafseer: 'قرن الله حقه الأعظم وهو التوحيد بحق الوالدين في البر والصلة والرحمة ولين الجانب.',
    reflection: 'بر الوالدين مفتاح رضا الله وجنات النعيم؛ تفقّد والديك اليوم بكلمة طيبة، دعاء صادق، أو هدية تسر خاطرهما.',
    audioUrl: 'https://everyayah.com/data/Alafasy_128kbps/017023.mp3'
  },
  {
    id: 8,
    arabic: 'وَاصْبِرْ لِحُكْمِ رَبِّكَ فَإِنَّكَ بِأَعْيُنِنَا',
    surah: 'الطور',
    surahNumber: 52,
    ayah: 48,
    juz: 27,
    theme: 'معية الله وحفظه',
    tafseer: 'اصبر على قضاء الله وأوامره وأذى الخلق؛ فإنك في رعايتنا وحفظنا وحمايتنا الدائمة.',
    reflection: 'ما أعظم أن تستشعر أنك في عين الله وحفظه! يطمئن قلبك وتزول مخاوفك كلها وأنت مع مولاك.',
    audioUrl: 'https://everyayah.com/data/Alafasy_128kbps/052048.mp3'
  },
  {
    id: 9,
    arabic: 'فَاذْكُرُونِي أَذْكُرْكُمْ وَاشْكُرُوا لِي وَلَا تَكْفُرُونِ',
    surah: 'البقرة',
    surahNumber: 2,
    ayah: 152,
    juz: 2,
    theme: 'فضل الذكر والشكر',
    tafseer: 'اذكروا الله بالتسبيح والطاعة يذكركم برحمته ورضوانه وثوابه في الملأ الأعلى، واشكروه على نعمه ولا تجحدوها.',
    reflection: 'شرف عظيم أن يذكرك ملك الملوك في ملأ من الملائكة المقربين لمجرد أن تذكره بلسانك في خلوتك!',
    audioUrl: 'https://everyayah.com/data/Alafasy_128kbps/002152.mp3'
  },
  {
    id: 10,
    arabic: 'وَاسْتَعِينُوا بِالصَّبْرِ وَالصَّلَاةِ وَإِنَّهَا لَكَبِيرَةٌ إِلَّا عَلَى الْخَاشِعِينَ',
    surah: 'البقرة',
    surahNumber: 2,
    ayah: 45,
    juz: 1,
    theme: 'الصلاة والصبر',
    tafseer: 'اطلبوا العون على مصائب الدنيا وأعباء الحياة بالصبر الجميل واللجوء إلى الصلاة، فهي الصلة الحقيقية بالله.',
    reflection: 'كان النبي ﷺ إذا حزبه أمرٌ أو أهمه فزع إلى الصلاة؛ اجعل سجودك ملجأك عند كل هم.',
    audioUrl: 'https://everyayah.com/data/Alafasy_128kbps/002045.mp3'
  },
  {
    id: 11,
    arabic: 'وَسَارِعُوا إِلَى مَغْفِرَةٍ مِّن رَّبِّكُمْ وَجَنَّةٍ عَرْضُهَا السَّمَاوَاتُ وَالْأَرْضُ أُعِدَّتْ لِلْمُتَّقِينَ',
    surah: 'آل عمران',
    surahNumber: 3,
    ayah: 133,
    juz: 4,
    theme: 'المسارعة في الخيرات',
    tafseer: 'تسابقوا بالأعمال الصالحة والتوبة النصوح نحو مغفرة الله والجنة الواسعة التي أعدها الله لأهل التقوى.',
    reflection: 'الحياة قصيرة والأنفاس معدودة، فلا تسوّف التوبة ولا تؤجل عملاً صالحاً، فالجنة غالية تستحق المسارعة.',
    audioUrl: 'https://everyayah.com/data/Alafasy_128kbps/003133.mp3'
  },
  {
    id: 12,
    arabic: 'حَسْبُنَا اللَّهُ وَنِعْمَ الْوَكِيلُ',
    surah: 'آل عمران',
    surahNumber: 3,
    ayah: 173,
    juz: 4,
    theme: 'الكفاية والتوكل',
    tafseer: 'الله وحده يكفينا في كل شدة وملمة، وهو نعم المولى ونعم النصير الذي يفوض إليه العباد كل أمورهم.',
    reflection: 'كلمة قالها إبراهيم عليه السلام حين أُلقي في النار فكانت برداً وسلاماً، وقالها النبي ﷺ وصحابته فكفاهم الله كيد الأعداء.',
    audioUrl: 'https://everyayah.com/data/Alafasy_128kbps/003173.mp3'
  },
  {
    id: 13,
    arabic: 'إِنَّ اللَّهَ وَمَلَائِكَتَهُ يُصَلُّونَ عَلَى النَّبِيِّ يَا أَيُّهَا الَّذِينَ آمَنُوا صَلُّوا عَلَيْهِ وَسَلِّمُوا تَسْلِيمًا',
    surah: 'الأحزاب',
    surahNumber: 33,
    ayah: 56,
    juz: 22,
    theme: 'الصلاة على النبي ﷺ',
    tafseer: 'ثناء من الله في الملأ الأعلى ودعاء واستغفار من الملائكة للنبي المصطفى، وأمر للمؤمنين بالإكثار من الصلاة والتسليم عليه.',
    reflection: 'من صلى على النبي ﷺ واحدة صلى الله عليه بها عشراً وحُطت عنه عشر خطايا ورفعت له عشر درجات.',
    audioUrl: 'https://everyayah.com/data/Alafasy_128kbps/033056.mp3'
  },
  {
    id: 14,
    arabic: 'وَقُل رَّبِّ زِدْنِي عِلْمًا',
    surah: 'طه',
    surahNumber: 20,
    ayah: 114,
    juz: 16,
    theme: 'طلب العلم النافع',
    tafseer: 'أمر إلهي لنبيه ﷺ بطلب الزيادة من العلم النافع الذي يقرب العبد من ربه وينير بصيرته.',
    reflection: 'العلم هو الميراث الحقيقي للأنبياء؛ احرص كل يوم على تعلم آية، حديث، أو فائدة نافعة تنفع بها دينك ودنياك.',
    audioUrl: 'https://everyayah.com/data/Alafasy_128kbps/020114.mp3'
  },
  {
    id: 15,
    arabic: 'لَا يُكَلِّفُ اللَّهُ نَفْسًا إِلَّا وُسْعَهَا',
    surah: 'البقرة',
    surahNumber: 2,
    ayah: 286,
    juz: 3,
    theme: 'رفع الحرج والتيسير',
    tafseer: 'رحمة من الله وتيسير؛ فلا يكلف عباده فوق طاقتهم وقدرتهم، وقضاؤه مقدور ومحفوف بلطفه.',
    reflection: 'مهما بدا حملك ثقيلاً، ثق أن الله يعلم طاقتك وقدرتك وأنك قادر على تجاوزه بلطفه ومعونته.',
    audioUrl: 'https://everyayah.com/data/Alafasy_128kbps/002286.mp3'
  },
  {
    id: 16,
    arabic: 'وَأَحْسِنُوا إِنَّ اللَّهَ يُحِبُّ الْمُحْسِنِينَ',
    surah: 'البقرة',
    surahNumber: 2,
    ayah: 195,
    juz: 2,
    theme: 'الإحسان ومحبة الله',
    tafseer: 'الإحسان في عبادة الله كأنك تراه، والإحسان إلى خلقه بالكلمة الطيبة واليد البيضاء وكف الأذى.',
    reflection: 'اجعل عملك متقناً، ومعاملتك راقية، ولسانك عطراً؛ فالإحسان بوابتك الكبرى لنيل محبة الله الخاصة.',
    audioUrl: 'https://everyayah.com/data/Alafasy_128kbps/002195.mp3'
  },
  {
    id: 17,
    arabic: 'وَمَا تَفْعَلُوا مِنْ خَيْرٍ يَعْلَمْهُ اللَّهُ',
    surah: 'البقرة',
    surahNumber: 2,
    ayah: 197,
    juz: 2,
    theme: 'علم الله بالخير ومجازاته',
    tafseer: 'لا يضيع عند الله مثقال ذرة من خير؛ يعلمه ويجازي عليه بأضعاف كثيرة في الدنيا والآخرة.',
    reflection: 'لا تحتقر معروفا صغيراً؛ ابتسامتك في وجه أخيك، إماطة أذى، أو جبر خاطر خفي.. كلها محفوظة في كتاب لا يضل ربي ولا ينسى.',
    audioUrl: 'https://everyayah.com/data/Alafasy_128kbps/002197.mp3'
  },
  {
    id: 18,
    arabic: 'رَبِّ إِنِّي لِمَا أَنزَلْتَ إِلَيَّ مِنْ خَيْرٍ فَقِيرٌ',
    surah: 'القصص',
    surahNumber: 28,
    ayah: 24,
    juz: 20,
    theme: 'دعاء موسى والافتقار إلى الله',
    tafseer: 'دعاء كليم الله موسى عليه السلام متذللاً ومفتقراً إلى ربه بعد أن أجهده التعب والغربة، ففتح الله له أبواب الرزق والأمان والزواج.',
    reflection: 'إظهار الفقر والفاقة إلى الله هو كمال العبودية وأعظم سر لاستجلاب العطايا والفتوحات الربانية.',
    audioUrl: 'https://everyayah.com/data/Alafasy_128kbps/028024.mp3'
  },
  {
    id: 19,
    arabic: 'إِنَّ اللَّهَ مَعَ الصَّابِرِينَ',
    surah: 'البقرة',
    surahNumber: 2,
    ayah: 153,
    juz: 2,
    theme: 'معية الصابرين',
    tafseer: 'معية خاصة وتأييد وتوفيق من الله لأهل الصبر على الطاعة، وعن المعصية، وعلى أقدار الله المؤلمة.',
    reflection: 'يكفي الصابر شرفاً أن الله معه بحفظه ونصره ومعونته؛ اصبر صبراً جميلاً وسترى ثمار الصبر يانعة.',
    audioUrl: 'https://everyayah.com/data/Alafasy_128kbps/002153.mp3'
  },
  {
    id: 20,
    arabic: 'وَمَا كَانَ اللَّهُ مُعَذِّبَهُمْ وَهُمْ يَسْتَغْفِرُونَ',
    surah: 'الأنفال',
    surahNumber: 8,
    ayah: 33,
    juz: 9,
    theme: 'أمان الاستغفار',
    tafseer: 'الاستغفار أمان من عذاب الله ومصائب الدنيا، وسبب لنزول الغيث والبركة في الأموال والأولاد والقوة.',
    reflection: 'كان الاستغفار أمان الأمة الثاني بعد وجود النبي ﷺ بينها، فلا تفرّط في هذا الأمان الحصين طوال يومك.',
    audioUrl: 'https://everyayah.com/data/Alafasy_128kbps/008033.mp3'
  }
];

export function getTodayVerse(date: Date = new Date()): DailyVerse {
  // Day of the year calculation (1 - 366)
  const startOfYear = new Date(date.getFullYear(), 0, 0);
  const diff = date.getTime() - startOfYear.getTime();
  const oneDay = 1000 * 60 * 60 * 24;
  const dayOfYear = Math.floor(diff / oneDay);

  const index = Math.abs(dayOfYear) % DAILY_VERSES.length;
  return DAILY_VERSES[index];
}

export function getVerseById(id: number): DailyVerse | undefined {
  return DAILY_VERSES.find((v) => v.id === id);
}

export function getRandomVerse(excludeId?: number): DailyVerse {
  const filtered = excludeId ? DAILY_VERSES.filter((v) => v.id !== excludeId) : DAILY_VERSES;
  const randomIndex = Math.floor(Math.random() * filtered.length);
  return filtered[randomIndex];
}
