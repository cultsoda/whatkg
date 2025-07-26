"use client"

import type React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Settings,
  Plus,
  TrendingUp,
  Calendar,
  Target,
  Home,
  FileText,
  BarChart3,
  CalendarDays,
  List,
  ArrowUp,
  ArrowDown,
  Minus,
  ArrowLeft,
} from "lucide-react"

interface User {
  id: string
  name: string
  icon: React.ReactNode
  color: string
  currentWeight: number
  previousWeight: number
  lastRecordDate: string
}

interface MainDashboardProps {
  user: User
  onNavigate: (screen: string) => void
}

export default function MainDashboard({ user, onNavigate }: MainDashboardProps) {
  // 몸무게 변화량 계산
  const weightChange = user.currentWeight - user.previousWeight
  const isIncrease = weightChange > 0
  const isDecrease = weightChange < 0
  const isStable = weightChange === 0

  // 변화량 색상 결정
  const getChangeColor = () => {
    if (isIncrease) return "text-red-500"
    if (isDecrease) return "text-blue-500"
    return "text-gray-500"
  }

  // 변화량 아이콘
  const getChangeIcon = () => {
    if (isIncrease) return <ArrowUp className="w-4 h-4" />
    if (isDecrease) return <ArrowDown className="w-4 h-4" />
    return <Minus className="w-4 h-4" />
  }

  // 오늘 날짜 포맷
  const today = new Date().toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "long",
  })

  // 마지막 기록 날짜 포맷
  const lastRecordFormatted = new Date(user.lastRecordDate).toLocaleDateString("ko-KR", {
    month: "short",
    day: "numeric",
  })

  const quickActions = [
    {
      id: "record",
      title: "몸무게 기록하기",
      icon: <Plus className="w-6 h-6" />,
      color: "bg-emerald-500 hover:bg-emerald-600",
      screen: "record",
    },
    {
      id: "chart",
      title: "차트 보기",
      icon: <TrendingUp className="w-6 h-6" />,
      color: "bg-blue-500 hover:bg-blue-600",
      screen: "chart",
    },
    {
      id: "calendar",
      title: "달력 보기",
      icon: <Calendar className="w-6 h-6" />,
      color: "bg-purple-500 hover:bg-purple-600",
      screen: "calendar",
    },
    {
      id: "goal",
      title: "목표 설정",
      icon: <Target className="w-6 h-6" />,
      color: "bg-orange-500 hover:bg-orange-600",
      screen: "goal",
    },
  ]

  const navigationItems = [
    { id: "home", label: "홈", icon: <Home className="w-5 h-5" />, active: true },
    { id: "record", label: "기록", icon: <FileText className="w-5 h-5" />, active: false },
    { id: "chart", label: "차트", icon: <BarChart3 className="w-5 h-5" />, active: false },
    { id: "calendar", label: "달력", icon: <CalendarDays className="w-5 h-5" />, active: false },
    { id: "list", label: "목록", icon: <List className="w-5 h-5" />, active: false },
  ]

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* 상단 헤더 */}
      <header className="bg-white shadow-sm px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Button variant="ghost" size="icon" onClick={() => onNavigate("logout")}>
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </Button>
            <div className="flex items-center space-x-2">
              <div className={user.color}>{user.icon}</div>
              <div>
                <h1 className="font-semibold text-gray-800">{user.name}님</h1>
                <p className="text-xs text-gray-500">{today}</p>
              </div>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={() => onNavigate("settings")}>
            <Settings className="w-5 h-5 text-gray-600" />
          </Button>
        </div>
      </header>

      {/* 메인 콘텐츠 */}
      <main className="flex-1 p-4 space-y-6">
        {/* 현재 상태 카드 */}
        <Card className="shadow-md">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg text-gray-700">현재 몸무게</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <div className="text-4xl font-bold text-gray-800 mb-2">
                {user.currentWeight}
                <span className="text-xl text-gray-500 ml-1">kg</span>
              </div>

              <div className={`flex items-center justify-center space-x-1 ${getChangeColor()}`}>
                {getChangeIcon()}
                <span className="font-medium">{Math.abs(weightChange).toFixed(1)}kg</span>
                <span className="text-sm text-gray-500">어제 대비</span>
              </div>
            </div>

            <div className="text-center pt-2 border-t border-gray-100">
              <p className="text-sm text-gray-500">마지막 기록: {lastRecordFormatted}</p>
            </div>
          </CardContent>
        </Card>

        {/* 빠른 액션 버튼들 */}
        <Card className="shadow-md">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg text-gray-700">빠른 액션</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              {quickActions.map((action) => (
                <Button
                  key={action.id}
                  onClick={() => onNavigate(action.screen)}
                  className={`${action.color} text-white h-20 flex flex-col items-center justify-center space-y-2 rounded-xl shadow-sm hover:shadow-md transition-all duration-200`}
                >
                  {action.icon}
                  <span className="text-sm font-medium">{action.title}</span>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 최근 활동 요약 (추가 정보) */}
        <Card className="shadow-md">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg text-gray-700">이번 주 요약</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-emerald-600">5</p>
                <p className="text-xs text-gray-500">기록 횟수</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-blue-600">-0.8</p>
                <p className="text-xs text-gray-500">주간 변화(kg)</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-purple-600">3</p>
                <p className="text-xs text-gray-500">목표까지(kg)</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>

      {/* 하단 네비게이션 */}
      <nav className="bg-white border-t border-gray-200 px-4 py-2">
        <div className="flex justify-around">
          {navigationItems.map((item) => (
            <Button
              key={item.id}
              variant="ghost"
              onClick={() => onNavigate(item.id)}
              className={`flex flex-col items-center space-y-1 py-2 px-3 ${
                item.active ? "text-emerald-600 bg-emerald-50" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {item.icon}
              <span className="text-xs">{item.label}</span>
            </Button>
          ))}
        </div>
      </nav>
    </div>
  )
}
