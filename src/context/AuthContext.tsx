import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import {
  User as FirebaseUser,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
} from 'firebase/auth';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  onSnapshot,
  deleteDoc,
} from 'firebase/firestore';
import { auth, db, googleProvider, handleFirestoreError, OperationType } from '../firebase';
import { UserProfile, AdminRecord } from '../types';

const BOOTSTRAP_ADMIN_EMAIL = 'dream27326@gmail.com';

interface AuthContextType {
  currentUser: FirebaseUser | null;
  profile: UserProfile | null;
  isAdmin: boolean;
  loading: boolean;
  adminEmails: string[];
  authError: string | null;
  clearAuthError: () => void;
  signInWithGoogle: () => Promise<void>;
  logOut: () => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
  addAdmin: (email: string) => Promise<void>;
  removeAdmin: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [adminEmails, setAdminEmails] = useState<string[]>([BOOTSTRAP_ADMIN_EMAIL]);
  const [authError, setAuthError] = useState<string | null>(null);

  const adminEmailsRef = useRef<string[]>([BOOTSTRAP_ADMIN_EMAIL]);

  // Subscribe to admins collection
  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, 'admins'),
      (snapshot) => {
        const emails: string[] = [BOOTSTRAP_ADMIN_EMAIL];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          if (data.email && !emails.includes(data.email.toLowerCase())) {
            emails.push(data.email.toLowerCase());
          }
        });
        setAdminEmails(emails);
        adminEmailsRef.current = emails;

        // Re-check admin status for current user
        if (auth.currentUser?.email) {
          const userEmail = auth.currentUser.email.toLowerCase();
          const userIsAdmin = userEmail === BOOTSTRAP_ADMIN_EMAIL || emails.includes(userEmail);
          setIsAdmin(userIsAdmin);
        }
      },
      (error) => {
        console.warn('Admins listener notice:', error);
      }
    );
    return () => unsub();
  }, []);

  // Listen to Auth State once on mount
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user);
        const userEmail = (user.email || '').toLowerCase();
        const userIsAdmin =
          userEmail === BOOTSTRAP_ADMIN_EMAIL ||
          adminEmailsRef.current.includes(userEmail);
        setIsAdmin(userIsAdmin);

        // Fallback default profile immediately so UI does not flicker or bounce
        const fallbackProfile: UserProfile = {
          id: user.uid,
          email: user.email || '',
          displayName: user.displayName || 'ผู้ใช้งาน',
          photoURL: user.photoURL || '',
          phoneNumber: user.phoneNumber || '',
          studentOrStaffId: '',
          department: 'ภาควิชาเทคโนโลยีการศึกษา',
          role: userIsAdmin ? 'admin' : 'user',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        // Fetch or create user profile in Firestore
        const userDocRef = doc(db, 'users', user.uid);
        try {
          const docSnap = await getDoc(userDocRef);
          if (docSnap.exists()) {
            const data = docSnap.data() as UserProfile;
            if (userIsAdmin && data.role !== 'admin') {
              updateDoc(userDocRef, { role: 'admin', updatedAt: new Date().toISOString() }).catch(() => {});
              setProfile({ ...data, role: 'admin' });
            } else {
              setProfile(data);
            }
          } else {
            // Document does not exist, create it
            await setDoc(userDocRef, fallbackProfile);
            setProfile(fallbackProfile);
          }
        } catch (err) {
          console.warn('Profile read/create notice, using auth profile:', err);
          setProfile(fallbackProfile);
        }
      } else {
        setCurrentUser(null);
        setProfile(null);
        setIsAdmin(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    try {
      setAuthError(null);
      await signInWithPopup(auth, googleProvider);
    } catch (error: any) {
      console.error('Google Sign-in error:', error);
      let message = 'เกิดข้อผิดพลาดในการลงชื่อเข้าใช้ด้วย Google';
      if (error?.code === 'auth/popup-blocked') {
        message = 'เบราว์เซอร์บล็อกหน้าต่างป็อปอัป (Popup Blocked) กรุณากดอนุญาตให้เปิดหน้าต่างป็อปอัปสำหรับเว็บไซต์นี้';
      } else if (error?.code === 'auth/popup-closed-by-user') {
        message = 'หน้าต่างลงชื่อเข้าใช้ถูกปิดก่อนทำรายการเสร็จสิ้น';
      } else if (error?.code === 'auth/unauthorized-domain') {
        message = 'โดเมนนี้ยังไม่ได้รับอนุญาตใน Firebase Auth Console (กรุณาเพิ่มโดเมนใน Authorized Domains)';
      } else if (error?.message) {
        message = error.message;
      }
      setAuthError(message);
      throw error;
    }
  };

  const logOut = async () => {
    try {
      setAuthError(null);
      await signOut(auth);
      setCurrentUser(null);
      setProfile(null);
      setIsAdmin(false);
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  };

  const updateProfile = async (data: Partial<UserProfile>) => {
    if (!currentUser) return;
    const userDocRef = doc(db, 'users', currentUser.uid);
    try {
      const updatePayload = {
        ...data,
        updatedAt: new Date().toISOString(),
      };
      await updateDoc(userDocRef, updatePayload);
      setProfile((prev) => (prev ? { ...prev, ...updatePayload } : null));
    } catch (error) {
      console.error('Update profile error:', error);
      // Still update local profile state
      setProfile((prev) => (prev ? { ...prev, ...data } : null));
    }
  };

  const addAdmin = async (newEmail: string) => {
    const cleanEmail = newEmail.trim().toLowerCase();
    if (!cleanEmail) return;
    const adminDocRef = doc(db, 'admins', cleanEmail.replace(/[@.]/g, '_'));
    try {
      const record: AdminRecord = {
        id: cleanEmail.replace(/[@.]/g, '_'),
        email: cleanEmail,
        addedBy: currentUser?.email || 'admin',
        createdAt: new Date().toISOString(),
      };
      await setDoc(adminDocRef, record);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `admins/${cleanEmail}`);
    }
  };

  const removeAdmin = async (adminEmail: string) => {
    const cleanEmail = adminEmail.trim().toLowerCase();
    if (cleanEmail === BOOTSTRAP_ADMIN_EMAIL) {
      throw new Error('ไม่สามารถลบอีเมลผู้ดูแลระบบเริ่มต้นได้');
    }
    const adminDocRef = doc(db, 'admins', cleanEmail.replace(/[@.]/g, '_'));
    try {
      await deleteDoc(adminDocRef);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `admins/${cleanEmail}`);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        profile,
        isAdmin,
        loading,
        adminEmails,
        authError,
        clearAuthError: () => setAuthError(null),
        signInWithGoogle,
        logOut,
        updateProfile,
        addAdmin,
        removeAdmin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
