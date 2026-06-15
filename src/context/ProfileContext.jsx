import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from '../config/api.config';
import AuthContext from './AuthContext';

const ProfileContext = createContext(null);

export function ProfileProvider({ children }) {
  const { user, token, updateUser } = useContext(AuthContext);
  const [profileData, setProfileData] = useState({
    username: user?.username || '',
    email: user?.email || '',
    role: user?.role || '',
    avatar: user?.avatar || '',
    logo: '',
    isProfileCompleted: user?.isProfileCompleted ?? true,
    googleId: user?.googleId || null,
  });
  const [loading, setLoading] = useState(false);
  const [hasFetched, setHasFetched] = useState(false);

  const fetchProfile = useCallback(async () => {
    if (!token) return;
    try {
      setLoading(true);
      const res = await axios.get('/api/v1/users/profile');
      const u = res.data.user || {};
      const p = res.data.profile || {};

      const newData = {
        username: u.username || user?.username || '',
        email: u.email || user?.email || '',
        role: u.role || user?.role || '',
        avatar: u.avatar || '',
        logo: p.logo || '',
        isProfileCompleted: u.isProfileCompleted ?? true,
        googleId: u.googleId || null,
      };

      setProfileData(newData);

      // Sync to AuthContext
      updateUser({
        username: newData.username,
        email: newData.email,
        avatar: newData.avatar,
        isProfileCompleted: newData.isProfileCompleted,
        googleId: newData.googleId,
      });
    } catch (err) {
      console.error('ProfileContext: failed to fetch profile', err);
    } finally {
      setLoading(false);
      setHasFetched(true);
    }
  }, [token, user?.username, user?.email, user?.role, updateUser]);

  // Fetch once on mount if authenticated
  useEffect(() => {
    if (token && !hasFetched) {
      fetchProfile();
    }
  }, [token, hasFetched, fetchProfile]);

  // Optimistic update — merge new data into local state + sync to AuthContext
  const updateProfile = useCallback((newData) => {
    setProfileData(prev => {
      const merged = { ...prev, ...newData };
      // If logo was updated, add cache-buster
      if (newData.logo && newData.logo !== prev.logo) {
        merged.logo = newData.logo.split('?')[0] + '?v=' + Date.now();
      }
      return merged;
    });

    // Sync relevant fields to AuthContext
    const authFields = {};
    if (newData.username) authFields.username = newData.username;
    if (newData.email) authFields.email = newData.email;
    if (newData.avatar !== undefined) authFields.avatar = newData.avatar;
    if (newData.isProfileCompleted !== undefined) authFields.isProfileCompleted = newData.isProfileCompleted;
    if (Object.keys(authFields).length > 0) {
      updateUser(authFields);
    }
  }, [updateUser]);

  const value = {
    profileData,
    loading,
    updateProfile,
    refreshProfile: fetchProfile,
  };

  return (
    <ProfileContext.Provider value={value}>
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  const ctx = useContext(ProfileContext);
  if (!ctx) {
    throw new Error('useProfile must be used within a ProfileProvider');
  }
  return ctx;
}

export default ProfileContext;
