import React, { useState } from 'react';
import { Booking } from '../../types';
import { X, XCircle, AlertCircle } from 'lucide-react';

interface RejectModalProps {
  booking: Booking | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (bookingId: string, reason: string) => Promise<void>;
}

const COMMON_REASONS = [
  'อุปกรณ์ถูกสำรองไว้สำหรับคาบเรียนปฏิบัติการของภาควิชา',
  'อุปกรณ์จำเป็นต้องได้รับการตรวจเช็กและซ่อมบำรุง',
  'ระยะเวลาการขอยืมซ้อนทับกับกิจกรรมสัมมนาของคณะ',
  'ข้อมูลผู้ขอยืมหรือวัตถุประสงค์ไม่ครบถ้วนสมบูรณ์',
];

export const RejectModal: React.FC<RejectModalProps> = ({
  booking,
  isOpen,
  onClose,
  onConfirm,
}) => {
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen || !booking) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      setErrorMsg('กรุณาระบุเหตุผลในการปฏิเสธคำขอ');
      return;
    }

    setSubmitting(true);
    setErrorMsg('');
    try {
      await onConfirm(booking.id, reason.trim());
      onClose();
    } catch (err) {
      console.error(err);
      setErrorMsg('เกิดข้อผิดพลาดในการบันทึก กรุณาลองอีกครั้ง');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden border border-slate-100">
        <div className="bg-gradient-to-r from-rose-600 to-rose-700 px-6 py-4 flex items-center justify-between text-white">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/10 rounded-xl">
              <XCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg leading-snug">ปฏิเสธคำขอยืมอุปกรณ์</h3>
              <p className="text-xs text-rose-100">
                รหัสคำขอ: {booking.bookingCode} | {booking.userName}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="p-3 bg-rose-50/70 rounded-xl border border-rose-100 text-xs text-slate-700 space-y-1">
            <p>
              <strong>อุปกรณ์:</strong> {booking.equipmentName} ({booking.quantity} ชิ้น)
            </p>
            <p>
              <strong>ผู้ขอยืม:</strong> {booking.userName}
            </p>
            <p>
              <strong>วันที่ต้องการยืม:</strong> {booking.startDate} ถึง {booking.endDate}
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              เหตุผลในการปฏิเสธ <span className="text-rose-500">*</span>
            </label>
            <textarea
              required
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="ระบุเหตุผลเพื่อแจ้งให้ผู้ขอยืมทราบ..."
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-rose-500"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1.5">
              เลือกเหตุผลด่วน:
            </label>
            <div className="space-y-1">
              {COMMON_REASONS.map((common) => (
                <button
                  key={common}
                  type="button"
                  onClick={() => setReason(common)}
                  className="w-full text-left text-xs p-2 rounded-lg bg-slate-50 hover:bg-sky-50 text-slate-700 hover:text-sky-800 border border-slate-200/60 transition-colors"
                >
                  • {common}
                </button>
              ))}
            </div>
          </div>

          {errorMsg && (
            <div className="p-3 bg-rose-50 text-rose-700 rounded-xl text-xs border border-rose-200 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2 rounded-xl text-sm font-semibold text-white bg-rose-600 hover:bg-rose-700 shadow-md shadow-rose-600/20 disabled:opacity-50 transition-all"
            >
              {submitting ? 'กำลังบันทึก...' : 'ยืนยันปฏิเสธคำขอ'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
