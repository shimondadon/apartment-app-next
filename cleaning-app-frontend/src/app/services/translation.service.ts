import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Language } from '../models/types';

interface Translations {
  [key: string]: {
    he: string;
    en: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class TranslationService {
  private translations: Translations = {
    appTitle: {
      he: '🏠 אפליקציית ניקיון מקצועית',
      en: '🏠 Professional Cleaning App'
    },
    appSubtitle: {
      he: 'מערכת ניהול חכמה',
      en: 'Smart Management System'
    },
    fullName: {
      he: '👤 שם מלא',
      en: '👤 Full Name'
    },
    loginCode: {
      he: '🔑 קוד כניסה',
      en: '🔑 Login Code'
    },
    login: {
      he: 'כניסה למערכת ✓',
      en: 'Login to System ✓'
    },
    home: {
      he: '🏠 בית',
      en: '🏠 Home'
    },
    work: {
      he: 'עבודה',
      en: 'Work'
    },
    inventory: {
      he: 'מלאי',
      en: 'Inventory'
    },
    issues: {
      he: 'תקלות',
      en: 'Issues'
    },
    summary: {
      he: 'סיכום',
      en: 'Summary'
    },
    selectApartment: {
      he: '🏡 בחרי דירה',
      en: '🏡 Select Apartment'
    },
    startWork: {
      he: 'התחל עבודה',
      en: 'Start Work'
    },
    endWork: {
      he: 'סיים עבודה',
      en: 'End Work'
    },
    notStartedWork: {
      he: 'טרם התחלתי לעבוד',
      en: 'Not Started Working'
    },
    working: {
      he: 'עובדת כעת',
      en: 'Currently Working'
    },
    completed: {
      he: 'הושלם',
      en: 'Completed'
    }
  };

  private languages: Language[] = [
    { code: 'he', name: 'עברית', direction: 'rtl' },
    { code: 'en', name: 'English', direction: 'ltr' }
  ];

  private currentLanguageSubject = new BehaviorSubject<Language>(this.languages[0]);
  public currentLanguage$ = this.currentLanguageSubject.asObservable();

  constructor() {
    const savedLang = localStorage.getItem('app_language');
    if (savedLang) {
      const lang = this.languages.find(l => l.code === savedLang);
      if (lang) {
        this.currentLanguageSubject.next(lang);
        this.applyDirection(lang.direction);
      }
    }
  }

  getCurrentLanguage(): Language {
    return this.currentLanguageSubject.value;
  }

  toggleLanguage(): void {
    const current = this.currentLanguageSubject.value;
    const newLang = current.code === 'he' ? this.languages[1] : this.languages[0];
    this.setLanguage(newLang);
  }

  setLanguage(language: Language): void {
    this.currentLanguageSubject.next(language);
    localStorage.setItem('app_language', language.code);
    this.applyDirection(language.direction);
  }

  translate(key: string): string {
    const lang = this.currentLanguageSubject.value.code;
    return this.translations[key]?.[lang] || key;
  }

  private applyDirection(direction: 'rtl' | 'ltr'): void {
    document.documentElement.setAttribute('dir', direction);
    document.documentElement.setAttribute('lang', direction === 'rtl' ? 'he' : 'en');
  }
}
