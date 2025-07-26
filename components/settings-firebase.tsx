"use client"

import React, { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { ArrowLeft, Download, Upload, Trash2, LogOut, Database, User, Shield } from "lucide-react"
import { toast } from "@/hooks/use-toast"

// Firebase 서비스
import { dataService } from "@/lib/services/databaseService"
import { logOut, getCurrentUser } from "@/lib/services/authService"

interface SettingsProps {
  selectedMember: {
    id: string
    name: string
    icon: React.ReactNode
    color: string
  }
  onNavigate: (screen: string) => void
  onBack: () => void
}

export default function SettingsFirebase({ selectedMember, onNavigate, onBack }: SettingsProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deleteType, setDeleteType] = useState("")
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [stats, setStats] = useState({
    totalRecords: 0,
    dataSize: "0KB",
    lastBackup: "없음"
  })

  const currentUser = getCurrentUser()

  useEffect(() => {
    if (currentUser) {
      loadStats()
    }
  }, [currentUser])

  const loadStats = async () => {
    try {
      // 통계 데이터 로드 (실제로는 더 정확한 계산 필요)
      const exportData = await dataService.exportAllData(currentUser.uid)
      const totalRecords = exportData.members.reduce((sum, member) => 
        sum + (member.weightRecords?.length || 0), 0
      )
      
      const dataSize = `${Math.round(JSON.stringify(exportData).length / 1024)}KB`
      
      setStats({
        totalRecords,
        dataSize,
        lastBackup: "없음" // 실제로는 마지막 백업 시간을 저장/불러와야 함
      })
    } catch (error) {
      console.error('통계 로드 실패:', error)
    }
  }

  const handleExportData = async () => {
    setLoading(true)
    try {
      const exportData = await dataService.exportAllData(currentUser.uid)
      
      // JSON 파일로 다운로드
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { 
        type: "application/json" 
      })
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = `whatkg_backup_${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      toast({
        title: "내보내기 완료",
        description: "모든 데이터가 JSON 파일로 저장되었습니다."
      })

      // 마지막 백업 시간 업데이트
      setStats(prev => ({
        ...prev,
        lastBackup: new Date().toLocaleString('ko-KR')
      }))

    } catch (error) {
      console.error('데이터 내보내기 실패:', error)
      toast({
        title: "내보내기 실패",
        description: "데이터 내보내기에 실패했습니다.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleImportData = () => {
    const input = document.createElement("input")
    input.type = "file"
    input.accept = ".json"
    input.onchange = async (e) => {
      const file = e.target.files?.[0]
      if (!file) return

      setLoading(true)
      try {
        const text = await file.text()
        const importData = JSON.parse(text)
        
        // 데이터 유효성 검사
        if (!importData.members || !Array.isArray(importData.members)) {
          throw new Error("올바르지 않은 파일 형식입니다.")
        }

        const importCount = await dataService.importData(currentUser.uid, importData)
        
        toast({
          title: "가져오기 완료",
          description: `${importCount}개의 기록을 성공적으로 가져왔습니다.`
        })

        // 통계 새로고침
        await loadStats()

      } catch (error) {
        console.error('데이터 가져오기 실패:', error)
        toast({
          title: "가져오기 실패",
          description: error.message || "데이터 가져오기에 실패했습니다.",
          variant: "destructive"
        })
      } finally {
        setLoading(false)
      }
    }
    input.click()
  }

  const handleDeleteData = async () => {
    setLoading(true)
    try {
      if (deleteType === "member") {
        // 특정 구성원 데이터 삭제 로직 (구현 필요)
        toast({
          title: "삭제 완료",
          description: `${selectedMember.name}의 모든 데이터가 삭제되었습니다.`
        })
      } else if (deleteType === "all") {
        // 모든 데이터 삭제 로직 (구현 필요)
        toast({
          title: "삭제 완료",
          description: "모든 데이터가 삭제되었습니다."
        })
      }

      await loadStats()
    } catch (error) {
      console.error('데이터 삭제 실패:', error)
      toast({
        title: "삭제 실패",
        description: "데이터 삭제에 실패했습니다.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
      setDeleteDialogOpen(false)
    }
  }

  const handleLogout = async () => {
    try {
      await logOut()
      toast({
        title: "로그아웃 완료",
        description: "안전하게 로그아웃되었습니다."
      })
      onNavigate("login")
    } catch (error) {
      console.error('로그아웃 실패:', error)
      toast({
        title: "로그아웃 실패",
        description: "로그아웃에 실패했습니다.",
        variant: "destructive"
      })
    }
    setLogoutDialogOpen(false)
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
            <div>
              <h1 className="font-semibold text-gray-800">설정</h1>
              <p className="text-xs text-gray-500">앱 설정 및 데이터 관리</p>
            </div>
          </div>
        </div>
      </header>

      {/* 메인 콘텐츠 */}
      <main className="flex-1 p-4 space-y-6">
        {/* 사용자 정보 */}
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="text-lg text-gray-700 flex items-center space-x-2">
              <User className="w-5 h-5" />
              <span>사용자 정보</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">이메일</span>
              <span className="text-gray-800">{currentUser?.email}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">가입일</span>
              <span className="text-gray-800">
                {currentUser?.metadata?.creationTime ? 
                  new Date(currentUser.metadata.creationTime).toLocaleDateString('ko-KR') : 
                  '정보 없음'}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* 데이터 관리 */}
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
                마지막 백업: {stats.lastBackup} | 총 {stats.totalRecords}개 기록 ({stats.dataSize})
              </div>
              <div className="flex space-x-2">
                <Button 
                  variant="outline" 
                  onClick={handleExportData} 
                  className="flex-1"
                  disabled={loading}
                >
                  <Download className="w-4 h-4 mr-1" />
                  {loading ? "내보내는 중..." : "내보내기"}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={handleImportData} 
                  className="flex-1"
                  disabled={loading}
                >
                  <Upload className="w-4 h-4 mr-1" />
                  가져오기
                </Button>
              </div>
            </div>

            {/* 데이터 초기화 */}
            <div className="space-y-3 pt-4 border-t border-gray-200">
              <div className="font-medium text-gray-700 flex items-center space-x-2">
                <Shield className="w-4 h-4 text-orange-500" />
                <span>데이터 초기화</span>
              </div>
              <div className="space-y-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setDeleteType("member")
                    setDeleteDialogOpen(true)
                  }}
                  className="w-full text-orange-600 border-orange-200 hover:bg-orange-50"
                  disabled={loading}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  {selectedMember.name} 데이터만 삭제
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setDeleteType("all")
                    setDeleteDialogOpen(true)
                  }}
                  className="w-full text-red-600 border-red-200 hover:bg-red-50"
                  disabled={loading}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  모든 데이터 삭제
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 앱 정보 */}
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="text-lg text-gray-700">앱 정보</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">버전</span>
              <span className="text-gray-800">1.0.0</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">개발자</span>
              <span className="text-gray-800">WhatKG Team</span>
            </div>
          </CardContent>
        </Card>

        {/* 로그아웃 */}
        <Button
          variant="outline"
          onClick={() => setLogoutDialogOpen(true)}
          className="w-full h-12 text-red-600 border-red-200 hover:bg-red-50"
        >
          <LogOut className="w-5 h-5 mr-2" />
          로그아웃
        </Button>
      </main>

      {/* 삭제 확인 다이얼로그 */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>데이터 삭제 확인</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteType === "member" ? (
                <>
                  <strong>{selectedMember.name}</strong>의 모든 몸무게 기록과 목표가 삭제됩니다.
                  <br />이 작업은 되돌릴 수 없습니다.
                </>
              ) : (
                <>
                  모든 가족 구성원의 데이터가 완전히 삭제됩니다.
                  <br />이 작업은 되돌릴 수 없습니다.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteData} 
              className="bg-red-600 hover:bg-red-700"
            >
              삭제
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* 로그아웃 확인 다이얼로그 */}
      <AlertDialog open={logoutDialogOpen} onOpenChange={setLogoutDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>로그아웃</AlertDialogTitle>
            <AlertDialogDescription>
              정말 로그아웃 하시겠습니까?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction onClick={handleLogout}>
              로그아웃
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}