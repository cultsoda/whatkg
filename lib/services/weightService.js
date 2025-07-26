// lib/services/weightService.js
import { 
    collection, 
    addDoc, 
    getDocs, 
    query, 
    where, 
    orderBy, 
    limit 
  } from 'firebase/firestore';
  import { db } from '../firebase';
  
  // 몸무게 기록 추가
  export const addWeightRecord = async (userId, weightData) => {
    try {
      const docRef = await addDoc(collection(db, 'weightRecords'), {
        userId,
        weight: weightData.weight,
        date: weightData.date,
        memo: weightData.memo || '',
        createdAt: new Date().toISOString()
      });
      
      console.log('몸무게 기록 저장 완료:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('몸무게 기록 저장 오류:', error);
      throw error;
    }
  };
  
  // 사용자 몸무게 기록 조회
  export const getUserWeightRecords = async (userId) => {
    try {
      const q = query(
        collection(db, 'weightRecords'),
        where('userId', '==', userId),
        orderBy('date', 'desc'),
        limit(50)
      );
      
      const querySnapshot = await getDocs(q);
      const records = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      console.log('몸무게 기록 조회 완료:', records.length, '개');
      return records;
    } catch (error) {
      console.error('몸무게 기록 조회 오류:', error);
      throw error;
    }
  };