import React, { useState, useMemo } from 'react';
import { Equipment, Booking, BookingStatus, ReturnCondition } from '../types';
import { useAuth } from '../context/AuthContext';
import {
  createEquipment,
  updateEquipment,
  deleteEquipment,
  seedDefaultEquipmentData,
} from '../services/equipmentService';
import {
  approveBookingRequest,
  rejectBookingRequest,
  returnBookingRecord,
} from '../services/bookingService';
import { EquipmentFormModal } from './admin/EquipmentFormModal';
import { ReturnModal } from './admin/ReturnModal';
import { RejectModal } from './admin/RejectModal';
import { AdminRoleManager } from './admin/AdminRoleManager';
import {
  LayoutDashboard,
  ClipboardList,
  Package,
  ShieldCheck,
  Plus,
  PackagePlus,
  Search,
  CheckCircle,
  XCircle,
  RotateCcw,
  Clock,
  User,
  Phone,
  Mail,
  Calendar,
  Trash2,
  Edit,
  AlertTriangle,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

interface AdminPanelProps {
  equipmentList: Equipment[];
  allBookings: Booking[];
  loadingEquipment: boolean;
  loadingBookings: boolean;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  equipmentList,
  allBookings,
  loadingEquipment,
  loadingBookings,
}) => {
  const { currentUser } = useAuth();
  const [adminSubTab, setAdminSubTab] = useState<'overview' | 'bookings' | 'equipment' | 'admins'>('overview');

  // Booking filters & search
  const [bookingFilter, setBookingFilter] = useState<BookingStatus | 'all'>('all');
  const [bookingSearch, setBookingSearch] = useState('');

  // Equipment search
  const [equipmentSearch, setEquipmentSearch] = useState('');

  // Modals state
  const [equipmentModalOpen, setEquipmentModalOpen] = useState(false);
  const [editingEquipment, setEditingEquipment] = useState<Equipment | null>(null);

  const [returnModalOpen, setReturnModalOpen] = useState(false);
  const [activeBookingForReturn, setActiveBookingForReturn] = useState<Booking | null>(null);

  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [activeBookingForReject, setActiveBookingForReject] = useState<Booking | null>(null);

  const [actionProcessing, setActionProcessing] = useState<string | null>(null);
  const [seeding, setSeeding] = useState(false);

  // Metrics computation
  const totalEquipmentCount = equipmentList.reduce((acc, curr) => acc + (curr.totalQuantity || 0), 0);
  const availableEquipmentCount = equipmentList.reduce((acc, curr) => acc + (curr.availableQuantity || 0), 0);
  const borrowedEquipmentCount = Math.max(0, totalEquipmentCount - availableEquipmentCount);

  const pendingBookings = useMemo(() => allBookings.filter((b) => b.status === 'pending'), [allBookings]);
  const activeBookings = useMemo(() => allBookings.filter((b) => b.status === 'approved'), [allBookings]);
  const returnedBookings = useMemo(() => allBookings.filter((b) => b.status === 'returned'), [allBookings]);

  // Filtered Bookings for the management view
  const filteredBookings = useMemo(() => {
    return allBookings.filter((b) => {
      const matchStatus = bookingFilter === 'all' ? true : b.status === bookingFilter;
      const matchSearch =
        b.bookingCode.toLowerCase().includes(bookingSearch.toLowerCase()) ||
        b.userName.toLowerCase().includes(bookingSearch.toLowerCase()) ||
        b.equipmentName.toLowerCase().includes(bookingSearch.toLowerCase()) ||
        b.userStudentId.toLowerCase().includes(bookingSearch.toLowerCase());
      return matchStatus && matchSearch;
    });
  }, [allBookings, bookingFilter, bookingSearch]);

  // Filtered Equipment for inventory management
  const filteredEquipment = useMemo(() => {
    return equipmentList.filter((e) => {
      return (
        e.code.toLowerCase().includes(equipmentSearch.toLowerCase()) ||
        e.name.toLowerCase().includes(equipmentSearch.toLowerCase()) ||
        e.category.toLowerCase().includes(equipmentSearch.toLowerCase())
      );
    });
  }, [equipmentList, equipmentSearch]);

  // Handlers
  const handleSaveEquipment = async (data: Omit<Equipment, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (editingEquipment) {
      await updateEquipment(editingEquipment.id, data);
    } else {
      await createEquipment(data);
    }
  };

  const handleDeleteEquipment = async (item: Equipment) => {
    if (!window.confirm(`คุณแน่ใจหรือไม่ว่าต้องการลบ "${item.name}" (${item.code}) ออกจากระบบ?`)) {
      return;
    }
    try {
      await deleteEquipment(item.id);
    } catch (err) {
      console.error(err);
      alert('เกิดข้อผิดพลาดในการลบอุปกรณ์');
    }
  };

  const handleApprove = async (booking: Booking) => {
    if (!window.confirm(`ยืนยันการอนุมัติให้ "${booking.userName}" ยืม "${booking.equipmentName}" จำนวน ${booking.quantity} ชิ้น?`)) {
      return;
    }
    setActionProcessing(booking.id);
    try {
      await approveBookingRequest(
        booking.id,
        booking.equipmentId,
        booking.quantity,
        currentUser?.email || 'admin'
      );
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'เกิดข้อผิดพลาดในการอนุมัติคำขอ');
    } finally {
      setActionProcessing(null);
    }
  };

  const handleConfirmReturn = async (
    bookingId: string,
    equipmentId: string,
    quantity: number,
    condition: ReturnCondition,
    notes: string
  ) => {
    await returnBookingRecord(bookingId, equipmentId, quantity, condition, notes);
  };

  const handleConfirmReject = async (bookingId: string, reason: string) => {
    await rejectBookingRequest(bookingId, reason, currentUser?.email || 'admin');
  };

  const handleSeedDemo = async () => {
    setSeeding(true);
    try {
      await seedDefaultEquipmentData();
    } catch (err) {
      console.error('Failed to seed:', err);
    } finally {
      setSeeding(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Sub-navigation tabs */}
      <div className="bg-white p-2 rounded-2xl border border-teal-100 shadow-xs flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          <button
            onClick={() => setAdminSubTab('overview')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
              adminSubTab === 'overview'
                ? 'bg-teal-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>ภาพรวมแดชบอร์ด</span>
          </button>

          <button
            onClick={() => setAdminSubTab('bookings')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
              adminSubTab === 'bookings'
                ? 'bg-teal-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <ClipboardList className="w-4 h-4" />
            <span>จัดการคำขอยืม-คืน</span>
            {pendingBookings.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-xs font-bold bg-amber-400 text-amber-950">
                {pendingBookings.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setAdminSubTab('equipment')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
              adminSubTab === 'equipment'
                ? 'bg-teal-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>จัดการอุปกรณ์</span>
            <span className="text-xs opacity-75">({equipmentList.length})</span>
          </button>

          <button
            onClick={() => setAdminSubTab('admins')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
              adminSubTab === 'admins'
                ? 'bg-teal-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>จัดการผู้ดูแลระบบ</span>
          </button>
        </div>

        {/* Global Action on Top Bar */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <button
            onClick={() => {
              setEditingEquipment(null);
              setEquipmentModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold text-white bg-teal-600 hover:bg-teal-700 shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>เพิ่มอุปกรณ์ใหม่</span>
          </button>
        </div>
      </div>

      {/* TAB 1: OVERVIEW DASHBOARD */}
      {adminSubTab === 'overview' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* 4 Metric Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs hover:border-teal-300 transition-colors">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  อุปกรณ์ทั้งหมด
                </span>
                <div className="p-2 bg-teal-50 text-teal-600 rounded-xl">
                  <Package className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-3 text-3xl font-black text-slate-900 tracking-tight">
                {totalEquipmentCount} <span className="text-sm font-normal text-slate-500">ชิ้น</span>
              </div>
              <div className="mt-1 text-xs text-slate-500 flex items-center justify-between">
                <span>จาก {equipmentList.length} รายการ</span>
                <span className="text-teal-700 font-bold">พร้อมยืม {availableEquipmentCount} ชิ้น</span>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs hover:border-teal-300 transition-colors">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  กำลังถูกยืม
                </span>
                <div className="p-2 bg-cyan-50 text-cyan-600 rounded-xl">
                  <Clock className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-3 text-3xl font-black text-cyan-700 tracking-tight">
                {borrowedEquipmentCount} <span className="text-sm font-normal text-slate-500">ชิ้น</span>
              </div>
              <div className="mt-1 text-xs text-slate-500">
                {activeBookings.length} คำขอที่กำลังใช้งานอยู่
              </div>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs hover:border-teal-300 transition-colors">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  รออนุมัติการยืม
                </span>
                <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
                  <AlertTriangle className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-3 text-3xl font-black text-amber-600 tracking-tight">
                {pendingBookings.length} <span className="text-sm font-normal text-slate-500">รายการ</span>
              </div>
              <div className="mt-1 text-xs text-slate-500">
                {pendingBookings.length > 0 ? (
                  <button
                    onClick={() => {
                      setAdminSubTab('bookings');
                      setBookingFilter('pending');
                    }}
                    className="text-amber-700 font-semibold hover:underline flex items-center gap-1"
                  >
                    <span>คลิกเพื่อตรวจสอบ</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                ) : (
                  'ไม่มีรายการค้างตรวจสอบ'
                )}
              </div>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs hover:border-teal-300 transition-colors">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  คืนแล้วเสร็จ
                </span>
                <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
                  <CheckCircle className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-3 text-3xl font-black text-emerald-700 tracking-tight">
                {returnedBookings.length} <span className="text-sm font-normal text-slate-500">ครั้ง</span>
              </div>
              <div className="mt-1 text-xs text-slate-500">
                ประวัติการยืม-คืนสำเร็จในระบบ
              </div>
            </div>
          </div>

          {/* Pending Alerts Banner if any */}
          {pendingBookings.length > 0 && (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-amber-500 text-white rounded-xl shadow-xs">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-amber-950">
                    มีคำขอยืมอุปกรณ์รอการตรวจสอบ {pendingBookings.length} รายการ
                  </h4>
                  <p className="text-xs text-amber-800">
                    กรุณาตรวจสอบรายละเอียดและกดอนุมัติเมื่อผู้ยืมมารับอุปกรณ์จริงที่ห้องบริการ
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  setAdminSubTab('bookings');
                  setBookingFilter('pending');
                }}
                className="self-start sm:self-auto px-4 py-2 rounded-xl text-xs font-bold text-amber-950 bg-amber-300 hover:bg-amber-400 shadow-xs transition-colors"
              >
                ไปที่รายการรออนุมัติ
              </button>
            </div>
          )}

          {/* Seed demo data shortcut if needed */}
          {equipmentList.length === 0 && (
            <div className="p-6 bg-teal-50 border border-teal-200 rounded-2xl text-center space-y-3">
              <div className="w-12 h-12 bg-teal-600 text-white rounded-xl flex items-center justify-center mx-auto shadow-md">
                <Sparkles className="w-6 h-6" />
              </div>
              <h4 className="text-base font-bold text-slate-900">
                เริ่มต้นใช้งานระบบยืม-คืนอุปกรณ์ภาควิชา
              </h4>
              <p className="text-xs text-slate-600 max-w-md mx-auto">
                ยังไม่มีข้อมูลอุปกรณ์ในระบบ สามารถกดปุ่มด้านล่างเพื่อนำเข้าข้อมูลตัวอย่าง (กล้อง 4K, ไมค์โครโฟนไร้สาย, ขาตั้ง, ไฟสตูดิโอ, โปรเจกเตอร์) สำหรับทดสอบระบบได้ทันที
              </p>
              <button
                onClick={handleSeedDemo}
                disabled={seeding}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 shadow-md shadow-teal-600/20 transition-all"
              >
                <PackagePlus className="w-4 h-4" />
                <span>{seeding ? 'กำลังนำเข้าข้อมูล...' : 'นำเข้าอุปกรณ์ตัวอย่าง (10 รายการ)'}</span>
              </button>
            </div>
          )}

          {/* Recent Bookings Feed */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                <ClipboardList className="w-5 h-5 text-teal-600" />
                รายการคำขอยืมล่าสุด
              </h3>
              <button
                onClick={() => setAdminSubTab('bookings')}
                className="text-xs font-semibold text-teal-700 hover:underline flex items-center gap-1"
              >
                ดูทั้งหมด ({allBookings.length})
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {allBookings.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-400">ยังไม่มีรายการยืมในระบบ</div>
            ) : (
              <div className="divide-y divide-slate-100">
                {allBookings.slice(0, 5).map((b) => (
                  <div
                    key={b.id}
                    className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black px-2 py-0.5 rounded bg-teal-100 text-teal-900">
                          {b.bookingCode}
                        </span>
                        <span className="text-sm font-bold text-slate-800">{b.equipmentName}</span>
                        <span className="text-xs text-slate-500">x{b.quantity}</span>
                      </div>
                      <div className="text-xs text-slate-500 mt-1 flex items-center gap-3">
                        <span>ผู้ยืม: {b.userName}</span>
                        <span>•</span>
                        <span>กำหนดคืน: {b.endDate}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xs px-2.5 py-1 rounded-full font-semibold ${
                          b.status === 'pending'
                            ? 'bg-amber-100 text-amber-800'
                            : b.status === 'approved'
                            ? 'bg-teal-100 text-teal-900'
                            : b.status === 'returned'
                            ? 'bg-cyan-100 text-cyan-900'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {b.status === 'pending'
                          ? 'รออนุมัติ'
                          : b.status === 'approved'
                          ? 'กำลังยืม'
                          : b.status === 'returned'
                          ? 'คืนแล้ว'
                          : b.status === 'rejected'
                          ? 'ปฏิเสธ'
                          : 'ยกเลิก'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: BOOKING MANAGEMENT */}
      {adminSubTab === 'bookings' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Search & Filter Header */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-teal-100 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={bookingSearch}
                  onChange={(e) => setBookingSearch(e.target.value)}
                  placeholder="ค้นหารหัสคำขอ, ชื่อผู้ยืม, รหัสนักศึกษา, ชื่ออุปกรณ์..."
                  className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-teal-500"
                />
              </div>

              {/* Status Tabs */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 no-scrollbar">
                {[
                  { key: 'all', label: 'ทั้งหมด' },
                  { key: 'pending', label: 'รออนุมัติ' },
                  { key: 'approved', label: 'กำลังยืม' },
                  { key: 'returned', label: 'คืนแล้ว' },
                  { key: 'rejected', label: 'ปฏิเสธ' },
                ].map((st) => {
                  const count = allBookings.filter((b) => (st.key === 'all' ? true : b.status === st.key)).length;
                  const isSel = bookingFilter === st.key;
                  return (
                    <button
                      key={st.key}
                      onClick={() => setBookingFilter(st.key as BookingStatus | 'all')}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                        isSel
                          ? 'bg-teal-600 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      <span>{st.label}</span>
                      <span className="text-[10px] opacity-80">({count})</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Bookings List Cards */}
          {loadingBookings ? (
            <div className="space-y-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl p-5 border border-slate-200 animate-pulse space-y-3">
                  <div className="h-5 bg-slate-200 rounded w-1/3" />
                  <div className="h-4 bg-slate-200 rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : filteredBookings.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 shadow-xs max-w-md mx-auto space-y-3">
              <ClipboardList className="w-12 h-12 text-slate-300 mx-auto" />
              <h4 className="text-base font-bold text-slate-800">ไม่พบคำขอยืมในเงื่อนไขที่เลือก</h4>
              <p className="text-xs text-slate-500">กรุณาลองเปลี่ยนคำค้นหาหรือตัวกรองสถานะ</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredBookings.map((b) => (
                <div
                  key={b.id}
                  className="bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:border-teal-300 transition-all p-5 space-y-4"
                >
                  {/* Top Bar */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-2.5 py-1 rounded-lg text-xs font-black bg-teal-100 text-teal-900">
                        {b.bookingCode}
                      </span>
                      <span className="text-xs text-slate-400">
                        ส่งคำขอเมื่อ {new Date(b.createdAt).toLocaleString('th-TH')}
                      </span>
                    </div>

                    <div>
                      {b.status === 'pending' && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
                          <Clock className="w-3.5 h-3.5" />
                          รออนุมัติ / ผู้ใช้ยังไม่ได้รับของ
                        </span>
                      )}
                      {b.status === 'approved' && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-teal-50 text-teal-800 border border-teal-200">
                          <CheckCircle className="w-3.5 h-3.5 text-teal-600" />
                          กำลังยืม (รับอุปกรณ์แล้ว)
                        </span>
                      )}
                      {b.status === 'returned' && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-cyan-50 text-cyan-800 border border-cyan-200">
                          <RotateCcw className="w-3.5 h-3.5 text-cyan-600" />
                          คืนอุปกรณ์แล้ว
                        </span>
                      )}
                      {b.status === 'rejected' && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
                          <XCircle className="w-3.5 h-3.5" />
                          ปฏิเสธคำขอ
                        </span>
                      )}
                      {b.status === 'cancelled' && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-600 border border-slate-200">
                          ผู้ใช้ยกเลิก
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Applicant & Equipment Content */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {/* User Info Box */}
                    <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 text-xs space-y-1.5 text-slate-700">
                      <div className="font-bold text-slate-900 flex items-center gap-1.5 text-sm">
                        <User className="w-4 h-4 text-teal-600" />
                        {b.userName}
                      </div>
                      {b.userStudentId && (
                        <div>
                          <strong>รหัสประจำตัว:</strong> {b.userStudentId}
                        </div>
                      )}
                      <div className="flex items-center gap-1.5 text-slate-600">
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                        <a href={`tel:${b.userPhone}`} className="text-teal-600 hover:underline font-semibold">
                          {b.userPhone}
                        </a>
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-600">
                        <Mail className="w-3.5 h-3.5 text-slate-400" />
                        <span className="truncate">{b.userEmail}</span>
                      </div>
                    </div>

                    {/* Equipment Box */}
                    <div className="p-3.5 bg-teal-50/60 rounded-xl border border-teal-100 text-xs space-y-1.5 text-slate-700">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-teal-200 text-teal-900">
                          {b.equipmentCode}
                        </span>
                        <span className="font-bold text-slate-900 text-sm truncate">
                          {b.equipmentName}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">จำนวนที่ขอยืม:</span>
                        <span className="font-bold text-teal-950">{b.quantity} ชิ้น</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">วันที่ยืม:</span>
                        <span className="font-medium">{b.startDate}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">กำหนดคืน:</span>
                        <span className="font-bold text-rose-600">{b.endDate}</span>
                      </div>
                    </div>

                    {/* Purpose Box */}
                    <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 text-xs space-y-1 text-slate-700 flex flex-col justify-between">
                      <div>
                        <span className="font-semibold text-slate-700">วัตถุประสงค์การยืม:</span>
                        <p className="mt-1 text-slate-600 line-clamp-3 leading-relaxed">
                          {b.purpose}
                        </p>
                      </div>

                      {/* Approval/Return metadata if any */}
                      {b.approvedBy && (
                        <div className="pt-2 text-[11px] text-slate-400 border-t border-slate-200/60">
                          ดำเนินการโดย: {b.approvedBy}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Return details banner */}
                  {b.status === 'returned' && (
                    <div className="p-3 bg-cyan-50 rounded-xl border border-cyan-200 text-xs text-cyan-950 flex items-center justify-between">
                      <div>
                        <span className="font-bold">สภาพตอนรับคืน: </span>
                        <span>
                          {b.returnCondition === 'normal'
                            ? 'ปกติสมบูรณ์'
                            : b.returnCondition === 'damaged'
                            ? 'ชำรุด'
                            : 'สูญหาย'}
                        </span>
                        {b.returnNotes && <span className="ml-2 text-slate-600">({b.returnNotes})</span>}
                      </div>
                      {b.returnedAt && (
                        <span className="text-slate-500 text-[11px]">
                          {new Date(b.returnedAt).toLocaleString('th-TH')}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Rejection banner */}
                  {b.status === 'rejected' && (
                    <div className="p-3 bg-rose-50 rounded-xl border border-rose-200 text-xs text-rose-900">
                      <strong>เหตุผลที่ปฏิเสธ:</strong> {b.rejectionReason}
                    </div>
                  )}

                  {/* Action Buttons for Admin */}
                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                    {b.status === 'pending' && (
                      <>
                        <button
                          onClick={() => {
                            setActiveBookingForReject(b);
                            setRejectModalOpen(true);
                          }}
                          className="px-4 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 border border-rose-200 transition-colors"
                        >
                          ปฏิเสธคำขอ
                        </button>
                        <button
                          onClick={() => handleApprove(b)}
                          disabled={actionProcessing === b.id}
                          className="px-5 py-2 rounded-xl text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 shadow-md shadow-teal-600/20 disabled:opacity-50 transition-all flex items-center gap-1.5"
                        >
                          <CheckCircle className="w-4 h-4" />
                          <span>
                            {actionProcessing === b.id ? 'กำลังบันทึก...' : 'อนุมัติการยืม (รับอุปกรณ์)'}
                          </span>
                        </button>
                      </>
                    )}

                    {b.status === 'approved' && (
                      <button
                        onClick={() => {
                          setActiveBookingForReturn(b);
                          setReturnModalOpen(true);
                        }}
                        className="px-5 py-2 rounded-xl text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 shadow-md shadow-teal-600/20 transition-all flex items-center gap-1.5"
                      >
                        <RotateCcw className="w-4 h-4" />
                        <span>บันทึกการคืนอุปกรณ์</span>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: EQUIPMENT INVENTORY MANAGEMENT */}
      {adminSubTab === 'equipment' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-teal-100 shadow-xs flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={equipmentSearch}
                onChange={(e) => setEquipmentSearch(e.target.value)}
                placeholder="ค้นหารหัส, ชื่ออุปกรณ์, หมวดหมู่..."
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setEditingEquipment(null);
                  setEquipmentModalOpen(true);
                }}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-white bg-teal-600 hover:bg-teal-700 shadow-sm transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>เพิ่มอุปกรณ์ใหม่</span>
              </button>
            </div>
          </div>

          {/* Table of Equipment */}
          {loadingEquipment ? (
            <div className="bg-white rounded-2xl p-8 border border-slate-200 animate-pulse text-center">
              กำลังโหลดรายการอุปกรณ์...
            </div>
          ) : filteredEquipment.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 shadow-xs max-w-md mx-auto space-y-3">
              <Package className="w-12 h-12 text-slate-300 mx-auto" />
              <h4 className="text-base font-bold text-slate-800">ไม่พบรายการอุปกรณ์</h4>
              <p className="text-xs text-slate-500">สามารถกดปุ่มเพิ่มอุปกรณ์ใหม่ หรือนำเข้าข้อมูลตัวอย่างได้</p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs sm:text-sm">
                  <thead>
                    <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-semibold">
                      <th className="p-3.5 pl-5">รูปภาพ & รหัส</th>
                      <th className="p-3.5">ชื่ออุปกรณ์</th>
                      <th className="p-3.5">หมวดหมู่</th>
                      <th className="p-3.5 text-center">จำนวนทั้งหมด</th>
                      <th className="p-3.5 text-center">คงเหลือพร้อมยืม</th>
                      <th className="p-3.5">สถานะ</th>
                      <th className="p-3.5 pr-5 text-right">การจัดการ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredEquipment.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="p-3.5 pl-5">
                          <div className="flex items-center gap-3">
                            <img
                              src={item.imageUrl}
                              alt={item.name}
                              className="w-12 h-12 rounded-lg object-cover bg-slate-100 border border-slate-200"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src =
                                  'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=400&q=80';
                              }}
                            />
                            <span className="font-bold text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-800">
                              {item.code}
                            </span>
                          </div>
                        </td>

                        <td className="p-3.5">
                          <div className="font-bold text-slate-900 max-w-xs">{item.name}</div>
                          <div className="text-[11px] text-slate-400 truncate max-w-xs mt-0.5">
                            {item.description}
                          </div>
                        </td>

                        <td className="p-3.5">
                          <span className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-teal-50 text-teal-800 border border-teal-200">
                            {item.category}
                          </span>
                        </td>

                        <td className="p-3.5 text-center font-bold text-slate-800">
                          {item.totalQuantity}
                        </td>

                        <td className="p-3.5 text-center font-bold">
                          <span
                            className={
                              item.availableQuantity > 0 ? 'text-teal-700 font-bold' : 'text-rose-600 font-bold'
                            }
                          >
                            {item.availableQuantity}
                          </span>
                        </td>

                        <td className="p-3.5">
                          {item.status === 'available' ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-teal-50 text-teal-700 border border-teal-200">
                              พร้อมใช้งาน
                            </span>
                          ) : item.status === 'maintenance' ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                              ซ่อมบำรุง
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                              งดให้บริการ
                            </span>
                          )}
                        </td>

                        <td className="p-3.5 pr-5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => {
                                setEditingEquipment(item);
                                setEquipmentModalOpen(true);
                              }}
                              className="p-1.5 text-slate-500 hover:text-teal-700 hover:bg-teal-50 rounded-lg transition-colors"
                              title="แก้ไขข้อมูลอุปกรณ์"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteEquipment(item)}
                              className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                              title="ลบอุปกรณ์"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 4: ADMIN ROLE MANAGEMENT */}
      {adminSubTab === 'admins' && (
        <div className="animate-in fade-in duration-200 max-w-3xl mx-auto">
          <AdminRoleManager />
        </div>
      )}

      {/* Modals */}
      <EquipmentFormModal
        isOpen={equipmentModalOpen}
        onClose={() => setEquipmentModalOpen(false)}
        onSave={handleSaveEquipment}
        initialData={editingEquipment}
      />

      <ReturnModal
        booking={activeBookingForReturn}
        isOpen={returnModalOpen}
        onClose={() => {
          setReturnModalOpen(false);
          setActiveBookingForReturn(null);
        }}
        onConfirm={handleConfirmReturn}
      />

      <RejectModal
        booking={activeBookingForReject}
        isOpen={rejectModalOpen}
        onClose={() => {
          setRejectModalOpen(false);
          setActiveBookingForReject(null);
        }}
        onConfirm={handleConfirmReject}
      />
    </div>
  );
};
