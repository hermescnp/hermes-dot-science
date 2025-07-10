"use client"

import React, { createContext, useContext, useEffect, useState } from 'react'
import { onAuthStateChange, getCurrentUser } from '@/lib/auth-service'
import { doc, getDoc, Firestore } from 'firebase/firestore'
import { db } from '../firebase.js'
import type { User as FirebaseUser } from 'firebase/auth'

// Type assertion for db to avoid TypeScript issues
const firestoreDb = db as Firestore

interface User {
  uid: string
  email: string | null
  displayName: string | null
  emailVerified: boolean
}

interface UserData {
  uid: string
  email: string
  firstName: string
  lastName: string
  company: string
  role: string
  phone: string
  organizationSize: string
  language: string
  createdAt: Date
  lastUpdated: Date
  emailVerified: boolean
  status: string
  provider?: string
}

interface AuthContextType {
  user: User | null
  userData: UserData | null
  loading: boolean
  isAuthenticated: boolean
  refreshUserData: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  userData: null,
  loading: true,
  isAuthenticated: false,
  refreshUserData: async () => {},
})

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: React.ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [userData, setUserData] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchUserData = async (firebaseUser: FirebaseUser) => {
    try {
      if (firestoreDb) {
        const userDoc = await getDoc(doc(firestoreDb, 'users', firebaseUser.uid))
        if (userDoc.exists()) {
          const data = userDoc.data()
          setUserData({
            uid: data.uid,
            email: data.email,
            firstName: data.firstName || '',
            lastName: data.lastName || '',
            company: data.company || '',
            role: data.role || '',
            phone: data.phone || '',
            organizationSize: data.organizationSize || '',
            language: data.language || 'en',
            createdAt: data.createdAt?.toDate() || new Date(),
            lastUpdated: data.lastUpdated?.toDate() || new Date(),
            emailVerified: data.emailVerified || false,
            status: data.status || 'active',
            provider: data.provider || 'email'
          })
        } else {
          setUserData(null)
        }
      } else {
        console.warn('Firestore not initialized, skipping user data fetch')
        setUserData(null)
      }
    } catch (error) {
      console.error('Error fetching user data:', error)
      setUserData(null)
    }
  }

  const refreshUserData = async () => {
    if (user) {
      await fetchUserData(user as FirebaseUser)
    }
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChange(async (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        // User is signed in
        const user: User = {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          emailVerified: firebaseUser.emailVerified,
        }
        setUser(user)
        
        // Fetch user data from Firestore
        await fetchUserData(firebaseUser)
      } else {
        // User is signed out
        setUser(null)
        setUserData(null)
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const value: AuthContextType = {
    user,
    userData,
    loading,
    isAuthenticated: !!user,
    refreshUserData,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
} 