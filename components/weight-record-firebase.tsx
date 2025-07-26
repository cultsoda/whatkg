"use client"

import React, { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Scale, Calendar, FileText, Save, ArrowLeft } from "lucide-react"
import { toast } from "@/hooks/use-toast"

// Firebase 서비스
import { weightService } from "@/lib/services/databaseService"
import { getCurrentUser } from "@/lib/services/authService"

interface WeightRecordProps {
  selectedMember: {
    id: string
    name: string
    icon: React.ReactNode
    color: string
  }
  onBack: () => void
}

export default function WeightRecordFirebase({ selectedMember, onBack }: WeightRecordProps) {
  const [weight, setWeight] = useState("")
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [memo, setMemo] = useState("")
  const [loading, setLoading] = useState(false)
  const [recentRecords, setRecentRecords] = useState([])

  // 현재 사용자 정보
  const currentUser = getCurrentUser()

  // 최근 기록 불러오기
  useEffect(() => {
    if (currentUser && selectedMember) {
      loadRecentRecords()
    }
  }, [currentUser, selectedMember])

  const loadRecentRecords = async () => {
    try {
      const records = await weightService.getRecords(
        currentUser.uid, 
        selectedMember.id, 
        5 // 최근 5개만
      )
      setRecentRecords(records)
    } catch (error) {
      console.error('최근 기록 로드 실패:', error)
    }
  }

  const handleSave = async () => {
    if (!weight.trim()) {
      toast({
        title: "입력 오류",
        description: "몸무게를 입력해주세요.",
        variant: "destructive"
      })
      return
    }

    const weightValue = parseFloat(weight)
    if (isNaN(weightValue) || weightValue <= 0 || weightValue > 1000) {
      toast({
        title: "입력 오류", 
        description: "올바른 몸무게를 입력해주세요 (1-1000kg).",
        variant: "destructive"
      })
      return
    }

    setLoading(true)

    try {
      await weightService.addRecord(currentUser.uid, selectedMember.id, {
        weight: weightValue,
        date,
        memo: memo.trim()
      })

      toast({
        title: "저장 완료!",
        description: `${selectedMember.name}의 몸무게가 기록되었습니다.`
      })

      // 폼 초기화
      setWeight("")
      setMemo("")
      setDate(new Date().toISOString().split('T')[0])

      // 최근 기록 새로고침
      await loadRecentRecords()

    } catch (error) {
      console.error('저장 실패:', error)
      toast({
        title: "저장 실패",
        description: "몸무게 기록 저장에 실패했습니다. 다시 시도해주세요.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('ko-KR', {
      month: 'short',
      day: 'numeric',
      weekday: 'short'
    })
  }

  const formatWeight = (weight: number) => {
    return `${weight.toFixed(1)}kg`
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4">
      <div className="max-w-md mx-auto space-y-6">
        {/* 헤더 */}
        <div className="flex items-center justify-between">
          <Button 
            variant="ghost" 
            onClick={onBack}
            className="p-2"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-xl font-bold text-gray-800">몸무게 기록</h1>
          <div className="w-9" /> {/* 공간 확보용 */}
        </div>

        {/* 선택된 구성원 표시 */}
        <Card className="shadow-md">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className={selectedMember.color}>
                {selectedMember.icon}
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-800">
                  {selectedMember.name}
                </h2>
                <p className="text-sm text-gray-500">몸무게를 기록해보세요</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 몸무게 입력 */}
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-gray-700">
              <Scale className="w-5 h-5" />
              <span>몸무게</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Input
                type="number"
                step="0.1"
                placeholder="몸무게를 입력하세요"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                className="text-lg text-center font-semibold"
                disabled={loading}
              />
              <p className="text-xs text-gray-500 text-center mt-1">
                kg 단위로 입력해주세요
              </p>
            </div>
          </CardContent>
        </Card>

        {/* 날짜 선택 */}
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-gray-700">
              <Calendar className="w-5 h-5" />
              <span>날짜</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              disabled={loading}
            />
          </CardContent>
        </Card>

        {/* 메모 */}
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-gray-700">
              <FileText className="w-5 h-5" />
              <span>메모 (선택사항)</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="오늘의 몸무게에 대한 메모를 남겨보세요..."
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              rows={3}
              disabled={loading}
            />
          </CardContent>
        </Card>

        {/* 최근 기록 */}
        {recentRecords.length > 0 && (
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="text-gray-700">최근 기록</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {recentRecords.map((record, index) => (
                  <div 
                    key={record.id} 
                    className="flex justify-between items-center p-2 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600">
                        {formatDate(record.date)}
                      </span>
                      {index === 0 && (
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                          최신
                        </span>
                      )}
                    </div>
                    <span className="font-semibold text-gray-800">
                      {formatWeight(record.weight)}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* 저장 버튼 */}
        <Button 
          onClick={handleSave} 
          className="w-full h-12 text-lg font-semibold bg-blue-600 hover:bg-blue-700"
          disabled={loading}
        >
          <Save className="w-5 h-5 mr-2" />
          {loading ? "저장 중..." : "기록 저장"}
        </Button>
      </div>
    </div>
  )
}