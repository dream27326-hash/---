import React, { createContext, useContext, useEffect, useState } from 'react';
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
import { UserProfile, Role, AdminRecord } from '../types';

const BOOTSTRAP_ADMIN_EMAIL = 'dream27326@gmail.com';

interface AuthContextType {
  currentUser: FirebaseUser | null;
  profile: UserProfile | null;
  isAdmin: boolean;
  loading: boolean;
  adminEmails: string[];
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

  // Listen to admins collection
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
      },
      (error) => {
        console.warn('Admins listener error (may be non-admin access):', error);
      }
    );
    return () => unsub();
  }, []);

  // Listen to Auth State
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setLoading(true);
      if (user) {
        setCurrentUser(user);
        const userEmail = (user.email || '').toLowerCase();
        const userIsAdmin = userEmail === BOOTSTRAP_ADMIN_EMAIL || adminEmails.includes(userEmail);
        setIsAdmin(userIsAdmin);

        // Fetch or create user profile
        const userDocRef = doc(db, 'users', user.uid);
        try {
          const docSnap = await getDoc(userDocRef);
          if (docSnap.exists()) {
            const data = docSnap.data() as UserProfile;
            // Update admin role in profile if matched
            if (userIsAdmin && data.role !== 'admin') {
              await updateDoc(userDocRef, { role: 'admin', updatedAt: new Date().toISOString() });
              setProfile({ ...data, role: 'admin' });
            } else {
              setProfile(data);
            }
          } else {
            // Create initial profile
            const newProfile: UserProfile = {
              id: user.uid,
              email: user.email || '',
              displayName: user.displayName || 'ผู้ใช้งานเทคโนโลยีการศึกษา',
              photoURL: user.photoURL || '',
              phoneNumber: user.phoneNumber || '',
              studentOrStaffId: '',
              department: 'ภาควิชาเทคโนโลยีการศึกษา',
              role: userIsAdmin ? 'admin' : 'user',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            };
            await setDoc(userDocRef, newProfile);
            setProfile(newProfile);
          }
        } catch (err) {
          console.error('Error fetching/creating profile:', err);
          handleFirestoreError(err, OperationType.GET, `users/${user.uid}`);
        }
      } else {
        setCurrentUser(null);
        setProfile(null);
        setIsAdmin(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [adminEmails]);

  const signInWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const logOut = async () => {
    try {
      await signOut(auth);
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
      handleFirestoreError(error, OperationType.UPDATE, `users/${currentUser.uid}`);
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
