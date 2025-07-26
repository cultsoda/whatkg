"use client"

import type React from "react"
import { useState, useMemo } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  Search,
  Filter,
  Plus,
  Edit,
  Trash2,
  MoreVertical,
  ArrowUp,
  ArrowDown,
  Minus,
  Home,
  FileText,
  BarChart3,
  CalendarDays,
  List,
  Download,
  X,
  CheckCircle,
  ArrowLeft,
} from "lucide-react"

interface User {
  id: string
  name: string
  icon: React.ReactNode
  color: string
}

interface WeightRecord {
  id: number
  date: string
  dayOfWeek: string
  weight: number
  change: number
  memo: string
  createdAt: string
}

interface ListSummary {
  totalRecords: number
  averageWeight: number
  maxIncrease: number
  maxDecrease: number
  period: string
}

interface WeightListProps {
  user: User
  onNavigate: (screen: string) => void
}

const recordsList: WeightRecord[] = [
  {
    id: 1,
    date: "2024-07-25",
    dayOfWeek: "목",
    weight: 58.5,
    change: -0.3,
    memo: "저녁 늦게 먹었지만 감소",
    createdAt: "2024-07-25 08:30",
  },
  {
    id: 2,
    date: "2024-07-24",
    dayOfWeek: "수",
    weight: 58.8,
    change: +0.2,
    memo: "",
    createdAt: "2024-07-24 07:45",
  },
  {
    id: 3,
    date: "2024-07-23",
    dayOfWeek: "화",
    weight: 58.6,
    change: -0.4,
    memo: "운동 후 측정",
    createdAt: "2024-07-23 09:15",
  },
  {
    id: 4,
    date: "2024-07-22",
    dayOfWeek: "월",
    weight: 59.0,
    change: +0.1,
    memo: "",
    createdAt: "2024-07-22 08:00",
  },
  {
    id: 5,
    date: "2024-07-21",
    dayOfWeek: "일",
    weight: 58.9,
    change: -0.2,
    memo: "주말 휴식",
    createdAt: "2024-07-21 10:30",
  },
]

const listSummary: ListSummary = {
  totalRecords: 25,
  averageWeight: 59.2,
  maxIncrease: +0.8,
  maxDecrease: -0.6,
  period: "지난 30일",
}

export default function WeightList({ user, onNavigate }: WeightListProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [showSearch, setShowSearch] = useState(false)
  const [sortBy, setSortBy] = useState<"latest" | "oldest" | "highest" | "lowest">("latest")
  const [filterBy, setFilterBy] = useState<"all" | "thisMonth" | "lastMonth" | "custom">("all")
  const [selectedRecords, setSelectedRecords] = useState<number[]>([])
  const [isMultiSelectMode, setIsMultiSelectMode] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [recordToDelete, setRecordToDelete] = useState<number | null>(null)

  // 필터링 및 정렬된 기록 목록
  const filteredAndSortedRecords = useMemo(() => {
    let filtered = recordsList

    // 검색 필터링
    if (searchQuery) {
      filtered = filtered.filter(
        (record) =>
          record.date.includes(searchQuery) ||
          record.weight.toString().includes(searchQuery) ||
          record.memo.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    }

    // 기간 필터링
    if (filterBy !== "all") {
      const now = new Date()
      const currentMonth = now.getMonth()
      const currentYear = now.getFullYear()

      filtered = filtered.filter((record) => {
        const recordDate = new Date(record.date)
        const recordMonth = recordDate.getMonth()
        const recordYear = recordDate.getFullYear()

        switch (filterBy) {
          case "thisMonth":
            return recordMonth === currentMonth && recordYear === currentYear
          case "lastMonth":
            const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1
            const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear
            return recordMonth === lastMonth && recordYear === lastMonthYear
          default:
            return true
        }
      })
    }

    // 정렬
    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case "latest":
          return new Date(b.date).getTime() - new Date(a.date).getTime()
        case "oldest":
          return new Date(a.date).getTime() - new Date(b.date).getTime()
        case "highest":
          return b.weight - a.weight
        case "lowest":
          return a.weight - b.weight
        default:
          return 0
      }
    })

    return sorted
  }, [searchQuery, sortBy, filterBy])

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
        <span className="text-sm font-medium">{Math.abs(change).toFixed(1)}kg</span>
      </div>
    )
  }

  // 기록 선택 토글
  const toggleRecordSelection = (recordId: number) => {
    setSelectedRecords((prev) => (prev.includes(recordId) ? prev.filter((id) => id !== recordId) : [...prev, recordId]))
  }

  // 전체 선택/해제
  const toggleSelectAll = () => {
    if (selectedRecords.length === filteredAndSortedRecords.length) {
      setSelectedRecords([])
    } else {
      setSelectedRecords(filteredAndSortedRecords.map((record) => record.id))
    }
  }

  // 다중 선택 모드 종료
  const exitMultiSelectMode = () => {
    setIsMultiSelectMode(false)
    setSelectedRecords([])
  }

  // 삭제 확인
  const handleDelete = (recordId: number) => {
    setRecordToDelete(recordId)
    setDeleteDialogOpen(true)
  }

  // 삭제 실행
  const confirmDelete = () => {
    if (recordToDelete) {
      // 실제로는 데이터베이스에서 삭제
      console.log("기록 삭제:", recordToDelete)
      alert("기록이 삭제되었습니다.")
    }
    setDeleteDialogOpen(false)
    setRecordToDelete(null)
  }

  // 일괄 삭제
  const handleBulkDelete = () => {
    if (selectedRecords.length > 0) {
      console.log("일괄 삭제:", selectedRecords)
      alert(`${selectedRecords.length}개 기록이 삭제되었습니다.`)
      exitMultiSelectMode()
    }
  }

  // 데이터 내보내기
  const handleExport = () => {
    console.log("데이터 내보내기")
    alert("CSV 파일로 내보내기 완료!")
  }

  const navigationItems = [
    { id: "home", label: "홈", icon: <Home className="w-5 h-5" />, active: false },
    { id: "record", label: "기록", icon: <FileText className="w-5 h-5" />, active: false },
    { id: "chart", label: "차트", icon: <BarChart3 className="w-5 h-5" />, active: false },
    { id: "calendar", label: "달력", icon: <CalendarDays className="w-5 h-5" />, active: false },
    { id: "list", label: "목록", icon: <List className="w-5 h-5" />, active: true },
  ]

  const sortOptions = [
    { value: "latest", label: "최신순" },
    { value: "oldest", label: "오래된순" },
    { value: "highest", label: "몸무게 높은순" },
    { value: "lowest", label: "몸무게 낮은순" },
  ]

  const filterOptions = [
    { value: "all", label: "전체" },
    { value: "thisMonth", label: "이번달" },
    { value: "lastMonth", label: "지난달" },
    { value: "custom", label: "사용자 정의" },
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
                <h1 className="font-semibold text-gray-800">전체 기록</h1>
                <p className="text-xs text-gray-500">{listSummary.totalRecords}개의 기록</p>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {!isMultiSelectMode && (
              <Button variant="ghost" size="icon" onClick={() => setIsMultiSelectMode(true)}>
                <CheckCircle className="w-5 h-5 text-gray-600" />
              </Button>
            )}
            {isMultiSelectMode && (
              <Button variant="ghost" size="icon" onClick={exitMultiSelectMode}>
                <X className="w-5 h-5 text-gray-600" />
              </Button>
            )}
            <Button variant="ghost" size="icon" onClick={() => setShowSearch(!showSearch)}>
              <Search className="w-5 h-5 text-gray-600" />
            </Button>
          </div>
        </div>

        {/* 검색바 */}
        {showSearch && (
          <div className="mt-3">
            <Input
              placeholder="날짜, 몸무게, 메모로 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full"
            />
          </div>
        )}
      </header>

      {/* 메인 콘텐츠 */}
      <main className="flex-1 p-4 space-y-4">
        {/* 통계 요약 */}
        <Card className="shadow-md">
          <CardContent className="p-4">
            <div className="grid grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-lg font-bold text-gray-800">{listSummary.totalRecords}</div>
                <div className="text-xs text-gray-500">총 기록</div>
              </div>
              <div>
                <div className="text-lg font-bold text-gray-800">{listSummary.averageWeight}kg</div>
                <div className="text-xs text-gray-500">평균</div>
              </div>
              <div>
                <div className="text-lg font-bold text-red-500">+{listSummary.maxIncrease}kg</div>
                <div className="text-xs text-gray-500">최대 증가</div>
              </div>
              <div>
                <div className="text-lg font-bold text-blue-500">{listSummary.maxDecrease}kg</div>
                <div className="text-xs text-gray-500">최대 감소</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 필터/정렬 옵션 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="bg-transparent">
                  <Filter className="w-4 h-4 mr-1" />
                  {sortOptions.find((opt) => opt.value === sortBy)?.label}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {sortOptions.map((option) => (
                  <DropdownMenuItem key={option.value} onClick={() => setSortBy(option.value as any)}>
                    {option.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="bg-transparent">
                  {filterOptions.find((opt) => opt.value === filterBy)?.label}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {filterOptions.map((option) => (
                  <DropdownMenuItem key={option.value} onClick={() => setFilterBy(option.value as any)}>
                    {option.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {isMultiSelectMode && (
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" onClick={toggleSelectAll} className="bg-transparent">
                <CheckCircle className="w-4 h-4 mr-1" />
                전체선택
              </Button>
              <Button variant="outline" size="sm" onClick={handleBulkDelete} className="text-red-600 bg-transparent">
                <Trash2 className="w-4 h-4 mr-1" />
                삭제
              </Button>
            </div>
          )}

          {!isMultiSelectMode && (
            <Button variant="outline" size="sm" onClick={handleExport} className="bg-transparent">
              <Download className="w-4 h-4 mr-1" />
              내보내기
            </Button>
          )}
        </div>

        {/* 기록 리스트 */}
        <div className="space-y-3">
          {filteredAndSortedRecords.length === 0 ? (
            <Card className="shadow-md">
              <CardContent className="p-8 text-center">
                <div className="text-gray-400 mb-4">
                  <List className="w-16 h-16 mx-auto" />
                </div>
                <h3 className="text-lg font-medium text-gray-600 mb-2">기록이 없습니다</h3>
                <p className="text-gray-500 mb-4">첫 번째 몸무게 기록을 추가해보세요</p>
                <Button onClick={() => onNavigate("record")} className="bg-emerald-500 hover:bg-emerald-600">
                  <Plus className="w-4 h-4 mr-1" />첫 기록 추가하기
                </Button>
              </CardContent>
            </Card>
          ) : (
            filteredAndSortedRecords.map((record) => (
              <Card
                key={record.id}
                className={`shadow-md transition-all duration-200 ${
                  selectedRecords.includes(record.id) ? "ring-2 ring-emerald-500 bg-emerald-50" : "hover:shadow-lg"
                }`}
                onClick={() => {
                  if (isMultiSelectMode) {
                    toggleRecordSelection(record.id)
                  }
                }}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          {isMultiSelectMode && (
                            <div
                              className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                                selectedRecords.includes(record.id)
                                  ? "bg-emerald-500 border-emerald-500"
                                  : "border-gray-300"
                              }`}
                            >
                              {selectedRecords.includes(record.id) && <CheckCircle className="w-3 h-3 text-white" />}
                            </div>
                          )}
                          <div>
                            <div className="font-medium text-gray-800">
                              {new Date(record.date).toLocaleDateString("ko-KR", {
                                month: "short",
                                day: "numeric",
                              })}
                              <span className="text-sm text-gray-500 ml-1">({record.dayOfWeek})</span>
                            </div>
                            <div className="text-xs text-gray-500">{record.createdAt.split(" ")[1]}</div>
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="text-2xl font-bold text-gray-800">{record.weight}kg</div>
                          {getChangeDisplay(record.change)}
                        </div>
                      </div>

                      {record.memo && (
                        <div className="bg-gray-50 p-2 rounded text-sm text-gray-700 mb-2">{record.memo}</div>
                      )}
                    </div>

                    {!isMultiSelectMode && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="ml-2">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem onClick={() => console.log("수정:", record.id)}>
                            <Edit className="w-4 h-4 mr-2" />
                            수정
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDelete(record.id)} className="text-red-600">
                            <Trash2 className="w-4 h-4 mr-2" />
                            삭제
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </main>

      {/* 플로팅 액션 버튼 */}
      <Button
        onClick={() => onNavigate("record")}
        className="fixed bottom-20 right-4 w-14 h-14 rounded-full bg-emerald-500 hover:bg-emerald-600 shadow-lg"
        size="icon"
      >
        <Plus className="w-6 h-6" />
      </Button>

      {/* 삭제 확인 다이얼로그 */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>기록 삭제</DialogTitle>
          </DialogHeader>
          <p className="text-gray-600">이 기록을 삭제하시겠습니까? 삭제된 기록은 복구할 수 없습니다.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)} className="bg-transparent">
              취소
            </Button>
            <Button onClick={confirmDelete} className="bg-red-500 hover:bg-red-600">
              삭제
            </Button>
          </DialogFooter>
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
