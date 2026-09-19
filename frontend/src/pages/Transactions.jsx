import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { transactionAPI } from '../services/api';
import TransactionCard from '../components/TransactionCard';
import { History, ArrowDownLeft, ArrowUpRight, RotateCcw, Filter, Volume2 } from 'lucide-react';
import { speakText as speakAudio } from '../utils/speechService';

export default function Transactions() {
  const { language, t } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('ALL');

  const loadTransactions = async () => {
    try {
      const res = await transactionAPI.getTransactions(100);
      if (res.data.success) {
        setTransactions(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching transactions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTransactions();
  }, []);

  const filtered = transactions.filter((tx) => {
    if (filterType === 'IN') return tx.type === 'IN';
    if (filterType === 'OUT') return tx.type === 'OUT';
    return true;
  });

  const speakTransactionsSummary = () => {
    if (transactions.length === 0) {
      const emptyMap = {
        'en-IN': 'No transactions recorded yet.',
        'hi-IN': 'अभी तक कोई लेनदेन रिकॉर्ड नहीं हुआ है।',
        'bn-IN': 'এখনও কোনো লেনদেন রেকর্ড করা হয়নি।',
        'mr-IN': 'अद्याप कोणताही व्यवहार नोंदवला गेला नाही.',
        'te-IN': 'ఇంతవరకు ఎలాంటి లావాదేవీలు నమోదు కాలేదు.',
        'ta-IN': 'இதுவரை எந்த பரிவர்த்தனையும் பதிவு செய்யப்படவில்லை.',
        'gu-IN': 'હજુ સુધી કોઈ વ્યવહાર નોંધાયો નથી.',
        'kn-IN': 'ಇನ್ನೂ ಯಾವುದೇ ವಹಿವಾಟು ದಾಖಲಾಗಿಲ್ಲ.',
        'ml-IN': 'ഇതുവരെ ഇടപാടുകളൊന്നും രേഖപ്പെടുത്തിയിട്ടില്ല.',
        'pa-IN': 'ਅਜੇ ਤੱਕ ਕੋਈ ਲੈਣ-ਦੇਣ ਦਰਜ ਨਹੀਂ ਹੋਇਆ।',
        'or-IN': 'ଏ ପର୍ଯ୍ୟନ୍ତ କୌଣସି କାରବାର ରେକର୍ଡ ହୋଇନାହିଁ।'
      };
      speakAudio(emptyMap[language] || emptyMap['en-IN'], language);
      return;
    }
    const inCount = transactions.filter(t => t.type === 'IN').length;
    const outCount = transactions.filter(t => t.type === 'OUT').length;
    const summaryMap = {
      'en-IN': `Total ${transactions.length} transactions recorded. ${inCount} restock entries and ${outCount} sales registered.`,
      'hi-IN': `कुल ${transactions.length} लेनदेन रिकॉर्ड हैं। ${inCount} बार स्टॉक आया, और ${outCount} बिक्री दर्ज हुई हैं।`,
      'bn-IN': `মোট ${transactions.length}টি লেনদেন। ${inCount} বার স্টক এসেছে, এবং ${outCount}টি বিক্রয় হয়েছে।`,
      'mr-IN': `एकूण ${transactions.length} व्यवहार नोंदवले आहेत. ${inCount} वेळा साठा आला, आणि ${outCount} विक्री झाली.`,
      'te-IN': `మొత్తం ${transactions.length} లావాదేవీలు నమోదయ్యాయి. ${inCount} స్టాక్ ఇన్ మరియు ${outCount} అమ్మకాలు జరిగాయి.`,
      'ta-IN': `மொத்தம் ${transactions.length} பரிவர்த்தனைகள். ${inCount} முறை இருப்பு வந்தது, ${outCount} விற்பனை பதிவானது.`,
      'gu-IN': `કુલ ${transactions.length} વ્યવહારો નોંધાયા. ${inCount} વખત સ્ટોક આવ્યો અને ${outCount} વેચાણ થયું.`,
      'kn-IN': `ಒಟ್ಟು ${transactions.length} ವಹಿವಾಟುಗಳು. ${inCount} ಬಾರಿ ಸ್ಟಾಕ್ ಬಂದಿದೆ ಮತ್ತು ${outCount} ಮಾರಾಟವಾಗಿದೆ.`,
      'ml-IN': `ആകെ ${transactions.length} ഇടപാടുകൾ. ${inCount} സ്റ്റോക്ക് വരവും ${outCount} വിൽപ്പനയും രേഖപ്പെടുത്തി.`,
      'pa-IN': `ਕੁੱਲ ${transactions.length} ਲੈਣ-ਦੇਣ ਦਰਜ ਹਨ। ${inCount} ਵਾਰ ਸਟਾਕ ਆਇਆ ਅਤੇ ${outCount} ਵਿਕਰੀ ਹੋਈ।`,
      'or-IN': `ମୋଟ ${transactions.length}ଟି କାରବାର। ${inCount} ଷ୍ଟକ୍ ଆସିଛି ଏବଂ ${outCount} ବିକ୍ରୟ ହୋଇଛି।`
    };
    speakAudio(summaryMap[language] || summaryMap['en-IN'], language);
  };

  return (
    <div className="space-y-6 pb-20 md:pb-10 animate-fade-in max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center justify-between w-full sm:w-auto">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <History className="w-7 h-7 text-orange-500" />
              <span>{t('transactions')}</span>
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              {t('recentTransactions')}
            </p>
          </div>

          <button
            onClick={speakTransactionsSummary}
            className="sm:hidden bg-orange-50 hover:bg-orange-100 text-orange-700 border border-orange-200 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm"
            title="Listen to transaction summary"
          >
            <Volume2 className="w-3.5 h-3.5" />
            <span>{language === 'hi-IN' ? 'सुनें' : 'Listen'}</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={speakTransactionsSummary}
            className="hidden sm:flex bg-orange-50 hover:bg-orange-100 text-orange-700 border border-orange-200 px-3.5 py-2 rounded-2xl text-xs font-bold items-center gap-1.5 shadow-sm transition-all"
            title="Listen to transaction summary"
          >
            <Volume2 className="w-4 h-4" />
            <span>{language === 'hi-IN' ? 'हिसाब सुनें' : 'Listen Summary'}</span>
          </button>

          {/* Filter Pills */}
          <div className="flex items-center gap-1 bg-white border border-slate-200 p-1 rounded-2xl shadow-sm">
            {[
              { id: 'ALL', label: t('allStatus') },
              { id: 'IN',  label: '↓ IN' },
              { id: 'OUT', label: '↑ OUT' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilterType(tab.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  filterType === tab.id
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Transaction List */}
      {loading ? (
        <div className="text-center py-16 text-slate-400 text-sm font-semibold">
          {t('loadingTransactions')}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center shadow-sm">
          <History className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">
            {t('recentTransactions')}
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            {t('firstTxHint')}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((tx) => (
            <TransactionCard
              key={tx.id}
              tx={tx}
              onUndone={loadTransactions}
              language={language}
            />
          ))}
        </div>
      )}
    </div>
  );
}
