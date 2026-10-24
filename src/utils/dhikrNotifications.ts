import { audioService } from './audio';

export interface DhikrReminder {
  arabic: string;
  virtue: string;
}

export const DHIKR_REMINDERS: DhikrReminder[] = [
  {
    arabic: 'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ ، سُبْحَانَ اللَّهِ الْعَظِيمِ',
    virtue: 'كلمتان خفيفتان على اللسان، ثقيلتان في الميزان، حبيبتان إلى الرحمن'
  },
  {
    arabic: 'لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ',
    virtue: 'كنزٌ من كنوز الجنة ودواءٌ لِتسعة وتسعين داءً أيسرها الهم'
  },
  {
    arabic: 'أَسْتَغْفِرُ اللَّهَ الْعَظِيمَ وَأَتُوبُ إِلَيْهِ',
    virtue: 'من لزم الاستغفار جعل الله له من كل ضيق مخرجاً ومن كل هم فرجاً'
  },
  {
    arabic: 'اللَّهُمَّ صَلِّ وَسَلِّمْ عَلَى نَبِيِّنَا مُحَمَّدٍ',
    virtue: 'من صلّى عليّ صلاةً واحدة صلّى الله عليه بها عشراً وحُطت عنه عشر خطايا'
  },
  {
    arabic: 'لَا إِلَهَ إِلَّا أَنْتَ سُبْحَانَكَ إِنِّي كُنْتُ مِنَ الظَّالِمِينَ',
    virtue: 'دعوة ذي النون، لم يدعُ بها رجل مسلم في شيء قط إلا استجاب الله له'
  },
  {
    arabic: 'سُبْحَانَ اللَّهِ ، وَالْحَمْدُ لِلَّهِ ، وَلَا إِلَهَ إِلَّا اللَّهُ ، وَاللَّهُ أَكْبَرُ',
    virtue: 'أحب الكلام إلى الله، وغراس الجنة، وأفضل ما طلعت عليه الشمس'
  },
  {
    arabic: 'لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ',
    virtue: 'كانت له عدل عشر رقاب، وكُتبت له مائة حسنة ومُحيت عنه مائة سيئة'
  },
  {
    arabic: 'حَسْبُنَا اللَّهُ وَنِعْمَ الْوَكِيلُ',
    virtue: 'أمان الخائفين وتفريج الكروب، قالها النبي ﷺ حين قيل: إن الناس قد جمعوا لكم'
  },
  {
    arabic: 'يَا حَيُّ يَا قَيُّومُ بِرَحْمَتِكَ أَسْتَغِيثُ أَصْلِحْ لِي شَأْنِي كُلَّهُ',
    virtue: 'من أدعية الكرب والفرج وتفريج الهموم المأثورة عن رسول الله ﷺ'
  },
  {
    arabic: 'رَضِيتُ بِاللَّهِ رَبّاً، وَبِالإِسْلاَمِ دِيناً، وَبِمُحَمَّدٍ صَلَّى اللَّهُ عَلَيْهِ وَسَلَّمَ نَبِيّاً',
    virtue: 'من قالها كان حقاً على الله تعالى أن يُرضيه يوم القيامة'
  },
  {
    arabic: 'اللَّهُمَّ إِنِّي أَسْأَلُكَ عِلْماً نَافِعاً، وَرِزْقاً طَيِّباً، وَعَمَلاً مُتَقَبَّلاً',
    virtue: 'من دعاء النبي ﷺ كل صباح لنيل بركة الرزق والعمل الصالح'
  },
  {
    arabic: 'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ عَدَدَ خَلْقِهِ، وَرِضَا نَفْسِهِ، وَزِنَةَ عَرْشِهِ، وَمِدَادَ كَلِمَاتِهِ',
    virtue: 'أعظم أذكار التسبيح المضاعف وزناً وأجراً عند الله تعالى'
  },
  {
    arabic: 'اللَّهُمَّ أَعِنِّي عَلَى ذِكْرِكَ وَشُكْرِكَ وَحُسْنِ عِبَادَتِكَ',
    virtue: 'وصية رسول الله ﷺ لمعاذ بن جبل ألا يدعها دبر كل صلاة'
  },
  {
    arabic: 'اللَّهُمَّ إِنَّكَ عَفُوٌّ تُحِبُّ الْعَفْوَ فَاعْفُ عَنِّي',
    virtue: 'الدعاء المأثور لطلب العفو والمغفرة ورضا الرحمن'
  }
];

let lastDhikrIndex = -1;

export function getRandomDhikr(): { dhikr: DhikrReminder; index: number } {
  let index: number;
  do {
    index = Math.floor(Math.random() * DHIKR_REMINDERS.length);
  } while (index === lastDhikrIndex && DHIKR_REMINDERS.length > 1);

  lastDhikrIndex = index;
  return { dhikr: DHIKR_REMINDERS[index], index };
}

export function sendDhikrNotification(customDhikr?: DhikrReminder): DhikrReminder {
  const item = customDhikr || getRandomDhikr().dhikr;
  const title = 'تذكير بذكر الله 🌿';
  const body = `${item.arabic}\n${item.virtue}`;

  // 1. Windows Native Notification via Electron IPC
  if (window.electronAPI) {
    window.electronAPI.showNotification(title, `${item.arabic} - ${item.virtue}`);
  } else if (typeof window !== 'undefined' && 'Notification' in window) {
    if (Notification.permission === 'granted') {
      new Notification(title, { body, icon: './icon.png' });
    } else if (Notification.permission !== 'denied') {
      Notification.requestPermission().then((permission) => {
        if (permission === 'granted') {
          new Notification(title, { body, icon: './icon.png' });
        }
      });
    }
  }

  // 2. Play subtle soft harmonic chime
  audioService.playChime(0.4);

  // 3. Dispatch in-app UI event for instant visual feedback
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('dhikr-notification-pop', {
        detail: item
      })
    );
  }

  return item;
}
