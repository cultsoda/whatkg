"use client"

import React, { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, ReferenceLine } from "recharts"
import { TrendingUp, TrendingDown, ArrowLeft } from "lucide-react"
import { toast } from "@/hooks/use-toast"

// Firebase 서비스
import { weightService, goalService, statisticsService } from "@/lib/services/databaseService"
import { getCurrentUser } from "@/lib/services/authService"

interface WeightChartProps {
  selectedMember: {
    id: string
    name: string
    icon: React.ReactNode
    color: string
  }
  onNavigate: (screen: string) => void
  onBack: () => void
}

export default function WeightChartFirebase({ selectedMember, onNavigate, onBack }: WeightChartProps) {
  const [selectedPeriod, setSelectedPeriod] = useState("1개월")
  const [chartData, setChartData] = useState([])
  const [statistics, setStatistics] = useState({
    startWeight: null,
    currentWeight: null,
    totalChange: 0,
    weeklyAverage: 0,
    maxWeight: null,
    minWeight: null,
    recordDays: 0,
    goalWeight: null
  })
  const [loading, setLoading] = useState(true)

  const currentUser = getCurrentUser()
  const periods = ["1주일", "1개월", "3개월", "전체"]

  useEffect(() => {
    if (currentUser && selectedMember) {
      loadChartData()
    }
  }, [currentUser, selectedMember, selectedPeriod])

  const loadChartData = async () => {
    setLoading(true)
    
    try {
      // 기간별 날짜 범위 계산
      const endDate = new Date()
      const startDate = new Date()
      
      switch (selectedPeriod) {
        case "1주일": startDate.setDate(startDate.getDate() - 7); break
        case "1개월": startDate.setMonth(startDate.getMonth() - 1); break
        case "3개월": startDate.setMonth(startDate.getMonth() - 3); break
        case "전체": startDate.setFullYear(startDate.getFullYear() - 2); break
      }

      // 데이터 가져오기
      const records = await weightService.getRecordsByDateRange(
        currentUser.uid,
        selectedMember.id,
        startDate.toISOString().split('T')[0],
        endDate.toISOString().split('T')[0]
      )

      const goal = await goalService.getGoal(currentUser.uid, selectedMember.id)

      // 차트 데이터 포맷팅
      const formattedData = records
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        .map((record) => ({
          date: record.date,
          weight: record.weight,
          formattedDate: new Date(record.date).toLocaleDateString("ko-KR", {
            month: "short",
            day: "numeric",
          })
        }))

      setChartData(formattedData)

      // 통계 계산
      if (records.length > 0) {
        const weights = records.map(r => r.weight)
        const sortedByDate = records.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        
        const startWeight = sortedByDate[0].weight
        const currentWeight = sortedByDate[sortedByDate.length - 1].weight
        const totalChange = currentWeight - startWeight
        
        const daysDiff = Math.max(1, (new Date(sortedByDate[sortedByDate.length - 1].date).getTime() - 
                                     new Date(sortedByDate[0].date).getTime()) / (1000 * 60 * 60 * 24))
        const weeklyAverage = (totalChange / daysDiff) * 7

        setStatistics({
          startWeight,
          currentWeight,
          totalChange: parseFloat(totalChange.toFixed(1)),
          weeklyAverage: parseFloat(weeklyAverage.toFixed(1)),
          maxWeight: Math.max(...weights),
          minWeight: Math.min(...weights),
          recordDays: records.length,
          goalWeight: goal?.targetWeight || null
        })
      }

    } catch (error) {
      console.error('차트 데이터 로드 실패:', error)
      toast({
        title: "데이터 로드 실패",
        description: "차트 정보를 불러오는데 실패했습니다.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <TrendingUp className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">차트를 불러오는 중...</p>
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
                <h1 className="font-semibold text-gray-800">{selectedMember.name}님의 몸무게 변화</h1>
                <p className="text-xs text-gray-500">체중 변화 추이를 확인해보세요</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* 메인 콘텐츠 */}
      <main className="flex-1 p-4 space-y-6">
        {/* 기간 선택 */}
        <Card className="shadow-md">
          <CardContent className="p-4">
            <div className="flex space-x-2">
              {periods.map((period) => (
                <Button
                  key={period}
                  variant={selectedPeriod === period ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedPeriod(period)}
                  className="flex-1"
                >
                  {period}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 차트 */}
        {chartData.length > 0 ? (
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
                  weight: { label: "몸무게", color: "hsl(var(--chart-1))" }
                }}
                className="h-[300px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="formattedDate" />
                    <YAxis domain={["dataMin - 0.5", "dataMax + 0.5"]} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    {statistics.goalWeight && (
                      <ReferenceLine
                        y={statistics.goalWeight}
                        stroke="#f59e0b"
                        strokeDasharray="5 5"
                        label={{ value: "목표", position: "right" }}
                      />
                    )}
                    <Line
                      type="monotone"
                      dataKey="weight"
                      stroke="var(--color-weight)"
                      strokeWidth={3}
                      dot={{ fill: "var(--color-weight)", strokeWidth: 2, r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        ) : (
          <Card className="shadow-md">
            <CardContent className="p-8 text-center">
              <TrendingUp className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p className="text-gray-500 mb-4">선택한 기간에 기록이 없습니다</p>
              <Button onClick={() => onNavigate("record")}>
                기록 추가하기
              </Button>
            </CardContent>
          </Card>
        )}

        {/* 통계 정보 */}
        {statistics.currentWeight && (
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
                  {statistics.totalChange > 0 ? "+" : ""}{statistics.totalChange}kg
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
                  {statistics.weeklyAverage > 0 ? "+" : ""}{statistics.weeklyAverage}kg
                </div>
                <div className="text-sm text-gray-500 mt-1">주간 평균</div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  )
}