import React, { useState, useRef, useEffect } from 'react';
import {
  Camera, X, RefreshCw, Check, Sparkles, Volume2, Mic, Upload, ArrowRight,
  Package, IndianRupee, Layers, ShieldCheck
} from 'lucide-react';
import { productAPI } from '../services/api';
import { speakText as speakAudio, stopSpeaking } from '../utils/speechService';
import { localizeEntity } from '../utils/transliterate';
import { PRESET_PRODUCT_IMAGES } from '../utils/productImages';
import { classifyImageElement } from '../utils/visualClassifier';

const GROCERY_SWITCH_LIST = [
  { id: 'onions', name: 'Red Onions (Pyaaz)', category: 'Vegetables', default_unit: 'bori', unit_size: 50, suggested_price: 35, purchase_price: 26, base_unit: 'kg', min_stock: 30, emoji: '🧅', regional_names: ['pyaaz', 'onions', 'vengayam', 'ullipaya', 'kanda'] },
  { id: 'potatoes', name: 'Fresh Potatoes (Aloo)', category: 'Vegetables', default_unit: 'bori', unit_size: 50, suggested_price: 25, purchase_price: 18, base_unit: 'kg', min_stock: 30, emoji: '🥔', regional_names: ['aloo', 'potatoes', 'urulaikizhangu', 'bangaladumpa'] },
  { id: 'rice', name: 'Basmati Rice', category: 'Grains', default_unit: 'bori', unit_size: 25, suggested_price: 65, purchase_price: 50, base_unit: 'kg', min_stock: 25, emoji: '🌾', regional_names: ['chawal', 'rice', 'biryani chawal', 'arisi'] },
  { id: 'wheat', name: 'Wheat Flour (Atta)', category: 'Grains', default_unit: 'bori', unit_size: 50, suggested_price: 38, purchase_price: 30, base_unit: 'kg', min_stock: 50, emoji: '🍞', regional_names: ['atta', 'gehu', 'wheat', 'chakki atta'] },
  { id: 'oil', name: 'Mustard Cooking Oil', category: 'Oils', default_unit: 'peti', unit_size: 12, suggested_price: 155, purchase_price: 130, base_unit: 'litre', min_stock: 12, emoji: '🛢️', regional_names: ['tel', 'mustard oil', 'sarson tel', 'cooking oil'] },
  { id: 'milk', name: 'Fresh Milk Packets', category: 'Dairy', default_unit: 'packet', unit_size: 0.5, suggested_price: 33, purchase_price: 27, base_unit: 'litre', min_stock: 10, emoji: '🥛', regional_names: ['doodh', 'milk', 'paal', 'haalu'] },
  { id: 'sugar', name: 'Refined Sugar (Chini)', category: 'Essentials', default_unit: 'bori', unit_size: 50, suggested_price: 45, purchase_price: 38, base_unit: 'kg', min_stock: 25, emoji: '🍬', regional_names: ['chini', 'sugar', 'sakkar', 'chakkara'] },
  { id: 'dal', name: 'Toor Dal (Arhar)', category: 'Pulses', default_unit: 'bori', unit_size: 25, suggested_price: 145, purchase_price: 120, base_unit: 'kg', min_stock: 15, emoji: '🥣', regional_names: ['toor dal', 'arhar', 'dal', 'paruppu', 'pappu'] },
  { id: 'eggs', name: 'Farm Fresh Eggs', category: 'Poultry', default_unit: 'dozen', unit_size: 12, suggested_price: 7, purchase_price: 5.5, base_unit: 'piece', min_stock: 24, emoji: '🥚', regional_names: ['ande', 'eggs', 'muttai', 'guddu'] },
  { id: 'tea', name: 'Premium Tea (Chai Patti)', category: 'Beverages', default_unit: 'packet', unit_size: 1, suggested_price: 280, purchase_price: 230, base_unit: 'kg', min_stock: 5, emoji: '🍵', regional_names: ['chai', 'tea', 'chai patti', 'teathool'] }
];

function getCameraAudioPrompt(lang, productName, unitName, unitSize, baseUnit) {
  const map = {
    'en-IN': `I detected ${productName}! Suggested unit is ${unitName} of ${unitSize} ${baseUnit}. What selling price should be taken?`,
    'hi-IN': `मैंने ${productName} पहचाना! सुझाई गई इकाई ${unitSize} ${baseUnit} की ${unitName} है। आप क्या बिक्री मूल्य रखना चाहते हैं?`,
    'te-IN': `నేను ${productName} గుర్తించాను! సూచించిన యూనిట్ ${unitSize} ${baseUnit} ${unitName}. మీరు ఎంత అమ్మకపు ధర నిర్ణయించాలనుకుంటున్నారు?`,
    'ta-IN': `நான் ${productName} கண்டறிந்தேன்! பரிந்துரைக்கப்பட்ட அலகு ${unitSize} ${baseUnit} ${unitName}. என்ன விற்பனை விலை வைக்க விரும்புகிறீர்கள்?`,
    'bn-IN': `আমি ${productName} শনাক্ত করেছি! প্রস্তাবিত একক হলো ${unitSize} ${baseUnit} ${unitName}। আপনি কী বিক্রয় মূল্য রাখতে চান?`,
    'mr-IN': `मी ${productName} ओळखले! सुचवलेले युनिट ${unitSize} ${baseUnit} चे ${unitName} आहे. आपण काय विक्री किंमत ठेवू इच्छिता?`,
    'gu-IN': `મેં ${productName} ઓળખી કાઢ્યું! સૂચવેલ એકમ ${unitSize} ${baseUnit} નું ${unitName} છે. તમે શું વેચાણ કિંમત રાખવા માંગો છો?`,
    'kn-IN': `ನಾನು ${productName} ಗುರುತಿಸಿದ್ದೇನೆ! ಸೂಚಿಸಲಾದ ಘಟಕವು ${unitSize} ${baseUnit} ನ ${unitName} ಆಗಿದೆ. ನೀವು ಯಾವ ಮಾರಾಟದ ಬೆಲೆಯನ್ನು ನಿಗದಿಪಡಿಸಲು ಬಯಸುತ್ತೀರಿ?`,
    'ml-IN': `ഞാൻ ${productName} കണ്ടെത്തി! നിർദ്ദേശിച്ച യൂണിറ്റ് ${unitSize} ${baseUnit} ൻ്റെ ${unitName} ആണ്. എന്ത് വിൽപ്പന വിലയാണ് നിങ്ങൾ നൽകാൻ ആഗ്രഹിക്കുന്നത്?`,
    'pa-IN': `ਮੈਂ ${productName} ਪਛਾਣ ਲਿਆ ਹੈ! ਸੁਝਾਈ ਗਈ ਇਕਾਈ ${unitSize} ${baseUnit} ਦੀ ${unitName} ਹੈ। ਤੁਸੀਂ ਕੀ ਵਿਕਰੀ ਮੁੱਲ ਰੱਖਣਾ ਚਾਹੁੰਦੇ ਹੋ?`,
    'or-IN': `ମୁଁ ${productName} ଚିହ୍ନଟ କରିଛି! ପ୍ରସ୍ତାବିତ ୟୁନିଟ୍ ହେଉଛି ${unitSize} ${baseUnit} ର ${unitName}। ଆପଣ କେତେ ବିକ୍ରୟ ମୂଲ୍ୟ ରଖିବାକୁ ଚାହାଁନ୍ତି?`
  };
  return map[lang] || map['en-IN'];
}

export default function CameraScannerModal({ isOpen, onClose, onProductDetected, language = 'en-IN' }) {
  const [cameraActive, setCameraActive] = useState(false);
  const [detecting, setDetecting] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const [detectionResult, setDetectionResult] = useState(null);
  const [priceInput, setPriceInput] = useState('');
  const [selectedUnit, setSelectedUnit] = useState('bori');
  const [isListeningPrice, setIsListeningPrice] = useState(false);
  const [cameraError, setCameraError] = useState(null);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const mediaStreamRef = useRef(null);
  const fileInputRef = useRef(null);
  const nativeCameraInputRef = useRef(null);

  // Initialize live camera stream with bulletproof fallback across Windows PC, Mac, Android, and iOS
  const startCamera = async (preferredFacing = 'environment') => {
    setCameraError(null);
    let stream = null;

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraError('Camera access not supported on this browser. Click "📸 Take Photo / Upload File" below.');
      return;
    }

    // Attempt 1: Ideal facingMode (rear on phones, or flexible on desktop)
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: preferredFacing },
          width: { ideal: 1280, min: 640 },
          height: { ideal: 720, min: 480 }
        },
        audio: false
      });
    } catch (e1) {
      console.warn('Ideal facing camera attempt failed, trying default webcam constraint:', e1.message);
      // Attempt 2: Simple video: true (Guaranteed to work on Windows webcams, laptops, and external cameras!)
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false
        });
      } catch (e2) {
        console.warn('Simple video attempt failed, checking device list:', e2.message);
        // Attempt 3: Enumerate video devices
        try {
          const devices = await navigator.mediaDevices.enumerateDevices();
          const videoDev = devices.find(d => d.kind === 'videoinput');
          if (videoDev) {
            stream = await navigator.mediaDevices.getUserMedia({
              video: { deviceId: { exact: videoDev.deviceId } },
              audio: false
            });
          } else {
            throw new Error('No webcam found on this device.');
          }
        } catch (e3) {
          console.error('All webcam stream attempts failed:', e3);
          setCameraError('Webcam not active (' + (e3.name || e3.message || 'Permission denied') + '). Click "📸 Take Photo with Camera" below to use your device camera or upload an image.');
          setCameraActive(false);
          return;
        }
      }
    }

    if (stream) {
      mediaStreamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current.play().catch(err => console.warn('Autoplay caught:', err));
        };
      }
      setCameraActive(true);
      setCameraError(null);
    }
  };

  const stopCamera = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }
    setCameraActive(false);
  };

  useEffect(() => {
    if (isOpen) {
      setCapturedImage(null);
      setDetectionResult(null);
      setPriceInput('');
      startCamera();
    } else {
      stopCamera();
      stopSpeaking();
    }
    return () => {
      stopCamera();
      stopSpeaking();
    };
  }, [isOpen]);

  // Capture snapshot from webcam
  const handleCaptureSnapshot = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
    stopCamera();
    setCapturedImage(dataUrl);

    // Run real-time pixel analysis
    const visualFeatures = classifyImageElement(canvas);
    runDetection({ imageBase64: dataUrl, visualFeatures });
  };

  // Upload photo from device
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    stopCamera();
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result;
      setCapturedImage(dataUrl);

      const img = new Image();
      img.onload = () => {
        const visualFeatures = classifyImageElement(img);
        runDetection({ imageBase64: dataUrl, itemHint: file.name, visualFeatures });
      };
      img.onerror = () => {
        runDetection({ imageBase64: dataUrl, itemHint: file.name });
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  };

  // 1-Tap Manual Product Switcher handler
  const handleManualProductSwitch = (productId) => {
    const item = GROCERY_SWITCH_LIST.find(p => p.id === productId);
    if (!item) return;

    setDetectionResult({
      ...item,
      confidence: 1.0,
      source: 'manual_selection',
      image_url: capturedImage || item.image_url
    });
    setSelectedUnit(item.default_unit || 'bori');
    setPriceInput(String(item.suggested_price || 35));

    // 🔊 Voice prompt for switched item
    const promptText = getCameraAudioPrompt(
      language,
      localizeEntity(item.name, language),
      item.default_unit || 'bori',
      item.unit_size || 25,
      item.base_unit || 'kg'
    );
    speakAudio(promptText, language);

    setTimeout(() => {
      startListeningPrice();
    }, 2800);
  };

  // Preset sample photo test
  const handlePresetSelect = (preset) => {
    stopCamera();
    setCapturedImage(preset.url);
    runDetection({ imageUrl: preset.url, itemHint: preset.label });
  };

  // Run AI Detection on image
  const runDetection = async (params) => {
    setDetecting(true);
    try {
      const res = await productAPI.detectImage({ ...params, language });
      if (res.data.success && res.data.data) {
        const item = res.data.data;
        setDetectionResult(item);
        setSelectedUnit(item.default_unit || 'bori');
        setPriceInput(String(item.suggested_price || 60));

        // 🔊 Speak out loud: what it is, unit, and ask for selling price!
        const promptText = getCameraAudioPrompt(
          language,
          localizeEntity(item.name, language),
          item.default_unit || 'bori',
          item.unit_size || 25,
          item.base_unit || 'kg'
        );
        speakAudio(promptText, language);

        // Auto-listen for price after short delay
        setTimeout(() => {
          startListeningPrice();
        }, 3200);
      }
    } catch (err) {
      console.error('Detection error:', err);
    } finally {
      setDetecting(false);
    }
  };

  // 🎙️ Voice listening to capture the price spoken by user
  const startListeningPrice = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.lang = language || 'en-IN';
    recognition.continuous = false;

    recognition.onstart = () => setIsListeningPrice(true);
    recognition.onresult = (e) => {
      const text = e.results[0][0].transcript;
      const numMatch = text.match(/\d+/);
      if (numMatch) {
        setPriceInput(numMatch[0]);
        speakAudio(`Selling price set to ₹${numMatch[0]}.`, language);
      }
    };
    recognition.onerror = () => setIsListeningPrice(false);
    recognition.onend = () => setIsListeningPrice(false);

    recognition.start();
  };

  // Confirm and return detected product to Add Product form
  const handleConfirmProduct = () => {
    if (!detectionResult) return;
    const finalProduct = {
      name: detectionResult.name,
      category: detectionResult.category || 'General',
      default_unit: selectedUnit,
      base_unit: detectionResult.base_unit || 'kg',
      unit_size: detectionResult.unit_size || 1,
      selling_price: parseFloat(priceInput) || detectionResult.suggested_price || 60,
      purchase_price: detectionResult.purchase_price || 0,
      min_stock_threshold: detectionResult.min_stock || 10,
      reorder_quantity: (detectionResult.min_stock || 10) * 2,
      regional_names: (detectionResult.regional_names || []).join(', '),
      image_url: capturedImage || detectionResult.image_url
    };

    onProductDetected(finalProduct);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/70 backdrop-blur-md animate-fade-in">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white p-4 sm:p-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-orange-500/30 border border-orange-400/40 flex items-center justify-center text-orange-300">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm sm:text-base flex items-center gap-1.5">
                <span>AI Camera Grocery Detector</span>
                <span className="text-[10px] bg-orange-500 text-white px-2 py-0.5 rounded-full uppercase font-black tracking-wider">Vision AI</span>
              </h3>
              <p className="text-[11px] text-slate-400">
                Snap or upload a grocery photo — AI will detect product, units & ask price
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 flex-1">
          
          {/* Camera Viewfinder / Photo Preview */}
          <div className="relative w-full h-56 sm:h-64 bg-slate-950 rounded-2xl overflow-hidden border border-slate-200 flex items-center justify-center shadow-inner">
            {capturedImage ? (
              <img
                src={capturedImage}
                alt="Captured"
                className="w-full h-full object-cover object-center animate-fade-in"
              />
            ) : cameraActive ? (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="text-center p-6 text-slate-400 space-y-2">
                <Camera className="w-12 h-12 mx-auto text-slate-600" />
                <p className="text-xs font-semibold">
                  {cameraError || 'Camera inactive. Click Snap or choose a photo below.'}
                </p>
              </div>
            )}

            <canvas ref={canvasRef} className="hidden" />

            {/* AI Detecting Overlay */}
            {detecting && (
              <div className="absolute inset-0 bg-slate-950/75 backdrop-blur-xs flex flex-col items-center justify-center text-white space-y-3 animate-fade-in">
                <RefreshCw className="w-10 h-10 text-orange-400 animate-spin" />
                <p className="text-sm font-black tracking-wide text-orange-200 animate-pulse">
                  🧠 AI Detecting Grocery Item & Trade Units...
                </p>
              </div>
            )}

            {/* Camera Retake Button */}
            {capturedImage && !detecting && (
              <button
                onClick={() => {
                  setCapturedImage(null);
                  setDetectionResult(null);
                  startCamera();
                }}
                className="absolute top-3 right-3 bg-black/60 hover:bg-black/80 backdrop-blur-md text-white text-xs font-bold px-3 py-1.5 rounded-xl border border-white/20 shadow-md flex items-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Retake</span>
              </button>
            )}
          </div>

          {/* Camera & File Controls */}
          {!capturedImage && (
            <div className="space-y-3">
              {cameraError && (
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3 text-xs text-amber-900 flex items-start gap-2 animate-fade-in">
                  <span className="text-base">⚠️</span>
                  <div className="flex-1">
                    <p className="font-bold">{cameraError}</p>
                    <div className="mt-1.5 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => startCamera()}
                        className="bg-amber-600 hover:bg-amber-700 text-white font-bold px-2.5 py-1 rounded-lg text-[10px] flex items-center gap-1 shadow-xs"
                      >
                        <RefreshCw className="w-3 h-3" />
                        <span>Retry Webcam</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => nativeCameraInputRef.current?.click()}
                        className="bg-slate-900 hover:bg-black text-white font-bold px-2.5 py-1 rounded-lg text-[10px] flex items-center gap-1 shadow-xs"
                      >
                        <Camera className="w-3 h-3" />
                        <span>Open Camera App</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {cameraActive && (
                  <button
                    onClick={handleCaptureSnapshot}
                    className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-black py-3 px-3 rounded-2xl shadow-md shadow-orange-500/25 flex items-center justify-center gap-1.5 text-xs transition-all active:scale-95"
                  >
                    <Camera className="w-4 h-4" />
                    <span>Snap Webcam</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => nativeCameraInputRef.current?.click()}
                  className="bg-gradient-to-r from-slate-900 to-slate-800 hover:from-black hover:to-slate-900 text-white font-bold py-3 px-3 rounded-2xl text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all active:scale-95"
                >
                  <Camera className="w-4 h-4 text-orange-400" />
                  <span>Take Live Photo</span>
                </button>

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold py-3 px-3 rounded-2xl text-xs flex items-center justify-center gap-1.5 border border-slate-200 transition-all active:scale-95"
                >
                  <Upload className="w-4 h-4 text-slate-500" />
                  <span>Upload File</span>
                </button>

                {/* Hidden native inputs */}
                <input
                  ref={nativeCameraInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>

              {/* Instant Test Presets */}
              <div>
                <span className="text-[11px] font-bold text-slate-500 block mb-1.5">
                  Or test with 1-click sample kirana products:
                </span>
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                  {PRESET_PRODUCT_IMAGES.slice(0, 7).map((p, idx) => (
                    <button
                      key={idx}
                      onClick={() => handlePresetSelect(p)}
                      className="text-[10px] bg-white hover:bg-orange-50 hover:text-orange-700 border border-slate-200 hover:border-orange-300 text-slate-700 px-2.5 py-1.5 rounded-xl font-extrabold whitespace-nowrap shadow-xs transition-colors"
                    >
                      {p.label.split('/')[0].trim()}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── Detection Result & Voice Prompting Section ── */}
          {detectionResult && (
            <div className="bg-gradient-to-br from-orange-50/80 via-amber-50/50 to-white border border-orange-200/80 rounded-3xl p-4 sm:p-5 space-y-4 shadow-sm animate-slide-up">
              
              {/* Product Match Card */}
              <div className="flex items-start justify-between gap-3">
                <div>
                  <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full mb-1">
                    <Check className="w-3 h-3" />
                    <span>Detected with {Math.round((detectionResult.confidence || 0.95) * 100)}% Match</span>
                  </span>
                  <h4 className="text-lg sm:text-xl font-black text-slate-900">
                    {localizeEntity(detectionResult.name, language)}
                  </h4>
                  <p className="text-xs text-slate-500">
                    Category: <strong className="text-slate-800">{detectionResult.category}</strong>
                  </p>
                  {detectionResult.topCandidates && detectionResult.topCandidates.length > 1 && (
                    <div className="flex items-center gap-1.5 flex-wrap mt-2">
                      <span className="text-[10px] font-bold text-slate-500">Other visual matches:</span>
                      {detectionResult.topCandidates.slice(1).map(c => (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => handleManualProductSwitch(c.id)}
                          className="text-[10px] bg-white hover:bg-orange-50 hover:text-orange-700 text-slate-700 px-2 py-0.5 rounded-lg border border-slate-200 font-bold transition-colors"
                        >
                          {c.name.split('(')[0].trim()} ({c.percentage}%)
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="w-14 h-14 rounded-2xl bg-white border border-slate-200 overflow-hidden flex-shrink-0 shadow-sm">
                  <img
                    src={capturedImage || detectionResult.image_url}
                    alt="Detected"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              {/* ⚡ Quick 1-Tap Item Switcher / Correction Bar */}
              <div className="bg-white/90 rounded-2xl p-2.5 border border-orange-200 shadow-xs">
                <div className="flex items-center justify-between mb-1.5 px-1">
                  <span className="text-[11px] font-extrabold text-slate-700">
                    Not {detectionResult.name.split('(')[0].trim()}? Tap to switch product:
                  </span>
                  <span className="text-[10px] bg-orange-100 text-orange-800 px-2 py-0.5 rounded-md font-black uppercase tracking-wider">
                    1-Tap Fix
                  </span>
                </div>
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                  {GROCERY_SWITCH_LIST.map((prod) => (
                    <button
                      key={prod.id}
                      type="button"
                      onClick={() => handleManualProductSwitch(prod.id)}
                      className={`px-2.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                        detectionResult.id === prod.id
                          ? 'bg-slate-900 text-white shadow-sm scale-105 ring-2 ring-orange-500'
                          : 'bg-slate-100 hover:bg-orange-50 text-slate-700 hover:text-orange-700 border border-slate-200'
                      }`}
                    >
                      <span className="text-sm">{prod.emoji}</span>
                      <span>{prod.name.split('(')[0].trim()}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* 📦 Recommended Units */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  📦 Recommended Trade Unit for this Product:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'bori', label: 'Bori (Bag)', size: detectionResult.unit_size || 25 },
                    { id: 'peti', label: 'Peti (Carton)', size: 12 },
                    { id: 'packet', label: 'Packet', size: 1 },
                    { id: 'dozen', label: 'Dozen (12 pcs)', size: 12 },
                    { id: 'quintal', label: 'Quintal', size: 100 },
                    { id: 'kg', label: 'Kilogram (kg)', size: 1 }
                  ].map((unit) => (
                    <button
                      key={unit.id}
                      type="button"
                      onClick={() => setSelectedUnit(unit.id)}
                      className={`px-2.5 py-2 rounded-xl text-xs font-bold border transition-all text-center ${
                        selectedUnit === unit.id
                          ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <div>{unit.label}</div>
                      <div className="text-[10px] opacity-75 font-normal">{unit.size} {detectionResult.base_unit || 'kg'}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* 💰 Price Inquiry with Voice Input */}
              <div className="pt-2 border-t border-orange-200/60">
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                    <IndianRupee className="w-3.5 h-3.5 text-orange-500" />
                    <span>What Selling Price should be taken?</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      const promptText = getCameraAudioPrompt(
                        language,
                        localizeEntity(detectionResult.name, language),
                        selectedUnit,
                        detectionResult.unit_size || 25,
                        detectionResult.base_unit || 'kg'
                      );
                      speakAudio(promptText, language);
                    }}
                    className="text-[11px] font-bold text-orange-700 bg-orange-100 hover:bg-orange-200 px-2 py-0.5 rounded-lg flex items-center gap-1"
                  >
                    <Volume2 className="w-3 h-3" />
                    <span>Repeat Voice</span>
                  </button>
                </div>

                <div className="relative">
                  <div className="absolute left-3.5 top-2.5 text-base font-black text-slate-400">₹</div>
                  <input
                    type="number"
                    step="any"
                    value={priceInput}
                    onChange={(e) => setPriceInput(e.target.value)}
                    placeholder="Enter selling price per unit..."
                    className="w-full bg-white border-2 border-orange-400 rounded-2xl pl-8 pr-12 py-2.5 text-base font-black text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500 shadow-sm"
                  />
                  <button
                    type="button"
                    onClick={startListeningPrice}
                    className={`absolute right-2.5 top-2 p-1.5 rounded-xl transition-all ${
                      isListeningPrice
                        ? 'bg-rose-500 text-white animate-pulse'
                        : 'text-slate-400 hover:text-orange-500 hover:bg-orange-50'
                    }`}
                    title="Speak price"
                  >
                    <Mic className="w-4 h-4" />
                  </button>
                </div>
                {isListeningPrice && (
                  <p className="text-[10px] text-rose-600 font-bold mt-1 animate-pulse">
                    🎙️ Listening for price... Speak now (e.g. "65 rupees")
                  </p>
                )}
              </div>

              {/* Confirm Button */}
              <button
                onClick={handleConfirmProduct}
                className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-black py-3 rounded-2xl shadow-lg shadow-orange-500/30 flex items-center justify-center gap-2 text-sm transition-all hover:-translate-y-0.5"
              >
                <span>Confirm & Populate Product Form</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
