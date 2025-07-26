"use client"

import React, { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Target, Calendar, TrendingDown, TrendingUp, Minus, ArrowLeft, Save } from "lucide-react"
import { toast } from "@/hooks/use-toast"

// Firebase 서비스
import { goalService, weightService } from "@/lib/services/databaseService"
import { getCurrentUser } from "@/lib/services/authService"

interface GoalSettingProps {
  selectedMember: {
    id: string
    name: string
    icon: React.ReactNode
    color: string
  }
  onNavigate: (screen: string) => void
  onBack: () => void
}

export default function GoalSettingFirebase({ selectedMember, onNavigate, onBack }: GoalSettingProps) {
  const [currentWeight, setCurrentWeight] = useState("")
  const [targetWeight, setTargetWeight] = useState("")
  const [targetDate, setTargetDate] = useState("")
  const [goalType, setGoalType] = useState("maintain")
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const [existingGoal, setExistingGoal] = useState(null)

  const currentUser = getCurrentUser()

  useEffect(() => {
    if (currentUser && selectedMember) {
      loadExistingData()
    }
  }, [currentUser, selectedMember])

  const loadExistingData = async () => {
    try {
      // 기존 목표 불러오기
      const goal = await goalService.getGoal(currentUser.uid, selectedMember.id)
      
      // 최근 몸무게 기록 불러오기
      const recentRecords = await weightService.getRecords(currentUser.uid, selectedMember.id, 1)
      
      if (goal) {
        setExistingGoal(goal)
        setCurrentWeight(goal.currentWeight.toString())
        setTargetWeight(goal.targetWeight.toString())
        setTargetDate(goal.targetDate)
        setGoalType(goal.goalType)
      } else if (recentRecords.length > 0) {
        // 기존 목표가 없으면 최근 몸무게를 현재 몸무게로 설정
        setCurrentWeight(recentRecords[0].weight.toString())
      }

    } catch (error) {
      console.error('기존 데이터 로드 실패:', error)
    } finally {
      setInitialLoading(false)
    }
  }

  const handleSave = async () => {
    if (!currentWeight || !targetWeight || !targetDate) {
      toast({
        title: "입력 오류",
        description: "모든 필드를 입력해주세요.",
        variant: "destructive"
      })
      return
    }

    const currentWeightNum = parseFloat(currentWeight)
    const targetWeightNum = parseFloat(targetWeight)

    if (isNaN(currentWeightNum) || isNaN(targetWeightNum) || 
        currentWeightNum <= 0 || targetWeightNum <= 0 ||
        currentWeightNum > 1000 || targetWeightNum > 1000) {
      toast({
        title: "입력 오류",
        description: "올바른 몸무게를 입력해주세요 (1-1000kg).",
        variant: "destructive"
      })
      return
    }

    const selectedDate = new Date(targetDate)
    const today = new Date()
    if (selectedDate <= today) {
      toast({
        title: "입력 오류",
        description: "목표 날짜는 오늘 이후로 설정해주세요.",
        variant: "destructive"
      })
      return
    }

    setLoading(true)

    try {
      // 목표 타입 자동 결정
      let autoGoalType = goalType
      if (goalType === "maintain") {
        const diff = targetWeightNum - currentWeightNum
        if (diff > 0.5) autoGoalType = "gain"
        else if (diff < -0.5) autoGoalType = "lose"
        else autoGoalType = "maintain"
      }

      // 주간 목표 계산
      const daysDiff = Math.ceil((selectedDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
      const weeksDiff = Math.max(1, daysDiff / 7)
      const totalChange = targetWeightNum - currentWeightNum
      const weeklyTarget = Math.abs(totalChange / weeksDiff)

      await goalService.setGoal(currentUser.uid, selectedMember.id, {
        currentWeight: currentWeightNum,
        targetWeight: targetWeightNum,
        targetDate,
        goalType: autoGoalType,
        weeklyTarget
      })

      toast({
        title: "목표 설정 완료!",
        description: `${selectedMember.name}의 목표가 설정되었습니다.`
      })

      // 대시보드로 이동
      onNavigate("dashboard")

    } catch (error) {
      console.error('목표 설정 실패:', error)
      toast({
        title: "설정 실패",
        description: "목표 설정에 실패했습니다. 다시 시도해주세요.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const calculateDifference = () => {
    if (!currentWeight || !targetWeight) return { diff: 0, type: "maintain" }
    
    const current = parseFloat(currentWeight)
    const target = parseFloat(targetWeight)
    
    if (isNaN(current) || isNaN(target)) return { diff: 0, type: "maintain" }
    
    const diff = target - current
    let type = "maintain"
    
    if (diff > 0.5) type = "gain"
    else if (diff < -0.5) type = "lose"
    
    return { diff: parseFloat(diff.toFixed(1)), type }
  }

  const calculateWeeksToGoal = () => {
    if (!targetDate) return 0
    
    const target = new Date(targetDate)
    const today = new Date()
    const diffTime = target.getTime() - today.getTime()
    const diffWeeks = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 7))
    
    return Math.max(0, diffWeeks)
  }

  const { diff, type } = calculateDifference()
  const weeksToGoal = calculateWeeksToGoal()

  if (initialLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Target className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">목표 정보를 불러오는 중...</p>
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
                <h1 className="font-semibold text-gray-800">목표 설정</h1>
                <p className="text-xs text-gray-500">{selectedMember.name}님의 목표를 설정해보세요</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* 메인 콘텐츠 */}
      <main className="flex-1 p-4 space-y-6">
        {existingGoal && (
          <Card className="shadow-md border-blue-200 bg-blue-50">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2 text-blue-700">
                <Target className="w-4 h-4" />
                <span className="text-sm font-medium">기존 목표를 수정하고 있습니다</span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 현재 몸무게 */}
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="text-lg text-gray-700">현재 몸무게</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="currentWeight">몸무게 (kg)</Label>
              <Input
                id="currentWeight"
                type="number"
                step="0.1"
                placeholder="현재 몸무게를 입력하세요"
                value={currentWeight}
                onChange={(e) => setCurrentWeight(e.target.value)}
                disabled={loading}
              />
            </div>
          </CardContent>
        </Card>

        {/* 목표 몸무게 */}
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="text-lg text-gray-700">목표 몸무게</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="targetWeight">목표 몸무게 (kg)</Label>
              <Input
                id="targetWeight"
                type="number"
                step="0.1"
                placeholder="목표 몸무게를 입력하세요"
                value={targetWeight}
                onChange={(e) => setTargetWeight(e.target.value)}
                disabled={loading}
              />
            </div>
          </CardContent>
        </Card>

        {/* 목표 날짜 */}
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="text-lg text-gray-700 flex items-center space-x-2">
              <Calendar className="w-5 h-5" />
              <span>목표 달성 날짜</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="targetDate">목표 날짜</Label>
              <Input
                id="targetDate"
                type="date"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                min={new Date(Date.now() + 86400000).toISOString().split('T')[0]} // 내일부터
                disabled={loading}
              />
            </div>
          </CardContent>
        </Card>

        {/* 목표 요약 */}
        {currentWeight && targetWeight && targetDate && (
          <Card className="shadow-md border-green-200 bg-green-50">
            <CardHeader>
              <CardTitle className="text-lg text-green-700">목표 요약</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">목표 유형</span>
                <div className="flex items-center space-x-2">
                  {type === "lose" && <TrendingDown className="w-4 h-4 text-blue-500" />}
                  {type === "gain" && <TrendingUp className="w-4 h-4 text-red-500" />}
                  {type === "maintain" && <Minus className="w-4 h-4 text-gray-500" />}
                  <span className="font-medium">
                    {type === "lose" ? "체중 감량" : type === "gain" ? "체중 증가" : "체중 유지"}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-gray-600">변화량</span>
                <span className={`font-medium ${
                  type === "lose" ? "text-blue-600" : 
                  type === "gain" ? "text-red-600" : "text-gray-600"
                }`}>
                  {diff > 0 ? "+" : ""}{diff}kg
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-gray-600">목표 기간</span>
                <span className="font-medium">{weeksToGoal}주</span>
              </div>
              
              {weeksToGoal > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">주간 목표</span>
                  <span className="font-medium">
                    {(Math.abs(diff) / weeksToGoal).toFixed(1)}kg/주
                  </span>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* 저장 버튼 */}
        <Button 
          onClick={handleSave} 
          className="w-full h-12 text-lg font-semibold bg-green-600 hover:bg-green-700"
          disabled={loading || !currentWeight || !targetWeight || !targetDate}
        >
          <Save className="w-5 h-5 mr-2" />
          {loading ? "저장 중..." : existingGoal ? "목표 수정" : "목표 설정"}
        </Button>
      </main>
    </div>
  )
}