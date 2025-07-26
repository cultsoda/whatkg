"use client"

import React, { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ArrowLeft, Search, Filter, MoreVertical, Edit, Trash2, Download, Calendar, TrendingUp, TrendingDown, Minus } from "lucide-react"
import { toast } from "@/hooks/use-toast"

// Firebase 서비스
import { weightService } from "@/lib/services/databaseService"
import { getCurrentUser } from "@/lib/services/authService"

interface WeightListProps {
  selectedMember: {
    id: string
    name: string
    icon: React.ReactNode
    color: string
  }
  onNavigate: (screen: string) => void
  onBack: () => void
}

export default function WeightListFirebase({ selectedMember, onNavigate, onBack }: WeightListProps) {
  const [records, setRecords] = useState([])
  const [filteredRecords, setFilteredRecords] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState("latest")
  const [filterBy, setFilterBy] = useState("all")
  const [loading, setLoading] = useState(true)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [recordToDelete, setRecordToDelete] = useState(null)

  const currentUser = getCurrentUser()

  useEffect(() => {
    if (currentUser && selectedMember) {
      loadRecords()
    }
  }, [currentUser, selectedMember])

  useEffect(() => {
    filterAndSortRecords()
  }, [records, searchTerm, sortBy, filterBy])

  const loadRecords = async () => {
    setLoading(true)
    try {
      const data = await weightService.getRecords(currentUser.uid, selectedMember.id, 200)
      setRecords(data)
    } catch (error) {
      console.error('기록 목록 로드 실패:', error)
      toast({
        title: "로드 실패",
        description: "기록 목록을 불러오는데 실패했습니다.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const filterAndSortRecords = () => {
    let filtered = [...records]

    // 검색 필터
    if (searchTerm) {
      filtered = filtered.filter(record => 
        record.memo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.weight.toString().includes(searchTerm) ||
        record.date.includes(searchTerm)
      )
    }

    // 날짜 필터
    const now = new Date()
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0)

    switch (filterBy) {
      case "thisMonth":
        filtered = filtered.filter(record => new Date(record.date) >= thisMonth)
        break
      case "lastMonth":
        filtered = filtered.filter(record => {
          const recordDate = new Date(record.date)
          return recordDate >= lastMonth && recordDate <= lastMonthEnd
        })
        break
    }

    // 정렬
    switch (sortBy) {
      case "latest":
        filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        break
      case "oldest":
        filtered.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        break
      case "highest":
        filtered.sort((a, b) => b.weight - a.weight)
        break
      case "lowest":
        filtered.sort((a, b) => a.weight - b.weight)
        break
    }

    setFilteredRecords(filtered)
  }

  const handleDelete = async () => {
    if (!recordToDelete) return

    try {
      await weightService.deleteRecord(recordToDelete.id)
      
      toast({
        title: "삭제 완료",
        description: "기록이 삭제되었습니다."
      })

      // 목록 새로고침
      await loadRecords()
      
    } catch (error) {
      console.error('기록 삭제 실패:', error)
      toast({
        title: "삭제 실패",
        description: "기록 삭제에 실패했습니다.",
        variant: "destructive"
      })
    }

    setDeleteDialogOpen(false)
    setRecordToDelete(null)
  }

  const handleExport = () => {
    if (filteredRecords.length === 0) {
      toast({
        title: "내보낼 데이터 없음",
        description: "내보낼 기록이 없습니다.",
        variant: "destructive"
      })
      return
    }

    // CSV 형식으로 데이터 생성
    const headers = ["날짜", "몸무게(kg)", "메모"]
    const csvData = [
      headers.join(","),
      ...filteredRecords.map(record => [
        record.date,
        record.weight,
        `"${record.memo || ""}"`
      ].join(","))
    ].join("\n")

    // 파일 다운로드
    const blob = new Blob([csvData], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", `${selectedMember.name}_weight_records.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    toast({
      title: "내보내기 완료",
      description: "CSV 파일로 다운로드되었습니다."
    })
  }

  const getWeightChange = (currentIndex) => {
    if (currentIndex >= filteredRecords.length - 1) return null
    
    const current = filteredRecords[currentIndex].weight
    const previous = filteredRecords[currentIndex + 1].weight
    const change = current - previous
    
    return {
      value: parseFloat(change.toFixed(1)),
      type: change > 0.1 ? "increase" : change < -0.1 ? "decrease" : "stable"
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    if (date.toDateString() === today.toDateString()) return "오늘"
    if (date.toDateString() === yesterday.toDateString()) return "어제"
    
    return date.toLocaleDateString('ko-KR', {
      month: 'short',
      day: 'numeric',
      weekday: 'short'
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Calendar className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">기록을 불러오는 중...</p>
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
                <h1 className="font-semibold text-gray-800">전체 기록</h1>
                <p className="text-xs text-gray-500">{records.length}개의 기록</p>
              </div>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={handleExport}>
            <Download className="w-5 h-5 text-gray-600" />
          </Button>
        </div>
      </header>

      {/* 검색 및 필터 */}
      <div className="bg-white border-b px-4 py-3 space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="날짜, 몸무게, 메모로 검색..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex space-x-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="flex-1">
                <Filter className="w-4 h-4 mr-1" />
                {sortBy === "latest" ? "최신순" : 
                 sortBy === "oldest" ? "오래된순" : 
                 sortBy === "highest" ? "높은순" : "낮은순"}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setSortBy("latest")}>최신순</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy("oldest")}>오래된순</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy("highest")}>몸무게 높은순</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy("lowest")}>몸무게 낮은순</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="flex-1">
                {filterBy === "all" ? "전체" :
                 filterBy === "thisMonth" ? "이번달" : "지난달"}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setFilterBy("all")}>전체</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterBy("thisMonth")}>이번달</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterBy("lastMonth")}>지난달</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* 기록 목록 */}
      <main className="flex-1 p-4">
        {filteredRecords.length > 0 ? (
          <div className="space-y-3">
            {filteredRecords.map((record, index) => {
              const weightChange = getWeightChange(index)
              
              return (
                <Card key={record.id} className="shadow-sm">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-gray-600">
                            {formatDate(record.date)}
                          </span>
                          <div className="flex items-center space-x-3">
                            {weightChange && (
                              <div className={`flex items-center space-x-1 ${
                                weightChange.type === "increase" ? "text-red-500" : 
                                weightChange.type === "decrease" ? "text-blue-500" : "text-gray-500"
                              }`}>
                                {weightChange.type === "increase" && <TrendingUp className="w-3 h-3" />}
                                {weightChange.type === "decrease" && <TrendingDown className="w-3 h-3" />}
                                {weightChange.type === "stable" && <Minus className="w-3 h-3" />}
                                <span className="text-xs">
                                  {weightChange.value > 0 ? "+" : ""}{weightChange.value}
                                </span>
                              </div>
                            )}
                            <span className="text-lg font-bold text-gray-800">
                              {record.weight.toFixed(1)}kg
                            </span>
                          </div>
                        </div>
                        
                        {record.memo && (
                          <p className="text-sm text-gray-600 mt-2 bg-gray-50 p-2 rounded">
                            {record.memo}
                          </p>
                        )}
                      </div>
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="ml-2">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => {
                            setRecordToDelete(record)
                            setDeleteDialogOpen(true)
                          }}>
                            <Trash2 className="w-4 h-4 mr-2" />
                            삭제
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        ) : (
          <Card className="shadow-sm">
            <CardContent className="p-8 text-center">
              <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p className="text-gray-500 mb-4">
                {searchTerm || filterBy !== "all" ? "검색 결과가 없습니다" : "아직 기록이 없습니다"}
              </p>
              <Button onClick={() => onNavigate("record")}>
                첫 기록 추가하기
              </Button>
            </CardContent>
          </Card>
        )}
      </main>

      {/* 삭제 확인 다이얼로그 */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>기록 삭제</AlertDialogTitle>
            <AlertDialogDescription>
              {recordToDelete && (
                <>
                  {formatDate(recordToDelete.date)}의 기록 ({recordToDelete.weight.toFixed(1)}kg)을 삭제하시겠습니까?
                  <br />이 작업은 되돌릴 수 없습니다.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              삭제
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}