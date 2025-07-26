"use client"

import React, { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Calendar, Plus, ArrowLeft } from "lucide-react"
import { toast } from "@/hooks/use-toast"

// Firebase 서비스
import { weightService } from "@/lib/services/databaseService"
import { getCurrentUser } from "@/lib/services/authService"

interface WeightCalendarProps {
  selectedMember: {
    id: string
    name: string
    icon: React.ReactNode
    color: string
  }
  onNavigate: (screen: string) => void
  onBack: () => void
}

export default function WeightCalendarFirebase({ selectedMember, onNavigate, onBack }: WeightCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState(null)

  const currentUser = getCurrentUser()

  useEffect(() => {
    if (currentUser && selectedMember) {
      loadMonthRecords()
    }
  }, [currentUser, selectedMember, currentDate])

  const loadMonthRecords = async () => {
    setLoading(true)
    try {
      // 현재 월의 시작과 끝 날짜 계산
      const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
      const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)

      const monthRecords = await weightService.getRecordsByDateRange(
        currentUser.uid,
        selectedMember.id,
        startOfMonth.toISOString().split('T')[0],
        endOfMonth.toISOString().split('T')[0]
      )

      setRecords(monthRecords)
    } catch (error) {
      console.error('달력 데이터 로드 실패:', error)
      toast({
        title: "로드 실패",
        description: "달력 데이터를 불러오는데 실패했습니다.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const navigateMonth = (direction) => {
    const newDate = new Date(currentDate)
    newDate.setMonth(newDate.getMonth() + direction)
    setCurrentDate(newDate)
    setSelectedDate(null)
  }

  const getRecordForDate = (date) => {
    const dateString = date.toISOString().split('T')[0]
    return records.find(record => record.date === dateString)
  }

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
      days.push(new Date(current))
      current.setDate(current.getDate() + 1)
    }
    
    return days
  }

  const isToday = (date) => {
    const today = new Date()
    return date.toDateString() === today.toDateString()
  }

  const isCurrentMonth = (date) => {
    return date.getMonth() === currentDate.getMonth()
  }

  const handleDateClick = (date) => {
    if (!isCurrentMonth(date)) return
    
    const record = getRecordForDate(date)
    if (record) {
      setSelectedDate(date)
    } else {
      // 기록이 없는 날짜 클릭 시 기록 추가로 이동
      onNavigate("record")
    }
  }

  const formatWeight = (weight) => {
    return `${weight.toFixed(1)}kg`
  }

  const formatDate = (date) => {
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long'
    })
  }

  const selectedRecord = selectedDate ? getRecordForDate(selectedDate) : null

  const calendarDays = generateCalendarDays()
  const monthYear = currentDate.toLocaleDateString('ko-KR', { 
    year: 'numeric', 
    month: 'long' 
  })

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Calendar className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">달력을 불러오는 중...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* 헤더 */}
      <header className="bg-white shadow-sm px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Button variant="ghost" size="icon" onClick={onBack}>
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </Button>
            <div className="flex items-center space-x-2">
              <div className={selectedMember.color}>{selectedMember.icon}</div>
              <div>
                <h1 className="font-semibold text-gray-800">달력 보기</h1>
                <p className="text-xs text-gray-500">{selectedMember.name}님의 기록</p>
              </div>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={() => onNavigate("record")}>
            <Plus className="w-5 h-5 text-gray-600" />
          </Button>
        </div>
      </header>

      {/* 메인 콘텐츠 */}
      <main className="flex-1 p-4 space-y-6">
        {/* 월 네비게이션 */}
        <Card className="shadow-md">
          <CardHeader>
            <div className="flex items-center justify-between">
              <Button variant="ghost" size="icon" onClick={() => navigateMonth(-1)}>
                <ChevronLeft className="w-5 h-5" />
              </Button>
              <CardTitle className="text-lg text-gray-700">
                {monthYear}
              </CardTitle>
              <Button variant="ghost" size="icon" onClick={() => navigateMonth(1)}>
                <ChevronRight className="w-5 h-5" />
              </Button>
            </div>
          </CardHeader>
        </Card>

        {/* 달력 */}
        <Card className="shadow-md">
          <CardContent className="p-4">
            {/* 요일 헤더 */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {['일', '월', '화', '수', '목', '금', '토'].map((day, index) => (
                <div key={day} className={`text-center text-sm font-medium p-2 ${
                  index === 0 ? 'text-red-500' : index === 6 ? 'text-blue-500' : 'text-gray-700'
                }`}>
                  {day}
                </div>
              ))}
            </div>

            {/* 날짜 그리드 */}
            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map((date, index) => {
                const record = getRecordForDate(date)
                const hasRecord = !!record
                const isCurrentMonthDate = isCurrentMonth(date)
                const isTodayDate = isToday(date)
                
                return (
                  <button
                    key={index}
                    onClick={() => handleDateClick(date)}
                    disabled={!isCurrentMonthDate}
                    className={`
                      relative p-2 text-sm border rounded-lg min-h-[50px] flex flex-col items-center justify-center
                      transition-colors duration-200
                      ${!isCurrentMonthDate ? 'text-gray-300 bg-gray-50 cursor-not-allowed' : 
                        isTodayDate ? 'bg-blue-100 border-blue-300 text-blue-800 font-bold' :
                        hasRecord ? 'bg-green-50 border-green-200 text-green-800 hover:bg-green-100' :
                        'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'}
                    `}
                  >
                    <span className="text-xs">
                      {date.getDate()}
                    </span>
                    {hasRecord && (
                      <span className="text-xs font-medium mt-1">
                        {record.weight.toFixed(1)}
                      </span>
                    )}
                    {hasRecord && (
                      <div className="absolute top-1 right-1 w-2 h-2 bg-green-500 rounded-full" />
                    )}
                  </button>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* 선택된 날짜 상세 정보 */}
        {selectedRecord && selectedDate && (
          <Card className="shadow-md border-green-200 bg-green-50">
            <CardHeader>
              <CardTitle className="text-lg text-green-700">
                {formatDate(selectedDate)}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">몸무게</span>
                <span className="text-xl font-bold text-gray-800">
                  {formatWeight(selectedRecord.weight)}
                </span>
              </div>
              
              {selectedRecord.memo && (
                <div className="space-y-2">
                  <span className="text-gray-600 text-sm">메모</span>
                  <p className="text-gray-700 bg-white p-3 rounded-lg">
                    {selectedRecord.memo}
                  </p>
                </div>
              )}
              
              <Button 
                variant="outline" 
                onClick={() => setSelectedDate(null)}
                className="w-full"
              >
                닫기
              </Button>
            </CardContent>
          </Card>
        )}

        {/* 이번 달 요약 */}
        {records.length > 0 && (
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="text-lg text-gray-700">이번 달 요약</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-blue-600">{records.length}</div>
                  <div className="text-sm text-gray-500">기록 일수</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-600">
                    {(records.reduce((sum, r) => sum + r.weight, 0) / records.length).toFixed(1)}kg
                  </div>
                  <div className="text-sm text-gray-500">평균 몸무게</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 기록이 없는 경우 */}
        {records.length === 0 && (
          <Card className="shadow-md">
            <CardContent className="p-8 text-center">
              <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p className="text-gray-500 mb-4">이번 달에 기록된 몸무게가 없습니다</p>
              <Button onClick={() => onNavigate("record")}>
                <Plus className="w-4 h-4 mr-2" />
                첫 기록 추가하기
              </Button>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}