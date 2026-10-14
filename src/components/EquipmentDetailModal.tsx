import React from 'react';
import { Equipment } from '../types';
import {
  X,
  Tag,
  Layers,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  CalendarCheck,
  Package,
} from 'lucide-react';

interface EquipmentDetailModalProps {
  equipment: Equipment | null;
  isOpen: boolean;
  onClose: () => void;
  onBorrow: (equipment: Equipment) => void;
}

export const EquipmentDetailModal: React.FC<EquipmentDetailModalProps> = ({
  equipment,
  isOpen,
  onClose,
  onBorrow,
}) => {
  if (!isOpen || !equipment) return null;

  const isAvailable = equipment.status === 'available' && equipment.availableQuantity > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden border border-slate-100 max-h-[90vh] flex flex-col">
        {/* Header in Turquoise */}
        <div className="bg-gradient-to-r from-teal-700 via-teal-600 to-cyan-600 px-6 py-4 flex items-center justify-between text-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/10 rounded-xl">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg leading-snug">รายละเอียดอุปกรณ์</h3>
              <p className="text-xs text-teal-100">รหัสอุปกรณ์: {equipment.code}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* Main Image */}
          <div className="aspect-16/9 w-full bg-slate-100 rounded-2xl overflow-hidden relative border border-slate-200">
            <img
              src={equipment.imageUrl}
              alt={equipment.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=800&q=80';
              }}
            />
            <div className="absolute top-3 left-3">
              <span className="px-3 py-1 rounded-xl text-xs font-bold bg-slate-950/80 text-white backdrop-blur-md">
                {equipment.code}
              </span>
            </div>
            <div className="absolute top-3 right-3">
              {equipment.status === 'available' ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold bg-teal-600/90 text-white backdrop-blur-md">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  ว่าง {equipment.availableQuantity} ชิ้น
                </span>
              ) : equipment.status === 'maintenance' ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold bg-rose-600/90 text-white backdrop-blur-md">
                  <XCircle className="w-3.5 h-3.5" />
                  อยู่ระหว่างซ่อมบำรุง
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold bg-slate-700/90 text-white backdrop-blur-md">
                  งดให้บริการ
                </span>
              )}
            </div>
          </div>

          {/* Titles & Category */}
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-teal-50 text-teal-800 border border-teal-200 mb-2">
              <Tag className="w-3.5 h-3.5" />
              {equipment.category}
            </div>
            <h2 className="text-xl font-bold text-slate-900">{equipment.name}</h2>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              รายละเอียดและอุปกรณ์ส่วนควบในชุด
            </h4>
            <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line bg-slate-50 p-4 rounded-xl border border-slate-200/80">
              {equipment.description || 'ไม่มีรายละเอียดเพิ่มเติม'}
            </p>
          </div>

          {/* Stock Metrics */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-teal-50/70 border border-teal-100">
              <div className="text-xs font-medium text-teal-800">จำนวนทั้งหมดในคลัง</div>
              <div className="text-2xl font-black text-teal-950 mt-1">
                {equipment.totalQuantity} <span className="text-sm font-normal text-slate-600">ชิ้น</span>
              </div>
            </div>
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-100">
              <div className="text-xs font-medium text-emerald-800">คงเหลือพร้อมให้ยืม</div>
              <div className="text-2xl font-black text-emerald-950 mt-1">
                {equipment.availableQuantity}{' '}
                <span className="text-sm font-normal text-slate-600">ชิ้น</span>
              </div>
            </div>
          </div>

          {/* Policy Notice */}
          <div className="p-3.5 rounded-xl bg-amber-50/80 border border-amber-200/80 text-xs text-amber-800 space-y-1">
            <div className="font-semibold flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              เงื่อนไขการยืมอุปกรณ์ภาควิชาเทคโนโลยีการศึกษา
            </div>
            <p className="text-amber-900/80 pl-5">
              1. ผู้ยืมต้องแสดงบัตรประจำตัวประชาชนหรือบัตรนักศึกษาในวันที่มารับอุปกรณ์จริง
              <br />
              2. ตรวจสอบสภาพอุปกรณ์ร่วมกับเจ้าหน้าที่ก่อนนำออกจากห้องปฏิบัติการ
              <br />
              3. ส่งคืนอุปกรณ์ตามวันเวลาที่กำหนด และรักษาความสะอาดของอุปกรณ์ทุกชิ้น
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200/80 flex items-center justify-end gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-200/70 transition-colors"
          >
            ปิด
          </button>
          <button
            type="button"
            disabled={!isAvailable}
            onClick={() => {
              onClose();
              onBorrow(equipment);
            }}
            className={`flex items-center gap-2 px-6 py-2 rounded-xl text-sm font-semibold transition-all ${
              isAvailable
                ? 'bg-teal-600 hover:bg-teal-700 text-white shadow-md shadow-teal-600/20 active:scale-95'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
          >
            <CalendarCheck className="w-4 h-4" />
            <span>ขอยืมอุปกรณ์นี้</span>
          </button>
        </div>
      </div>
    </div>
  );
};
