import React, { useState } from 'react';
import { Booking, ReturnCondition } from '../../types';
import {
  X,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  AlertCircle,
} from 'lucide-react';

interface ReturnModalProps {
  booking: Booking | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (
    bookingId: string,
    equipmentId: string,
    quantity: number,
    condition: ReturnCondition,
    notes: string
  ) => Promise<void>;
}

export const ReturnModal: React.FC<ReturnModalProps> = ({
  booking,
  isOpen,
  onClose,
  onConfirm,
}) => {
  const [condition, setCondition] = useState<ReturnCondition>('normal');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen || !booking) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErrorMsg('');
    try {
      await onConfirm(
        booking.id,
        booking.equipmentId,
        booking.quantity,
        condition,
        notes.trim()
      );
      onClose();
    } catch (err) {
      console.error(err);
      setErrorMsg('เกิดข้อผิดพลาดในการบันทึกการคืน');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden border border-slate-100">
        {/* Header in Turquoise */}
        <div className="bg-gradient-to-r from-teal-700 via-teal-600 to-cyan-600 px-6 py-4 flex items-center justify-between text-white">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/10 rounded-xl">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg leading-snug">บันทึกการส่งคืนอุปกรณ์</h3>
              <p className="text-xs text-teal-100">
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

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Summary Box */}
          <div className="p-3 bg-teal-50/70 rounded-xl border border-teal-100 text-xs text-slate-700 space-y-1">
            <div className="flex justify-between">
              <span className="text-slate-500">อุปกรณ์:</span>
              <span className="font-bold text-slate-900">{booking.equipmentName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">รหัสอุปกรณ์:</span>
              <span className="font-bold text-slate-900">{booking.equipmentCode}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">จำนวนที่คืน:</span>
              <span className="font-bold text-teal-800">{booking.quantity} ชิ้น</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">ผู้ยืม:</span>
              <span className="font-medium text-slate-900">
                {booking.userName} ({booking.userPhone})
              </span>
            </div>
          </div>

          {/* Condition Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">
              ผลการตรวจสอบสภาพอุปกรณ์เมื่อรับคืน
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setCondition('normal')}
                className={`p-3 rounded-xl border text-center transition-all ${
                  condition === 'normal'
                    ? 'border-teal-500 bg-teal-50 text-teal-800 ring-2 ring-teal-400/30'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                <CheckCircle2 className="w-5 h-5 mx-auto text-teal-600 mb-1" />
                <div className="text-xs font-bold">ปกติสมบูรณ์</div>
                <div className="text-[10px] text-slate-400 mt-0.5">ใช้งานได้ตามปกติ</div>
              </button>

              <button
                type="button"
                onClick={() => setCondition('damaged')}
                className={`p-3 rounded-xl border text-center transition-all ${
                  condition === 'damaged'
                    ? 'border-amber-500 bg-amber-50/80 text-amber-800 ring-2 ring-amber-400/30'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                <AlertTriangle className="w-5 h-5 mx-auto text-amber-600 mb-1" />
                <div className="text-xs font-bold">ชำรุด / มีตำหนิ</div>
                <div className="text-[10px] text-slate-400 mt-0.5">ต้องซ่อมบำรุง</div>
              </button>

              <button
                type="button"
                onClick={() => setCondition('lost')}
                className={`p-3 rounded-xl border text-center transition-all ${
                  condition === 'lost'
                    ? 'border-rose-500 bg-rose-50/80 text-rose-800 ring-2 ring-rose-400/30'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                <XCircle className="w-5 h-5 mx-auto text-rose-600 mb-1" />
                <div className="text-xs font-bold">สูญหาย</div>
                <div className="text-[10px] text-slate-400 mt-0.5">ตัดออกจากคลัง</div>
              </button>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              หมายเหตุ / รายละเอียดการตรวจสภาพ
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="เช่น อุปกรณ์ส่งคืนครบถ้วน อุปกรณ์เสริมและกระเป๋าอยู่ในสภาพดี"
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-teal-500"
            />
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
              disabled={saving}
              className="px-6 py-2 rounded-xl text-sm font-semibold text-white bg-teal-600 hover:bg-teal-700 shadow-md shadow-teal-600/20 disabled:opacity-50 transition-all flex items-center gap-2"
            >
              {saving ? 'กำลังบันทึก...' : 'บันทึกการรับคืนและคืนสต็อก'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
