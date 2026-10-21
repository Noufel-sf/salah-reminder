# Noor - Islamic Prayer Reminder Desktop App 🌙

> A lightweight, modern, and beautiful desktop application for Muslim prayer reminders, timetable tracking, and Qibla direction. Built with **React**, **Vite**, **TypeScript**, and **Electron**.

---

## ✨ Features

- ⏱️ **Offline Accurate Prayer Times**: Powered by the official [`adhan`](https://github.com/batoulapps/adhan-js) calculation library — works 100% offline.
- 🔔 **Desktop Native Notifications**: Windows toast notifications for every prayer time with custom per-prayer toggles.
- 🔊 **Multi-Mode Audio Alerts**: Support for Takbeer call, Peaceful Chime, Full Adhan audio streaming, or subtle beeps.
- 🕋 **Live Qibla Direction Compass**: Mathematical spherical trigonometry calculating exact compass angle relative to the Holy Kaaba in Mecca.
- 🌍 **Configurable Calculation Methods**:
  - Muslim World League (MWL)
  - Umm al-Qura (Makkah)
  - Egyptian General Authority of Survey
  - Karachi (University of Islamic Sciences)
  - Dubai & Gulf regions
  - ISNA (North America)
  - Moonsighting Committee Worldwide
- 📅 **Dual Calendar**: Displays both Gregorian and Hijri (Islamic) dates.
- 🎨 **Modern Islamic Glassmorphism UI**: Deep dark aesthetic with emerald and amber highlights, smooth animations, and live progress bars.
- 🪟 **System Tray & Background Mode**: Minimizes directly to the Windows system tray and runs quietly in the background without cluttering the taskbar.

---

## 🛠️ Tech Stack

- **Desktop Framework**: Electron 34
- **Frontend Framework**: React 18 + Vite 6
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4 + Vanilla CSS Design Tokens
- **Icons**: Lucide React
- **Calculation Engine**: `adhan` (Batoul Apps)
- **Package Manager**: `pnpm`

---

## 🚀 Getting Started

### 1. Clone the repository
```bash
git clone https://github.com/Noufel-sf/salah-reminder.git
cd salah-reminder
```

### 2. Install dependencies
```bash
pnpm install
```

### 3. Run in Development Mode
```bash
pnpm run dev
```

### 4. Build Production Bundle
```bash
pnpm run build
```

---

## 📜 License
MIT License. Created as an open-source side project.
