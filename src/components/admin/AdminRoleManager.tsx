import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  ShieldCheck,
  UserPlus,
  Trash2,
  Mail,
  Crown,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';

export const AdminRoleManager: React.FC = () => {
  const { adminEmails, addAdmin, removeAdmin, currentUser } = useAuth();
  const [newEmail, setNewEmail] = useState('');
  const [adding, setAdding] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    const emailToSet = newEmail.trim().toLowerCase();
    if (!emailToSet) return;

    if (!emailToSet.includes('@') || !emailToSet.includes('.')) {
      setErrorMsg('รูปแบบอีเมลไม่ถูกต้อง');
      return;
    }

    if (adminEmails.includes(emailToSet)) {
      setErrorMsg('อีเมลนี้เป็นผู้ดูแลระบบอยู่แล้ว');
      return;
    }

    setAdding(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      await addAdmin(emailToSet);
      setSuccessMsg(`เพิ่มสิทธิ์ผู้ดูแลระบบให้ ${emailToSet} เรียบร้อยแล้ว`);
      setNewEmail('');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      console.error(err);
      setErrorMsg('เกิดข้อผิดพลาดในการเพิ่มผู้ดูแลระบบ');
    } finally {
      setAdding(false);
    }
  };

  const handleRemove = async (email: string) => {
    if (!window.confirm(`คุณแน่ใจหรือไม่ว่าต้องการถอนสิทธิ์ผู้ดูแลระบบของ ${email}?`)) {
      return;
    }
    setErrorMsg('');
    try {
      await removeAdmin(email);
      setSuccessMsg(`ถอนสิทธิ์ผู้ดูแลระบบของ ${email} เรียบร้อยแล้ว`);
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err: any) {
      setErrorMsg(err.message || 'เกิดข้อผิดพลาดในการถอนสิทธิ์');
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-6 space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <div>
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-teal-600" />
            การจัดการสิทธิ์ผู้ดูแลระบบ (Admin Role Management)
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            กำหนดสิทธิ์การเข้าถึงระบบจัดการอุปกรณ์ คำขอยืม-คืน และสถิติภาพรวม
          </p>
        </div>
      </div>

      {/* Add Admin Form */}
      <form onSubmit={handleAddAdmin} className="space-y-3">
        <label className="block text-xs font-semibold text-slate-700">
          เพิ่มอีเมลผู้ดูแลระบบใหม่ (Google Account)
        </label>
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="email"
              required
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              placeholder="กรอกอีเมล Gmail เช่น staff.edtech@gmail.com"
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-teal-500"
            />
          </div>
          <button
            type="submit"
            disabled={adding || !newEmail.trim()}
            className="inline-flex items-center justify-center gap-1.5 px-5 py-2 rounded-xl text-sm font-semibold text-white bg-teal-600 hover:bg-teal-700 shadow-sm disabled:opacity-50 transition-all shrink-0"
          >
            <UserPlus className="w-4 h-4" />
            <span>{adding ? 'กำลังเพิ่ม...' : 'เพิ่มผู้ดูแลระบบ'}</span>
          </button>
        </div>
      </form>

      {errorMsg && (
        <div className="p-3 bg-rose-50 text-rose-700 rounded-xl text-xs border border-rose-200 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-3 bg-emerald-50 text-emerald-700 rounded-xl text-xs border border-emerald-200 flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Admins List */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
          รายชื่อผู้ดูแลระบบปัจจุบัน ({adminEmails.length} บัญชี)
        </h4>

        <div className="divide-y divide-slate-100 border border-slate-100 rounded-xl overflow-hidden bg-slate-50/50">
          {adminEmails.map((email) => {
            const isOwner = email === 'dream27326@gmail.com';
            const isCurrentUser = currentUser?.email?.toLowerCase() === email;

            return (
              <div
                key={email}
                className="p-3.5 flex items-center justify-between hover:bg-white transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center ${
                      isOwner ? 'bg-amber-100 text-amber-700' : 'bg-teal-100 text-teal-700'
                    }`}
                  >
                    {isOwner ? <Crown className="w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                      <span>{email}</span>
                      {isCurrentUser && (
                        <span className="text-[10px] font-bold px-2 py-0.2 rounded-full bg-teal-100 text-teal-800">
                          (คุณ)
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-500">
                      {isOwner ? 'ผู้ดูแลระบบหลักเริ่มต้น (Primary Owner)' : 'ผู้ดูแลระบบร่วม (Admin)'}
                    </div>
                  </div>
                </div>

                {!isOwner && (
                  <button
                    onClick={() => handleRemove(email)}
                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                    title="ถอนสิทธิ์ผู้ดูแลระบบ"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
