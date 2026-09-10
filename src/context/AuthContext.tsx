"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, User, signOut } from "firebase/auth";
import { auth, db } from "@/lib/firebase/client";
import { doc, getDoc, setDoc } from "firebase/firestore";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  civicScore: number;
  role: "citizen" | "official" | null;
  refreshScore: () => void;
  mockLogin: (email: string, name: string, role: "citizen" | "official") => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  civicScore: 0,
  role: null,
  refreshScore: () => {},
  mockLogin: () => {},
  logout: () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [civicScore, setCivicScore] = useState(0);
  const [role, setRole] = useState<"citizen" | "official" | null>(null);

  const fetchScore = async (uid: string, currentUser?: User | null) => {
    try {
      const userDoc = await getDoc(doc(db, "users", uid));
      if (userDoc.exists()) {
        setCivicScore(userDoc.data().civicScore || 0);
        setRole(userDoc.data().role || "citizen");
      } else {
        await setDoc(doc(db, "users", uid), {
          email: currentUser?.email || "",
          displayName: currentUser?.displayName || "Citizen",
          civicScore: 0,
          role: "citizen",
          createdAt: new Date(),
        });
        setCivicScore(0);
        setRole("citizen");
      }
    } catch (error) {
      console.error("Failed to fetch user score:", error);
    }
  };

  const mockLogin = (
    email: string,
    name: string,
    userRole: "citizen" | "official"
  ) => {
    const mockUserData = {
      user: {
        uid: "mock-uid-12345",
        email: email,
        displayName: name,
        photoURL:
          "https://api.dicebear.com/7.x/bottts/svg?seed=" +
          encodeURIComponent(name),
      },
      civicScore: userRole === "official" ? 2500 : 0, // Reset default citizen score to 0
      role: userRole,
    };
    localStorage.setItem("mock_user", JSON.stringify(mockUserData));
    setUser(mockUserData.user as any);
    setCivicScore(mockUserData.civicScore);
    setRole(mockUserData.role);
  };

  const logout = async () => {
    try {
      localStorage.removeItem("mock_user");
      setUser(null);
      setCivicScore(0);
      setRole(null);
      await signOut(auth).catch(() => {});
      window.location.href = "/login";
    } catch (error) {
      console.error("Logout failed:", error);
      localStorage.removeItem("mock_user");
      window.location.href = "/login";
    }
  };

  const refreshScore = () => {
    if (user && user.uid !== "mock-uid-12345") {
      fetchScore(user.uid, user);
    }
  };

  useEffect(() => {
    const savedMock = localStorage.getItem("mock_user");
    if (savedMock) {
      try {
        const parsed = JSON.parse(savedMock);
        setUser(parsed.user);
        setCivicScore(parsed.civicScore || 0); // Reset fallback to 0
        setRole(parsed.role || "citizen");
        setLoading(false);
        return;
      } catch (err) {
        console.error("Failed to parse mock user:", err);
        localStorage.removeItem("mock_user");
      }
    }

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (localStorage.getItem("mock_user")) {
        setLoading(false);
        return;
      }
      setUser(currentUser);
      if (currentUser) {
        await fetchScore(currentUser.uid, currentUser);
      } else {
        setCivicScore(0);
        setRole(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        civicScore,
        role,
        refreshScore,
        mockLogin,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};