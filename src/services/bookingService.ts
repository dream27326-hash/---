import {
  collection,
  onSnapshot,
  doc,
  setDoc,
  updateDoc,
  query,
  where,
  orderBy,
  runTransaction,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { Booking, ReturnCondition } from '../types';

const BOOKINGS_COLLECTION = 'bookings';
const EQUIPMENT_COLLECTION = 'equipment';

export const subscribeToUserBookings = (
  userId: string,
  onSuccess: (bookings: Booking[]) => void,
  onError?: (error: unknown) => void
) => {
  const q = query(
    collection(db, BOOKINGS_COLLECTION),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const list: Booking[] = [];
      snapshot.forEach((docSnap) => {
        list.push({ id: docSnap.id, ...(docSnap.data() as Omit<Booking, 'id'>) });
      });
      onSuccess(list);
    },
    (error) => {
      console.error('Subscribe user bookings error:', error);
      onError?.(error);
      handleFirestoreError(error, OperationType.LIST, BOOKINGS_COLLECTION);
    }
  );
};

export const subscribeToAllBookings = (
  onSuccess: (bookings: Booking[]) => void,
  onError?: (error: unknown) => void
) => {
  const q = query(collection(db, BOOKINGS_COLLECTION), orderBy('createdAt', 'desc'));

  return onSnapshot(
    q,
    (snapshot) => {
      const list: Booking[] = [];
      snapshot.forEach((docSnap) => {
        list.push({ id: docSnap.id, ...(docSnap.data() as Omit<Booking, 'id'>) });
      });
      onSuccess(list);
    },
    (error) => {
      console.error('Subscribe all bookings error:', error);
      onError?.(error);
      handleFirestoreError(error, OperationType.LIST, BOOKINGS_COLLECTION);
    }
  );
};

export const createBookingRequest = async (
  data: Omit<Booking, 'id' | 'bookingCode' | 'status' | 'createdAt' | 'updatedAt'>
): Promise<string> => {
  try {
    const newDocRef = doc(collection(db, BOOKINGS_COLLECTION));
    const now = new Date().toISOString();
    const shortCode = 'EDT-' + Math.random().toString(36).substring(2, 8).toUpperCase();

    const payload: Booking = {
      ...data,
      id: newDocRef.id,
      bookingCode: shortCode,
      status: 'pending',
      createdAt: now,
      updatedAt: now,
    };

    await setDoc(newDocRef, payload);
    return newDocRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, BOOKINGS_COLLECTION);
    throw error;
  }
};

export const cancelBookingRequest = async (bookingId: string): Promise<void> => {
  try {
    const docRef = doc(db, BOOKINGS_COLLECTION, bookingId);
    await updateDoc(docRef, {
      status: 'cancelled',
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `${BOOKINGS_COLLECTION}/${bookingId}`);
    throw error;
  }
};

export const approveBookingRequest = async (
  bookingId: string,
  equipmentId: string,
  quantity: number,
  adminEmail: string
): Promise<void> => {
  try {
    await runTransaction(db, async (transaction) => {
      const bookingRef = doc(db, BOOKINGS_COLLECTION, bookingId);
      const equipmentRef = doc(db, EQUIPMENT_COLLECTION, equipmentId);

      const bookingSnap = await transaction.get(bookingRef);
      if (!bookingSnap.exists()) {
        throw new Error('ไม่พบข้อมูลคำขอยืม');
      }

      const equipmentSnap = await transaction.get(equipmentRef);
      if (!equipmentSnap.exists()) {
        throw new Error('ไม่พบข้อมูลอุปกรณ์');
      }

      const equipmentData = equipmentSnap.data();
      const currentAvailable = equipmentData.availableQuantity ?? 0;

      if (currentAvailable < quantity) {
        throw new Error(`อุปกรณ์คงเหลือไม่เพียงพอ (คงเหลือ ${currentAvailable} ชิ้น, ต้องการ ${quantity} ชิ้น)`);
      }

      const now = new Date().toISOString();
      transaction.update(bookingRef, {
        status: 'approved',
        approvedBy: adminEmail,
        approvedAt: now,
        updatedAt: now,
      });

      transaction.update(equipmentRef, {
        availableQuantity: Math.max(0, currentAvailable - quantity),
        updatedAt: now,
      });
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `${BOOKINGS_COLLECTION}/${bookingId}`);
    throw error;
  }
};

export const rejectBookingRequest = async (
  bookingId: string,
  reason: string,
  adminEmail: string
): Promise<void> => {
  try {
    const docRef = doc(db, BOOKINGS_COLLECTION, bookingId);
    const now = new Date().toISOString();
    await updateDoc(docRef, {
      status: 'rejected',
      rejectionReason: reason || 'ไม่ระบุเหตุผล',
      approvedBy: adminEmail,
      updatedAt: now,
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `${BOOKINGS_COLLECTION}/${bookingId}`);
    throw error;
  }
};

export const returnBookingRecord = async (
  bookingId: string,
  equipmentId: string,
  quantity: number,
  condition: ReturnCondition,
  notes: string
): Promise<void> => {
  try {
    await runTransaction(db, async (transaction) => {
      const bookingRef = doc(db, BOOKINGS_COLLECTION, bookingId);
      const equipmentRef = doc(db, EQUIPMENT_COLLECTION, equipmentId);

      const bookingSnap = await transaction.get(bookingRef);
      if (!bookingSnap.exists()) {
        throw new Error('ไม่พบข้อมูลคำขอยืม');
      }

      const equipmentSnap = await transaction.get(equipmentRef);
      const now = new Date().toISOString();

      transaction.update(bookingRef, {
        status: 'returned',
        returnCondition: condition,
        returnNotes: notes || '',
        returnedAt: now,
        updatedAt: now,
      });

      if (equipmentSnap.exists()) {
        const equipmentData = equipmentSnap.data();
        const total = equipmentData.totalQuantity ?? 0;
        const currentAvailable = equipmentData.availableQuantity ?? 0;

        // If returned in normal or damaged condition, return stock (damaged can be marked for maintenance)
        if (condition === 'lost') {
          // Lost item: do not return to available quantity, reduce total quantity
          const newTotal = Math.max(0, total - quantity);
          transaction.update(equipmentRef, {
            totalQuantity: newTotal,
            updatedAt: now,
          });
        } else if (condition === 'damaged') {
          // Damaged item: return to available or set equipment note/status
          const newAvailable = Math.min(total, currentAvailable + quantity);
          transaction.update(equipmentRef, {
            availableQuantity: newAvailable,
            updatedAt: now,
          });
        } else {
          // Normal return
          const newAvailable = Math.min(total, currentAvailable + quantity);
          transaction.update(equipmentRef, {
            availableQuantity: newAvailable,
            updatedAt: now,
          });
        }
      }
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `${BOOKINGS_COLLECTION}/${bookingId}`);
    throw error;
  }
};
