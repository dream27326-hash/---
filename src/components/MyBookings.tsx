import React, { useState } from 'react';
import { Booking, BookingStatus } from '../types';
import { cancelBookingRequest } from '../services/bookingService';
import {
  Clock,
  CheckCircle,
  XCircle,
  RotateCcw,
  Ban,
  Calendar,
  Layers,
  FileText,
  AlertCircle,
  HelpCircle,
  Sparkles,
} from 'lucide-react';

interface MyBookingsProps {
  bookings: Booking[];
  loading: boolean;
  onExploreEquipment: () => void;
}

export const MyBookings: React.FC<MyBookingsProps> = ({
  bookings,
  loading,
  onExploreEquipment,
}) => {
  const [activeFilter, setActiveFilter] = useState<BookingStatus | 'all'>('all');
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  const filteredBookings = bookings.filter((b) => {
    if (activeFilter === 'all') return true;
    return b.status === activeFilter;
  });

  const handleCancelBooking = async (bookingId: string) => {
    if (!window.confirm('คุณต้องการยกเลิกคำขอยืมอุปกรณ์นี้ใช่หรือไม่?')) return;
    setCancellingId(bookingId);
    setErrorMsg('');
    try {
      await cancelBookingRequest(bookingId);
    } catch (err) {
      console.error(err);
      setErrorMsg('เกิดข้อผิดพลาดในการยกเลิกคำขอ');
    } finally {
      setCancellingId(null);
    }
  };

  const getStatusBadge = (status: BookingStatus) => {
    switch (status) {
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-3.5 h-3.5" />
            รออนุมัติ / รอรับอุปกรณ์
          </span>
        );
      case 'approved':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-teal-50 text-teal-800 border border-teal-200">
            <CheckCircle className="w-3.5 h-3.5 text-teal-600" />
            อนุมัติแล้ว / กำลังยืม
          </span>
        );
      case 'returned':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-cyan-50 text-cyan-800 border border-cyan-200">
            <RotateCcw className="w-3.5 h-3.5 text-cyan-600" />
            คืนอุปกรณ์แล้ว
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <XCircle className="w-3.5 h-3.5" />
            คำขอถูกปฏิเสธ
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200">
            <Ban className="w-3.5 h-3.5" />
            ยกเลิกแล้ว
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-teal-100">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Clock className="w-6 h-6 text-teal-600" />
            รายการจองของฉัน (My Bookings)
          </h2>
          <p className="text-sm text-slate-500 mt-0.5">
            ติดตามสถานะคำขอยืม กำหนดส่งคืน และประวัติการใช้อุปกรณ์ภาควิชาเทคโนโลยีการศึกษา
          </p>
        </div>

        <button
          onClick={onExploreEquipment}
          className="self-start sm:self-auto inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-white bg-teal-600 hover:bg-teal-700 shadow-md shadow-teal-600/20 transition-all"
        >
          <Layers className="w-4 h-4" />
          <span>ดูอุปกรณ์ทั้งหมด</span>
        </button>
      </div>

      {/* Tabs Filter */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        {[
          { key: 'all', label: 'ทั้งหมด' },
          { key: 'pending', label: 'รออนุมัติ' },
          { key: 'approved', label: 'กำลังยืม / อนุมัติแล้ว' },
          { key: 'returned', label: 'คืนแล้ว' },
          { key: 'rejected', label: 'ถูกปฏิเสธ' },
          { key: 'cancelled', label: 'ยกเลิกแล้ว' },
        ].map((tab) => {
          const count = bookings.filter((b) => (tab.key === 'all' ? true : b.status === tab.key)).length;
          const isSelected = activeFilter === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveFilter(tab.key as BookingStatus | 'all')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-medium whitespace-nowrap transition-all ${
                isSelected
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-teal-50 border border-slate-200/80'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`text-[11px] px-1.5 py-0.2 rounded-full ${
                  isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {errorMsg && (
        <div className="p-3 bg-rose-50 text-rose-700 rounded-xl text-xs border border-rose-200 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Booking Cards List */}
      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl p-5 border border-slate-200 animate-pulse space-y-3"
            >
              <div className="h-5 bg-slate-200 rounded w-1/4" />
              <div className="h-4 bg-slate-200 rounded w-1/2" />
              <div className="h-10 bg-slate-100 rounded w-full" />
            </div>
          ))}
        </div>
      ) : filteredBookings.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 max-w-md mx-auto space-y-4 shadow-xs">
          <div className="w-16 h-16 rounded-2xl bg-teal-50 text-teal-600 mx-auto flex items-center justify-center">
            <FileText className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-800">ไม่มีรายการจองในหมวดหมู่นี้</h3>
            <p className="text-xs text-slate-500 mt-1">
              {bookings.length === 0
                ? 'คุณยังไม่เคยส่งคำขอยืมอุปกรณ์ สามารถเลือกอุปกรณ์และส่งคำขอได้ทันที'
                : 'ไม่พบรายการที่ตรงกับสถานะที่เลือก'}
            </p>
          </div>
          {bookings.length === 0 && (
            <button
              onClick={onExploreEquipment}
              className="px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 shadow-md shadow-teal-600/20 transition-all"
            >
              เลือกยืมอุปกรณ์ตอนนี้
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredBookings.map((booking) => (
            <div
              key={booking.id}
              className="bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md transition-shadow p-5 sm:p-6 space-y-4"
            >
              {/* Header Row */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <span className="px-2.5 py-1 rounded-lg text-xs font-black bg-teal-100 text-teal-900 tracking-wider">
                    {booking.bookingCode}
                  </span>
                  <span className="text-xs text-slate-400">
                    ยื่นคำขอเมื่อ {new Date(booking.createdAt).toLocaleDateString('th-TH')}
                  </span>
                </div>
                <div>{getStatusBadge(booking.status)}</div>
              </div>

              {/* Equipment & Details Row */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-slate-100 text-slate-700">
                      {booking.equipmentCode}
                    </span>
                    <h3 className="text-base font-bold text-slate-900">{booking.equipmentName}</h3>
                  </div>

                  <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <span className="font-semibold text-slate-700">วัตถุประสงค์:</span>{' '}
                    {booking.purpose}
                  </p>
                </div>

                {/* Reservation Meta Box */}
                <div className="bg-teal-50/70 p-3.5 rounded-xl border border-teal-100 text-xs space-y-2 text-slate-700">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">จำนวนที่ขอยืม:</span>
                    <span className="font-bold text-slate-900">{booking.quantity} ชิ้น</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">วันที่ต้องการยืม:</span>
                    <span className="font-medium text-slate-900">{booking.startDate}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">วันที่กำหนดคืน:</span>
                    <span className="font-medium text-rose-600 font-bold">{booking.endDate}</span>
                  </div>
                </div>
              </div>

              {/* Conditional Alert Messages based on Status */}
              {booking.status === 'approved' && (
                <div className="p-3 bg-teal-50 rounded-xl border border-teal-200 text-xs text-teal-900 flex items-start gap-2.5">
                  <CheckCircle className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">คำขอได้รับการอนุมัติแล้ว:</span> กรุณานำบัตรนักศึกษา
                    หรือบัตรประชาชน มารับอุปกรณ์ ณ ห้องบริการโสตทัศนูปกรณ์และเทคโนโลยีการศึกษา
                    {booking.approvedBy && ` (ผู้อนุมัติ: ${booking.approvedBy})`}
                  </div>
                </div>
              )}

              {booking.status === 'rejected' && (
                <div className="p-3 bg-rose-50 rounded-xl border border-rose-200 text-xs text-rose-800 flex items-start gap-2.5">
                  <XCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">เหตุผลที่ปฏิเสธ:</span>{' '}
                    {booking.rejectionReason || 'ไม่ระบุเหตุผล กรุณาติดต่อเจ้าหน้าที่ประจำภาควิชา'}
                  </div>
                </div>
              )}

              {booking.status === 'returned' && (
                <div className="p-3 bg-cyan-50 rounded-xl border border-cyan-200 text-xs text-cyan-900 flex items-start gap-2.5">
                  <RotateCcw className="w-4 h-4 text-cyan-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">บันทึกการคืนอุปกรณ์:</span> สภาพอุปกรณ์: {
                      booking.returnCondition === 'normal'
                        ? 'สภาพปกติสมบูรณ์'
                        : booking.returnCondition === 'damaged'
                        ? 'มีรอยชำรุด'
                        : 'สูญหาย'
                    }{' '}
                    {booking.returnNotes && `(หมายเหตุ: ${booking.returnNotes})`}
                    {booking.returnedAt && (
                      <span className="text-slate-500 block mt-0.5">
                        คืนเมื่อ: {new Date(booking.returnedAt).toLocaleString('th-TH')}
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Action footer */}
              {booking.status === 'pending' && (
                <div className="flex items-center justify-between pt-2">
                  <span className="text-xs text-amber-600 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    รอเจ้าหน้าที่ตรวจสอบคำขอยืม
                  </span>

                  <button
                    onClick={() => handleCancelBooking(booking.id)}
                    disabled={cancellingId === booking.id}
                    className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 border border-rose-200 transition-colors"
                  >
                    {cancellingId === booking.id ? 'กำลังยกเลิก...' : 'ยกเลิกคำขอนี้'}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
