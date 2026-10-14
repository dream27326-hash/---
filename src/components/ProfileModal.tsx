import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { X, User, Phone, IdCard, Building2, Mail, Shield, Check } from 'lucide-react';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose }) => {
  const { currentUser, profile, isAdmin, updateProfile } = useAuth();

  const [displayName, setDisplayName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [studentOrStaffId, setStudentOrStaffId] = useState('');
  const [department, setDepartment] = useState('');
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.displayName || currentUser?.displayName || '');
      setPhoneNumber(profile.phoneNumber || '');
      setStudentOrStaffId(profile.studentOrStaffId || '');
      setDepartment(profile.department || 'ภาควิชาเทคโนโลยีการศึกษา');
    }
  }, [profile, currentUser]);

  if (!isOpen || !currentUser) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErrorMsg('');
    try {
      await updateProfile({
        displayName: displayName.trim(),
        phoneNumber: phoneNumber.trim(),
        studentOrStaffId: studentOrStaffId.trim(),
        department: department.trim(),
      });
      setSuccessMsg(true);
      setTimeout(() => {
        setSuccessMsg(false);
        onClose();
      }, 1000);
    } catch (err) {
      console.error(err);
      setErrorMsg('เกิดข้อผิดพลาดในการบันทึกข้อมูล กรุณาลองใหม่อีกครั้ง');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden border border-slate-100">
        {/* Modal Header in Turquoise */}
        <div className="bg-gradient-to-r from-teal-700 via-teal-600 to-cyan-600 px-6 py-4 flex items-center justify-between text-white">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/10 rounded-xl">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg leading-snug">ข้อมูลโปรไฟล์ผู้ใช้งาน</h3>
              <p className="text-xs text-teal-100">จัดการข้อมูลติดต่อสำหรับใช้ยืนยันการยืมอุปกรณ์</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Avatar and Role */}
          <div className="flex items-center gap-4 p-3 bg-teal-50/70 rounded-xl border border-teal-100">
            {currentUser.photoURL ? (
              <img
                src={currentUser.photoURL}
                alt={displayName}
                className="w-14 h-14 rounded-full ring-2 ring-teal-300 object-cover"
              />
            ) : (
              <div className="w-14 h-14 rounded-full bg-teal-600 text-white flex items-center justify-center font-bold text-xl">
                {displayName[0] || 'U'}
              </div>
            )}
            <div className="flex-1">
              <div className="text-sm font-bold text-slate-800">{displayName || 'ผู้ใช้งาน'}</div>
              <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                {currentUser.email}
              </div>
              <div className="mt-1 inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-semibold bg-white text-teal-800 border border-teal-200">
                <Shield className="w-3 h-3 text-teal-600" />
                {isAdmin ? 'ผู้ดูแลระบบ (Admin)' : 'ผู้ใช้ทั่วไป (นักศึกษา/อาจารย์)'}
              </div>
            </div>
          </div>

          {/* Form fields */}
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-teal-600" />
                ชื่อ-นามสกุล
              </label>
              <input
                type="text"
                required
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                placeholder="ระบุชื่อ-นามสกุลจริง"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                <IdCard className="w-3.5 h-3.5 text-teal-600" />
                รหัสนักศึกษา / รหัสประจำตัวบุคลากร
              </label>
              <input
                type="text"
                value={studentOrStaffId}
                onChange={(e) => setStudentOrStaffId(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                placeholder="เช่น 6401012345 หรือ EMP-092"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-teal-600" />
                เบอร์โทรศัพท์ติดต่อ (จำเป็นสำหรับการติดต่อรับ-คืนอุปกรณ์)
              </label>
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                placeholder="เช่น 081-234-5678"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-teal-600" />
                สังกัด / สาขาวิชา / คณะ
              </label>
              <input
                type="text"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                placeholder="เช่น ภาควิชาเทคโนโลยีการศึกษา คณะศึกษาศาสตร์"
              />
            </div>
          </div>

          {errorMsg && (
            <div className="p-3 bg-rose-50 text-rose-700 rounded-xl text-xs border border-rose-200">
              {errorMsg}
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-emerald-50 text-emerald-700 rounded-xl text-xs border border-emerald-200 flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600" />
              บันทึกข้อมูลเรียบร้อยแล้ว
            </div>
          )}

          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors"
            >
              ปิดหน้าต่าง
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 rounded-xl text-sm font-semibold text-white bg-teal-600 hover:bg-teal-700 shadow-md shadow-teal-600/20 disabled:opacity-50 transition-all flex items-center gap-2"
            >
              {saving ? 'กำลังบันทึก...' : 'บันทึกข้อมูล'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
