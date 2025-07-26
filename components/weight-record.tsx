"use client"

import type React from "react"
import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  ArrowLeft,
  Calendar,
  Save,
  X,
  Home,
  FileText,
  BarChart3,
  CalendarDays,
  List,
  ArrowUp,
  ArrowDown,
  Minus,
} from "lucide-react"

interface User {
  id: string
  name: string
  icon: React.ReactNode
  color: string
}

interface WeightRecord {
  date: string
  weight: number
  change: number
  memo: string
}

interface WeightRecordProps {
  user: User
  onNavigate: (screen: string) => void
  onSave: (record: { date: string; weight: number; memo: string }) => void
}

const recentRecords: WeightRecord[] = [
  { date: "2024-07-25", weight: 58.8, change: +0.3, memo: "저녁 늦게 먹음" },
  { date: "2024-07-24", weight: 58.5, change: -0.2, memo: "운동 후 측정" },
  { date: "2024-07-23", weight: 58.7, change: +0.1, memo: "" },
]

export default function WeightRecord({ user, onNavigate, onSave }: WeightRecordProps) {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0])
  const [weight, setWeight] = useState("")
  const [memo, setMemo] = useState("")
  const [errors, setErrors] = useState<{ [key: string]: string }>({})

  // 입력 검증
  const validateForm = () => {
    const newErrors: { [key: string]: string } = {}

    // 날짜 검증
    const today = new Date()
    const oneYearAgo = new Date()
    oneYearAgo.setFullYear(today.getFullYear() - 1)
    const inputDate = new Date(selectedDate)

    if (inputDate > today) {
      newErrors.date = "미래 날짜는 선택할 수 없습니다"
    } else if (inputDate < oneYearAgo) {
      newErrors.date = "1년 이전 날짜는 선택할 수 없습니다"
    }

    // 몸무게 검증
    const weightNum = Number.parseFloat(weight)
    if (!weight) {
      newErrors.weight = "몸무게를 입력해주세요"
    } else if (isNaN(weightNum)) {
      newErrors.weight = "올바른 숫자를 입력해주세요"
    } else if (weightNum < 20 || weightNum > 200) {
      newErrors.weight = "몸무게는 20kg~200kg 범위로 입력해주세요"
    }

    // 메모 길이 검증
    if (memo.length > 100) {
      newErrors.memo = "메모는 100자 이내로 입력해주세요"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSave = () => {
    if (validateForm()) {
      onSave({
        date: selectedDate,
        weight: Number.parseFloat(weight),
        memo: memo,
      })
      // 저장 후 대시보드로 이동
      onNavigate("dashboard")
    }
  }

  const handleCancel = () => {
    setWeight("")
    setMemo("")
    setErrors({})
    onNavigate("dashboard")
  }

  // 변화량 표시 함수
  const getChangeDisplay = (change: number) => {
    const isIncrease = change > 0
    const isDecrease = change < 0
    const color = isIncrease ? "text-red-500" : isDecrease ? "text-blue-500" : "text-gray-500"
    const icon = isIncrease ? (
      <ArrowUp className="w-3 h-3" />
    ) : isDecrease ? (
      <ArrowDown className="w-3 h-3" />
    ) : (
      <Minus className="w-3 h-3" />
    )

    return (
      <div className={`flex items-center space-x-1 ${color}`}>
        {icon}
        <span className="text-sm">{Math.abs(change).toFixed(1)}</span>
      </div>
    )
  }

  const navigationItems = [
    { id: "home", label: "홈", icon: <Home className="w-5 h-5" />, active: false },
    { id: "record", label: "기록", icon: <FileText className="w-5 h-5" />, active: true },
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
            <Button variant="ghost" size="icon" onClick={() => onNavigate("dashboard")}>
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </Button>
            <div className="flex items-center space-x-2">
              <div className={user.color}>{user.icon}</div>
              <h1 className="font-semibold text-gray-800">몸무게 기록</h1>
            </div>
          </div>
        </div>
      </header>

      {/* 메인 콘텐츠 */}
      <main className="flex-1 p-4 space-y-6">
        {/* 입력 폼 */}
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="text-lg text-gray-700">새 기록 추가</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* 날짜 선택 */}
            <div className="space-y-2">
              <Label htmlFor="date" className="text-sm font-medium text-gray-700">
                날짜
              </Label>
              <div className="relative">
                <Input
                  id="date"
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className={`pr-10 ${errors.date ? "border-red-500" : ""}`}
                />
                <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              </div>
              {errors.date && <p className="text-sm text-red-500">{errors.date}</p>}
            </div>

            {/* 몸무게 입력 */}
            <div className="space-y-2">
              <Label htmlFor="weight" className="text-sm font-medium text-gray-700">
                몸무게 *
              </Label>
              <div className="relative">
                <Input
                  id="weight"
                  type="number"
                  step="0.1"
                  min="20"
                  max="200"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  placeholder="58.5"
                  className={`pr-12 text-lg ${errors.weight ? "border-red-500" : ""}`}
                  inputMode="decimal"
                />
                <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">
                  kg
                </span>
              </div>
              {errors.weight && <p className="text-sm text-red-500">{errors.weight}</p>}
            </div>

            {/* 특이사항/메모 */}
            <div className="space-y-2">
              <Label htmlFor="memo" className="text-sm font-medium text-gray-700">
                특이사항/메모
              </Label>
              <Textarea
                id="memo"
                value={memo}
                onChange={(e) => setMemo(e.target.value)}
                placeholder="오늘의 특이사항이나 느낌을 적어보세요"
                className={`resize-none ${errors.memo ? "border-red-500" : ""}`}
                rows={3}
                maxLength={100}
              />
              <div className="flex justify-between items-center">
                {errors.memo && <p className="text-sm text-red-500">{errors.memo}</p>}
                <p className="text-xs text-gray-500 ml-auto">{memo.length}/100</p>
              </div>
            </div>

            {/* 액션 버튼 */}
            <div className="flex space-x-3 pt-4">
              <Button onClick={handleSave} className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white h-12">
                <Save className="w-4 h-4 mr-2" />
                저장하기
              </Button>
              <Button onClick={handleCancel} variant="outline" className="px-6 h-12 bg-transparent">
                <X className="w-4 h-4 mr-2" />
                취소
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 최근 기록 미리보기 */}
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="text-lg text-gray-700">최근 기록</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentRecords.map((record, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700">
                        {new Date(record.date).toLocaleDateString("ko-KR", {
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                      <div className="flex items-center space-x-2">
                        <span className="text-lg font-semibold text-gray-800">{record.weight}kg</span>
                        {getChangeDisplay(record.change)}
                      </div>
                    </div>
                    {record.memo && <p className="text-xs text-gray-500 truncate">{record.memo}</p>}
                  </div>
                </div>
              ))}
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
