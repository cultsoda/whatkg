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

// Firebase 연동된 컴포넌트들
import MainDashboardFirebase from "@/components/main-dashboard-firebase"
import WeightRecordFirebase from "@/components/weight-record-firebase"
import WeightChartFirebase from "@/components/weight-chart-firebase"
import WeightCalendarFirebase from "@/components/weight-calendar-firebase"
import GoalSettingFirebase from "@/components/goal-setting-firebase"
import WeightListFirebase from "@/components/weight-list-firebase"
import SettingsFirebase from "@/components/settings-firebase"

// 타입 정의
interface FamilyMember {
  id: string
  name: string
  icon: React.ReactNode
  color: string
  bgColor: string
}

interface FormData {
  email: string
  password: string
  displayName: string
}

// 가족 구성원 데이터
const familyMembers: FamilyMember[] = [
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
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [currentScreen, setCurrentScreen] = useState<string>("login")
  const [selectedMember, setSelectedMember] = useState<FamilyMember | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  
  // 로그인 폼 상태
  const [isLogin, setIsLogin] = useState<boolean>(true)
  const [showPassword, setShowPassword] = useState<boolean>(false)
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
    displayName: ''
  })

  // Firebase 인증 상태 감지
  useEffect(() => {
    const unsubscribe = onAuthStateChange((user: any) => {
      setCurrentUser(user)
      setLoading(false)
      
      if (user) {
        setCurrentScreen("memberSelect")
      } else {
        setCurrentScreen("login")
        setSelectedMember(null)
      }
    })

    return unsubscribe
  }, [])

  // 입력 처리
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  // 이메일 인증 처리
  const handleEmailAuth = async (e: React.FormEvent<HTMLFormElement>) => {
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
    } catch (error: any) {
      console.error('인증 오류:', error)
      toast({ 
        title: isLogin ? "로그인 실패" : "회원가입 실패",
        description: error.message || "알 수 없는 오류가 발생했습니다.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  // 구글 로그인 처리
  const handleGoogleAuth = async () => {
    setLoading(true)
    try {
      await signInWithGoogle()
      toast({ title: "Google 로그인 성공!" })
    } catch (error: any) {
      console.error('Google 로그인 오류:', error)
      toast({ 
        title: "Google 로그인 실패",
        description: error.message || "알 수 없는 오류가 발생했습니다.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  // 화면 네비게이션
  const handleNavigate = (screen: string, member?: FamilyMember | null) => {
    if (member) {
      setSelectedMember(member)
    }
    setCurrentScreen(screen)
  }

  // 구성원 선택
  const handleMemberSelect = (member: FamilyMember) => {
    setSelectedMember(member)
    setCurrentScreen("dashboard")
  }

  // 뒤로 가기
  const handleBack = () => {
    switch (currentScreen) {
      case "dashboard":
      case "record":
      case "chart":
      case "calendar":
      case "goal":
      case "list":
      case "settings":
        setCurrentScreen("memberSelect")
        break
      default:
        setCurrentScreen("memberSelect")
    }
  }

  // 로딩 화면
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <Scale className="w-12 h-12 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">로딩 중...</p>
        </div>
      </div>
    )
  }

  // 로그인 화면
  if (currentScreen === "login") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4">
        <div className="max-w-md mx-auto space-y-8 pt-16">
          {/* 로고 */}
          <div className="text-center">
            <Scale className="w-16 h-16 mx-auto mb-4 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-800 mb-2">WhatKG</h1>
            <p className="text-gray-600">가족의 건강한 몸무게 관리</p>
          </div>

          {/* 로그인/회원가입 폼 */}
          <Card className="shadow-lg">
            <CardContent className="p-6">
              <div className="flex mb-6">
                <Button
                  variant={isLogin ? "default" : "ghost"}
                  onClick={() => setIsLogin(true)}
                  className="flex-1"
                >
                  로그인
                </Button>
                <Button
                  variant={!isLogin ? "default" : "ghost"}
                  onClick={() => setIsLogin(false)}
                  className="flex-1"
                >
                  회원가입
                </Button>
              </div>

              <form onSubmit={handleEmailAuth} className="space-y-4">
                {!isLogin && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">이름</label>
                    <Input
                      name="displayName"
                      placeholder="이름을 입력하세요"
                      value={formData.displayName}
                      onChange={handleInputChange}
                      required={!isLogin}
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">이메일</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      type="email"
                      name="email"
                      placeholder="이메일을 입력하세요"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">비밀번호</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      placeholder="비밀번호를 입력하세요"
                      value={formData.password}
                      onChange={handleInputChange}
                      className="pl-10 pr-10"
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </Button>
                  </div>
                </div>

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "처리 중..." : isLogin ? "로그인" : "회원가입"}
                </Button>
              </form>

              <div className="mt-6">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">또는</span>
                  </div>
                </div>

                <Button
                  variant="outline"
                  onClick={handleGoogleAuth}
                  className="w-full mt-4"
                  disabled={loading}
                >
                  Google로 계속하기
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
        <Toaster />
      </div>
    )
  }

  // 구성원 선택 화면
  if (currentScreen === "memberSelect") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4">
        <div className="max-w-md mx-auto space-y-8 pt-16">
          <div className="text-center">
            <Scale className="w-12 h-12 mx-auto mb-4 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-800 mb-2">가족 구성원 선택</h1>
            <p className="text-gray-600">몸무게를 기록할 구성원을 선택하세요</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {familyMembers.map((member) => (
              <Card 
                key={member.id}
                className={`cursor-pointer transition-all duration-200 hover:scale-105 shadow-md ${member.bgColor}`}
                onClick={() => handleMemberSelect(member)}
              >
                <CardContent className="p-6 text-center">
                  <div className={`${member.color} mb-3 flex justify-center`}>
                    {member.icon}
                  </div>
                  <h3 className="font-semibold text-gray-800">{member.name}</h3>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center">
            <Button variant="ghost" onClick={() => logOut()}>
              로그아웃
            </Button>
          </div>
        </div>
        <Toaster />
      </div>
    )
  }

  // Firebase 연동 컴포넌트 렌더링
  if (selectedMember) {
    switch (currentScreen) {
      case "dashboard":
        return <MainDashboardFirebase 
          selectedMember={selectedMember} 
          onNavigate={handleNavigate} 
          onBack={handleBack} 
        />
      case "record":
        return <WeightRecordFirebase 
          selectedMember={selectedMember} 
          onBack={handleBack} 
        />
      case "chart":
        return <WeightChartFirebase 
          selectedMember={selectedMember} 
          onNavigate={handleNavigate} 
          onBack={handleBack} 
        />
      case "calendar":
        return <WeightCalendarFirebase 
          selectedMember={selectedMember} 
          onNavigate={handleNavigate} 
          onBack={handleBack} 
        />
      case "goal":
        return <GoalSettingFirebase 
          selectedMember={selectedMember} 
          onNavigate={handleNavigate} 
          onBack={handleBack} 
        />
      case "list":
        return <WeightListFirebase 
          selectedMember={selectedMember} 
          onNavigate={handleNavigate} 
          onBack={handleBack} 
        />
      case "settings":
        return <SettingsFirebase 
          selectedMember={selectedMember} 
          onNavigate={handleNavigate} 
          onBack={handleBack} 
        />
      default:
        return <MainDashboardFirebase 
          selectedMember={selectedMember} 
          onNavigate={handleNavigate} 
          onBack={handleBack} 
        />
    }
  }

  // 기본 화면 (구성원 선택으로 이동)
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
      <Button onClick={() => setCurrentScreen("memberSelect")}>
        구성원 선택하기
      </Button>
      <Toaster />
    </div>
  )
}