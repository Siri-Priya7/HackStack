import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { inventoryAPI } from '../services/api';
import AlertCard from '../components/AlertCard';
import {
  AlertTriangle,
  ShoppingCart,
  CheckCircle,
  Package,
  TrendingDown,
  FileSpreadsheet,
  Volume2
} from 'lucide-react';
import { speakText as speakAudio } from '../utils/speechService';

export default function Alerts() {
  const { language, t } = useAuth();
  const [alerts, setAlerts] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadAlerts = async () => {
    try {
      const res = await inventoryAPI.getAlerts();
      if (res.data.success) {
        setAlerts(res.data.data.alerts || []);
        setSuggestions(res.data.data.suggestions || []);
      }
    } catch (err) {
      console.error('Error fetching alerts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAlerts();
  }, []);

  const totalEstimatedCost = suggestions.reduce((acc, s) => acc + (s.estimatedCost || 0), 0);

  const speakAlertsSummary = () => {
    if (alerts.length === 0) {
      const allStockedMap = {
        'en-IN': 'All products are sufficiently stocked. No urgent alerts.',
        'hi-IN': 'सभी सामान पर्याप्त मात्रा में उपलब्ध हैं। कोई अलर्ट नहीं।',
        'bn-IN': 'সব পণ্য পর্যাপ্ত পরিমাণে মজুদ আছে। কোনো জরুরি সতর্কতা নেই।',
        'mr-IN': 'सर्व उत्पादने पुरेशा प्रमाणात उपलब्ध आहेत. कोणताही तातडीचा अलर्ट नाही.',
        'te-IN': 'అన్ని ఉత్పత్తులు తగినంత నిల్వ ఉన్నాయి. అత్యవసర హెచ్చరికలు లేవు.',
        'ta-IN': 'அனைத்து பொருட்களும் போதுமான அளவில் உள்ளன. அவசர எச்சரிக்கைகள் இல்லை.',
        'gu-IN': 'બધા ઉત્પાદનો પર્યાપ્ત માત્રામાં ઉપલબ્ધ છે. કોઈ તાકીદની ચેતવણી નથી.',
        'kn-IN': 'ಎಲ್ಲಾ ಉತ್ಪನ್ನಗಳು ಸಾಕಷ್ಟು ಪ್ರಮಾಣದಲ್ಲಿವೆ. ಯಾವುದೇ ತುರ್ತು ಎಚ್ಚರಿಕೆ ಇಲ್ಲ.',
        'ml-IN': 'എല്ലാ ഉൽപ്പന്നങ്ങളും ആവശ്യത്തിന് സ്റ്റോക്കുണ്ട്. അടിയന്തിര മുന്നറിയിപ്പുകൾ ഒന്നുമില്ല.',
        'pa-IN': 'ਸਾਰੇ ਉਤਪਾਦ ਲੋੜੀਂਦੀ ਮਾਤਰਾ ਵਿੱਚ ਉਪਲਬਧ ਹਨ। ਕੋਈ ਜ਼ਰੂਰੀ ਅਲਰਟ ਨਹੀਂ।',
        'or-IN': 'ସମସ୍ତ ଉତ୍ପାଦ ପର୍ଯ୍ୟାପ୍ତ ପରିମାଣରେ ଉପଲବ୍ଧ ଅଛି। କୌଣସି ଜରୁରୀ ସତର୍କତା ନାହିଁ।'
      };
      speakAudio(allStockedMap[language] || allStockedMap['en-IN'], language);
      return;
    }
    const count = alerts.length;
    const alertSpeechMap = {
      'en-IN': `Attention! ${count} items have low or out of stock levels. Total estimated reorder cost is rupees ${totalEstimatedCost}.`,
      'hi-IN': `ध्यान दें! ${count} उत्पादों का स्टॉक कम या समाप्त हो रहा है। अनुमानित लागत ₹${totalEstimatedCost} है।`,
      'bn-IN': `মনোযোগ দিন! ${count}টি পণ্যের স্টক কম বা শেষ। আনুমানিক খরচ ₹${totalEstimatedCost}।`,
      'mr-IN': `लक्ष द्या! ${count} उत्पादनांचा साठा कमी किंवा संपत आला आहे. अंदाजित खर्च ₹${totalEstimatedCost} आहे.`,
      'te-IN': `గమనించండి! ${count} ఉత్పత్తుల నిల్వ తగ్గింది లేదా పూర్తయింది. అంచనా వ్యయం ₹${totalEstimatedCost}.`,
      'ta-IN': `கவனிக்கவும்! ${count} பொருட்களின் இருப்பு குறைந்துள்ளது அல்லது முடிவடைந்துள்ளது. தோராய செலவு ₹${totalEstimatedCost}.`,
      'gu-IN': `ધ્યાન આપો! ${count} ઉત્પાદનોનો સ્ટોક ઓછો છે અથવા સમાપ્ત થયો છે. અંદાજિત ખર્ચ ₹${totalEstimatedCost} છે.`,
      'kn-IN': `ಗಮನಿಸಿ! ${count} ಉತ್ಪನ್ನಗಳ ಸ್ಟಾಕ್ ಕಡಿಮೆಯಾಗಿದೆ ಅಥವಾ ಮುಗಿದಿದೆ. ಅಂದಾಜು ವೆಚ್ಚ ₹${totalEstimatedCost}.`,
      'ml-IN': `ശ്രദ്ധിക്കുക! ${count} ഉൽപ്പന്നങ്ങളുടെ സ്റ്റോക്ക് കുറവാണ് അല്ലെങ്കിൽ തീർന്നു. കണക്കാക്കിയ ചിലവ് ₹${totalEstimatedCost}.`,
      'pa-IN': `ਧਿਆਨ ਦਿਓ! ${count} ਉਤਪਾਦਾਂ ਦਾ ਸਟਾਕ ਘੱਟ ਹੈ ਜਾਂ ਖਤਮ ਹੋ ਗਿਆ ਹੈ। ਅਨੁਮਾਨਿਤ ਲਾਗਤ ₹${totalEstimatedCost} ਹੈ।`,
      'or-IN': `ଧ୍ୟାନ ଦିଅନ୍ତୁ! ${count} ଉତ୍ପାଦର ଷ୍ଟକ୍ କମ ଅଛି କିମ୍ବା ଶେଷ ହୋଇଛି। ଆନୁମାନିକ ଖର୍ଚ୍ଚ ₹${totalEstimatedCost}।`
    };
    speakAudio(alertSpeechMap[language] || alertSpeechMap['en-IN'], language);
  };

  return (
    <div className="space-y-6 pb-20 md:pb-10 animate-fade-in max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <AlertTriangle className="w-7 h-7 text-rose-500" />
            <span>{t('alerts')}</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            {t('urgentAlerts')}
          </p>
        </div>

        <button
          onClick={speakAlertsSummary}
          className="bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 px-3.5 py-2 rounded-2xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm"
          title="Listen to alerts summary"
        >
          <Volume2 className="w-4 h-4" />
          <span>{language === 'hi-IN' ? 'अलर्ट सुनें' : (language === 'te-IN' ? 'వినండి' : (language === 'ta-IN' ? 'கேளுங்கள்' : (language === 'bn-IN' ? 'শুনুন' : 'Listen Alerts')))}</span>
        </button>
      </div>

      {/* Procurement Summary Banner */}
      {suggestions.length > 0 && (
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-3xl p-6 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold text-orange-400 uppercase tracking-wider">
              {t('wholesaleEstimate')}
            </span>
            <h3 className="text-xl sm:text-2xl font-black mt-1">
              {suggestions.length} {t('suggestedReorder')}
            </h3>
            <p className="text-xs text-slate-300 mt-1">
              {t('estimatedCost')}: ₹{totalEstimatedCost.toLocaleString('en-IN')}
            </p>
          </div>

          <div className="text-right">
            <span className="bg-orange-500 text-white font-extrabold text-xs px-4 py-2 rounded-xl inline-flex items-center gap-1.5 shadow-md shadow-orange-500/30">
              <ShoppingCart className="w-4 h-4" />
              <span>{suggestions.length} {t('productsCount')}</span>
            </span>
          </div>
        </div>
      )}

      {/* Active Alerts List */}
      <div className="space-y-4">
        <h2 className="text-base font-extrabold text-slate-900">
          {t('urgentAlerts')}
        </h2>

        {loading ? (
          <div className="text-center py-12 text-slate-400 text-sm font-semibold">
            {t('checkingStockLevels')}
          </div>
        ) : alerts.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center shadow-sm">
            <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800">
              {t('inStock')} ✓
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              {t('noAlertsMsg')}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {alerts.map((alert, idx) => (
              <AlertCard
                key={idx}
                alert={alert}
                onResolved={loadAlerts}
                language={language}
              />
            ))}
          </div>
        )}
      </div>

      {/* Suggested Reorder Breakdown Table */}
      {suggestions.length > 0 && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
          <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-orange-500" />
            <span>{t('suggestedReorder')}</span>
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase border-b border-slate-200">
                <tr>
                  <th className="py-3 px-3">Product</th>
                  <th className="py-3 px-3">Remaining</th>
                  <th className="py-3 px-3">{t('suggestedReorder')}</th>
                  <th className="py-3 px-3">{t('estimatedCost')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {suggestions.map((s, idx) => (
                  <tr key={idx} className="hover:bg-slate-50">
                    <td className="py-3 px-3 font-extrabold text-slate-900">
                      {s.productName}
                    </td>
                    <td className="py-3 px-3 text-rose-600 font-semibold">
                      {s.currentStockDisplay}
                    </td>
                    <td className="py-3 px-3 font-bold text-orange-700">
                      {s.suggestionText}
                    </td>
                    <td className="py-3 px-3 font-semibold text-slate-700">
                      ₹{s.estimatedCost}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
