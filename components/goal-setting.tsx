"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { ChartContainer } from "@/components/ui/chart"
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, ReferenceLine } from "recharts"
import {
  ArrowLeft,
  Target,
  TrendingDown,
  TrendingUp,
  Minus,
  Clock,
  Bell,
  RotateCcw,
  Save,
  AlertTriangle,
  CheckCircle,
} from "lucide-react"

interface User {
  id: string
  name: string
  icon: React.ReactNode
  color: string
}

interface CurrentStatus {
  currentWeight: number
  weeklyTrend: number
  totalChange: number
  startDate: string
}

interface GoalSettingProps {
  user: User
  onNavigate: (screen: string) => void
  onSave: (goalData: any) => void
}

const currentStatus: CurrentStatus = {
  currentWeight: 58.5,
  weeklyTrend: -0.3,
  totalChange: -1.7,
  startDate: "2024-07-01",
}

export default function GoalSetting({ user, onNavigate, onSave }: GoalSettingProps) {
  const [targetWeight, setTargetWeight] = useState("57.0")
  const [goalType, setGoalType] = useState<"decrease" | "increase" | "maintain">("decrease")
  const [weeklyGoal, setWeeklyGoal] = useState("0.4")
  const [dailyReminder, setDailyReminder] = useState(true)
  const [achievementAlert, setAchievementAlert] = useState(true)
  const [reminderTime, setReminderTime] = useState("09:00")
  const [errors, setErrors] = useState<{ [key: string]: string }>({})

  // 계산된 값들
  const [goalCalculation, setGoalCalculation] = useState({
    requiredChange: 0,
    estimatedDays: 0,
    estimatedDate: "",
    weeklyRecommended: 0,
    isHealthyGoal: true,
  })

  // 목표 계산 로직
  useEffect(() => {
    const target = Number.parseFloat(targetWeight)
    const weekly = Number.parseFloat(weeklyGoal)

    if (!isNaN(target) && !isNaN(weekly)) {
      const requiredChange = target - currentStatus.currentWeight
      const weeksNeeded = Math.abs(requiredChange) / Math.abs(weekly || 0.1)
      const estimatedDays = Math.ceil(weeksNeeded * 7)

      const estimatedDate = new Date()
      estimatedDate.setDate(estimatedDate.getDate() + estimatedDays)

      // 건강한 주당 변화량 (체중의 0.5~1%)
      const healthyWeeklyMin = currentStatus.currentWeight * 0.005
      const healthyWeeklyMax = currentStatus.currentWeight * 0.01
      const isHealthyGoal = Math.abs(weekly) >= healthyWeeklyMin && Math.abs(weekly) <= healthyWeeklyMax

      setGoalCalculation({
        requiredChange,
        estimatedDays,
        estimatedDate: estimatedDate.toLocaleDateString("ko-KR"),
        weeklyRecommended: (healthyWeeklyMin + healthyWeeklyMax) / 2,
        isHealthyGoal,
      })
    }
  }, [targetWeight, weeklyGoal])

  // 목표 타입 자동 설정
  useEffect(() => {
    const target = Number.parseFloat(targetWeight)
    if (!isNaN(target)) {
      const diff = target - currentStatus.currentWeight
      if (Math.abs(diff) <= 0.5) {
        setGoalType("maintain")
      } else if (diff > 0) {
        setGoalType("increase")
      } else {
        setGoalType("decrease")
      }
    }
  }, [targetWeight])

  // 유효성 검사
  const validateForm = () => {
    const newErrors: { [key: string]: string } = {}
    const target = Number.parseFloat(targetWeight)
    const weekly = Number.parseFloat(weeklyGoal)

    // 목표 몸무게 검증
    if (!targetWeight) {
      newErrors.targetWeight = "목표 몸무게를 입력해주세요"
    } else if (isNaN(target)) {
      newErrors.targetWeight = "올바른 숫자를 입력해주세요"
    } else if (target < currentStatus.currentWeight - 20 || target > currentStatus.currentWeight + 20) {
      newErrors.targetWeight = "현재 몸무게 ±20kg 범위 내에서 설정해주세요"
    }

    // 주간 목표 검증
    if (!weeklyGoal) {
      newErrors.weeklyGoal = "주간 목표를 입력해주세요"
    } else if (isNaN(weekly)) {
      newErrors.weeklyGoal = "올바른 숫자를 입력해주세요"
    } else if (weekly < 0.1 || weekly > 1.0) {
      newErrors.weeklyGoal = "0.1kg ~ 1.0kg 범위로 설정해주세요"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSave = () => {
    if (validateForm()) {
      const goalData = {
        targetWeight: Number.parseFloat(targetWeight),
        goalType,
        weeklyGoal: Number.parseFloat(weeklyGoal),
        dailyReminder,
        achievementAlert,
        reminderTime,
        estimatedDate: goalCalculation.estimatedDate,
      }
      onSave(goalData)
      onNavigate("dashboard")
    }
  }

  const handleReset = () => {
    setTargetWeight("57.0")
    setWeeklyGoal("0.4")
    setDailyReminder(true)
    setAchievementAlert(true)
    setReminderTime("09:00")
    setErrors({})
  }

  // 시뮬레이션 차트 데이터
  const generateChartData = () => {
    const data = []
    const weeks = Math.min(
      12,
      Math.ceil(Math.abs(goalCalculation.requiredChange) / Number.parseFloat(weeklyGoal || "0.4")),
    )

    for (let i = 0; i <= weeks; i++) {
      const weight = currentStatus.currentWeight + (goalCalculation.requiredChange * i) / weeks
      data.push({
        week: i,
        weight: Number.parseFloat(weight.toFixed(1)),
      })
    }

    return data
  }

  const chartData = generateChartData()

  const goalTypes = [
    {
      id: "decrease",
      label: "체중 감량",
      icon: <TrendingDown className="w-5 h-5" />,
      description: "건강한 속도로 체중을 줄여보세요",
      color: "text-blue-600 bg-blue-50 border-blue-200",
    },
    {
      id: "increase",
      label: "체중 증가",
      icon: <TrendingUp className="w-5 h-5" />,
      description: "균형잡힌 방법으로 체중을 늘려보세요",
      color: "text-green-600 bg-green-50 border-green-200",
    },
    {
      id: "maintain",
      label: "체중 유지",
      icon: <Minus className="w-5 h-5" />,
      description: "현재 체중을 건강하게 유지해보세요",
      color: "text-gray-600 bg-gray-50 border-gray-200",
    },
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
              <h1 className="font-semibold text-gray-800">목표 설정</h1>
            </div>
          </div>
        </div>
      </header>

      {/* 메인 콘텐츠 */}
      <main className="flex-1 p-4 space-y-6">
        {/* 현재 상태 카드 */}
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="text-lg text-gray-700 flex items-center space-x-2">
              <Target className="w-5 h-5" />
              <span>현재 상태</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-gray-800">{currentStatus.currentWeight}kg</div>
                <div className="text-xs text-gray-500">현재 몸무게</div>
              </div>
              <div>
                <div
                  className={`text-2xl font-bold ${currentStatus.weeklyTrend < 0 ? "text-blue-600" : "text-red-600"}`}
                >
                  {currentStatus.weeklyTrend > 0 ? "+" : ""}
                  {currentStatus.weeklyTrend}kg
                </div>
                <div className="text-xs text-gray-500">주간 추세</div>
              </div>
              <div>
                <div
                  className={`text-2xl font-bold ${currentStatus.totalChange < 0 ? "text-blue-600" : "text-red-600"}`}
                >
                  {currentStatus.totalChange > 0 ? "+" : ""}
                  {currentStatus.totalChange}kg
                </div>
                <div className="text-xs text-gray-500">총 변화량</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 목표 설정 섹션 */}
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="text-lg text-gray-700">목표 몸무게</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="targetWeight" className="text-sm font-medium text-gray-700">
                목표 몸무게 *
              </Label>
              <div className="relative">
                <Input
                  id="targetWeight"
                  type="number"
                  step="0.1"
                  value={targetWeight}
                  onChange={(e) => setTargetWeight(e.target.value)}
                  placeholder="57.0"
                  className={`pr-12 text-lg ${errors.targetWeight ? "border-red-500" : ""}`}
                />
                <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">
                  kg
                </span>
              </div>
              {errors.targetWeight && <p className="text-sm text-red-500">{errors.targetWeight}</p>}
            </div>

            {/* 목표 달성 예상 정보 */}
            {!errors.targetWeight && targetWeight && (
              <div className="bg-emerald-50 p-4 rounded-lg space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">필요한 변화량</span>
                  <span
                    className={`font-semibold ${goalCalculation.requiredChange < 0 ? "text-blue-600" : "text-red-600"}`}
                  >
                    {goalCalculation.requiredChange > 0 ? "+" : ""}
                    {goalCalculation.requiredChange.toFixed(1)}kg
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">예상 달성일</span>
                  <span className="font-semibold text-gray-800 flex items-center space-x-1">
                    <Clock className="w-4 h-4" />
                    <span>{goalCalculation.estimatedDate}</span>
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">권장 주간 변화량</span>
                  <span className="font-semibold text-emerald-600">
                    {goalCalculation.weeklyRecommended.toFixed(1)}kg/주
                  </span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 목표 타입 선택 */}
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="text-lg text-gray-700">목표 타입</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {goalTypes.map((type) => (
                <div
                  key={type.id}
                  className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                    goalType === type.id ? type.color : "bg-white border-gray-200 hover:bg-gray-50"
                  }`}
                  onClick={() => setGoalType(type.id as any)}
                >
                  <div className="flex items-center space-x-3">
                    {type.icon}
                    <div>
                      <div className="font-medium">{type.label}</div>
                      <div className="text-sm text-gray-600">{type.description}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 주간 목표 설정 */}
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="text-lg text-gray-700">주간 목표</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="weeklyGoal" className="text-sm font-medium text-gray-700">
                주당 목표 변화량 *
              </Label>
              <div className="relative">
                <Input
                  id="weeklyGoal"
                  type="number"
                  step="0.1"
                  min="0.1"
                  max="1.0"
                  value={weeklyGoal}
                  onChange={(e) => setWeeklyGoal(e.target.value)}
                  placeholder="0.4"
                  className={`pr-16 ${errors.weeklyGoal ? "border-red-500" : ""}`}
                />
                <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">kg/주</span>
              </div>
              {errors.weeklyGoal && <p className="text-sm text-red-500">{errors.weeklyGoal}</p>}

              {!goalCalculation.isHealthyGoal && weeklyGoal && (
                <div className="flex items-center space-x-2 text-orange-600 bg-orange-50 p-2 rounded">
                  <AlertTriangle className="w-4 h-4" />
                  <span className="text-sm">권장 범위를 벗어났습니다. 건강한 속도로 조절해보세요.</span>
                </div>
              )}

              {goalCalculation.isHealthyGoal && weeklyGoal && (
                <div className="flex items-center space-x-2 text-green-600 bg-green-50 p-2 rounded">
                  <CheckCircle className="w-4 h-4" />
                  <span className="text-sm">건강한 목표 설정입니다!</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* 시뮬레이션 차트 */}
        {chartData.length > 1 && (
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="text-lg text-gray-700">목표 달성 예상 경로</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  weight: {
                    label: "몸무게",
                    color: "hsl(var(--chart-1))",
                  },
                }}
                className="h-[200px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <XAxis dataKey="week" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                    <YAxis
                      domain={["dataMin - 0.5", "dataMax + 0.5"]}
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12 }}
                    />
                    <ReferenceLine
                      y={Number.parseFloat(targetWeight)}
                      stroke="#10b981"
                      strokeDasharray="5 5"
                      label={{ value: "목표", position: "right" }}
                    />
                    <Line
                      type="monotone"
                      dataKey="weight"
                      stroke="var(--color-weight)"
                      strokeWidth={2}
                      dot={{ fill: "var(--color-weight)", strokeWidth: 2, r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        )}

        {/* 알림 설정 */}
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="text-lg text-gray-700 flex items-center space-x-2">
              <Bell className="w-5 h-5" />
              <span>알림 설정</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-gray-700">매일 기록 알림</div>
                <div className="text-sm text-gray-500">매일 정해진 시간에 기록을 알려드려요</div>
              </div>
              <Switch checked={dailyReminder} onCheckedChange={setDailyReminder} />
            </div>

            {dailyReminder && (
              <div className="ml-4 space-y-2">
                <Label htmlFor="reminderTime" className="text-sm font-medium text-gray-700">
                  알림 시간
                </Label>
                <Input
                  id="reminderTime"
                  type="time"
                  value={reminderTime}
                  onChange={(e) => setReminderTime(e.target.value)}
                  className="w-32"
                />
              </div>
            )}

            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-gray-700">목표 달성 격려 알림</div>
                <div className="text-sm text-gray-500">목표에 가까워질 때 응원 메시지를 보내드려요</div>
              </div>
              <Switch checked={achievementAlert} onCheckedChange={setAchievementAlert} />
            </div>
          </CardContent>
        </Card>

        {/* 액션 버튼 */}
        <div className="flex space-x-3 pb-6">
          <Button onClick={handleSave} className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white h-12">
            <Save className="w-4 h-4 mr-2" />
            목표 저장
          </Button>
          <Button onClick={handleReset} variant="outline" className="px-6 h-12 bg-transparent">
            <RotateCcw className="w-4 h-4 mr-2" />
            재설정
          </Button>
        </div>
      </main>
    </div>
  )
}
