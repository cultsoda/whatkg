"use client"

import React, { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Scale, TrendingUp, TrendingDown, Target, Calendar, BarChart, Settings, User, ArrowLeft, Plus } from "lucide-react"
import { toast } from "@/hooks/use-toast"

// Firebase 서비스
import { weightService, goalService, statisticsService } from "@/lib/services/databaseService"
import { getCurrentUser } from "@/lib/services/authService"

interface MainDashboardProps {
  selectedMember: {
    id: string
    name: string
    icon: React.ReactNode
    color: string
    bgColor: string
  }
  onNavigate: (screen: string) => void
  onBack: () => void
}

interface DashboardData {
  latestWeight: number | null
  weightTrend: {
    trend: string
    change: number
    period: number
  } | null
  goalProgress: {
    progressPercentage: number
    currentWeight: number
    targetWeight: number
    remainingWeight: number
    goalType: string
  } | null
  recentRecords: any[]
  recordCount: number
}

export default function MainDashboardFirebase({ selectedMember, onNavigate, onBack }: MainDashboardProps) {
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    latestWeight: null,
    weightTrend: null,
    goalProgress: null,
    recentRecords: [],
    recordCount: 0
  })
  const [loading, setLoading] = useState(true)

  const currentUser = getCurrentUser()

  useEffect(() => {
    if (currentUser && selectedMember) {
      loadDashboardData()
    }
  }, [currentUser, selectedMember])

  const loadDashboardData = async () => {
    setLoading(true)
    
    try {
      // 최근 기록들 가져오기
      const recentRecords = await weightService.getRecords(
        currentUser.uid, 
        selectedMember.id, 
        10
      )

      // 최신 몸무게
      const latestWeight = recentRecords.length > 0 ? recentRecords[0].weight : null

      // 몸무게 트렌드 분석 (최근 30일)
      const weightTrend = await statisticsService.getWeightTrend(
        currentUser.uid, 
        selectedMember.id, 
        30
      )

      // 목표 달성률
      const goalProgress = await statisticsService.getGoalProgress(
        currentUser.uid, 
        selectedMember.id
      )

      setDashboardData({
        latestWeight,
        weightTrend,
        goalProgress,
        recentRecords,
        recordCount: recentRecords.length
      })

    } catch (error) {
      console.error('대시보드 데이터 로드 실패:', error)
      toast({
        title: "데이터 로드 실패",
        description: "대시보드 정보를 불러오는데 실패했습니다.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'increasing':
        return <TrendingUp className="w-5 h-5 text-red-500" />
      case 'decreasing':
        return <TrendingDown className="w-5 h-5 text-green-500" />
      default:
        return <TrendingUp className="w-5 h-5 text-gray-400" />
    }
  }

  const getTrendText = (trend: string, change: number) => {
    switch (trend) {
      case 'increasing':
        return `${Math.abs(change)}kg 증가`
      case 'decreasing':
        return `${Math.abs(change)}kg 감소`
      case 'stable':
        return '안정적'
      default:
        return '데이터 부족'
    }
  }

  const getGoalStatusColor = (progressPercentage: number, goalType: string) => {
    if (goalType === 'lose') {
      if (progressPercentage >= 80) return 'text-green-600'
      if (progressPercentage >= 50) return 'text-yellow-600'
      return 'text-blue-600'
    } else if (goalType === 'gain') {
      if (progressPercentage >= 80) return 'text-green-600'
      if (progressPercentage >= 50) return 'text-yellow-600'
      return 'text-blue-600'
    }
    return 'text-blue-600'
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('ko-KR', {
      month: 'short',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4">
        <div className="max-w-md mx-auto">
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
              <Scale className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
              <p className="text-gray-600">데이터를 불러오는 중...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4">
      <div className="max-w-md mx-auto space-y-6">
        {/* 헤더 */}
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={onBack} className="p-2">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-xl font-bold text-gray-800">대시보드</h1>
          <Button 
            variant="ghost" 
            onClick={() => onNavigate("settings")}
            className="p-2"
          >
            <Settings className="w-5 h-5" />
          </Button>
        </div>

        {/* 선택된 구성원 */}
        <Card className="shadow-md">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className={selectedMember.color}>
                {selectedMember.icon}
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-semibold text-gray-800">
                  {selectedMember.name}
                </h2>
                <p className="text-sm text-gray-500">
                  {dashboardData.recordCount > 0 
                    ? `총 ${dashboardData.recordCount}개 기록`
                    : "아직 기록이 없습니다"
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 현재 몸무게 */}
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-gray-700">
              <Scale className="w-5 h-5" />
              <span>현재 몸무게</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {dashboardData.latestWeight ? (
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-800 mb-2">
                  {dashboardData.latestWeight.toFixed(1)}kg
                </div>
                {dashboardData.weightTrend && (
                  <div className="flex items-center justify-center space-x-2 text-sm">
                    {getTrendIcon(dashboardData.weightTrend.trend)}
                    <span className="text-gray-600">
                      최근 30일간 {getTrendText(dashboardData.weightTrend.trend, dashboardData.weightTrend.change)}
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <Scale className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p className="text-gray-500 mb-4">아직 기록된 몸무게가 없습니다</p>
                <Button 
                  onClick={() => onNavigate("record")}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  첫 기록 추가하기
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 목표 진행률 */}
        {dashboardData.goalProgress ? (
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-gray-700">
                <Target className="w-5 h-5" />
                <span>목표 진행률</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">목표 몸무게</span>
                  <span className="font-semibold">
                    {dashboardData.goalProgress.targetWeight.toFixed(1)}kg
                  </span>
                </div>
                
                {/* 진행률 바 */}
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-blue-600 h-3 rounded-full transition-all duration-500"
                    style={{ 
                      width: `${Math.min(dashboardData.goalProgress.progressPercentage, 100)}%` 
                    }}
                  />
                </div>
                
                <div className="flex justify-between items-center">
                  <span 
                    className={`text-sm font-semibold ${getGoalStatusColor(
                      dashboardData.goalProgress.progressPercentage, 
                      dashboardData.goalProgress.goalType
                    )}`}
                  >
                    {dashboardData.goalProgress.progressPercentage.toFixed(1)}% 달성
                  </span>
                  <span className="text-sm text-gray-600">
                    {Math.abs(dashboardData.goalProgress.remainingWeight).toFixed(1)}kg 남음
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-gray-700">
                <Target className="w-5 h-5" />
                <span>목표 설정</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-4">
                <Target className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p className="text-gray-500 mb-4">목표가 설정되지 않았습니다</p>
                <Button 
                  onClick={() => onNavigate("goal")}
                  variant="outline"
                >
                  목표 설정하기
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 최근 기록 */}
        {dashboardData.recentRecords.length > 0 && (
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-gray-700">
                  <Calendar className="w-5 h-5" />
                  <span>최근 기록</span>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => onNavigate("list")}
                >
                  전체보기
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {dashboardData.recentRecords.slice(0, 5).map((record, index) => (
                  <div 
                    key={record.id}
                    className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="text-sm text-gray-600">
                        {formatDate(record.date)}
                      </div>
                      {index === 0 && (
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                          최신
                        </span>
                      )}
                    </div>
                    <div className="font-semibold text-gray-800">
                      {record.weight.toFixed(1)}kg
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* 빠른 액션 버튼들 */}
        <div className="grid grid-cols-2 gap-4">
          <Button 
            onClick={() => onNavigate("record")}
            className="h-16 bg-blue-600 hover:bg-blue-700 flex flex-col items-center justify-center space-y-1"
          >
            <Plus className="w-6 h-6" />
            <span className="text-sm">기록 추가</span>
          </Button>
          
          <Button 
            onClick={() => onNavigate("chart")}
            variant="outline"
            className="h-16 flex flex-col items-center justify-center space-y-1"
          >
            <BarChart className="w-6 h-6" />
            <span className="text-sm">차트 보기</span>
          </Button>
        </div>

        {/* 네비게이션 버튼들 */}
        <div className="grid grid-cols-2 gap-4">
          <Button 
            onClick={() => onNavigate("calendar")}
            variant="outline"
            className="h-12"
          >
            <Calendar className="w-4 h-4 mr-2" />
            달력
          </Button>
          
          <Button 
            onClick={() => onNavigate("goal")}
            variant="outline"
            className="h-12"
          >
            <Target className="w-4 h-4 mr-2" />
            목표 설정
          </Button>
        </div>
      </div>
    </div>
  )
}