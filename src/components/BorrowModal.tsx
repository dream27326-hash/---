import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { Equipment } from '../types';
import { useAuth } from '../context/AuthContext';
import { createBookingRequest } from '../services/bookingService';
import {
  X,
  Calendar,
  Layers,
  FileText,
  Phone,
  IdCard,
  Building2,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  LogIn,
} from 'lucide-react';

interface BorrowModalProps {
  equipment: Equipment | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const BorrowModal: React.FC<BorrowModalProps> = ({
  equipment,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { currentUser, profile, updateProfile, signInWithGoogle } = useAuth();

  const today = new Date().toISOString().split('T')[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];

  const [quantity, setQuantity] = useState(1);
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(tomorrow);
  const [purpose, setPurpose] = useState('');

  // Contact details
  const [phone, setPhone] = useState(profile?.phoneNumber || '');
  const [studentId, setStudentId] = useState(profile?.studentOrStaffId || '');
  const [department, setDepartment] = useState(profile?.department || 'ภาควิชาเทคโนโลยีการศึกษา');

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [createdBookingCode, setCreatedBookingCode] = useState<string | null>(null);

  React.useEffect(() => {
    if (profile) {
      if (profile.phoneNumber) setPhone(profile.phoneNumber);
      if (profile.studentOrStaffId) setStudentId(profile.studentOrStaffId);
      if (profile.department) setDepartment(profile.department);
    }
  }, [profile]);

  React.useEffect(() => {
    if (equipment) {
      setQuantity(1);
      setErrorMsg('');
      setCreatedBookingCode(null);
    }
  }, [equipment]);

  if (!isOpen || !equipment) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    if (quantity < 1 || quantity > equipment.availableQuantity) {
      setErrorMsg(`กรุณาระบุจำนวนระหว่าง 1 ถึง ${equipment.availableQuantity} ชิ้น`);
      return;
    }

    if (!startDate || !endDate) {
      setErrorMsg('กรุณาเลือกวันที่ต้องการยืมและวันที่กำหนดคืน');
      return;
    }

    if (new Date(endDate) < new Date(startDate)) {
      setErrorMsg('วันที่กำหนดคืนต้องไม่ก่อนกว่าวันที่เริ่มยืม');
      return;
    }

    if (!purpose.trim()) {
      setErrorMsg('กรุณาระบุวัตถุประสงค์ในการยืมใช้งาน');
      return;
    }

    if (!phone.trim()) {
      setErrorMsg('กรุณากรอกเบอร์โทรศัพท์สำหรับติดต่อ');
      return;
    }

    setSubmitting(true);
    setErrorMsg('');

    try {
      if (
        phone !== profile?.phoneNumber ||
        studentId !== profile?.studentOrStaffId ||
        department !== profile?.department
      ) {
        await updateProfile({
          phoneNumber: phone.trim(),
          studentOrStaffId: studentId.trim(),
          department: department.trim(),
        });
      }

      const bookingId = await createBookingRequest({
        userId: currentUser.uid,
        userName: profile?.displayName || currentUser.displayName || 'ผู้ขอยืม',
        userEmail: currentUser.email || '',
        userPhone: phone.trim(),
        userStudentId: studentId.trim(),
        equipmentId: equipment.id,
        equipmentName: equipment.name,
        equipmentCode: equipment.code,
        quantity: Number(quantity),
        startDate,
        endDate,
        purpose: purpose.trim(),
      });

      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
      });

      setCreatedBookingCode(bookingId);
      setTimeout(() => {
        onSuccess();
      }, 1500);
    } catch (err) {
      console.error(err);
      setErrorMsg('เกิดข้อผิดพลาดในการส่งคำขอ กรุณาลองใหม่อีกครั้ง');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl overflow-hidden border border-slate-100 my-8">
        {/* Header in Turquoise */}
        <div className="bg-gradient-to-r from-teal-700 via-teal-600 to-cyan-600 px-6 py-4 flex items-center justify-between text-white">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/10 rounded-xl">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg leading-snug">แบบฟอร์มส่งคำขอยืมอุปกรณ์</h3>
              <p className="text-xs text-teal-100">ภาควิชาเทคโนโลยีการศึกษา</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Not Logged In Prompt */}
        {!currentUser ? (
          <div className="p-8 text-center space-y-4">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center">
              <LogIn className="w-8 h-8" />
            </div>
            <div>
              <h4 className="font-bold text-slate-800 text-lg">เข้าสู่ระบบเพื่อขอยืมอุปกรณ์</h4>
              <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto">
                กรุณาเข้าสู่ระบบด้วย Google Account ของสถาบันเพื่อส่งคำขอยืมอุปกรณ์ในภาควิชา
              </p>
            </div>
            <button
              onClick={() => signInWithGoogle()}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold text-white bg-teal-600 hover:bg-teal-700 shadow-md shadow-teal-600/20 transition-all"
            >
              <LogIn className="w-4 h-4" />
              <span>เข้าสู่ระบบด้วย Google</span>
            </button>
          </div>
        ) : createdBookingCode ? (
          /* Success Screen */
          <div className="p-8 text-center space-y-4 animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 mx-auto rounded-full bg-teal-100 text-teal-700 flex items-center justify-center">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-xl">ส่งคำขอยืมสำเร็จ!</h4>
              <p className="text-sm text-slate-600 mt-1">
                ระบบได้บันทึกคำขอยืมอุปกรณ์ของคุณแล้ว สามารถตรวจสอบสถานะได้ที่เมนู "การจองของฉัน"
              </p>
            </div>
            <div className="p-4 bg-teal-50/70 rounded-xl border border-teal-200 max-w-sm mx-auto text-left text-xs space-y-1 text-slate-700">
              <p>
                <strong>อุปกรณ์:</strong> {equipment.name}
              </p>
              <p>
                <strong>รหัสอุปกรณ์:</strong> {equipment.code}
              </p>
              <p>
                <strong>จำนวน:</strong> {quantity} ชิ้น
              </p>
              <p>
                <strong>กำหนดวันที่:</strong> {startDate} ถึง {endDate}
              </p>
            </div>
            <p className="text-xs text-slate-400">
              *เมื่อเจ้าหน้าที่อนุมัติคำขอแล้ว สามารถนำบัตรประจำตัวมารับอุปกรณ์ได้ที่ห้องปฏิบัติการเทคโนโลยีการศึกษา
            </p>
          </div>
        ) : (
          /* Form Content */
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {/* Equipment Summary Banner */}
            <div className="flex items-center gap-4 p-3 bg-teal-50/60 rounded-xl border border-teal-100">
              <img
                src={equipment.imageUrl}
                alt={equipment.name}
                className="w-16 h-16 rounded-lg object-cover ring-1 ring-teal-200 bg-white"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=400&q=80';
                }}
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-teal-200/80 text-teal-900">
                    {equipment.code}
                  </span>
                  <span className="text-xs text-slate-500">{equipment.category}</span>
                </div>
                <h4 className="text-sm font-bold text-slate-800 truncate mt-0.5">
                  {equipment.name}
                </h4>
                <div className="text-xs text-teal-800 font-semibold mt-1">
                  คงเหลือพร้อมยืม: <span className="font-bold text-teal-900">{equipment.availableQuantity}</span> /{' '}
                  {equipment.totalQuantity} ชิ้น
                </div>
              </div>
            </div>

            {/* Quantity and Dates */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  จำนวนที่ต้องการยืม (ชิ้น)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="1"
                    max={equipment.availableQuantity}
                    required
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-teal-500 font-semibold"
                  />
                  <span className="absolute right-3 top-2.5 text-xs text-slate-400">ชิ้น</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-teal-600" />
                  วันที่ต้องการยืม
                </label>
                <input
                  type="date"
                  required
                  min={today}
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-teal-600" />
                  วันที่กำหนดคืน
                </label>
                <input
                  type="date"
                  required
                  min={startDate || today}
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-teal-500"
                />
              </div>
            </div>

            {/* Purpose */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                วัตถุประสงค์ในการยืมใช้งาน <span className="text-rose-500">*</span>
              </label>
              <textarea
                required
                rows={2}
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                placeholder="เช่น ถ่ายทำวิดีโอสื่อการเรียนการสอนรายวิชา EDT302, บันทึกภาพกิจกรรมสัมมนาวิชาการ"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-teal-500 transition-all placeholder:text-slate-400"
              />
            </div>

            {/* Applicant Contact Details */}
            <div className="pt-2 border-t border-slate-100">
              <h5 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <IdCard className="w-4 h-4 text-teal-600" />
                ข้อมูลผู้ขอยืมและติดต่อ
              </h5>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    เบอร์โทรศัพท์ติดต่อ <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="เช่น 081-234-5678"
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    รหัสนักศึกษา / รหัสบุคลากร
                  </label>
                  <input
                    type="text"
                    value={studentId}
                    onChange={(e) => setStudentId(e.target.value)}
                    placeholder="เช่น 640105001"
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    สังกัด / คณะ / สาขา
                  </label>
                  <input
                    type="text"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    placeholder="เช่น ภาควิชาเทคโนโลยีการศึกษา คณะศึกษาศาสตร์"
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>
            </div>

            {errorMsg && (
              <div className="p-3 bg-rose-50 text-rose-700 rounded-xl text-xs border border-rose-200 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors"
              >
                ยกเลิก
              </button>
              <button
                type="submit"
                disabled={submitting || equipment.availableQuantity < 1}
                className="px-6 py-2 rounded-xl text-sm font-semibold text-white bg-teal-600 hover:bg-teal-700 shadow-md shadow-teal-600/20 disabled:opacity-50 transition-all flex items-center gap-2"
              >
                {submitting ? 'กำลังส่งคำขอ...' : 'ยืนยันการส่งคำขอยืม'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
