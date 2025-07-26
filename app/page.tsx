"use client"

import React, { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Scale, User, UserCheck, Baby, Heart, Mail, Lock, Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Toaster } from "@/components/ui/toaster"
import { toast } from "@/hooks/use-toast"

// Firebase 서비스들
import { 
  signInWithEmail, 
  signUpWithEmail, 
  signInWithGoogle, 
  logOut, 
  onAuthStateChange 
} from "@/lib/services/authService"

// 기존 컴포넌트들
import MainDashboard from "@/components/main-dashboard"
import WeightRecord from "@/components/weight-record"
import WeightChart from "@/components/weight-chart"
import WeightCalendar from "@/components/weight-calendar"
import GoalSetting from "@/components/goal-setting"
import WeightList from "@/components/weight-list"
import Settings from "@/components/settings"

// 가족 구성원 데이터
const familyMembers = [
  {
    id: "mom",
    name: "엄마",
    icon: <User className="w-12 h-12" />,
    color: "text-pink-600",
    bgColor: "bg-pink-50 hover:bg-pink-100",
  },
  {
    id: "dad",
    name: "아빠", 
    icon: <UserCheck className="w-12 h-12" />,
    color: "text-blue-600",
    bgColor: "bg-blue-50 hover:bg-blue-100",
  },
  {
    id: "son",
    name: "아들",
    icon: <Baby className="w-12 h-12" />,
    color: "text-green-600", 
    bgColor: "bg-green-50 hover:bg-green-100",
  },
  {
    id: "daughter",
    name: "딸",
    icon: <Heart className="w-12 h-12" />,
    color: "text-purple-600",
    bgColor: "bg-purple-50 hover:bg-purple-100",
  },
]

export default function App() {
  // 상태 관리
  const [currentUser, setCurrentUser] = useState(null)
  const [currentScreen, setCurrentScreen] = useState("login")
  const [selectedMember, setSelectedMember] = useState(null)
  const [loading, setLoading] = useState(true)
  
  // 로그인 폼 상태
  const [isLogin, setIsLogin] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    displayName: ''
  })

  // Firebase 인증 상태 감지
  useEffect(() => {
    const unsubscribe = onAuthStateChange((user) => {
      setCurrentUser(user)
      setLoading(false)
      
      if (user) {
        setCurrentScreen("memberSelect")
      } else {
        setCurrentScreen("login")
      }
    })

    return unsubscribe
  }, [])

  // 입력 처리
  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  // 이메일 인증 처리
  const handleEmailAuth = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (isLogin) {
        await signInWithEmail(formData.email, formData.password)
        toast({ title: "로그인 성공!" })
      } else {
        await signUpWithEmail(formData.email, formData.password, formData.displayName)
        toast({ title: "회원가입 성공!" })
      }
    } catch (error) {
      toast({ 
        title: "오류가 발생했습니다", 
        description: error.message,
        variant: "destructive" 
      })
    } finally {
      setLoading(false)
    }
  }

  // Google 로그인
  const handleGoogleAuth = async () => {
    setLoading(true)
    try {
      await signInWithGoogle()
      toast({ title: "Google 로그인 성공!" })
    } catch (error) {
      toast({ 
        title: "Google 로그인 실패", 
        description: error.message,
        variant: "destructive" 
      })
    } finally {
      setLoading(false)
    }
  }

  // 로그아웃
  const handleLogout = async () => {
    try {
      await logOut()
      setSelectedMember(null)
      setCurrentScreen("login")
      toast({ title: "로그아웃 되었습니다" })
    } catch (error) {
      toast({ 
        title: "로그아웃 실패", 
        description: error.message,
        variant: "destructive" 
      })
    }
  }

  // 가족 구성원 선택
  const handleMemberSelect = (memberId) => {
    const member = familyMembers.find(m => m.id === memberId)
    if (member) {
      const userData = {
        ...member,
        currentWeight: 58.5,
        previousWeight: 58.8,
        lastRecordDate: "2024-07-25",
        firebaseUser: currentUser
      }
      setSelectedMember(userData)
      setCurrentScreen("dashboard")
    }
  }

  // 화면 네비게이션
  const handleNavigate = (screen) => {
    if (screen === "logout") {
      handleLogout()
    } else {
      setCurrentScreen(screen)
    }
  }

  // 로딩 화면
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">로딩 중...</p>
        </div>
      </div>
    )
  }

  // 로그인 화면
  if (currentScreen === "login") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
          {/* 로고 */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-600 rounded-2xl mb-4">
              <Scale className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">WhatKG</h1>
            <p className="text-gray-600 mt-2">가족 몸무게 관리</p>
          </div>

          {/* 탭 전환 */}
          <div className="flex mb-6">
            <button
              className={`flex-1 py-2 px-4 rounded-l-lg font-medium transition-colors ${
                isLogin ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              onClick={() => setIsLogin(true)}
            >
              로그인
            </button>
            <button
              className={`flex-1 py-2 px-4 rounded-r-lg font-medium transition-colors ${
                !isLogin ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              onClick={() => setIsLogin(false)}
            >
              회원가입
            </button>
          </div>

          {/* 폼 */}
          <form onSubmit={handleEmailAuth} className="space-y-4">
            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">이름</label>
                <Input
                  type="text"
                  name="displayName"
                  value={formData.displayName}
                  onChange={handleInputChange}
                  placeholder="이름을 입력하세요"
                  required
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">이메일</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="pl-10"
                  placeholder="이메일을 입력하세요"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">비밀번호</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="pl-10 pr-10"
                  placeholder="비밀번호를 입력하세요"
                  required
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700" disabled={loading}>
              {loading ? "처리 중..." : (isLogin ? "로그인" : "회원가입")}
            </Button>
          </form>

          <div className="mt-4">
            <Button 
              onClick={handleGoogleAuth} 
              variant="outline" 
              className="w-full"
              disabled={loading}
            >
              Google로 {isLogin ? "로그인" : "회원가입"}
            </Button>
          </div>
        </div>
        <Toaster />
      </div>
    )
  }

  // 가족 구성원 선택 화면
  if (currentScreen === "memberSelect") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md mx-auto space-y-8">
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="bg-white rounded-full p-4 shadow-lg">
                <Scale className="w-16 h-16 text-emerald-600" />
              </div>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">가족 몸무게 관리</h1>
              <p className="text-gray-600 text-sm">사용자를 선택해주세요</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {familyMembers.map((member) => (
              <Card
                key={member.id}
                className="cursor-pointer transition-all duration-200 transform hover:scale-105 hover:shadow-md"
                onClick={() => handleMemberSelect(member.id)}
              >
                <CardContent className={`p-6 text-center ${member.bgColor} rounded-lg`}>
                  <div className={`${member.color} mb-3 flex justify-center`}>{member.icon}</div>
                  <h3 className="font-semibold text-gray-800 text-lg">{member.name}</h3>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center">
            <Button onClick={handleLogout} variant="outline">
              로그아웃
            </Button>
          </div>
        </div>
        <Toaster />
      </div>
    )
  }

  // 기존 화면들 (대시보드, 기록 등)
  if (currentScreen === "dashboard" && selectedMember) {
    return (
      <>
        <MainDashboard user={selectedMember} onNavigate={handleNavigate} />
        <Toaster />
      </>
    )
  }

  if (currentScreen === "record" && selectedMember) {
    return (
      <>
        <WeightRecord 
          user={selectedMember} 
          onNavigate={handleNavigate} 
          onSave={(record) => {
            console.log("기록 저장:", record)
            toast({ title: "기록이 저장되었습니다!" })
          }} 
        />
        <Toaster />
      </>
    )
  }

  if (currentScreen === "chart" && selectedMember) {
    return (
      <>
        <WeightChart user={selectedMember} onNavigate={handleNavigate} />
        <Toaster />
      </>
    )
  }

  if (currentScreen === "calendar" && selectedMember) {
    return (
      <>
        <WeightCalendar user={selectedMember} onNavigate={handleNavigate} />
        <Toaster />
      </>
    )
  }

  if (currentScreen === "goal" && selectedMember) {
    return (
      <>
        <GoalSetting 
          user={selectedMember} 
          onNavigate={handleNavigate} 
          onSave={(goalData) => {
            console.log("목표 저장:", goalData)
            toast({ title: "목표가 설정되었습니다!" })
          }} 
        />
        <Toaster />
      </>
    )
  }

  if (currentScreen === "list" && selectedMember) {
    return (
      <>
        <WeightList user={selectedMember} onNavigate={handleNavigate} />
        <Toaster />
      </>
    )
  }

  if (currentScreen === "settings" && selectedMember) {
    return (
      <>
        <Settings 
          user={selectedMember} 
          onNavigate={handleNavigate} 
          onUserChange={handleMemberSelect} 
        />
        <Toaster />
      </>
    )
  }

  return null
}