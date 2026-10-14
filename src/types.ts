export type Role = 'admin' | 'user';

export interface UserProfile {
  id: string;
  email: string;
  displayName: string;
  photoURL?: string;
  phoneNumber?: string;
  studentOrStaffId?: string;
  department?: string;
  role: Role;
  createdAt?: string;
  updatedAt?: string;
}

export type EquipmentCategory =
  | 'กล้องถ่ายภาพและวิดีโอ'
  | 'ไมโครโฟนและอุปกรณ์เสียง'
  | 'ขาตั้งกล้องและกิมบอล'
  | 'โปรเจกเตอร์และจอภาพ'
  | 'อุปกรณ์ไฟสตูดิโอ'
  | 'แท็บเล็ตและคอมพิวเตอร์'
  | 'อุปกรณ์เสริมและสายสัญญาณ'
  | 'อื่นๆ';

export type EquipmentStatus = 'available' | 'maintenance' | 'inactive';

export interface Equipment {
  id: string;
  code: string;
  name: string;
  category: EquipmentCategory;
  totalQuantity: number;
  availableQuantity: number;
  status: EquipmentStatus;
  imageUrl: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export type BookingStatus = 'pending' | 'approved' | 'returned' | 'rejected' | 'cancelled';
export type ReturnCondition = 'normal' | 'damaged' | 'lost';

export interface Booking {
  id: string;
  bookingCode: string;
  userId: string;
  userName: string;
  userEmail: string;
  userPhone: string;
  userStudentId: string;
  equipmentId: string;
  equipmentName: string;
  equipmentCode: string;
  quantity: number;
  startDate: string;
  endDate: string;
  purpose: string;
  status: BookingStatus;
  rejectionReason?: string;
  returnCondition?: ReturnCondition;
  returnNotes?: string;
  approvedBy?: string;
  approvedAt?: string;
  returnedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AdminRecord {
  id: string;
  email: string;
  addedBy?: string;
  createdAt: string;
}
