"use client"

import type React from "react"
import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { toast } from "@/hooks/use-toast"
import {
  ArrowLeft,
  UserIcon,
  UserCheck,
  Baby,
  Heart,
  Bell,
  Palette,
  Database,
  Target,
  Info,
  Download,
  Upload,
  Trash2,
  Edit,
  RotateCcw,
  ExternalLink,
  MessageSquare,
  ChevronDown,
  AlertTriangle,
  SettingsIcon,
} from "lucide-react"

interface FamilyMember {
  id: string
  name: string
  icon: React.ReactNode
  color: string
  bgColor: string
}

interface CurrentSettings {
  user: {
    name: string
    icon: string
  }
  app: {
    unit: "kg" | "lb"
    notifications: {
      dailyReminder: boolean
      reminderTime: string
      goalAchievement: boolean
    }
    theme: "light" | "dark" | "system"
  }
  data: {
    lastBackup: string
    totalRecords: number
    dataSize: string
  }
  goal: {
    targetWeight: number
    isSet: boolean
  }
  app_info: {
    version: string
    buildDate: string
  }
}

interface SettingsProps {
  user: FamilyMember
  onNavigate: (screen: string) => void
  onUserChange: (userId: string) => void
}

const currentSettings: CurrentSettings = {
  user: {
    name: "엄마",
    icon: "👩",
  },
  app: {
    unit: "kg",
    notifications: {
      dailyReminder: true,
      reminderTime: "08:00",
      goalAchievement: true,
    },
    theme: "light",
  },
  data: {
    lastBackup: "2024-07-20",
    totalRecords: 25,
    dataSize: "2.3KB",
  },
  goal: {
    targetWeight: 57.0,
    isSet: true,
  },
  app_info: {
    version: "1.0.0",
    buildDate: "2024-07-01",
  },
}

const familyMembers = [
  {
    id: "mom",
    name: "엄마",
    icon: <UserIcon className="w-8 h-8" />,
    color: "text-pink-600",
    bgColor: "bg-pink-50",
  },
  {
    id: "dad",
    name: "아빠",
    icon: <UserCheck className="w-8 h-8" />,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
  },
  {
    id: "son",
    name: "아들",
    icon: <Baby className="w-8 h-8" />,
    color: "text-green-600",
    bgColor: "bg-green-50",
  },
  {
    id: "daughter",
    name: "딸",
    icon: <Heart className="w-8 h-8" />,
    color: "text-purple-600",
    bgColor: "bg-purple-50",
  },
]

export default function Settings({ user, onNavigate, onUserChange }: SettingsProps) {
  const [settings, setSettings] = useState(currentSettings)
  const [showUserSelector, setShowUserSelector] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [deleteType, setDeleteType] = useState<"all" | "user" | null>(null)
  const [showDeveloperOptions, setShowDeveloperOptions] = useState(false)
  const [developerTapCount, setDeveloperTapCount] = useState(0)

  // 설정 업데이트 함수
  const updateSettings = (path: string, value: any) => {
    const keys = path.split(".")
    const newSettings = { ...settings }
    let current: any = newSettings

    for (let i = 0; i < keys.length - 1; i++) {
      current = current[keys[i]]
    }
    current[keys[keys.length - 1]] = value

    setSettings(newSettings)
    toast({
      title: "설정이 저장되었습니다",
      duration: 2000,
    })
  }

  // 사용자 변경
  const handleUserChange = (memberId: string) => {
    const member = familyMembers.find((m) => m.id === memberId)
    if (member) {
      onUserChange(memberId)
      setShowUserSelector(false)
      toast({
        title: `${member.name}님으로 전환되었습니다`,
        duration: 2000,
      })
    }
  }

  // 데이터 내보내기
  const handleExportData = () => {
    console.log("데이터 내보내기")
    toast({
      title: "데이터 내보내기 완료",
      description: "CSV 파일이 다운로드되었습니다",
      duration: 3000,
    })
  }

  // 데이터 가져오기
  const handleImportData = () => {
    console.log("데이터 가져오기")
    toast({
      title: "데이터 가져오기 완료",
      description: "백업 파일이 성공적으로 복원되었습니다",
      duration: 3000,
    })
  }

  // 데이터 삭제
  const handleDeleteData = () => {
    if (deleteType === "all") {
      console.log("전체 데이터 삭제")
      toast({
        title: "전체 데이터가 삭제되었습니다",
        variant: "destructive",
        duration: 3000,
      })
    } else if (deleteType === "user") {
      console.log("현재 사용자 데이터 삭제")
      toast({
        title: "현재 사용자 데이터가 삭제되었습니다",
        variant: "destructive",
        duration: 3000,
      })
    }
    setShowDeleteDialog(false)
    setDeleteType(null)
  }

  // 개발자 옵션 활성화
  const handleVersionTap = () => {
    setDeveloperTapCount((prev) => {
      const newCount = prev + 1
      if (newCount >= 7) {
        setShowDeveloperOptions(true)
        toast({
          title: "개발자 옵션이 활성화되었습니다",
          duration: 2000,
        })
        return 0
      }
      return newCount
    })
  }

  // 샘플 데이터 생성
  const generateSampleData = () => {
    console.log("샘플 데이터 생성")
    toast({
      title: "샘플 데이터가 생성되었습니다",
      duration: 2000,
    })
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* 상단 헤더 */}
      <header className="bg-white shadow-sm px-4 py-3">
        <div className="flex items-center space-x-3">
          <Button variant="ghost" size="icon" onClick={() => onNavigate("dashboard")}>
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Button>
          <div className="flex items-center space-x-2">
            <SettingsIcon className="w-5 h-5 text-gray-600" />
            <h1 className="font-semibold text-gray-800">설정</h1>
          </div>
        </div>
      </header>

      {/* 메인 콘텐츠 */}
      <main className="flex-1 p-4 space-y-6">
        {/* 사용자 관리 섹션 */}
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="text-lg text-gray-700 flex items-center space-x-2">
              <UserIcon className="w-5 h-5" />
              <span>사용자 관리</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className={user.color}>{user.icon}</div>
                <div>
                  <div className="font-medium text-gray-800">{user.name}님</div>
                  <div className="text-sm text-gray-500">현재 사용자</div>
                </div>
              </div>
              <Button variant="outline" onClick={() => setShowUserSelector(true)} className="bg-transparent">
                사용자 변경
              </Button>
            </div>

            {/* 사용자 선택 그리드 */}
            {showUserSelector && (
              <div className="grid grid-cols-2 gap-3 p-4 bg-gray-50 rounded-lg">
                <div className="col-span-2 text-sm font-medium text-gray-700 mb-2">사용자를 선택하세요</div>
                {familyMembers.map((member) => (
                  <Button
                    key={member.id}
                    variant="outline"
                    onClick={() => handleUserChange(member.id)}
                    className={`p-3 h-auto flex flex-col items-center space-y-2 ${
                      member.id === user.id ? "ring-2 ring-emerald-500 bg-emerald-50" : "bg-white"
                    }`}
                  >
                    <div className={member.color}>{member.icon}</div>
                    <span className="text-sm">{member.name}</span>
                  </Button>
                ))}
                <div className="col-span-2 mt-2">
                  <Button variant="ghost" onClick={() => setShowUserSelector(false)} className="w-full">
                    취소
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 앱 설정 섹션 */}
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="text-lg text-gray-700 flex items-center space-x-2">
              <SettingsIcon className="w-5 h-5" />
              <span>앱 설정</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* 단위 설정 */}
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-gray-700">단위 설정</div>
                <div className="text-sm text-gray-500">몸무게 표시 단위</div>
              </div>
              <div className="flex items-center space-x-2">
                <span className={`text-sm ${settings.app.unit === "kg" ? "font-medium" : "text-gray-500"}`}>kg</span>
                <Switch
                  checked={settings.app.unit === "lb"}
                  onCheckedChange={(checked) => updateSettings("app.unit", checked ? "lb" : "kg")}
                />
                <span className={`text-sm ${settings.app.unit === "lb" ? "font-medium" : "text-gray-500"}`}>lb</span>
              </div>
            </div>

            {/* 알림 설정 */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-gray-700 flex items-center space-x-2">
                    <Bell className="w-4 h-4" />
                    <span>매일 기록 알림</span>
                  </div>
                  <div className="text-sm text-gray-500">정해진 시간에 기록을 알려드려요</div>
                </div>
                <Switch
                  checked={settings.app.notifications.dailyReminder}
                  onCheckedChange={(checked) => updateSettings("app.notifications.dailyReminder", checked)}
                />
              </div>

              {settings.app.notifications.dailyReminder && (
                <div className="ml-6 space-y-2">
                  <Label htmlFor="reminderTime" className="text-sm font-medium text-gray-700">
                    알림 시간
                  </Label>
                  <Input
                    id="reminderTime"
                    type="time"
                    value={settings.app.notifications.reminderTime}
                    onChange={(e) => updateSettings("app.notifications.reminderTime", e.target.value)}
                    className="w-32"
                  />
                </div>
              )}

              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-gray-700">목표 달성 알림</div>
                  <div className="text-sm text-gray-500">목표에 가까워질 때 응원해드려요</div>
                </div>
                <Switch
                  checked={settings.app.notifications.goalAchievement}
                  onCheckedChange={(checked) => updateSettings("app.notifications.goalAchievement", checked)}
                />
              </div>
            </div>

            {/* 테마 설정 */}
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-gray-700 flex items-center space-x-2">
                  <Palette className="w-4 h-4" />
                  <span>테마 설정</span>
                </div>
                <div className="text-sm text-gray-500">앱의 외관을 설정하세요</div>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="bg-transparent">
                    {settings.app.theme === "light" ? "라이트" : settings.app.theme === "dark" ? "다크" : "시스템"}
                    <ChevronDown className="w-4 h-4 ml-1" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => updateSettings("app.theme", "light")}>라이트 모드</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => updateSettings("app.theme", "dark")}>다크 모드</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => updateSettings("app.theme", "system")}>시스템 설정</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardContent>
        </Card>

        {/* 데이터 관리 섹션 */}
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="text-lg text-gray-700 flex items-center space-x-2">
              <Database className="w-5 h-5" />
              <span>데이터 관리</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* 백업/복원 */}
            <div className="space-y-3">
              <div className="font-medium text-gray-700">백업 및 복원</div>
              <div className="text-sm text-gray-500 mb-3">
                마지막 백업: {settings.data.lastBackup} | 총 {settings.data.totalRecords}개 기록 (
                {settings.data.dataSize})
              </div>
              <div className="flex space-x-2">
                <Button variant="outline" onClick={handleExportData} className="flex-1 bg-transparent">
                  <Download className="w-4 h-4 mr-1" />
                  내보내기
                </Button>
                <Button variant="outline" onClick={handleImportData} className="flex-1 bg-transparent">
                  <Upload className="w-4 h-4 mr-1" />
                  가져오기
                </Button>
              </div>
            </div>

            {/* 데이터 초기화 */}
            <div className="space-y-3 pt-4 border-t border-gray-200">
              <div className="font-medium text-gray-700 flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 text-orange-500" />
                <span>데이터 초기화</span>
              </div>
              <div className="space-y-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setDeleteType("user")
                    setShowDeleteDialog(true)
                  }}
                  className="w-full text-orange-600 border-orange-200 hover:bg-orange-50 bg-transparent"
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  현재 사용자 데이터만 삭제
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setDeleteType("all")
                    setShowDeleteDialog(true)
                  }}
                  className="w-full text-red-600 border-red-200 hover:bg-red-50 bg-transparent"
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  전체 데이터 삭제
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 목표 관리 */}
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="text-lg text-gray-700 flex items-center space-x-2">
              <Target className="w-5 h-5" />
              <span>목표 관리</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {settings.goal.isSet ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-lg">
                  <div>
                    <div className="font-medium text-gray-800">현재 목표</div>
                    <div className="text-2xl font-bold text-emerald-600">{settings.goal.targetWeight}kg</div>
                  </div>
                  <Target className="w-8 h-8 text-emerald-500" />
                </div>
                <div className="flex space-x-2">
                  <Button variant="outline" onClick={() => onNavigate("goal")} className="flex-1 bg-transparent">
                    <Edit className="w-4 h-4 mr-1" />
                    목표 수정
                  </Button>
                  <Button variant="outline" className="flex-1 text-gray-600 bg-transparent">
                    <RotateCcw className="w-4 h-4 mr-1" />
                    목표 초기화
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-6">
                <Target className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <div className="text-gray-600 mb-3">설정된 목표가 없습니다</div>
                <Button onClick={() => onNavigate("goal")} className="bg-emerald-500 hover:bg-emerald-600">
                  목표 설정하기
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 앱 정보 섹션 */}
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="text-lg text-gray-700 flex items-center space-x-2">
              <Info className="w-5 h-5" />
              <span>앱 정보</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <Button
                variant="ghost"
                onClick={handleVersionTap}
                className="w-full justify-between p-3 h-auto bg-transparent"
              >
                <div className="text-left">
                  <div className="font-medium text-gray-700">앱 버전</div>
                  <div className="text-sm text-gray-500">v{settings.app_info.version}</div>
                </div>
              </Button>

              <Button variant="ghost" className="w-full justify-between p-3 h-auto bg-transparent">
                <div className="text-left">
                  <div className="font-medium text-gray-700">사용법 가이드</div>
                  <div className="text-sm text-gray-500">앱 사용 방법을 알아보세요</div>
                </div>
                <ExternalLink className="w-4 h-4 text-gray-400" />
              </Button>

              <Button variant="ghost" className="w-full justify-between p-3 h-auto bg-transparent">
                <div className="text-left">
                  <div className="font-medium text-gray-700">개인정보 처리방침</div>
                  <div className="text-sm text-gray-500">개인정보 보호 정책</div>
                </div>
                <ExternalLink className="w-4 h-4 text-gray-400" />
              </Button>

              <Button variant="ghost" className="w-full justify-between p-3 h-auto bg-transparent">
                <div className="text-left">
                  <div className="font-medium text-gray-700">피드백 보내기</div>
                  <div className="text-sm text-gray-500">의견이나 문의사항을 보내주세요</div>
                </div>
                <MessageSquare className="w-4 h-4 text-gray-400" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 개발자 옵션 (숨김 메뉴) */}
        {showDeveloperOptions && (
          <Card className="shadow-md border-orange-200">
            <CardHeader>
              <CardTitle className="text-lg text-orange-700 flex items-center space-x-2">
                <SettingsIcon className="w-5 h-5" />
                <span>개발자 옵션</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button variant="outline" onClick={generateSampleData} className="w-full bg-transparent">
                샘플 데이터 생성
              </Button>
              <div className="text-xs text-gray-500 space-y-1">
                <div>빌드 날짜: {settings.app_info.buildDate}</div>
                <div>디버그 모드: 활성화</div>
                <div>데이터 크기: {settings.data.dataSize}</div>
              </div>
            </CardContent>
          </Card>
        )}
      </main>

      {/* 삭제 확인 다이얼로그 */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2 text-red-600">
              <AlertTriangle className="w-5 h-5" />
              <span>데이터 삭제 확인</span>
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <p className="text-gray-600">
              {deleteType === "all"
                ? "모든 사용자의 전체 데이터를 삭제하시겠습니까?"
                : "현재 사용자의 데이터만 삭제하시겠습니까?"}
            </p>
            <div className="bg-red-50 p-3 rounded-lg">
              <p className="text-sm text-red-700 font-medium">⚠️ 주의사항</p>
              <p className="text-sm text-red-600">삭제된 데이터는 복구할 수 없습니다.</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)} className="bg-transparent">
              취소
            </Button>
            <Button onClick={handleDeleteData} className="bg-red-500 hover:bg-red-600">
              삭제
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
