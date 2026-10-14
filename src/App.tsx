import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { EquipmentCatalog } from './components/EquipmentCatalog';
import { MyBookings } from './components/MyBookings';
import { AdminPanel } from './components/AdminPanel';
import { BorrowModal } from './components/BorrowModal';
import { EquipmentDetailModal } from './components/EquipmentDetailModal';
import { ProfileModal } from './components/ProfileModal';
import { subscribeToEquipment } from './services/equipmentService';
import {
  subscribeToUserBookings,
  subscribeToAllBookings,
} from './services/bookingService';
import { Equipment, Booking } from './types';
import {
  Video,
  Shield,
  Layers,
  Clock,
  MapPin,
  Phone,
  Mail,
  Building,
  Heart,
} from 'lucide-react';

function AppContent() {
  const { currentUser, isAdmin, loading: authLoading } = useAuth();

  const [currentTab, setCurrentTab] = useState<'catalog' | 'my-bookings' | 'admin'>('catalog');

  // Equipment state
  const [equipmentList, setEquipmentList] = useState<Equipment[]>([]);
  const [loadingEquipment, setLoadingEquipment] = useState(true);

  // Bookings state
  const [userBookings, setUserBookings] = useState<Booking[]>([]);
  const [allBookings, setAllBookings] = useState<Booking[]>([]);
  const [loadingUserBookings, setLoadingUserBookings] = useState(true);
  const [loadingAllBookings, setLoadingAllBookings] = useState(true);

  // Modals
  const [selectedBorrowEquipment, setSelectedBorrowEquipment] = useState<Equipment | null>(null);
  const [borrowModalOpen, setBorrowModalOpen] = useState(false);

  const [selectedDetailEquipment, setSelectedDetailEquipment] = useState<Equipment | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);

  const [profileModalOpen, setProfileModalOpen] = useState(false);

  // Subscribe to Equipment (public)
  useEffect(() => {
    const unsub = subscribeToEquipment(
      (items) => {
        setEquipmentList(items);
        setLoadingEquipment(false);
      },
      () => {
        setLoadingEquipment(false);
      }
    );
    return () => unsub();
  }, []);

  // Subscribe to user bookings
  useEffect(() => {
    if (!currentUser) {
      setUserBookings([]);
      setLoadingUserBookings(false);
      return;
    }

    const unsub = subscribeToUserBookings(
      currentUser.uid,
      (bookings) => {
        setUserBookings(bookings);
        setLoadingUserBookings(false);
      },
      () => {
        setLoadingUserBookings(false);
      }
    );
    return () => unsub();
  }, [currentUser]);

  // Subscribe to all bookings (for Admin)
  useEffect(() => {
    if (!currentUser || !isAdmin) {
      setAllBookings([]);
      setLoadingAllBookings(false);
      return;
    }

    const unsub = subscribeToAllBookings(
      (bookings) => {
        setAllBookings(bookings);
        setLoadingAllBookings(false);
      },
      () => {
        setLoadingAllBookings(false);
      }
    );
    return () => unsub();
  }, [currentUser, isAdmin]);

  const myActiveCount = userBookings.filter(
    (b) => b.status === 'pending' || b.status === 'approved'
  ).length;

  const pendingAdminCount = allBookings.filter((b) => b.status === 'pending').length;

  const handleOpenBorrow = (item: Equipment) => {
    setSelectedBorrowEquipment(item);
    setBorrowModalOpen(true);
  };

  const handleOpenDetail = (item: Equipment) => {
    setSelectedDetailEquipment(item);
    setDetailModalOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800">
      {/* Navigation Header */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        onOpenProfile={() => setProfileModalOpen(true)}
        myActiveBookingsCount={myActiveCount}
        pendingRequestsCount={pendingAdminCount}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {currentTab === 'catalog' && (
          <EquipmentCatalog
            equipmentList={equipmentList}
            loading={loadingEquipment}
            onSelectToBorrow={handleOpenBorrow}
            onViewDetails={handleOpenDetail}
          />
        )}

        {currentTab === 'my-bookings' && (
          <MyBookings
            bookings={userBookings}
            loading={loadingUserBookings}
            onExploreEquipment={() => setCurrentTab('catalog')}
          />
        )}

        {currentTab === 'admin' && (
          <>
            {isAdmin ? (
              <AdminPanel
                equipmentList={equipmentList}
                allBookings={allBookings}
                loadingEquipment={loadingEquipment}
                loadingBookings={loadingAllBookings}
              />
            ) : (
              <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 max-w-md mx-auto space-y-4">
                <Shield className="w-12 h-12 text-rose-500 mx-auto" />
                <h3 className="text-lg font-bold text-slate-900">พื้นที่สำหรับผู้ดูแลระบบ</h3>
                <p className="text-xs text-slate-500">
                  คุณไม่มีสิทธิ์เข้าถึงส่วนงานแอดมิน หากคุณเป็นอาจารย์หรือเจ้าหน้าที่ กรุณาติดต่อผู้ดูแลระบบหลักเพื่อเพิ่มสิทธิ์ให้บัญชีของคุณ
                </p>
                <button
                  onClick={() => setCurrentTab('catalog')}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700"
                >
                  กลับหน้ารายการอุปกรณ์
                </button>
              </div>
            )}
          </>
        )}
      </main>

      {/* Modals */}
      <BorrowModal
        equipment={selectedBorrowEquipment}
        isOpen={borrowModalOpen}
        onClose={() => {
          setBorrowModalOpen(false);
          setSelectedBorrowEquipment(null);
        }}
        onSuccess={() => {
          setBorrowModalOpen(false);
          setSelectedBorrowEquipment(null);
          setCurrentTab('my-bookings');
        }}
      />

      <EquipmentDetailModal
        equipment={selectedDetailEquipment}
        isOpen={detailModalOpen}
        onClose={() => {
          setDetailModalOpen(false);
          setSelectedDetailEquipment(null);
        }}
        onBorrow={handleOpenBorrow}
      />

      <ProfileModal
        isOpen={profileModalOpen}
        onClose={() => setProfileModalOpen(false)}
      />

      {/* Footer */}
      <footer className="mt-auto bg-white border-t border-teal-100 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-teal-600 text-white flex items-center justify-center font-bold">
                  <Video className="w-4 h-4" />
                </div>
                <span className="font-bold text-slate-800 text-sm">
                  ภาควิชาเทคโนโลยีการศึกษา
                </span>
              </div>
              <p className="text-slate-500 leading-relaxed">
                ระบบยืม-คืนอุปกรณ์และโสตทัศนูปกรณ์ เพื่อสนับสนุนการเรียนรู้ การผลิตสื่อการศึกษา และการสร้างสรรค์นวัตกรรม
              </p>
            </div>

            <div className="space-y-1.5">
              <h5 className="font-bold text-slate-700 text-xs uppercase tracking-wider mb-2">
                สถานที่ติดต่อและเวลารับ-คืน
              </h5>
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                <span>ห้องปฏิบัติการเทคโนโลยีการศึกษา (ห้อง 402) อาคารเรียนรวม</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-teal-600 shrink-0" />
                <span>วันจันทร์ - วันศุกร์ เวลา 08:30 - 16:30 น. (เว้นวันหยุดราชการ)</span>
              </div>
            </div>

            <div className="space-y-1.5">
              <h5 className="font-bold text-slate-700 text-xs uppercase tracking-wider mb-2">
                ช่องทางติดต่อเจ้าหน้าที่
              </h5>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-teal-600 shrink-0" />
                <span>02-123-4567 ต่อ 402</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-teal-600 shrink-0" />
                <span>edtech.borrowing@university.ac.th</span>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-2 text-slate-400 text-[11px]">
            <span>© {new Date().getFullYear()} ภาควิชาเทคโนโลยีการศึกษา. สงวนลิขสิทธิ์ทั้งหมด.</span>
            <span>ระบบฐานข้อมูล Cloud Firestore & Google Authentication</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
