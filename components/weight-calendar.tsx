"use client"

import type React from "react"
import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  ChevronLeft,
  ChevronRight,
  Home,
  FileText,
  BarChart3,
  CalendarDays,
  List,
  Edit,
  Trash2,
  Plus,
  Calendar,
  ArrowLeft,
} from "lucide-react"

interface User {
  id: string
  name: string
  icon: React.ReactNode
  color: string
}

interface WeightData {
  weight: number
  change: number
  memo: string
}

interface CalendarData {
  [key: string]: WeightData
}

interface WeightCalendarProps {
  user: User
  onNavigate: (screen: string) => void
}

const calendarData: CalendarData = {
  "2024-07-01": { weight: 60.2, change: 0, memo: "시작!" },
  "2024-07-02": { weight: 60.0, change: -0.2, memo: "" },
  "2024-07-05": { weight: 59.8, change: -0.2, memo: "운동 시작" },
  "2024-07-10": { weight: 59.5, change: -0.3, memo: "" },
  "2024-07-15": { weight: 59.1, change: -0.4, memo: "컨디션 좋음" },
  "2024-07-20": { weight: 58.9, change: -0.2, memo: "" },
  "2024-07-25": { weight: 58.5, change: -0.4, memo: "목표에 가까워짐" },
}

const goalWeight = 57.0

export default function WeightCalendar({ user, onNavigate }: WeightCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date(2024, 6, 1)) // 2024년 7월
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const today = new Date()
  const weekDays = ["일", "월", "화", "수", "목", "금", "토"]

  // 달력 데이터 생성
  const generateCalendarDays = () => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const startDate = new Date(firstDay)
    startDate.setDate(startDate.getDate() - firstDay.getDay())

    const days = []
    const current = new Date(startDate)

    for (let i = 0; i < 42; i++) {
      // 6주 * 7일
      days.push(new Date(current))
      current.setDate(current.getDate() + 1)
    }

    return days
  }

  // 색상 결정 함수
  const getCellColor = (date: Date, data?: WeightData) => {
    if (!data) return "bg-white hover:bg-gray-50"

    const { weight, change } = data
    const isGoalAchieved = weight <= goalWeight

    if (isGoalAchieved) {
      return "bg-green-100 hover:bg-green-200 border-green-300"
    } else if (Math.abs(change) <= 0.1) {
      return "bg-gray-100 hover:bg-gray-200 border-gray-300"
    } else if (change > 0) {
      return "bg-red-100 hover:bg-red-200 border-red-300"
    } else {
      return "bg-blue-100 hover:bg-blue-200 border-blue-300"
    }
  }

  // 날짜 클릭 핸들러
  const handleDateClick = (date: Date) => {
    const dateKey = date.toISOString().split("T")[0]
    setSelectedDate(dateKey)
    setIsModalOpen(true)
  }

  // 월 이동
  const navigateMonth = (direction: "prev" | "next") => {
    const newDate = new Date(currentDate)
    if (direction === "prev") {
      newDate.setMonth(newDate.getMonth() - 1)
    } else {
      newDate.setMonth(newDate.getMonth() + 1)
    }
    setCurrentDate(newDate)
  }

  // 오늘로 이동
  const goToToday = () => {
    setCurrentDate(new Date())
  }

  const calendarDays = generateCalendarDays()
  const selectedData = selectedDate ? calendarData[selectedDate] : null

  const navigationItems = [
    { id: "home", label: "홈", icon: <Home className="w-5 h-5" />, active: false },
    { id: "record", label: "기록", icon: <FileText className="w-5 h-5" />, active: false },
    { id: "chart", label: "차트", icon: <BarChart3 className="w-5 h-5" />, active: false },
    { id: "calendar", label: "달력", icon: <CalendarDays className="w-5 h-5" />, active: true },
    { id: "list", label: "목록", icon: <List className="w-5 h-5" />, active: false },
  ]

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* 상단 헤더 */}
      <header className="bg-white shadow-sm px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Button variant="ghost" size="icon" onClick={() => onNavigate("dashboard")}>
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </Button>
            <div className="flex items-center space-x-2">
              <div className={user.color}>{user.icon}</div>
              <div>
                <h1 className="font-semibold text-gray-800">{user.name}님의 달력 보기</h1>
                <p className="text-xs text-gray-500">월별 몸무게 변화를 확인해보세요</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* 메인 콘텐츠 */}
      <main className="flex-1 p-4 space-y-4">
        {/* 월 네비게이션 */}
        <Card className="shadow-md">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <Button variant="outline" size="icon" onClick={() => navigateMonth("prev")}>
                <ChevronLeft className="w-4 h-4" />
              </Button>

              <div className="text-center">
                <h2 className="text-xl font-bold text-gray-800">
                  {currentDate.getFullYear()}년 {currentDate.getMonth() + 1}월
                </h2>
              </div>

              <Button variant="outline" size="icon" onClick={() => navigateMonth("next")}>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>

            <div className="flex justify-center mt-3">
              <Button variant="outline" size="sm" onClick={goToToday} className="text-emerald-600 bg-transparent">
                <Calendar className="w-4 h-4 mr-1" />
                오늘
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 달력 그리드 */}
        <Card className="shadow-md">
          <CardContent className="p-4">
            {/* 요일 헤더 */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {weekDays.map((day, index) => (
                <div
                  key={day}
                  className={`text-center text-sm font-medium py-2 ${
                    index === 0 ? "text-red-500" : index === 6 ? "text-blue-500" : "text-gray-600"
                  }`}
                >
                  {day}
                </div>
              ))}
            </div>

            {/* 날짜 그리드 */}
            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map((date, index) => {
                const dateKey = date.toISOString().split("T")[0]
                const data = calendarData[dateKey]
                const isToday = date.toDateString() === today.toDateString()
                const isCurrentMonth = date.getMonth() === currentDate.getMonth()
                const isOtherMonth = !isCurrentMonth

                return (
                  <button
                    key={index}
                    onClick={() => handleDateClick(date)}
                    className={`
                      relative h-16 border rounded-lg transition-all duration-200 transform hover:scale-105
                      ${getCellColor(date, data)}
                      ${isToday ? "ring-2 ring-emerald-500 ring-offset-1" : ""}
                      ${isOtherMonth ? "opacity-30" : ""}
                    `}
                  >
                    <div className="absolute top-1 left-1">
                      <span className={`text-xs font-medium ${isOtherMonth ? "text-gray-400" : "text-gray-700"}`}>
                        {date.getDate()}
                      </span>
                    </div>

                    {data && isCurrentMonth && (
                      <div className="absolute bottom-1 left-1 right-1">
                        <div className="text-xs font-bold text-gray-800">{data.weight}kg</div>
                        {data.change !== 0 && (
                          <div className={`text-xs ${data.change > 0 ? "text-red-600" : "text-blue-600"}`}>
                            {data.change > 0 ? "+" : ""}
                            {data.change.toFixed(1)}
                          </div>
                        )}
                      </div>
                    )}

                    {!data && isCurrentMonth && (
                      <div className="absolute inset-2 border-2 border-dashed border-gray-300 rounded opacity-50" />
                    )}
                  </button>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* 범례 */}
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="text-lg text-gray-700">범례</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-blue-100 border border-blue-300 rounded"></div>
                <span className="text-sm text-gray-600">감소</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-red-100 border border-red-300 rounded"></div>
                <span className="text-sm text-gray-600">증가</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-gray-100 border border-gray-300 rounded"></div>
                <span className="text-sm text-gray-600">유지</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-green-100 border border-green-300 rounded"></div>
                <span className="text-sm text-gray-600">목표달성</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>

      {/* 상세 정보 모달 */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-sm mx-auto">
          <DialogHeader>
            <DialogTitle className="text-center">
              {selectedDate &&
                new Date(selectedDate).toLocaleDateString("ko-KR", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  weekday: "long",
                })}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {selectedData ? (
              <>
                <div className="text-center space-y-2">
                  <div className="text-3xl font-bold text-gray-800">{selectedData.weight}kg</div>
                  {selectedData.change !== 0 && (
                    <div
                      className={`text-lg font-medium ${selectedData.change > 0 ? "text-red-500" : "text-blue-500"}`}
                    >
                      전날 대비 {selectedData.change > 0 ? "+" : ""}
                      {selectedData.change.toFixed(1)}kg
                    </div>
                  )}
                  {selectedData.weight <= goalWeight && <div className="text-green-600 font-medium">🎉 목표 달성!</div>}
                </div>

                {selectedData.memo && (
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-sm text-gray-700">{selectedData.memo}</p>
                  </div>
                )}

                <div className="flex space-x-2">
                  <Button variant="outline" className="flex-1 bg-transparent">
                    <Edit className="w-4 h-4 mr-1" />
                    수정
                  </Button>
                  <Button variant="outline" className="flex-1 text-red-600 hover:text-red-700 bg-transparent">
                    <Trash2 className="w-4 h-4 mr-1" />
                    삭제
                  </Button>
                </div>
              </>
            ) : (
              <>
                <div className="text-center py-8">
                  <div className="text-gray-400 mb-4">
                    <Calendar className="w-12 h-12 mx-auto" />
                  </div>
                  <p className="text-gray-600">이 날짜에는 기록이 없습니다</p>
                </div>

                <Button
                  onClick={() => {
                    setIsModalOpen(false)
                    onNavigate("record")
                  }}
                  className="w-full bg-emerald-500 hover:bg-emerald-600"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  기록 추가하기
                </Button>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* 하단 네비게이션 */}
      <nav className="bg-white border-t border-gray-200 px-4 py-2">
        <div className="flex justify-around">
          {navigationItems.map((item) => (
            <Button
              key={item.id}
              variant="ghost"
              onClick={() => onNavigate(item.id === "home" ? "dashboard" : item.id)}
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
