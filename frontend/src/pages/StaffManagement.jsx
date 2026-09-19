import React, { useState, useEffect } from 'react';
import { shopAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  Users,
  UserPlus,
  Trash2,
  Phone,
  CheckCircle2,
  AlertCircle,
  Info,
  Volume2
} from 'lucide-react';
import { speakText as speakAudio } from '../utils/speechService';
import { localizeEntity } from '../utils/transliterate';

export default function StaffManagement() {
  const { user, language, t } = useAuth();
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newStaff, setNewStaff] = useState({
    name: '',
    phone: '',
    preferred_language: 'en-IN'
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  const [confirmRemoveId, setConfirmRemoveId] = useState(null);

  const loadStaff = async () => {
    try {
      const res = await shopAPI.getStaff();
      if (res.data.success) {
        setStaffList(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load staff:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStaff();
  }, []);

  useEffect(() => {
    if (successMsg) {
      const timer = setTimeout(() => setSuccessMsg(null), 3500);
      return () => clearTimeout(timer);
    }
  }, [successMsg]);

  const handleAddStaff = async (e) => {
    e.preventDefault();
    if (!newStaff.name.trim() || !newStaff.phone.trim()) return;

    setSubmitting(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const res = await shopAPI.addStaff(newStaff);
      if (res.data.success) {
        setSuccessMsg(res.data.message);
        const addedName = newStaff.name;
        const msg = language === 'hi-IN'
          ? `स्टाफ सदस्य ${addedName} सफलतापूर्वक जोड़ा गया।`
          : `Staff member ${addedName} added successfully.`;
        speakAudio(msg, language);
        setNewStaff({ name: '', phone: '', preferred_language: 'en-IN' });
        setIsAddModalOpen(false);
        loadStaff();
      }
    } catch (err) {
      const errTxt = err.response?.data?.error || 'Failed to add staff member.';
      setError(errTxt);
      speakAudio(errTxt, language);
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemoveStaff = async (staffId, staffName) => {
    if (confirmRemoveId !== staffId) {
      setConfirmRemoveId(staffId);
      return;
    }

    try {
      const res = await shopAPI.removeStaff(staffId);
      if (res.data.success) {
        setStaffList(prev => prev.filter(s => s.id !== staffId));
        setConfirmRemoveId(null);
        const msg = language === 'hi-IN'
          ? `स्टाफ सदस्य ${staffName} को हटा दिया गया।`
          : `Staff member ${staffName} removed.`;
        speakAudio(msg, language);
      }
    } catch (err) {
      setError('Error removing staff member.');
      setConfirmRemoveId(null);
    }
  };

  return (
    <div className="space-y-6 pb-20 md:pb-10 animate-fade-in max-w-4xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Users className="w-7 h-7 text-orange-500" />
            <span>{t('staffManagement')}</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            {t('staffSubtitle')}
          </p>
        </div>

        <button
          onClick={() => {
            setError(null);
            setIsAddModalOpen(true);
          }}
          className="flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-extrabold px-4 py-2.5 rounded-2xl text-xs sm:text-sm shadow-md transition-all hover:-translate-y-0.5"
        >
          <UserPlus className="w-4 h-4 text-orange-400" />
          <span>{t('addStaffBtn')}</span>
        </button>
      </div>

      {/* Success Notification */}
      {successMsg && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-start gap-2.5 text-xs font-bold text-emerald-800 animate-slide-up">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <div>{successMsg}</div>
        </div>
      )}

      {/* Staff Permission Overview Card */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/80 rounded-2xl p-4 text-xs text-blue-900 flex items-start gap-3 shadow-sm">
        <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <div>
          <span className="font-extrabold">{t('staffPermissionTitle')}</span>
          <p className="text-[11px] text-blue-800/90 mt-0.5 leading-relaxed">
            {t('staffPermissionDesc')}
          </p>
        </div>
      </div>

      {/* Staff List */}
      <div className="space-y-3">
        {loading ? (
          <div className="text-center py-16 text-slate-400 text-sm font-semibold">
            Loading staff members...
          </div>
        ) : staffList.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center shadow-sm">
            <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800">
              {t('noStaffYet')}
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              {t('noStaffSub')}
            </p>
          </div>
        ) : (
          staffList.map((staff) => (
            <div
              key={staff.id}
              className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm hover:shadow transition-all flex items-center justify-between gap-4"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center font-black text-sm">
                  {staff.name.charAt(0).toUpperCase()}
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-extrabold text-slate-900 text-sm">
                      {localizeEntity(staff.name, language)}
                    </h4>
                    <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                      Staff
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span className="font-semibold">+91 {staff.phone}</span>
                    <span>•</span>
                    <span className="text-[11px] text-slate-400">
                      Joined {new Date(staff.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>

              {confirmRemoveId === staff.id ? (
                <div className="flex items-center gap-1.5 animate-fade-in">
                  <button
                    onClick={() => handleRemoveStaff(staff.id, staff.name)}
                    className="px-2.5 py-1 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold shadow-sm"
                  >
                    Confirm?
                  </button>
                  <button
                    onClick={() => setConfirmRemoveId(null)}
                    className="text-xs text-slate-400 hover:text-slate-600 p-1 font-semibold"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => handleRemoveStaff(staff.id, staff.name)}
                  className="text-slate-400 hover:text-rose-600 p-2 rounded-xl hover:bg-rose-50 transition-colors"
                  title="Remove staff access"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          ))
        )}
      </div>

      {/* Add Staff Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
              <h3 className="font-extrabold text-base flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-orange-400" />
                <span>{t('addStaffBtn')}</span>
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            {error && (
              <div className="m-4 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold p-3 rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleAddStaff} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {t('staffName')} *
                </label>
                <input
                  type="text"
                  required
                  value={newStaff.name}
                  onChange={(e) => setNewStaff({ ...newStaff, name: e.target.value })}
                  placeholder="e.g. Suresh Kumar, Manoj"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500 font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {t('staffPhone')} *
                </label>
                <input
                  type="tel"
                  maxLength="10"
                  required
                  value={newStaff.phone}
                  onChange={(e) => setNewStaff({ ...newStaff, phone: e.target.value.replace(/\D/g, '') })}
                  placeholder="9811122233"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500 font-semibold"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  Staff member will use this number to login with OTP.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {t('staffVoiceLang')}
                </label>
                <select
                  value={newStaff.preferred_language}
                  onChange={(e) => setNewStaff({ ...newStaff, preferred_language: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500 font-semibold"
                >
                  <option value="en-IN">English / Hinglish</option>
                  <option value="hi-IN">हिन्दी (Hindi)</option>
                  <option value="mr-IN">मराठी (Marathi)</option>
                  <option value="bn-IN">বাংলা (Bengali)</option>
                  <option value="te-IN">తెలుగు (Telugu)</option>
                  <option value="ta-IN">தமிழ் (Tamil)</option>
                  <option value="gu-IN">ગુજરાતી (Gujarati)</option>
                </select>
              </div>

              <div className="pt-4 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-5 py-2 rounded-xl text-xs shadow-md shadow-orange-500/25"
                >
                  {submitting ? '...' : t('saveStaffBtn')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
