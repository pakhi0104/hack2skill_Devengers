import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured } from '../services/supabaseClient';
import type { Profile } from '../types';

interface AuthContextType {
  user: any | null;
  profile: Profile | null;
  loading: boolean;
  isMockMode: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string, name: string, additionalData?: Partial<Profile>) => Promise<{ error: string | null }>;
  signOut: () => Promise<{ error: string | null }>;
  updateProfile: (profileData: Partial<Profile>) => Promise<{ error: string | null }>;
  forgotPassword: (email: string) => Promise<{ error: string | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// LocalStorage Keys for Mock DB
const MOCK_USERS_KEY = 'schemematch_mock_users';
const MOCK_PROFILES_KEY = 'schemematch_mock_profiles';
const MOCK_SESSION_KEY = 'schemematch_mock_session';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const isMockMode = !isSupabaseConfigured;

  // Initialize Auth State
  useEffect(() => {
    if (!isMockMode && supabase) {
      // Real Supabase Auth listener
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session) {
          setUser(session.user);
          fetchProfile(session.user.id);
        } else {
          setLoading(false);
        }
      });

      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (_event, session) => {
          if (session) {
            setUser(session.user);
            await fetchProfile(session.user.id);
          } else {
            setUser(null);
            setProfile(null);
            setLoading(false);
          }
        }
      );

      return () => {
        subscription.unsubscribe();
      };
    } else {
      // Mock LocalStorage Auth
      const savedSession = localStorage.getItem(MOCK_SESSION_KEY);
      if (savedSession) {
        try {
          const sessionData = JSON.parse(savedSession);
          setUser(sessionData.user);
          fetchMockProfile(sessionData.user.id);
        } catch (e) {
          localStorage.removeItem(MOCK_SESSION_KEY);
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    }
  }, []);

  // Fetch real profile from Supabase
  const fetchProfile = async (userId: string) => {
    if (!supabase) return;
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching profile:', error.message);
        // If profile doesn't exist, create it from auth metadata
        const { data: { user: currentUser } } = await supabase.auth.getUser();
        if (currentUser) {
          const name = currentUser.user_metadata?.name || currentUser.user_metadata?.full_name || 'User';
          const newProfile = {
            id: userId,
            name,
            email: currentUser.email || '',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };
          const { error: insertError } = await supabase.from('profiles').insert([newProfile]);
          if (!insertError) setProfile(newProfile);
        }
      } else {
        setProfile(data);
      }
    } catch (err) {
      console.error('Fetch profile catch:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch mock profile from LocalStorage
  const fetchMockProfile = (userId: string) => {
    const savedProfiles = localStorage.getItem(MOCK_PROFILES_KEY);
    if (savedProfiles) {
      try {
        const profilesList: Profile[] = JSON.parse(savedProfiles);
        const userProfile = profilesList.find((p) => p.id === userId);
        if (userProfile) {
          setProfile(userProfile);
        }
      } catch (e) {
        console.error('Error parsing mock profiles', e);
      }
    }
    setLoading(false);
  };

  // Sign In implementation
  const signIn = async (email: string, password: string): Promise<{ error: string | null }> => {
    setLoading(true);
    if (!isMockMode && supabase) {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        setLoading(false);
        return { error: error.message };
      }
      return { error: null };
    } else {
      // Simulate network latency (800ms)
      await new Promise((resolve) => setTimeout(resolve, 800));
      const savedUsers = localStorage.getItem(MOCK_USERS_KEY);
      const users = savedUsers ? JSON.parse(savedUsers) : [];
      const matchedUser = users.find((u: any) => u.email.toLowerCase() === email.toLowerCase());

      if (!matchedUser) {
        setLoading(false);
        return { error: 'Invalid login credentials. User not found.' };
      }
      if (matchedUser.password !== password) {
        setLoading(false);
        return { error: 'Invalid password. Please try again.' };
      }

      const mockSession = { user: { id: matchedUser.id, email: matchedUser.email } };
      localStorage.setItem(MOCK_SESSION_KEY, JSON.stringify(mockSession));
      setUser(mockSession.user);
      fetchMockProfile(matchedUser.id);
      return { error: null };
    }
  };

  // Sign Up implementation
  const signUp = async (
    email: string,
    password: string,
    name: string,
    additionalData?: Partial<Profile>
  ): Promise<{ error: string | null }> => {
    setLoading(true);
    if (!isMockMode && supabase) {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
          },
        },
      });

      if (error) {
        setLoading(false);
        return { error: error.message };
      }

      // If signup is successful, insert additional profile parameters
      if (data.user) {
        const profilePayload = {
          id: data.user.id,
          name,
          email,
          ...additionalData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        const { error: profileError } = await supabase
          .from('profiles')
          .upsert([profilePayload]);

        if (profileError) {
          console.error('Error creating profile entry:', profileError.message);
        }
      }

      setLoading(false);
      return { error: null };
    } else {
      // Simulate network latency (800ms)
      await new Promise((resolve) => setTimeout(resolve, 800));
      const savedUsers = localStorage.getItem(MOCK_USERS_KEY);
      const users = savedUsers ? JSON.parse(savedUsers) : [];

      if (users.some((u: any) => u.email.toLowerCase() === email.toLowerCase())) {
        setLoading(false);
        return { error: 'A user with this email address already exists.' };
      }

      const newUserId = crypto.randomUUID();
      const newUser = { id: newUserId, email, password };
      users.push(newUser);
      localStorage.setItem(MOCK_USERS_KEY, JSON.stringify(users));

      // Create profile details
      const savedProfiles = localStorage.getItem(MOCK_PROFILES_KEY);
      const profiles = savedProfiles ? JSON.parse(savedProfiles) : [];
      const newProfile: Profile = {
        id: newUserId,
        name,
        email,
        ...additionalData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      profiles.push(newProfile);
      localStorage.setItem(MOCK_PROFILES_KEY, JSON.stringify(profiles));

      // Log in session immediately
      const mockSession = { user: { id: newUserId, email } };
      localStorage.setItem(MOCK_SESSION_KEY, JSON.stringify(mockSession));
      setUser(mockSession.user);
      setProfile(newProfile);
      setLoading(false);
      return { error: null };
    }
  };

  // Sign Out implementation
  const signOut = async (): Promise<{ error: string | null }> => {
    setLoading(true);
    if (!isMockMode && supabase) {
      const { error } = await supabase.auth.signOut();
      if (error) {
        setLoading(false);
        return { error: error.message };
      }
      setUser(null);
      setProfile(null);
      setLoading(false);
      return { error: null };
    } else {
      await new Promise((resolve) => setTimeout(resolve, 500));
      localStorage.removeItem(MOCK_SESSION_KEY);
      setUser(null);
      setProfile(null);
      setLoading(false);
      return { error: null };
    }
  };

  // Update Profile implementation
  const updateProfile = async (profileData: Partial<Profile>): Promise<{ error: string | null }> => {
    if (!user) return { error: 'Not authenticated' };
    
    if (!isMockMode && supabase) {
      const { error } = await supabase
        .from('profiles')
        .update({
          ...profileData,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (error) {
        return { error: error.message };
      }
      setProfile((prev) => (prev ? { ...prev, ...profileData } : null));
      return { error: null };
    } else {
      await new Promise((resolve) => setTimeout(resolve, 600));
      const savedProfiles = localStorage.getItem(MOCK_PROFILES_KEY);
      const profiles: Profile[] = savedProfiles ? JSON.parse(savedProfiles) : [];
      
      const updatedProfiles = profiles.map((p) => {
        if (p.id === user.id) {
          return {
            ...p,
            ...profileData,
            updated_at: new Date().toISOString(),
          };
        }
        return p;
      });

      localStorage.setItem(MOCK_PROFILES_KEY, JSON.stringify(updatedProfiles));
      setProfile((prev) => (prev ? { ...prev, ...profileData } : null));
      return { error: null };
    }
  };

  // Forgot Password implementation
  const forgotPassword = async (email: string): Promise<{ error: string | null }> => {
    if (!isMockMode && supabase) {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) return { error: error.message };
      return { error: null };
    } else {
      await new Promise((resolve) => setTimeout(resolve, 600));
      const savedUsers = localStorage.getItem(MOCK_USERS_KEY);
      const users = savedUsers ? JSON.parse(savedUsers) : [];
      const userExists = users.some((u: any) => u.email.toLowerCase() === email.toLowerCase());
      
      if (!userExists) {
        return { error: 'No user registered with this email address.' };
      }
      return { error: null };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        isMockMode,
        signIn,
        signUp,
        signOut,
        updateProfile,
        forgotPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
