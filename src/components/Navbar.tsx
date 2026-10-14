import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Video,
  Layers,
  Clock,
  ShieldCheck,
  LogIn,
  LogOut,
  User,
  Menu,
  X,
  Sparkles,
} from 'lucide-react';

interface NavbarProps {
  currentTab: 'catalog' | 'my-bookings' | 'admin';
  setCurrentTab: (tab: 'catalog' | 'my-bookings' | 'admin') => void;
  onOpenProfile: () => void;
  myActiveBookingsCount: number;
  pendingRequestsCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  onOpenProfile,
  myActiveBookingsCount,
  pendingRequestsCount,
}) => {
  const { currentUser, profile, isAdmin, signInWithGoogle, logOut, loading } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-teal-100 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18">
          {/* Logo & Department Branding */}
          <div
            className="flex items-center gap-3 cursor-pointer select-none"
            onClick={() => setCurrentTab('catalog')}
          >
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-teal-600 via-teal-500 to-cyan-500 flex items-center justify-center text-white shadow-md shadow-teal-500/20">
              <Video className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg text-slate-900 tracking-tight">
                  ระบบยืม-คืนอุปกรณ์
                </span>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-teal-50 text-teal-800 border border-teal-200">
                  เทคโนโลยีการศึกษา
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">
                Educational Technology Equipment Borrowing System
              </p>
            </div>
          </div>

          {/* Desktop Navigation Navigation */}
          <nav className="hidden md:flex items-center gap-1.5">
            <button
              onClick={() => setCurrentTab('catalog')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                currentTab === 'catalog'
                  ? 'bg-teal-50 text-teal-700 shadow-xs ring-1 ring-teal-300'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
              }`}
            >
              <Layers className="w-4 h-4 text-teal-600" />
              <span>รายการอุปกรณ์</span>
            </button>

            {currentUser && (
              <button
                onClick={() => setCurrentTab('my-bookings')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                  currentTab === 'my-bookings'
                    ? 'bg-teal-50 text-teal-700 shadow-xs ring-1 ring-teal-300'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                }`}
              >
                <Clock className="w-4 h-4 text-teal-600" />
                <span>การจองของฉัน</span>
                {myActiveBookingsCount > 0 && (
                  <span className="ml-1 px-1.5 py-0.2 rounded-full text-xs font-bold bg-teal-600 text-white">
                    {myActiveBookingsCount}
                  </span>
                )}
              </button>
            )}

            {isAdmin && (
              <button
                onClick={() => setCurrentTab('admin')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                  currentTab === 'admin'
                    ? 'bg-teal-700 text-white shadow-xs'
                    : 'text-teal-800 bg-teal-50/80 hover:bg-teal-100'
                }`}
              >
                <ShieldCheck className="w-4 h-4" />
                <span>แอดมิน / จัดการ</span>
                {pendingRequestsCount > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full text-xs font-bold bg-amber-400 text-amber-950 animate-pulse">
                    {pendingRequestsCount}
                  </span>
                )}
              </button>
            )}
          </nav>

          {/* User Profile / Auth Area */}
          <div className="flex items-center gap-3">
            {loading ? (
              <div className="w-8 h-8 rounded-full border-2 border-teal-500 border-t-transparent animate-spin" />
            ) : currentUser ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={onOpenProfile}
                  className="flex items-center gap-2.5 p-1.5 sm:px-3 sm:py-1.5 rounded-full hover:bg-slate-100 transition-colors border border-slate-200 text-left"
                  title="แก้ไขข้อมูลโปรไฟล์"
                >
                  {currentUser.photoURL ? (
                    <img
                      src={currentUser.photoURL}
                      alt={currentUser.displayName || 'User'}
                      className="w-8 h-8 rounded-full object-cover ring-2 ring-teal-300"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center font-bold text-sm">
                      {currentUser.displayName?.[0] || 'U'}
                    </div>
                  )}
                  <div className="hidden sm:block text-left">
                    <div className="text-xs font-semibold text-slate-800 truncate max-w-[130px]">
                      {profile?.displayName || currentUser.displayName}
                    </div>
                    <div className="text-[11px] text-teal-600 flex items-center gap-1 font-medium">
                      {isAdmin ? 'ผู้ดูแลระบบ (Admin)' : 'ผู้ใช้ทั่วไป'}
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => logOut()}
                  className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                  title="ออกจากระบบ"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => signInWithGoogle()}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 shadow-md shadow-teal-600/20 active:scale-95 transition-all"
              >
                <LogIn className="w-4 h-4" />
                <span>เข้าสู่ระบบด้วย Google</span>
              </button>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-100 bg-white px-4 pt-3 pb-5 space-y-2">
          <button
            onClick={() => {
              setCurrentTab('catalog');
              setMobileMenuOpen(false);
            }}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium ${
              currentTab === 'catalog'
                ? 'bg-teal-50 text-teal-700 font-semibold'
                : 'text-slate-700 hover:bg-slate-50'
            }`}
          >
            <Layers className="w-4 h-4 text-teal-600" />
            <span>รายการอุปกรณ์ทั้งหมด</span>
          </button>

          {currentUser && (
            <button
              onClick={() => {
                setCurrentTab('my-bookings');
                setMobileMenuOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium ${
                currentTab === 'my-bookings'
                  ? 'bg-teal-50 text-teal-700 font-semibold'
                  : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-3">
                <Clock className="w-4 h-4 text-teal-600" />
                <span>การจองของฉัน</span>
              </div>
              {myActiveBookingsCount > 0 && (
                <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-teal-600 text-white">
                  {myActiveBookingsCount}
                </span>
              )}
            </button>
          )}

          {isAdmin && (
            <button
              onClick={() => {
                setCurrentTab('admin');
                setMobileMenuOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium ${
                currentTab === 'admin'
                  ? 'bg-teal-700 text-white font-semibold'
                  : 'text-teal-800 bg-teal-50'
              }`}
            >
              <div className="flex items-center gap-3">
                <ShieldCheck className="w-4 h-4" />
                <span>ระบบแอดมิน / จัดการอุปกรณ์และคำขอ</span>
              </div>
              {pendingRequestsCount > 0 && (
                <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-400 text-amber-950">
                  {pendingRequestsCount}
                </span>
              )}
            </button>
          )}

          {currentUser && (
            <button
              onClick={() => {
                onOpenProfile();
                setMobileMenuOpen(false);
              }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-700 hover:bg-slate-50 border-t border-slate-100 mt-2"
            >
              <User className="w-4 h-4 text-slate-500" />
              <span>ข้อมูลโปรไฟล์ของฉัน</span>
            </button>
          )}
        </div>
      )}
    </header>
  );
};
