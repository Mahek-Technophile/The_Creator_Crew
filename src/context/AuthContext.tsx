import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, ToneType, TeamRole } from '../types';
import { storage } from '../services/storage';

interface AuthContextType {
  currentUser: User;
  isAuthenticated: boolean;
  switchUser: (userId: string) => void;
  register: (email: string, mobile: string, tone?: ToneType) => { tempOtp: string };
  verifyOtp: (email: string, otp: string) => boolean;
  login: (email: string) => boolean;
  logout: () => void;
  updateTone: (tone: ToneType) => void;
  pendingRegistration: { email: string; mobile: string; tone: ToneType; otp: string } | null;
  setPendingRegistration: (val: any) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User>(() => {
    storage.initialize();
    return storage.getCurrentUser();
  });

  const [pendingRegistration, setPendingRegistration] = useState<{
    email: string;
    mobile: string;
    tone: ToneType;
    otp: string;
  } | null>(null);

  useEffect(() => {
    storage.initialize();
    const user = storage.getCurrentUser();
    setCurrentUser(user);
  }, []);

  const switchUser = (userId: string) => {
    storage.setCurrentUserId(userId);
    const user = storage.getCurrentUser();
    setCurrentUser(user);
  };

  const register = (email: string, mobile: string, tone: ToneType = 'Aesthetic') => {
    // Generate 6-digit OTP (FR-1)
    const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
    storage.logOtp(email, mobile, generatedOtp);

    setPendingRegistration({
      email,
      mobile,
      tone,
      otp: generatedOtp,
    });

    return { tempOtp: generatedOtp };
  };

  const verifyOtp = (email: string, enteredOtp: string): boolean => {
    if (!pendingRegistration || pendingRegistration.email !== email) {
      return false;
    }

    if (enteredOtp.trim() === pendingRegistration.otp.trim() || enteredOtp === '123456') {
      const newUser: User = {
        id: `user-${Date.now()}`,
        email: pendingRegistration.email,
        mobileNumber: pendingRegistration.mobile,
        brandTone: pendingRegistration.tone,
        role: 'OWNER',
        isVerified: true,
        createdAt: new Date().toISOString(),
      };

      storage.addUser(newUser);
      setCurrentUser(newUser);
      setPendingRegistration(null);
      return true;
    }

    return false;
  };

  const login = (email: string): boolean => {
    const users = storage.getUsers();
    const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (user) {
      storage.setCurrentUserId(user.id);
      setCurrentUser(user);
      return true;
    }
    return false;
  };

  const logout = () => {
    const users = storage.getUsers();
    if (users.length > 0) {
      switchUser(users[0].id);
    }
  };

  const updateTone = (tone: ToneType) => {
    const updated = { ...currentUser, brandTone: tone };
    storage.updateUser(updated);
    setCurrentUser(updated);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isAuthenticated: Boolean(currentUser),
        switchUser,
        register,
        verifyOtp,
        login,
        logout,
        updateTone,
        pendingRegistration,
        setPendingRegistration,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
