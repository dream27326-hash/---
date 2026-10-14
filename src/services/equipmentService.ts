import {
  collection,
  onSnapshot,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  writeBatch,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { Equipment } from '../types';
import { SAMPLE_EQUIPMENT_DATA } from '../data/sampleEquipment';

const EQUIPMENT_COLLECTION = 'equipment';

export const subscribeToEquipment = (
  onSuccess: (equipment: Equipment[]) => void,
  onError?: (error: unknown) => void
) => {
  const q = query(collection(db, EQUIPMENT_COLLECTION), orderBy('code', 'asc'));
  return onSnapshot(
    q,
    (snapshot) => {
      const list: Equipment[] = [];
      snapshot.forEach((docSnap) => {
        list.push({ id: docSnap.id, ...(docSnap.data() as Omit<Equipment, 'id'>) });
      });
      onSuccess(list);
    },
    (error) => {
      console.warn('Subscribe equipment notice:', error);
      onError?.(error);
    }
  );
};

export const createEquipment = async (
  item: Omit<Equipment, 'id' | 'createdAt' | 'updatedAt'>
): Promise<string> => {
  try {
    const newDocRef = doc(collection(db, EQUIPMENT_COLLECTION));
    const now = new Date().toISOString();
    const payload: Equipment = {
      ...item,
      id: newDocRef.id,
      createdAt: now,
      updatedAt: now,
    };
    await setDoc(newDocRef, payload);
    return newDocRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, EQUIPMENT_COLLECTION);
    throw error;
  }
};

export const updateEquipment = async (
  id: string,
  updates: Partial<Equipment>
): Promise<void> => {
  try {
    const docRef = doc(db, EQUIPMENT_COLLECTION, id);
    const payload = {
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    await updateDoc(docRef, payload);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `${EQUIPMENT_COLLECTION}/${id}`);
    throw error;
  }
};

export const deleteEquipment = async (id: string): Promise<void> => {
  try {
    const docRef = doc(db, EQUIPMENT_COLLECTION, id);
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `${EQUIPMENT_COLLECTION}/${id}`);
    throw error;
  }
};

export const seedDefaultEquipmentData = async (): Promise<number> => {
  try {
    const batch = writeBatch(db);
    const now = new Date().toISOString();
    let count = 0;

    for (const sample of SAMPLE_EQUIPMENT_DATA) {
      const newDocRef = doc(collection(db, EQUIPMENT_COLLECTION));
      const payload: Equipment = {
        ...sample,
        id: newDocRef.id,
        createdAt: now,
        updatedAt: now,
      };
      batch.set(newDocRef, payload);
      count++;
    }

    await batch.commit();
    return count;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, EQUIPMENT_COLLECTION);
    throw error;
  }
};
