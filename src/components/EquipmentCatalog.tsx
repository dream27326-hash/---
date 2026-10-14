import React, { useState, useMemo } from 'react';
import { Equipment, EquipmentCategory } from '../types';
import { useAuth } from '../context/AuthContext';
import { seedDefaultEquipmentData } from '../services/equipmentService';
import {
  Search,
  Filter,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Video,
  Mic,
  Maximize2,
  Tv,
  Sun,
  Tablet,
  Cable,
  Sparkles,
  Info,
  CalendarCheck,
  PackagePlus,
  Check,
} from 'lucide-react';

interface EquipmentCatalogProps {
  equipmentList: Equipment[];
  loading: boolean;
  onSelectToBorrow: (item: Equipment) => void;
  onViewDetails: (item: Equipment) => void;
}

const CATEGORIES: { label: EquipmentCategory | 'ทั้งหมด'; icon: React.FC<{ className?: string }> }[] = [
  { label: 'ทั้งหมด', icon: Video },
  { label: 'กล้องถ่ายภาพและวิดีโอ', icon: Video },
  { label: 'ไมโครโฟนและอุปกรณ์เสียง', icon: Mic },
  { label: 'ขาตั้งกล้องและกิมบอล', icon: Maximize2 },
  { label: 'โปรเจกเตอร์และจอภาพ', icon: Tv },
  { label: 'อุปกรณ์ไฟสตูดิโอ', icon: Sun },
  { label: 'แท็บเล็ตและคอมพิวเตอร์', icon: Tablet },
  { label: 'อุปกรณ์เสริมและสายสัญญาณ', icon: Cable },
];

export const EquipmentCatalog: React.FC<EquipmentCatalogProps> = ({
  equipmentList,
  loading,
  onSelectToBorrow,
  onViewDetails,
}) => {
  const { isAdmin } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<EquipmentCategory | 'ทั้งหมด'>('ทั้งหมด');
  const [onlyAvailable, setOnlyAvailable] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [seedSuccess, setSeedSuccess] = useState(false);

  // Filtered equipment
  const filteredItems = useMemo(() => {
    return equipmentList.filter((item) => {
      const matchSearch =
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase());

      const matchCategory =
        selectedCategory === 'ทั้งหมด' ? true : item.category === selectedCategory;

      const matchAvailability = onlyAvailable
        ? item.status === 'available' && item.availableQuantity > 0
        : true;

      return matchSearch && matchCategory && matchAvailability;
    });
  }, [equipmentList, searchTerm, selectedCategory, onlyAvailable]);

  const handleSeedDemo = async () => {
    setSeeding(true);
    try {
      await seedDefaultEquipmentData();
      setSeedSuccess(true);
      setTimeout(() => setSeedSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to seed:', err);
    } finally {
      setSeeding(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Hero Welcome Banner in Turquoise */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-teal-700 via-teal-600 to-cyan-600 text-white p-6 sm:p-8 shadow-xl shadow-teal-700/15">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-white/15 backdrop-blur-md mb-3 border border-white/20">
            <Sparkles className="w-3.5 h-3.5 text-cyan-200" />
            <span>ศูนย์บริการโสตทัศนูปกรณ์และเทคโนโลยีการศึกษา</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            ระบบยืม-คืนอุปกรณ์ผลิตสื่อและการศึกษา
          </h1>
          <p className="mt-2 text-sm sm:text-base text-teal-50/90 leading-relaxed">
            บริการให้ยืมกล้อง ไมโครโฟน ไฟสตูดิโอ ขาตั้ง และอุปกรณ์โสตทัศนูปกรณ์ สำหรับการเรียนการสอน
            ผลิตสื่อ วิจัย และกิจกรรมในภาควิชา
          </p>

          <div className="mt-5 flex flex-wrap items-center gap-3 text-xs sm:text-sm text-teal-50">
            <span className="flex items-center gap-1.5 bg-black/15 px-3 py-1.5 rounded-xl border border-white/10">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              พร้อมให้บริการ จันทร์ - ศุกร์ (08:30 - 16:30 น.)
            </span>
            <span className="flex items-center gap-1.5 bg-black/15 px-3 py-1.5 rounded-xl border border-white/10">
              <CalendarCheck className="w-4 h-4 text-cyan-200" />
              จองล่วงหน้าได้ 1-7 วัน
            </span>
          </div>
        </div>

        {/* Decorative background shapes */}
        <div className="absolute right-0 -bottom-10 w-96 h-96 bg-cyan-400/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -right-10 top-0 w-64 h-64 bg-teal-300/20 rounded-full blur-2xl pointer-events-none" />
      </div>

      {/* Search and Filters Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-teal-100 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          {/* Search box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="ค้นหาอุปกรณ์ เช่น รหัส (CAM-01), ชื่อกล้อง, ไมค์, ขาตั้ง..."
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-2.5 text-xs text-slate-400 hover:text-slate-600"
              >
                ล้าง
              </button>
            )}
          </div>

          {/* Quick Availability Switch */}
          <div className="flex items-center gap-3">
            <label className="cursor-pointer select-none flex items-center gap-2 text-xs sm:text-sm font-medium text-slate-700 bg-teal-50/70 hover:bg-teal-100/70 px-3 py-2 rounded-xl border border-teal-200 transition-colors">
              <input
                type="checkbox"
                checked={onlyAvailable}
                onChange={(e) => setOnlyAvailable(e.target.checked)}
                className="w-4 h-4 text-teal-600 rounded-sm focus:ring-teal-500"
              />
              <span>เฉพาะพร้อมให้ยืม (มีของว่าง)</span>
            </label>

            {/* Quick Demo Seed for Admin or First Time */}
            {isAdmin && equipmentList.length === 0 && (
              <button
                onClick={handleSeedDemo}
                disabled={seeding}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 shadow-sm transition-all"
              >
                <PackagePlus className="w-4 h-4" />
                <span>{seeding ? 'กำลังนำเข้า...' : 'นำเข้าอุปกรณ์ตัวอย่าง (10 รายการ)'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-0.5 no-scrollbar">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const isSelected = selectedCategory === cat.label;
            return (
              <button
                key={cat.label}
                onClick={() => setSelectedCategory(cat.label)}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-medium whitespace-nowrap transition-all ${
                  isSelected
                    ? 'bg-teal-600 text-white shadow-xs shadow-teal-600/30 ring-2 ring-teal-300/40'
                    : 'bg-slate-100 text-slate-600 hover:bg-teal-50 hover:text-teal-700'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : 'text-slate-500'}`} />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {seedSuccess && (
        <div className="p-3 bg-emerald-50 text-emerald-800 rounded-xl text-sm border border-emerald-200 flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-600" />
          นำเข้าชุดข้อมูลอุปกรณ์ตัวอย่างสำหรับภาควิชาเทคโนโลยีการศึกษาเรียบร้อยแล้ว!
        </div>
      )}

      {/* Equipment Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl p-4 border border-slate-100 shadow-xs animate-pulse space-y-3"
            >
              <div className="w-full h-44 bg-slate-200 rounded-xl" />
              <div className="h-4 bg-slate-200 rounded w-1/3" />
              <div className="h-5 bg-slate-200 rounded w-3/4" />
              <div className="h-3 bg-slate-200 rounded w-full" />
              <div className="h-8 bg-slate-200 rounded w-full mt-4" />
            </div>
          ))}
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200/80 shadow-xs max-w-xl mx-auto space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-teal-50 text-teal-600 mx-auto flex items-center justify-center">
            <Video className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-800">ไม่พบรายการอุปกรณ์</h3>
            <p className="text-sm text-slate-500 mt-1">
              {equipmentList.length === 0
                ? 'ยังไม่มีรายการอุปกรณ์ในระบบเทคโนโลยีการศึกษา'
                : 'ไม่พบอุปกรณ์ที่ตรงกับคำค้นหาหรือตัวกรองที่เลือก'}
            </p>
          </div>
          {isAdmin && equipmentList.length === 0 && (
            <button
              onClick={handleSeedDemo}
              disabled={seeding}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-teal-600 hover:bg-teal-700 shadow-md shadow-teal-600/20 transition-all"
            >
              <PackagePlus className="w-4 h-4" />
              <span>{seeding ? 'กำลังนำเข้า...' : 'กดเพื่อนำเข้าอุปกรณ์ตัวอย่าง 10 รายการ'}</span>
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filteredItems.map((item) => {
            const isAvailable = item.status === 'available' && item.availableQuantity > 0;
            const isMaintenance = item.status === 'maintenance';
            const isOut = item.status === 'available' && item.availableQuantity === 0;

            return (
              <div
                key={item.id}
                className="group bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-lg hover:border-teal-300 transition-all duration-300 flex flex-col overflow-hidden"
              >
                {/* Image Container with status badges */}
                <div className="relative aspect-4/3 bg-slate-100 overflow-hidden">
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=400&q=80';
                    }}
                  />

                  {/* Code Tag Top Left */}
                  <div className="absolute top-3 left-3">
                    <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-900/80 text-white backdrop-blur-md shadow-xs">
                      {item.code}
                    </span>
                  </div>

                  {/* Status Tag Top Right */}
                  <div className="absolute top-3 right-3">
                    {isMaintenance ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-rose-600/90 text-white backdrop-blur-md shadow-xs">
                        <XCircle className="w-3.5 h-3.5" />
                        ซ่อมบำรุง
                      </span>
                    ) : isOut ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-amber-600/90 text-white backdrop-blur-md shadow-xs">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        ถูกยืมหมด
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-teal-600/95 text-white backdrop-blur-md shadow-xs">
                        <CheckCircle className="w-3.5 h-3.5" />
                        ว่าง {item.availableQuantity} ชิ้น
                      </span>
                    )}
                  </div>
                </div>

                {/* Card Info Content */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <span className="text-[11px] font-medium text-teal-800 bg-teal-50 px-2 py-0.5 rounded-md inline-block mb-1.5 border border-teal-100">
                      {item.category}
                    </span>
                    <h3 className="font-bold text-slate-800 text-sm sm:text-base leading-snug line-clamp-1 group-hover:text-teal-700 transition-colors">
                      {item.name}
                    </h3>
                    <p className="text-xs text-slate-500 line-clamp-2 mt-1 leading-relaxed">
                      {item.description}
                    </p>
                  </div>

                  {/* Stock Bar */}
                  <div className="pt-2 border-t border-slate-100">
                    <div className="flex items-center justify-between text-xs text-slate-600 mb-1.5">
                      <span>คงเหลือในคลัง:</span>
                      <span className="font-semibold">
                        <span
                          className={
                            item.availableQuantity > 0 ? 'text-teal-700 font-bold' : 'text-rose-600 font-bold'
                          }
                        >
                          {item.availableQuantity}
                        </span>{' '}
                        / {item.totalQuantity} ชิ้น
                      </span>
                    </div>

                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 ${
                          item.availableQuantity === 0
                            ? 'bg-slate-300'
                            : item.availableQuantity < item.totalQuantity / 2
                            ? 'bg-amber-500'
                            : 'bg-teal-500'
                        }`}
                        style={{
                          width: `${
                            item.totalQuantity > 0
                              ? (item.availableQuantity / item.totalQuantity) * 100
                              : 0
                          }%`,
                        }}
                      />
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="pt-1 flex items-center gap-2">
                    <button
                      onClick={() => onViewDetails(item)}
                      className="p-2 rounded-xl text-slate-500 hover:text-teal-700 hover:bg-teal-50 border border-slate-200 transition-colors"
                      title="ดูรายละเอียดอุปกรณ์"
                    >
                      <Info className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => onSelectToBorrow(item)}
                      disabled={!isAvailable}
                      className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                        isAvailable
                          ? 'bg-teal-600 hover:bg-teal-700 text-white shadow-xs shadow-teal-600/20 active:scale-98'
                          : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                      }`}
                    >
                      <CalendarCheck className="w-4 h-4" />
                      <span>{isAvailable ? 'ส่งคำขอยืม' : 'ไม่พร้อมให้ยืม'}</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
