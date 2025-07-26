// lib/services/databaseService.js
import {
    collection,
    doc,
    addDoc,
    getDoc,
    getDocs,
    updateDoc,
    deleteDoc,
    query,
    where,
    orderBy,
    limit,
    startAfter,
    onSnapshot,
    serverTimestamp,
    writeBatch
  } from 'firebase/firestore';
  import { db } from '../firebase';
  
  // 몸무게 기록 관련 함수들
  export const weightService = {
    // 몸무게 기록 추가
    async addRecord(userId, memberId, weightData) {
      try {
        const recordData = {
          userId,
          memberId,
          weight: parseFloat(weightData.weight),
          date: weightData.date,
          memo: weightData.memo || '',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        };
  
        const docRef = await addDoc(collection(db, 'weightRecords'), recordData);
        console.log('몸무게 기록 추가 성공:', docRef.id);
        return docRef.id;
      } catch (error) {
        console.error('몸무게 기록 추가 실패:', error);
        throw error;
      }
    },
  
    // 특정 가족 구성원의 몸무게 기록 조회
    async getRecords(userId, memberId, limitCount = 50) {
      try {
        const q = query(
          collection(db, 'weightRecords'),
          where('userId', '==', userId),
          where('memberId', '==', memberId),
          orderBy('date', 'desc'),
          limit(limitCount)
        );
  
        const querySnapshot = await getDocs(q);
        const records = [];
        
        querySnapshot.forEach((doc) => {
          records.push({
            id: doc.id,
            ...doc.data()
          });
        });
  
        return records;
      } catch (error) {
        console.error('몸무게 기록 조회 실패:', error);
        throw error;
      }
    },
  
    // 실시간 몸무게 기록 구독
    subscribeToRecords(userId, memberId, callback, limitCount = 50) {
      const q = query(
        collection(db, 'weightRecords'),
        where('userId', '==', userId),
        where('memberId', '==', memberId),
        orderBy('date', 'desc'),
        limit(limitCount)
      );
  
      return onSnapshot(q, (querySnapshot) => {
        const records = [];
        querySnapshot.forEach((doc) => {
          records.push({
            id: doc.id,
            ...doc.data()
          });
        });
        callback(records);
      });
    },
  
    // 몸무게 기록 업데이트
    async updateRecord(recordId, updateData) {
      try {
        const recordRef = doc(db, 'weightRecords', recordId);
        await updateDoc(recordRef, {
          ...updateData,
          updatedAt: serverTimestamp()
        });
        console.log('몸무게 기록 업데이트 성공');
      } catch (error) {
        console.error('몸무게 기록 업데이트 실패:', error);
        throw error;
      }
    },
  
    // 몸무게 기록 삭제
    async deleteRecord(recordId) {
      try {
        await deleteDoc(doc(db, 'weightRecords', recordId));
        console.log('몸무게 기록 삭제 성공');
      } catch (error) {
        console.error('몸무게 기록 삭제 실패:', error);
        throw error;
      }
    },
  
    // 날짜 범위로 기록 조회
    async getRecordsByDateRange(userId, memberId, startDate, endDate) {
      try {
        const q = query(
          collection(db, 'weightRecords'),
          where('userId', '==', userId),
          where('memberId', '==', memberId),
          where('date', '>=', startDate),
          where('date', '<=', endDate),
          orderBy('date', 'asc')
        );
  
        const querySnapshot = await getDocs(q);
        const records = [];
        
        querySnapshot.forEach((doc) => {
          records.push({
            id: doc.id,
            ...doc.data()
          });
        });
  
        return records;
      } catch (error) {
        console.error('날짜별 기록 조회 실패:', error);
        throw error;
      }
    }
  };
  
  // 목표 설정 관련 함수들
  export const goalService = {
    // 목표 설정
    async setGoal(userId, memberId, goalData) {
      try {
        const goalRef = doc(db, 'goals', `${userId}_${memberId}`);
        const data = {
          userId,
          memberId,
          targetWeight: parseFloat(goalData.targetWeight),
          currentWeight: parseFloat(goalData.currentWeight),
          targetDate: goalData.targetDate,
          goalType: goalData.goalType, // 'lose', 'gain', 'maintain'
          weeklyTarget: parseFloat(goalData.weeklyTarget || 0),
          isActive: true,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        };
  
        await updateDoc(goalRef, data).catch(async () => {
          // 문서가 없으면 새로 생성
          await addDoc(collection(db, 'goals'), { ...data, id: `${userId}_${memberId}` });
        });
  
        console.log('목표 설정 성공');
      } catch (error) {
        console.error('목표 설정 실패:', error);
        throw error;
      }
    },
  
    // 목표 조회
    async getGoal(userId, memberId) {
      try {
        const goalRef = doc(db, 'goals', `${userId}_${memberId}`);
        const goalDoc = await getDoc(goalRef);
        
        if (goalDoc.exists()) {
          return {
            id: goalDoc.id,
            ...goalDoc.data()
          };
        } else {
          return null;
        }
      } catch (error) {
        console.error('목표 조회 실패:', error);
        throw error;
      }
    },
  
    // 목표 업데이트
    async updateGoal(userId, memberId, updateData) {
      try {
        const goalRef = doc(db, 'goals', `${userId}_${memberId}`);
        await updateDoc(goalRef, {
          ...updateData,
          updatedAt: serverTimestamp()
        });
        console.log('목표 업데이트 성공');
      } catch (error) {
        console.error('목표 업데이트 실패:', error);
        throw error;
      }
    }
  };
  
  // 가족 구성원 관리 관련 함수들
  export const familyService = {
    // 가족 구성원 정보 저장/업데이트
    async updateMemberInfo(userId, memberId, memberData) {
      try {
        const memberRef = doc(db, 'familyMembers', `${userId}_${memberId}`);
        const data = {
          userId,
          memberId,
          name: memberData.name,
          birthDate: memberData.birthDate,
          height: parseFloat(memberData.height || 0),
          gender: memberData.gender,
          isActive: true,
          updatedAt: serverTimestamp()
        };
  
        await updateDoc(memberRef, data).catch(async () => {
          // 문서가 없으면 새로 생성
          await addDoc(collection(db, 'familyMembers'), { 
            ...data, 
            id: `${userId}_${memberId}`,
            createdAt: serverTimestamp()
          });
        });
  
        console.log('가족 구성원 정보 업데이트 성공');
      } catch (error) {
        console.error('가족 구성원 정보 업데이트 실패:', error);
        throw error;
      }
    },
  
    // 가족 구성원 정보 조회
    async getMemberInfo(userId, memberId) {
      try {
        const memberRef = doc(db, 'familyMembers', `${userId}_${memberId}`);
        const memberDoc = await getDoc(memberRef);
        
        if (memberDoc.exists()) {
          return {
            id: memberDoc.id,
            ...memberDoc.data()
          };
        } else {
          return null;
        }
      } catch (error) {
        console.error('가족 구성원 정보 조회 실패:', error);
        throw error;
      }
    },
  
    // 모든 가족 구성원 조회
    async getAllMembers(userId) {
      try {
        const q = query(
          collection(db, 'familyMembers'),
          where('userId', '==', userId),
          where('isActive', '==', true)
        );
  
        const querySnapshot = await getDocs(q);
        const members = [];
        
        querySnapshot.forEach((doc) => {
          members.push({
            id: doc.id,
            ...doc.data()
          });
        });
  
        return members;
      } catch (error) {
        console.error('가족 구성원 조회 실패:', error);
        throw error;
      }
    }
  };
  
  // 통계 및 분석 관련 함수들
  export const statisticsService = {
    // 최근 몸무게 변화 분석
    async getWeightTrend(userId, memberId, days = 30) {
      try {
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);
  
        const records = await weightService.getRecordsByDateRange(
          userId, 
          memberId, 
          startDate.toISOString().split('T')[0], 
          endDate.toISOString().split('T')[0]
        );
  
        // 간단한 트렌드 분석
        if (records.length < 2) return { trend: 'insufficient_data', change: 0 };
  
        const firstWeight = records[records.length - 1].weight;
        const lastWeight = records[0].weight;
        const change = lastWeight - firstWeight;
  
        let trend = 'stable';
        if (change > 0.5) trend = 'increasing';
        else if (change < -0.5) trend = 'decreasing';
  
        return {
          trend,
          change: parseFloat(change.toFixed(1)),
          period: days,
          recordCount: records.length
        };
      } catch (error) {
        console.error('몸무게 트렌드 분석 실패:', error);
        throw error;
      }
    },
  
    // 목표 달성률 계산
    async getGoalProgress(userId, memberId) {
      try {
        const goal = await goalService.getGoal(userId, memberId);
        if (!goal) return null;
  
        const recentRecords = await weightService.getRecords(userId, memberId, 1);
        if (recentRecords.length === 0) return null;
  
        const currentWeight = recentRecords[0].weight;
        const startWeight = goal.currentWeight;
        const targetWeight = goal.targetWeight;
  
        const totalChange = targetWeight - startWeight;
        const currentChange = currentWeight - startWeight;
        
        const progressPercentage = totalChange !== 0 
          ? Math.min(Math.max((currentChange / totalChange) * 100, 0), 100)
          : 0;
  
        return {
          progressPercentage: parseFloat(progressPercentage.toFixed(1)),
          currentWeight,
          targetWeight,
          remainingWeight: parseFloat((targetWeight - currentWeight).toFixed(1)),
          goalType: goal.goalType
        };
      } catch (error) {
        console.error('목표 달성률 계산 실패:', error);
        throw error;
      }
    }
  };
  
  // 데이터 내보내기/가져오기 관련 함수들
  export const dataService = {
    // 모든 데이터 내보내기
    async exportAllData(userId) {
      try {
        const members = await familyService.getAllMembers(userId);
        const exportData = {
          exportDate: new Date().toISOString(),
          userId,
          members: []
        };
  
        for (const member of members) {
          const records = await weightService.getRecords(userId, member.memberId, 1000);
          const goal = await goalService.getGoal(userId, member.memberId);
          
          exportData.members.push({
            memberInfo: member,
            weightRecords: records,
            goal: goal
          });
        }
  
        return exportData;
      } catch (error) {
        console.error('데이터 내보내기 실패:', error);
        throw error;
      }
    },
  
    // 데이터 가져오기 (일괄 작업)
    async importData(userId, importData) {
      try {
        const batch = writeBatch(db);
        let importCount = 0;
  
        for (const memberData of importData.members) {
          // 가족 구성원 정보 가져오기
          if (memberData.memberInfo) {
            const memberRef = doc(db, 'familyMembers', `${userId}_${memberData.memberInfo.memberId}`);
            batch.set(memberRef, {
              ...memberData.memberInfo,
              userId,
              updatedAt: serverTimestamp()
            });
          }
  
          // 목표 정보 가져오기
          if (memberData.goal) {
            const goalRef = doc(db, 'goals', `${userId}_${memberData.goal.memberId}`);
            batch.set(goalRef, {
              ...memberData.goal,
              userId,
              updatedAt: serverTimestamp()
            });
          }
  
          // 몸무게 기록 가져오기 (배치 단위로 처리)
          if (memberData.weightRecords) {
            for (const record of memberData.weightRecords) {
              const recordRef = doc(collection(db, 'weightRecords'));
              batch.set(recordRef, {
                ...record,
                userId,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
              });
              importCount++;
  
              // 배치 크기 제한 (Firestore 배치는 최대 500개)
              if (importCount % 400 === 0) {
                await batch.commit();
                batch = writeBatch(db);
              }
            }
          }
        }
  
        // 남은 배치 커밋
        await batch.commit();
        
        console.log(`데이터 가져오기 성공: ${importCount}개 기록`);
        return importCount;
      } catch (error) {
        console.error('데이터 가져오기 실패:', error);
        throw error;
      }
    }
  };