"use client"

import type React from "react"
import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, ReferenceLine } from "recharts"
import {
  Home,
  FileText,
  BarChart3,
  CalendarDays,
  List,
  TrendingUp,
  TrendingDown,
  Target,
  Calendar,
  Award,
  ArrowLeft,
} from "lucide-react"

interface User {
  id: string
  name: string
  icon: React.ReactNode
  color: string
}

interface ChartData {
  date: string
  weight: number
  formattedDate: string
}

interface Statistics {
  startWeight: number
  currentWeight: number
  totalChange: number
  weeklyAverage: number
  maxWeight: number
  minWeight: number
  recordDays: number
  goalWeight: number
}

interface WeightChartProps {
  user: User
  onNavigate: (screen: string) => void
}

const rawChartData = [
  { date: "2024-07-01", weight: 60.2 },
  { date: "2024-07-05", weight: 59.8 },
  { date: "2024-07-10", weight: 59.5 },
  { date: "2024-07-15", weight: 59.1 },
  { date: "2024-07-20", weight: 58.9 },
  { date: "2024-07-25", weight: 58.5 },
]

const statistics: Statistics = {
  startWeight: 60.2,
  currentWeight: 58.5,
  totalChange: -1.7,
  weeklyAverage: -0.4,
  maxWeight: 60.5,
  minWeight: 58.3,
  recordDays: 25,
  goalWeight: 57.0,
}

export default function WeightChart({ user, onNavigate }: WeightChartProps) {
  const [selectedPeriod, setSelectedPeriod] = useState("1개월")

  const periods = ["1주일", "1개월", "3개월", "전체"]

  // 차트 데이터 포맷팅
  const chartData: ChartData[] = rawChartData.map((item) => ({
    ...item,
    formattedDate: new Date(item.date).toLocaleDateString("ko-KR", {
      month: "short",
      day: "numeric",
    }),
  }))

  // 추세선 계산 (단순 선형 회귀)
  const calculateTrendLine = () => {
    const n = chartData.length
    const sumX = chartData.reduce((sum, _, index) => sum + index, 0)
    const sumY = chartData.reduce((sum, item) => sum + item.weight, 0)
    const sumXY = chartData.reduce((sum, item, index) => sum + index * item.weight, 0)
    const sumXX = chartData.reduce((sum, _, index) => sum + index * index, 0)

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX)
    const intercept = (sumY - slope * sumX) / n

    return chartData.map((_, index) => ({
      x: index,
      trend: slope * index + intercept,
    }))
  }

  const trendData = calculateTrendLine()

  const navigationItems = [
    { id: "home", label: "홈", icon: <Home className="w-5 h-5" />, active: false },
    { id: "record", label: "기록", icon: <FileText className="w-5 h-5" />, active: false },
    { id: "chart", label: "차트", icon: <BarChart3 className="w-5 h-5" />, active: true },
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
              <div>
                <h1 className="font-semibold text-gray-800">{user.name}님의 몸무게 변화</h1>
                <p className="text-xs text-gray-500">체중 변화 추이를 확인해보세요</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* 메인 콘텐츠 */}
      <main className="flex-1 p-4 space-y-6">
        {/* 기간 선택 탭 */}
        <Card className="shadow-md">
          <CardContent className="p-4">
            <div className="flex space-x-2">
              {periods.map((period) => (
                <Button
                  key={period}
                  variant={selectedPeriod === period ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedPeriod(period)}
                  className={`flex-1 ${
                    selectedPeriod === period
                      ? "bg-emerald-500 hover:bg-emerald-600 text-white"
                      : "text-gray-600 hover:text-gray-800"
                  }`}
                >
                  {period}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 메인 차트 */}
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="text-lg text-gray-700 flex items-center space-x-2">
              <TrendingUp className="w-5 h-5" />
              <span>몸무게 변화 추이</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                weight: {
                  label: "몸무게",
                  color: "hsl(var(--chart-1))",
                },
              }}
              className="h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis
                    dataKey="formattedDate"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: "#666" }}
                  />
                  <YAxis
                    domain={["dataMin - 0.5", "dataMax + 0.5"]}
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: "#666" }}
                  />
                  <ChartTooltip
                    content={<ChartTooltipContent />}
                    labelFormatter={(value) => `날짜: ${value}`}
                    formatter={(value: any) => [`${value}kg`, "몸무게"]}
                  />
                  {/* 목표 체중 라인 */}
                  <ReferenceLine
                    y={statistics.goalWeight}
                    stroke="#f59e0b"
                    strokeDasharray="5 5"
                    label={{ value: "목표", position: "right" }}
                  />
                  {/* 메인 데이터 라인 */}
                  <Line
                    type="monotone"
                    dataKey="weight"
                    stroke="var(--color-weight)"
                    strokeWidth={3}
                    dot={{ fill: "var(--color-weight)", strokeWidth: 2, r: 6 }}
                    activeDot={{ r: 8, stroke: "var(--color-weight)", strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* 통계 정보 카드들 (2x2 그리드) */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="shadow-md">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-gray-800">{statistics.startWeight}kg</div>
              <div className="text-sm text-gray-500 mt-1">시작 몸무게</div>
            </CardContent>
          </Card>

          <Card className="shadow-md">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-gray-800">{statistics.currentWeight}kg</div>
              <div className="text-sm text-gray-500 mt-1">현재 몸무게</div>
            </CardContent>
          </Card>

          <Card className="shadow-md">
            <CardContent className="p-4 text-center">
              <div className={`text-2xl font-bold ${statistics.totalChange > 0 ? "text-red-500" : "text-blue-500"}`}>
                {statistics.totalChange > 0 ? "+" : ""}
                {statistics.totalChange}kg
              </div>
              <div className="text-sm text-gray-500 mt-1 flex items-center justify-center space-x-1">
                {statistics.totalChange > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                <span>총 변화량</span>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-md">
            <CardContent className="p-4 text-center">
              <div className={`text-2xl font-bold ${statistics.weeklyAverage > 0 ? "text-red-500" : "text-blue-500"}`}>
                {statistics.weeklyAverage > 0 ? "+" : ""}
                {statistics.weeklyAverage}kg
              </div>
              <div className="text-sm text-gray-500 mt-1">주간 평균</div>
            </CardContent>
          </Card>
        </div>

        {/* 추가 정보 */}
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="text-lg text-gray-700 flex items-center space-x-2">
              <Award className="w-5 h-5" />
              <span>상세 통계</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">최고 몸무게</span>
                  <span className="font-semibold text-red-500">{statistics.maxWeight}kg</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">최저 몸무게</span>
                  <span className="font-semibold text-blue-500">{statistics.minWeight}kg</span>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">기록 일수</span>
                  <span className="font-semibold text-gray-800 flex items-center space-x-1">
                    <Calendar className="w-4 h-4" />
                    <span>{statistics.recordDays}일</span>
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">목표까지</span>
                  <span className="font-semibold text-orange-500 flex items-center space-x-1">
                    <Target className="w-4 h-4" />
                    <span>{Math.abs(statistics.currentWeight - statistics.goalWeight).toFixed(1)}kg</span>
                  </span>
                </div>
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
