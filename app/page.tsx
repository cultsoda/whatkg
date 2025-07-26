"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Scale, User, UserCheck, Baby, Heart } from "lucide-react"
import { Toaster } from "@/components/ui/toaster"
import MainDashboard from "@/components/main-dashboard"
import WeightRecord from "@/components/weight-record"
import WeightChart from "@/components/weight-chart"
import WeightCalendar from "@/components/weight-calendar"
import GoalSetting from "@/components/goal-setting"
import WeightList from "@/components/weight-list"
import Settings from "@/components/settings"

interface FamilyMember {
  id: string
  name: string
  icon: React.ReactNode
  color: string
  bgColor: string
}

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

export default function LoginScreen() {
  const [selectedMember, setSelectedMember] = useState<string | null>(null)
  const [currentScreen, setCurrentScreen] = useState<string>("login")
  const [currentUser, setCurrentUser] = useState<any>(null)

  const handleMemberSelect = (memberId: string) => {
    setSelectedMember(memberId)
    const member = familyMembers.find((m) => m.id === memberId)

    // 샘플 데이터 추가
    const userData = {
      ...member,
      currentWeight: memberId === "mom" ? 58.5 : memberId === "dad" ? 75.2 : memberId === "son" ? 45.8 : 52.3,
      previousWeight: memberId === "mom" ? 58.8 : memberId === "dad" ? 75.0 : memberId === "son" ? 46.1 : 52.1,
      lastRecordDate: "2024-07-25",
    }

    setCurrentUser(userData)
    setCurrentScreen("dashboard")
  }

  const handleNavigate = (screen: string) => {
    if (screen === "home" || screen === "dashboard") {
      setCurrentScreen("dashboard")
    } else if (screen === "record") {
      setCurrentScreen("record")
    } else if (screen === "chart") {
      setCurrentScreen("chart")
    } else if (screen === "calendar") {
      setCurrentScreen("calendar")
    } else if (screen === "goal") {
      setCurrentScreen("goal")
    } else if (screen === "list") {
      setCurrentScreen("list")
    } else if (screen === "settings") {
      setCurrentScreen("settings")
    } else if (screen === "logout") {
      setCurrentScreen("login")
      setCurrentUser(null)
      setSelectedMember(null)
    } else {
      // 다른 화면들은 추후 구현
      alert(`${screen} 화면으로 이동`)
    }
  }

  const handleUserChange = (userId: string) => {
    handleMemberSelect(userId)
  }

  const handleSave = (record: { date: string; weight: number; memo: string }) => {
    // 실제로는 데이터베이스에 저장
    console.log("새 기록 저장:", record)
    alert("기록이 저장되었습니다!")
  }

  const handleGoalSave = (goalData: any) => {
    // 실제로는 데이터베이스에 저장
    console.log("목표 설정 저장:", goalData)
    alert("목표가 설정되었습니다!")
  }

  if (currentScreen === "dashboard" && currentUser) {
    return (
      <>
        <MainDashboard user={currentUser} onNavigate={handleNavigate} />
        <Toaster />
      </>
    )
  }

  if (currentScreen === "record" && currentUser) {
    return (
      <>
        <WeightRecord user={currentUser} onNavigate={handleNavigate} onSave={handleSave} />
        <Toaster />
      </>
    )
  }

  if (currentScreen === "chart" && currentUser) {
    return (
      <>
        <WeightChart user={currentUser} onNavigate={handleNavigate} />
        <Toaster />
      </>
    )
  }

  if (currentScreen === "calendar" && currentUser) {
    return (
      <>
        <WeightCalendar user={currentUser} onNavigate={handleNavigate} />
        <Toaster />
      </>
    )
  }

  if (currentScreen === "goal" && currentUser) {
    return (
      <>
        <GoalSetting user={currentUser} onNavigate={handleNavigate} onSave={handleGoalSave} />
        <Toaster />
      </>
    )
  }

  if (currentScreen === "list" && currentUser) {
    return (
      <>
        <WeightList user={currentUser} onNavigate={handleNavigate} />
        <Toaster />
      </>
    )
  }

  if (currentScreen === "settings" && currentUser) {
    return (
      <>
        <Settings user={currentUser} onNavigate={handleNavigate} onUserChange={handleUserChange} />
        <Toaster />
      </>
    )
  }

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md mx-auto space-y-8">
          {/* 헤더 섹션 */}
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="bg-white rounded-full p-4 shadow-lg">
                <Scale className="w-16 h-16 text-emerald-600" />
              </div>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">가족 몸무게 관리</h1>
              <p className="text-gray-600 text-sm">건강한 가족을 위한 체중 관리 앱</p>
            </div>
          </div>

          {/* 가족 구성원 선택 섹션 */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-center text-gray-700 mb-6">사용자를 선택해주세요</h2>

            <div className="grid grid-cols-2 gap-4">
              {familyMembers.map((member) => (
                <Card
                  key={member.id}
                  className={`cursor-pointer transition-all duration-200 transform hover:scale-105 ${
                    selectedMember === member.id ? "ring-2 ring-emerald-500 shadow-lg" : "hover:shadow-md"
                  }`}
                  onClick={() => handleMemberSelect(member.id)}
                >
                  <CardContent className={`p-6 text-center ${member.bgColor} rounded-lg`}>
                    <div className={`${member.color} mb-3 flex justify-center`}>{member.icon}</div>
                    <h3 className="font-semibold text-gray-800 text-lg">{member.name}</h3>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* 하단 정보 */}
          <div className="text-center space-y-2">
            <p className="text-xs text-gray-500">가족 모두의 건강한 체중 관리를 시작해보세요</p>
            <div className="flex justify-center items-center space-x-1 text-xs text-gray-400">
              <Heart className="w-3 h-3" />
              <span>Family Health Tracker</span>
            </div>
          </div>
        </div>
      </div>
      <Toaster />
    </>
  )
}
