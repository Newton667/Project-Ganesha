// src/context/AuthContext.js
import { createContext, useEffect, useMemo, useState, useContext } from "react";
import { supabase } from "../supabaseClient";

const AuthContext = createContext({
  session: null,
  user: null,
  accessToken: null,
  loading: true,
  signUpNewUser: async () => ({ success: false }),
  signInUser: async () => ({ success: false }),
  signOut: async () => ({ success: false }),
});

export const AuthContextProvider = ({ children }) => {
  // Start as loading=true so UI can avoid flicker
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  // ---------- Auth actions ----------
  const signUpNewUser = async (email, password, firstName, lastName) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { firstName, lastName },
          // send email confirmation? uncomment if needed
          // emailRedirectTo: `${window.location.origin}/login`
        },
      });
      if (error) return { success: false, error };
      return { success: true, data, session: data.session, user: data.user };
    } catch (error) {
      console.error("[Auth] signUp error:", error);
      return { success: false, error };
    }
  };

  const signInUser = async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) return { success: false, error };
      return { success: true, data };
    } catch (error) {
      console.error("[Auth] signIn error:", error);
      return { success: false, error };
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) return { success: false, error };
      return { success: true };
    } catch (error) {
      console.error("[Auth] signOut error:", error);
      return { success: false, error };
    }
  };

  // ---------- Session bootstrap & subscription ----------
  useEffect(() => {
    let isMounted = true;

    const bootstrap = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) {
          console.error("[Auth] getSession error:", error);
        }
        if (!isMounted) return;
        setSession(data?.session ?? null);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    // initial load
    bootstrap();

    // subscribe to auth changes
    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession ?? null);
      // once we hear anything from supabase, we can consider loading false
      setLoading(false);
    });

    return () => {
      isMounted = false;
      listener?.subscription?.unsubscribe?.();
    };
  }, []);

  // ---------- Derived values ----------
  const user = session?.user ?? null;
  const accessToken = session?.access_token ?? null;

  const value = useMemo(
    () => ({
      session,
      user,
      accessToken,
      loading,
      signUpNewUser,
      signInUser,
      signOut,
    }),
    [session, user, accessToken, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const UserAuth = () => useContext(AuthContext);
