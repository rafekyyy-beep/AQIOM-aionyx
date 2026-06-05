export interface IslamicQuery {
  type: 'quran' | 'hadith' | 'athkar' | 'prayer' | 'general';
  question: string;
}

export class IslamicAgent {
  async answer(query: IslamicQuery): Promise<string> {
    const { type, question } = query;

    switch (type) {
      case 'quran':
        return this.handleQuran(question);
      case 'athkar':
        return this.handleAthkar(question);
      case 'prayer':
        return this.handlePrayer(question);
      default:
        return this.handleGeneral(question);
    }
  }

  private handleQuran(question: string): string {
    const lower = question.toLowerCase();
    if (lower.includes('الرحمن')) {
      return 'سورة الرحمن: "الرَّحْمَٰنُ * عَلَّمَ الْقُرْآنَ * خَلَقَ الْإِنْسَانَ"';
    }
    if (lower.includes('الكرسي')) {
      return 'آية الكرسي (البقرة 255): "اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ..."';
    }
    return 'أبحث في القرآن عن: ' + question;
  }

  private handleAthkar(question: string): string {
    const lower = question.toLowerCase();
    if (lower.includes('صباح') || lower.includes('مساء')) {
      return 'أذكار الصباح والمساء:\n"اللهم بك أمسينا وبك أصبحنا وبك نحيا وبك نموت وإليك المصير"';
    }
    if (lower.includes('نوم')) {
      return 'دعاء النوم:\n"باسمك اللهم أموت وأحيا"';
    }
    return 'الدعاء المطلوب: ' + question;
  }

  private handlePrayer(question: string): string {
    return `مواقيت الصلاة تعتمد على موقعك. يمكنني مساعدتك في معرفة أوقات الصلاة إذا أرسلت مدينتك. سؤالك: ${question}`;
  }

  private handleGeneral(question: string): string {
    return `مرحباً! أنا المساعد الإسلامي لـ AQIOM. كيف يمكنني مساعدتك في الأمور الإسلامية؟ سؤالك: ${question}`;
  }
}
