"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"

interface User {
  id: string
  email: string
  name: string
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<boolean>
  signup: (email: string, password: string, name: string) => Promise<boolean>
  logout: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check if user is logged in on app start
    const savedUser = localStorage.getItem("quantalex-user")
    if (savedUser) {
      setUser(JSON.parse(savedUser))
    }
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(email)) {
        return false
      }

      // Password validation
      if (password.length < 6) {
        return false
      }

      // Simulate more realistic authentication
      const user: User = {
        id: `user_${Date.now()}`,
        email,
        name: email.split("@")[0].charAt(0).toUpperCase() + email.split("@")[0].slice(1),
      }

      setUser(user)
      localStorage.setItem("quantalex-user", JSON.stringify(user))
      localStorage.setItem("quantalex-auth-timestamp", Date.now().toString())
      return true
    } catch (error) {
      console.error("Login error:", error)
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const signup = async (email: string, password: string, name: string): Promise<boolean> => {
    setIsLoading(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(email)) {
        return false
      }

      // Password strength validation
      if (password.length < 6) {
        return false
      }

      // Name validation
      if (!name || name.trim().length < 2) {
        return false
      }

      // Check if user already exists (simulate)
      const existingUser = localStorage.getItem(`quantalex-user-${email}`)
      if (existingUser) {
        return false
      }

      const user: User = {
        id: `user_${Date.now()}`,
        email,
        name: name.trim(),
      }

      setUser(user)
      localStorage.setItem("quantalex-user", JSON.stringify(user))
      localStorage.setItem(`quantalex-user-${email}`, JSON.stringify(user))
      localStorage.setItem("quantalex-auth-timestamp", Date.now().toString())
      return true
    } catch (error) {
      console.error("Signup error:", error)
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("quantalex-user")
    localStorage.removeItem("quantalex-auth-timestamp")
    const userEmail = user?.email
    if (userEmail) {
      localStorage.removeItem(`quantalex-chats-${user.id}`)
    }
  }

  return <AuthContext.Provider value={{ user, login, signup, logout, isLoading }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
