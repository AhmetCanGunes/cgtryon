import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, Timestamp, doc, setDoc, getDoc, updateDoc, increment, getDocs, deleteDoc, query, where, orderBy, limit } from 'firebase/firestore';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged, User } from 'firebase/auth';
import { getStorage, ref, uploadString, getDownloadURL } from 'firebase/storage';
import { ADMIN_EMAILS, EmailSubscriber, AdminStats, AdminUserView } from '../types';

// Firebase yapılandırması
const firebaseConfig = {
  apiKey: "REMOVED_FIREBASE_KEY",
  authDomain: "cgtryon-1de7c.firebaseapp.com",
  projectId: "cgtryon-1de7c",
  storageBucket: "cgtryon-1de7c.firebasestorage.app",
  messagingSenderId: "444502945614",
  appId: "1:444502945614:web:be817300e067bfa9e9b81f"
};

// Firebase'i başlat
let app;
let db;
let auth;
let storage;

try {
  app = initializeApp(firebaseConfig);
  db = getFirestore(app);
  auth = getAuth(app);
  storage = getStorage(app);
  console.log('Firebase initialized successfully');
} catch (error) {
  console.error('Firebase initialization error:', error);
}

// Base64 görseli Firebase Storage'a yükle ve URL döndür
export const uploadBase64ToStorage = async (
  base64Data: string,
  userId: string,
  type: string
): Promise<string> => {
  try {
    if (!storage) throw new Error('Firebase Storage is not initialized');

    // Benzersiz dosya adı oluştur
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2, 15);
    const fileName = `generated/${userId}/${type}/${timestamp}_${randomId}.jpg`;

    // Storage referansı oluştur
    const storageRef = ref(storage, fileName);

    // Base64'ün data:image prefix'i varsa kaldır
    let base64String = base64Data;
    if (base64Data.includes(',')) {
      base64String = base64Data.split(',')[1];
    }

    // Storage'a yükle
    await uploadString(storageRef, base64String, 'base64', {
      contentType: 'image/jpeg'
    });

    // Download URL'i al
    const downloadUrl = await getDownloadURL(storageRef);
    console.log('✅ Image uploaded to Storage:', fileName);

    return downloadUrl;
  } catch (error: any) {
    console.error('Error uploading to Storage:', error);
    throw error;
  }
};

// E-posta kaydı ekle
export const saveEmailToFirebase = async (email: string): Promise<boolean> => {
  try {
    if (!db) {
      throw new Error('Firebase is not initialized');
    }

    const docRef = await addDoc(collection(db, 'emailSubscriptions'), {
      email: email,
      timestamp: Timestamp.now(),
      source: 'landing_page',
      createdAt: new Date().toISOString()
    });

    console.log('Email saved to Firebase with ID:', docRef.id);
    return true;
  } catch (error) {
    console.error('Error saving to Firebase:', error);
    return false;
  }
};

// LocalStorage'a yedekleme fonksiyonu
export const saveToLocalStorage = (email: string): boolean => {
  try {
    const existingEmails = JSON.parse(localStorage.getItem('emailSubscriptions') || '[]');
    const timestamp = new Date().toISOString();
    existingEmails.push({ email, timestamp });
    localStorage.setItem('emailSubscriptions', JSON.stringify(existingEmails));
    console.log('Email saved to localStorage:', email);
    return true;
  } catch (error) {
    console.error('Error saving to localStorage:', error);
    return false;
  }
};

// Kullanıcı tipi
export interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
  avatarId?: string;
  credits: number;
  plan: 'free' | 'pro' | 'enterprise';
  createdAt: string;
  lastLogin: string;
  usageHistory: UsageRecord[];
}

export interface UsageRecord {
  id: string;
  type: 'studio' | 'try-on' | 'ad-creative' | 'upscale';
  creditsUsed: number;
  timestamp: string;
  details: string;
  aiModel?: string; // AI Model used (e.g., "Gemini 2.0 Flash", "Imagen 3")
  estimatedCost?: number; // Estimated cost in USD
}

// Authentication fonksiyonları
export const registerUser = async (email: string, password: string): Promise<User> => {
  try {
    if (!auth) throw new Error('Auth is not initialized');
    
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Firestore'da kullanıcı profili oluştur
    await setDoc(doc(db!, 'users', user.uid), {
      uid: user.uid,
      email: user.email,
      credits: 0, // Başlangıç kredisi
      plan: 'free',
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
      usageHistory: []
    });
    
    console.log('✅ User registered successfully:', user.email);
    return user;
  } catch (error: any) {
    console.error('Registration error:', error);
    throw error;
  }
};

export const loginUser = async (email: string, password: string): Promise<User> => {
  try {
    if (!auth) throw new Error('Auth is not initialized');

    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Kullanıcı profilini kontrol et, yoksa oluştur
    const userRef = doc(db!, 'users', user.uid);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      // Mevcut kullanıcı - son giriş tarihini güncelle
      await updateDoc(userRef, {
        lastLogin: new Date().toISOString()
      });
    } else {
      // Yeni kullanıcı profili oluştur (eski kullanıcılar için)
      await setDoc(userRef, {
        uid: user.uid,
        email: user.email,
        credits: 0,
        plan: 'free',
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
        usageHistory: []
      });
      console.log('✅ User profile created for existing auth user');
    }

    console.log('✅ User logged in successfully:', user.email);
    return user;
  } catch (error: any) {
    console.error('Login error:', error);
    throw error;
  }
};

export const logoutUser = async (): Promise<void> => {
  try {
    if (!auth) throw new Error('Auth is not initialized');
    await signOut(auth);
    console.log('✅ User logged out successfully');
  } catch (error: any) {
    console.error('Logout error:', error);
    throw error;
  }
};

// Kullanıcı profili getir
export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
  try {
    if (!db) throw new Error('Firestore is not initialized');

    const docRef = doc(db, 'users', uid);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return docSnap.data() as UserProfile;
    } else {
      console.log('No user profile found');
      return null;
    }
  } catch (error: any) {
    console.error('Error fetching user profile:', error);
    return null;
  }
};

// Kullanıcı profili güncelle (isim ve avatar)
export const updateUserProfile = async (
  uid: string,
  updates: { displayName?: string; avatarId?: string }
): Promise<boolean> => {
  try {
    if (!db) throw new Error('Firestore is not initialized');

    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, updates);

    console.log('✅ User profile updated successfully');
    return true;
  } catch (error: any) {
    console.error('Error updating user profile:', error);
    return false;
  }
};

// Kredi kullan
export const useCredits = async (
  uid: string, 
  amount: number, 
  type: string, 
  details: string,
  aiModel?: string,
  estimatedCost?: number
): Promise<boolean> => {
  try {
    if (!db) throw new Error('Firestore is not initialized');
    
    const userRef = doc(db, 'users', uid);
    const userSnap = await getDoc(userRef);
    
    if (!userSnap.exists()) {
      throw new Error('User not found');
    }
    
    const userData = userSnap.data() as UserProfile;
    
    if (userData.credits < amount) {
      throw new Error('Yetersiz kredi!');
    }
    
    // Kredi düş ve kullanım kaydı ekle
    const usageRecord: UsageRecord = {
      id: `${Date.now()}`,
      type: type as any,
      creditsUsed: amount,
      timestamp: new Date().toISOString(),
      details,
      aiModel: aiModel || 'Unknown',
      estimatedCost: estimatedCost || 0
    };
    
    await updateDoc(userRef, {
      credits: increment(-amount),
      usageHistory: [...(userData.usageHistory || []), usageRecord]
    });
    
    console.log(`✅ ${amount} credits used for ${type} (AI Model: ${aiModel}, Cost: $${estimatedCost?.toFixed(4)})`);
    return true;
  } catch (error: any) {
    console.error('Error using credits:', error);
    throw error;
  }
};

// Admin için kullanım geçmişi kaydet (kredi düşürmeden)
export const trackAdminUsage = async (
  uid: string,
  type: string,
  details: string,
  aiModel?: string,
  estimatedCost?: number
): Promise<boolean> => {
  try {
    if (!db) throw new Error('Firestore is not initialized');
    
    const userRef = doc(db, 'users', uid);
    const userSnap = await getDoc(userRef);
    
    if (!userSnap.exists()) {
      console.warn('User not found for tracking');
      return false;
    }
    
    const userData = userSnap.data() as UserProfile;
    
    // Kullanım kaydı ekle (kredi düşürmeden)
    const usageRecord: UsageRecord = {
      id: `${Date.now()}`,
      type: type as any,
      creditsUsed: 0, // Admin için kredi düşmez
      timestamp: new Date().toISOString(),
      details,
      aiModel: aiModel || 'Unknown',
      estimatedCost: estimatedCost || 0
    };
    
    await updateDoc(userRef, {
      usageHistory: [...(userData.usageHistory || []), usageRecord]
    });
    
    console.log(`✅ Admin usage tracked for ${type} (AI Model: ${aiModel}, Cost: $${estimatedCost?.toFixed(4)})`);
    return true;
  } catch (error: any) {
    console.error('Error tracking admin usage:', error);
    return false;
  }
};

// Kredi ekle (satın alma)
export const addCredits = async (uid: string, amount: number): Promise<boolean> => {
  try {
    if (!db) throw new Error('Firestore is not initialized');
    
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, {
      credits: increment(amount)
    });
    
    console.log(`✅ ${amount} credits added`);
    return true;
  } catch (error: any) {
    console.error('Error adding credits:', error);
    return false;
  }
};

// Auth state listener
export const onAuthChange = (callback: (user: User | null) => void) => {
  if (!auth) return () => {};
  return onAuthStateChanged(auth, callback);
};

// ADMIN FONKSİYONLARI
// Tüm kullanıcıları listele (Admin için)
export const getAllUsers = async (): Promise<UserProfile[]> => {
  try {
    if (!db) throw new Error('Firestore is not initialized');

    const usersRef = collection(db, 'users');
    const querySnapshot = await getDocs(usersRef);

    const users: UserProfile[] = [];
    querySnapshot.forEach((docSnap) => {
      users.push(docSnap.data() as UserProfile);
    });

    // Client-side sıralama
    users.sort((a, b) => {
      if (!a.createdAt) return 1;
      if (!b.createdAt) return -1;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    console.log(`✅ Fetched ${users.length} users`);
    return users;
  } catch (error: any) {
    console.error('Error fetching users:', error);
    return [];
  }
};

// Admin: Kullanıcıya kredi ekle
export const adminAddCredits = async (userEmail: string, amount: number): Promise<boolean> => {
  try {
    if (!db) throw new Error('Firestore is not initialized');
    
    // E-posta ile kullanıcıyı bul
    const usersRef = collection(db, 'users');
    const querySnapshot = await getDocs(usersRef);
    
    let userDoc = null;
    querySnapshot.forEach((doc) => {
      if (doc.data().email === userEmail) {
        userDoc = doc;
      }
    });
    
    if (!userDoc) {
      throw new Error('Kullanıcı bulunamadı');
    }
    
    await updateDoc(doc(db, 'users', userDoc.id), {
      credits: increment(amount)
    });
    
    console.log(`✅ Admin: ${amount} credits added to ${userEmail}`);
    return true;
  } catch (error: any) {
    console.error('Error adding credits:', error);
    throw error;
  }
};

// Admin kontrolü - email admin listesinde mi?
export const isAdmin = (email: string | null | undefined): boolean => {
  if (!email) return false;
  return ADMIN_EMAILS.includes(email.toLowerCase());
};

// Email abonelerini getir
export const getEmailSubscribers = async (): Promise<EmailSubscriber[]> => {
  try {
    if (!db) throw new Error('Firestore is not initialized');

    const subscribersRef = collection(db, 'emailSubscriptions');
    const querySnapshot = await getDocs(subscribersRef);

    const subscribers: EmailSubscriber[] = [];
    querySnapshot.forEach((docSnap) => {
      const data = docSnap.data();
      subscribers.push({
        id: docSnap.id,
        email: data.email || '',
        timestamp: data.createdAt || data.timestamp?.toDate?.()?.toISOString() || '',
        source: data.source || 'landing_page'
      });
    });

    // Client-side sıralama (en yeni önce)
    subscribers.sort((a, b) => {
      if (!a.timestamp) return 1;
      if (!b.timestamp) return -1;
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    });

    console.log(`✅ Fetched ${subscribers.length} email subscribers`);
    return subscribers;
  } catch (error: any) {
    console.error('Error fetching email subscribers:', error);
    return [];
  }
};

// Email abonesini sil
export const deleteEmailSubscriber = async (subscriberId: string): Promise<boolean> => {
  try {
    if (!db) throw new Error('Firestore is not initialized');

    await deleteDoc(doc(db, 'emailSubscriptions', subscriberId));
    console.log(`✅ Deleted subscriber: ${subscriberId}`);
    return true;
  } catch (error: any) {
    console.error('Error deleting subscriber:', error);
    return false;
  }
};

// Admin istatistiklerini hesapla - GERÇEK VERİLER
export const getAdminStats = async (): Promise<AdminStats> => {
  try {
    if (!db) throw new Error('Firestore is not initialized');

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // Son 7 gün için tarih aralıkları oluştur
    const last7Days: Date[] = [];
    const last14Days: Date[] = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      last7Days.push(date);
    }
    for (let i = 13; i >= 7; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      last14Days.push(date);
    }

    // Tüm kullanıcıları çek
    const usersRef = collection(db, 'users');
    const usersSnapshot = await getDocs(usersRef);

    let totalUsers = 0;
    let totalCreditsUsed = 0;
    let totalGenerations = 0;
    const usersByPlan = { free: 0, pro: 0, enterprise: 0 };

    // Günlük veriler için map
    const dailyGenerationsMap: { [key: string]: number } = {};
    const dailyCreditsMap: { [key: string]: number } = {};
    const dailyUsersMap: { [key: string]: number } = {};

    // Initialize daily maps
    last7Days.forEach(d => {
      const key = d.toISOString().split('T')[0];
      dailyGenerationsMap[key] = 0;
      dailyCreditsMap[key] = 0;
      dailyUsersMap[key] = 0;
    });

    // Önceki 7 gün verileri (trend hesabı için)
    let prevWeekGenerations = 0;
    let prevWeekCredits = 0;
    let prevWeekUsers = 0;
    let thisWeekGenerations = 0;
    let thisWeekCredits = 0;
    let thisWeekUsers = 0;

    usersSnapshot.forEach((doc) => {
      const data = doc.data();
      totalUsers++;

      // Plan sayımı
      const plan = data.plan || 'free';
      if (plan in usersByPlan) {
        usersByPlan[plan as keyof typeof usersByPlan]++;
      }

      // Kullanıcı kayıt tarihini kontrol et
      if (data.createdAt) {
        const createdDate = new Date(data.createdAt);
        const createdDateKey = createdDate.toISOString().split('T')[0];

        // Bu hafta mı kayıt olmuş?
        if (createdDate >= last7Days[0]) {
          thisWeekUsers++;
          if (dailyUsersMap[createdDateKey] !== undefined) {
            dailyUsersMap[createdDateKey]++;
          }
        } else if (createdDate >= last14Days[0] && createdDate < last7Days[0]) {
          prevWeekUsers++;
        }
      }

      // Kullanım istatistikleri
      if (data.usageHistory && Array.isArray(data.usageHistory)) {
        data.usageHistory.forEach((record: any) => {
          totalGenerations++;
          const creditsUsed = record.creditsUsed || 0;
          totalCreditsUsed += creditsUsed;

          // Tarih bazlı analiz
          if (record.date) {
            const recordDate = new Date(record.date);
            const recordDateKey = recordDate.toISOString().split('T')[0];

            // Bu hafta mı?
            if (recordDate >= last7Days[0]) {
              thisWeekGenerations++;
              thisWeekCredits += creditsUsed;

              if (dailyGenerationsMap[recordDateKey] !== undefined) {
                dailyGenerationsMap[recordDateKey]++;
              }
              if (dailyCreditsMap[recordDateKey] !== undefined) {
                dailyCreditsMap[recordDateKey] += creditsUsed;
              }
            } else if (recordDate >= last14Days[0] && recordDate < last7Days[0]) {
              prevWeekGenerations++;
              prevWeekCredits += creditsUsed;
            }
          }
        });
      }
    });

    // Email abonelerini say
    const subscribersRef = collection(db, 'emailSubscriptions');
    const subscribersSnapshot = await getDocs(subscribersRef);
    const totalSubscribers = subscribersSnapshot.size;

    // Trend hesaplama (yüzde değişim)
    const calcTrend = (current: number, previous: number): number => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return Math.round(((current - previous) / previous) * 100);
    };

    const trends = {
      users: calcTrend(thisWeekUsers, prevWeekUsers),
      generations: calcTrend(thisWeekGenerations, prevWeekGenerations),
      credits: calcTrend(thisWeekCredits, prevWeekCredits),
      subscribers: 0 // Abone trend'i için geçmiş veri yok
    };

    // Recent activity array'i oluştur
    const recentActivity: AdminStats['recentActivity'] = last7Days.map(date => {
      const key = date.toISOString().split('T')[0];
      return {
        date: key,
        users: dailyUsersMap[key] || 0,
        generations: dailyGenerationsMap[key] || 0,
        credits: dailyCreditsMap[key] || 0
      };
    });

    // Daily sparkline arrays
    const dailyGenerations = last7Days.map(d => dailyGenerationsMap[d.toISOString().split('T')[0]] || 0);
    const dailyCredits = last7Days.map(d => dailyCreditsMap[d.toISOString().split('T')[0]] || 0);
    const dailyUsers = last7Days.map(d => dailyUsersMap[d.toISOString().split('T')[0]] || 0);

    console.log('📊 Admin Stats:', {
      totalUsers,
      totalGenerations,
      totalCreditsUsed,
      trends,
      dailyGenerations
    });

    return {
      totalUsers,
      totalCreditsUsed,
      totalGenerations,
      totalSubscribers,
      usersByPlan,
      recentActivity,
      trends,
      dailyGenerations,
      dailyCredits,
      dailyUsers
    };
  } catch (error: any) {
    console.error('Error fetching admin stats:', error);
    return {
      totalUsers: 0,
      totalCreditsUsed: 0,
      totalGenerations: 0,
      totalSubscribers: 0,
      usersByPlan: { free: 0, pro: 0, enterprise: 0 },
      recentActivity: [],
      trends: { users: 0, generations: 0, credits: 0, subscribers: 0 },
      dailyGenerations: [0, 0, 0, 0, 0, 0, 0],
      dailyCredits: [0, 0, 0, 0, 0, 0, 0],
      dailyUsers: [0, 0, 0, 0, 0, 0, 0]
    };
  }
};

// Admin: Kullanıcıları genişletilmiş bilgiyle getir
export const getAdminUserList = async (): Promise<AdminUserView[]> => {
  try {
    if (!db) {
      console.error('❌ Firestore is not initialized!');
      throw new Error('Firestore is not initialized');
    }

    console.log('🔍 Fetching users from Firestore...');
    const usersRef = collection(db, 'users');
    // orderBy kaldırıldı - index gerektirmeden tüm kullanıcıları çek
    const querySnapshot = await getDocs(usersRef);
    console.log(`📦 Firestore returned ${querySnapshot.size} documents`);

    const users: AdminUserView[] = [];
    querySnapshot.forEach((docSnap) => {
      const data = docSnap.data();

      // Kullanım istatistiklerini hesapla
      let totalGenerations = 0;
      let totalCreditsUsed = 0;
      let totalEstimatedCost = 0;
      const modelUsage: { [key: string]: number } = {};

      if (data.usageHistory && Array.isArray(data.usageHistory)) {
        totalGenerations = data.usageHistory.length;
        data.usageHistory.forEach((record: any) => {
          totalCreditsUsed += record.creditsUsed || 0;
          
          // Track AI model usage and cost
          if (record.aiModel) {
            modelUsage[record.aiModel] = (modelUsage[record.aiModel] || 0) + 1;
          }
          if (record.estimatedCost) {
            totalEstimatedCost += record.estimatedCost;
          }
        });
      }

      // Get last 10 usage records
      const recentUsageHistory = data.usageHistory 
        ? (data.usageHistory as UsageRecord[]).slice(-10).reverse() 
        : [];

      users.push({
        uid: data.uid || docSnap.id,
        email: data.email || 'Bilinmiyor',
        displayName: data.displayName,
        credits: data.credits || 0,
        plan: data.plan || 'free',
        createdAt: data.createdAt || '',
        lastLogin: data.lastLogin || '',
        totalGenerations,
        totalCreditsUsed,
        totalEstimatedCost,
        modelUsage,
        recentUsageHistory
      });
    });

    // Client-side sıralama (en yeni önce)
    users.sort((a, b) => {
      if (!a.createdAt) return 1;
      if (!b.createdAt) return -1;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    console.log(`✅ Fetched ${users.length} users for admin`);
    return users;
  } catch (error: any) {
    console.error('Error fetching admin user list:', error);
    return [];
  }
};

// Admin: Kullanıcı planını değiştir
export const adminUpdateUserPlan = async (userEmail: string, newPlan: 'free' | 'pro' | 'enterprise'): Promise<boolean> => {
  try {
    if (!db) throw new Error('Firestore is not initialized');

    const usersRef = collection(db, 'users');
    const querySnapshot = await getDocs(usersRef);

    let userDoc = null;
    querySnapshot.forEach((doc) => {
      if (doc.data().email === userEmail) {
        userDoc = doc;
      }
    });

    if (!userDoc) {
      throw new Error('Kullanıcı bulunamadı');
    }

    await updateDoc(doc(db, 'users', userDoc.id), {
      plan: newPlan
    });

    console.log(`✅ Admin: Updated ${userEmail} plan to ${newPlan}`);
    return true;
  } catch (error: any) {
    console.error('Error updating user plan:', error);
    throw error;
  }
};

// Admin: Kullanıcı kredisini sıfırla
export const adminSetUserCredits = async (userEmail: string, credits: number): Promise<boolean> => {
  try {
    if (!db) throw new Error('Firestore is not initialized');

    const usersRef = collection(db, 'users');
    const querySnapshot = await getDocs(usersRef);

    let userDoc = null;
    querySnapshot.forEach((doc) => {
      if (doc.data().email === userEmail) {
        userDoc = doc;
      }
    });

    if (!userDoc) {
      throw new Error('Kullanıcı bulunamadı');
    }

    await updateDoc(doc(db, 'users', userDoc.id), {
      credits: credits
    });

    console.log(`✅ Admin: Set ${userEmail} credits to ${credits}`);
    return true;
  } catch (error: any) {
    console.error('Error setting user credits:', error);
    throw error;
  }
};

// Admin: Kullanıcının usage history ve model kullanımını sıfırla
export const adminResetUserUsage = async (userEmail: string): Promise<boolean> => {
  try {
    if (!db) throw new Error('Firestore is not initialized');

    const usersRef = collection(db, 'users');
    const querySnapshot = await getDocs(usersRef);

    let userDoc = null;
    querySnapshot.forEach((doc) => {
      if (doc.data().email === userEmail) {
        userDoc = doc;
      }
    });

    if (!userDoc) {
      throw new Error('Kullanıcı bulunamadı');
    }

    await updateDoc(doc(db, 'users', userDoc.id), {
      usageHistory: []
    });

    console.log(`✅ Admin: Reset usage history for ${userEmail}`);
    return true;
  } catch (error: any) {
    console.error('Error resetting user usage:', error);
    throw error;
  }
};

// ==========================================
// GÖRSEL GEÇMİŞİ VE FAVORİLER SİSTEMİ
// ==========================================

export interface SavedImage {
  id: string;
  uid: string;
  imageUrl: string; // Base64 veya URL
  thumbnailUrl?: string;
  type: 'studio' | 'try-on' | 'ad-creative' | 'upscale';
  settings: any; // Kullanılan ayarlar
  prompt?: string;
  isFavorite: boolean;
  createdAt: string;
  aiModel?: string;
}

// Görsel kaydet (geçmişe ekle)
// Helper function to remove undefined values from objects (Firebase doesn't accept undefined)
const removeUndefinedValues = (obj: any): any => {
  if (obj === null || obj === undefined) return null;
  if (typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(removeUndefinedValues);

  const cleaned: any = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined) {
      cleaned[key] = typeof value === 'object' ? removeUndefinedValues(value) : value;
    }
  }
  return cleaned;
};

export const saveImageToHistory = async (
  uid: string,
  imageUrl: string,
  type: 'studio' | 'try-on' | 'ad-creative' | 'upscale',
  settings: any,
  prompt?: string,
  aiModel?: string
): Promise<string | null> => {
  try {
    if (!db) throw new Error('Firestore is not initialized');

    // Clean settings and imageData to remove undefined values
    const cleanedSettings = removeUndefinedValues(settings);

    const imageData: Omit<SavedImage, 'id'> = {
      uid,
      imageUrl,
      type,
      settings: cleanedSettings,
      prompt,
      isFavorite: false,
      createdAt: new Date().toISOString(),
      aiModel
    };

    const cleanedImageData = removeUndefinedValues(imageData);

    const docRef = await addDoc(collection(db, 'imageHistory'), cleanedImageData);
    console.log('✅ Image saved to history:', docRef.id);
    return docRef.id;
  } catch (error: any) {
    console.error('Error saving image to history:', error);
    return null;
  }
};

// Kullanıcının görsel geçmişini getir
export const getUserImageHistory = async (
  uid: string,
  limitCount: number = 50,
  filterType?: 'studio' | 'try-on' | 'ad-creative' | 'upscale'
): Promise<SavedImage[]> => {
  try {
    if (!db) throw new Error('Firestore is not initialized');

    const historyRef = collection(db, 'imageHistory');

    // Sorgu oluştur
    let q;
    if (filterType) {
      q = query(
        historyRef,
        where('uid', '==', uid),
        where('type', '==', filterType)
      );
    } else {
      q = query(
        historyRef,
        where('uid', '==', uid)
      );
    }

    const querySnapshot = await getDocs(q);

    const images: SavedImage[] = [];
    querySnapshot.forEach((docSnap) => {
      const data = docSnap.data();
      images.push({
        id: docSnap.id,
        uid: data.uid,
        imageUrl: data.imageUrl,
        thumbnailUrl: data.thumbnailUrl,
        type: data.type,
        settings: data.settings,
        prompt: data.prompt,
        isFavorite: data.isFavorite,
        createdAt: data.createdAt,
        aiModel: data.aiModel
      } as SavedImage);
    });

    // Client-side sıralama (en yeni önce)
    images.sort((a, b) => {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    // Limit uygula
    const limitedImages = images.slice(0, limitCount);

    console.log(`✅ Fetched ${limitedImages.length} images from history`);
    return limitedImages;
  } catch (error: any) {
    console.error('Error fetching image history:', error);
    return [];
  }
};

// Favorilere ekle/çıkar
export const toggleFavorite = async (imageId: string, isFavorite: boolean): Promise<boolean> => {
  try {
    if (!db) throw new Error('Firestore is not initialized');

    const imageRef = doc(db, 'imageHistory', imageId);
    await updateDoc(imageRef, {
      isFavorite: isFavorite
    });

    console.log(`✅ Image ${imageId} favorite status: ${isFavorite}`);
    return true;
  } catch (error: any) {
    console.error('Error toggling favorite:', error);
    return false;
  }
};

// Kullanıcının favorilerini getir
export const getUserFavorites = async (uid: string): Promise<SavedImage[]> => {
  try {
    if (!db) throw new Error('Firestore is not initialized');

    const historyRef = collection(db, 'imageHistory');
    const q = query(
      historyRef,
      where('uid', '==', uid),
      where('isFavorite', '==', true)
    );

    const querySnapshot = await getDocs(q);

    const favorites: SavedImage[] = [];
    querySnapshot.forEach((docSnap) => {
      const data = docSnap.data();
      favorites.push({
        id: docSnap.id,
        uid: data.uid,
        imageUrl: data.imageUrl,
        thumbnailUrl: data.thumbnailUrl,
        type: data.type,
        settings: data.settings,
        prompt: data.prompt,
        isFavorite: data.isFavorite,
        createdAt: data.createdAt,
        aiModel: data.aiModel
      } as SavedImage);
    });

    // Client-side sıralama (en yeni önce)
    favorites.sort((a, b) => {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    console.log(`✅ Fetched ${favorites.length} favorites`);
    return favorites;
  } catch (error: any) {
    console.error('Error fetching favorites:', error);
    return [];
  }
};

// Görseli geçmişten sil
export const deleteImageFromHistory = async (imageId: string): Promise<boolean> => {
  try {
    if (!db) throw new Error('Firestore is not initialized');

    await deleteDoc(doc(db, 'imageHistory', imageId));
    console.log(`✅ Image deleted from history: ${imageId}`);
    return true;
  } catch (error: any) {
    console.error('Error deleting image from history:', error);
    return false;
  }
};

// Birden fazla görseli kaydet (batch)
export const saveMultipleImagesToHistory = async (
  uid: string,
  images: Array<{
    imageUrl: string;
    type: 'studio' | 'try-on' | 'ad-creative' | 'upscale';
    settings: any;
    prompt?: string;
    aiModel?: string;
  }>
): Promise<string[]> => {
  try {
    if (!db) throw new Error('Firestore is not initialized');

    const savedIds: string[] = [];

    for (const image of images) {
      // Clean settings to remove undefined values (Firebase doesn't accept undefined)
      const cleanedSettings = removeUndefinedValues(image.settings);

      const imageData: Omit<SavedImage, 'id'> = {
        uid,
        imageUrl: image.imageUrl,
        type: image.type,
        settings: cleanedSettings,
        prompt: image.prompt,
        isFavorite: false,
        createdAt: new Date().toISOString(),
        aiModel: image.aiModel
      };

      // Also clean the entire imageData object
      const cleanedImageData = removeUndefinedValues(imageData);

      const docRef = await addDoc(collection(db, 'imageHistory'), cleanedImageData);
      savedIds.push(docRef.id);
    }

    console.log(`✅ Saved ${savedIds.length} images to history`);
    return savedIds;
  } catch (error: any) {
    console.error('Error saving multiple images:', error);
    return [];
  }
};

// Kullanıcının tüm geçmişini temizle
export const clearUserHistory = async (uid: string): Promise<boolean> => {
  try {
    if (!db) throw new Error('Firestore is not initialized');

    const historyRef = collection(db, 'imageHistory');
    const q = query(historyRef, where('uid', '==', uid));
    const querySnapshot = await getDocs(q);

    const deletePromises: Promise<void>[] = [];
    querySnapshot.forEach((docSnap) => {
      deletePromises.push(deleteDoc(doc(db, 'imageHistory', docSnap.id)));
    });

    await Promise.all(deletePromises);
    console.log(`✅ Cleared ${deletePromises.length} images from history for user ${uid}`);
    return true;
  } catch (error: any) {
    console.error('Error clearing user history:', error);
    return false;
  }
};

// Dashboard için kullanıcı istatistikleri
export interface UserDashboardStats {
  totalGenerations: number;
  totalCreditsUsed: number;
  successCount: number;
  failedCount: number;
  pendingCount: number;
  recentJobs: Array<{
    id: string;
    type: string;
    status: 'completed' | 'processing' | 'queued';
    time: string;
    details: string;
    imageUrl?: string; // Üretilen görsel URL'i
  }>;
  generationsByType: {
    studio: number;
    tryOn: number;
    adCreative: number;
    upscale: number;
  };
  weeklyGenerations: number[];
}

export const getUserDashboardStats = async (uid: string): Promise<UserDashboardStats> => {
  try {
    if (!db) throw new Error('Firestore is not initialized');

    // Kullanıcı profilini al
    const userRef = doc(db, 'users', uid);
    const userSnap = await getDoc(userRef);

    let totalCreditsUsed = 0;
    let usageHistory: UsageRecord[] = [];

    if (userSnap.exists()) {
      const userData = userSnap.data();
      usageHistory = userData.usageHistory || [];

      // Toplam kredi kullanımını hesapla
      usageHistory.forEach((record: any) => {
        totalCreditsUsed += record.creditsUsed || 0;
      });
    }

    // Görsel geçmişini al
    const historyRef = collection(db, 'imageHistory');
    const q = query(historyRef, where('uid', '==', uid));
    const querySnapshot = await getDocs(q);

    const images: any[] = [];
    querySnapshot.forEach((docSnap) => {
      images.push({
        id: docSnap.id,
        ...docSnap.data()
      });
    });

    // En yeniden eskiye sırala
    images.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const totalGenerations = images.length;

    // Tür bazında sayım
    const generationsByType = {
      studio: images.filter(img => img.type === 'studio').length,
      tryOn: images.filter(img => img.type === 'try-on').length,
      adCreative: images.filter(img => img.type === 'ad-creative').length,
      upscale: images.filter(img => img.type === 'upscale').length,
    };

    // Son 10 işi hazırla
    const recentJobs = images.slice(0, 10).map((img, index) => {
      const typeLabels: Record<string, string> = {
        'studio': 'Model Studio',
        'try-on': 'Virtual Try-on',
        'ad-creative': 'Ad Creative',
        'upscale': 'Upscale'
      };

      const timeAgo = getTimeAgo(img.createdAt);

      return {
        id: `#${img.id.substring(0, 6)}`,
        type: typeLabels[img.type] || img.type,
        status: 'completed' as const,
        time: timeAgo,
        details: img.prompt || img.aiModel || '',
        imageUrl: img.imageUrl // Üretilen görsel URL'i
      };
    });

    // Haftalık üretim grafiği (son 7 gün)
    const weeklyGenerations = getWeeklyGenerations(images);

    return {
      totalGenerations,
      totalCreditsUsed,
      successCount: totalGenerations,
      failedCount: 0,
      pendingCount: 0,
      recentJobs,
      generationsByType,
      weeklyGenerations
    };
  } catch (error: any) {
    console.error('Error fetching dashboard stats:', error);
    return {
      totalGenerations: 0,
      totalCreditsUsed: 0,
      successCount: 0,
      failedCount: 0,
      pendingCount: 0,
      recentJobs: [],
      generationsByType: { studio: 0, tryOn: 0, adCreative: 0, upscale: 0 },
      weeklyGenerations: [0, 0, 0, 0, 0, 0, 0]
    };
  }
};

// Zaman formatı yardımcı fonksiyonu
const getTimeAgo = (dateString: string): string => {
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString('tr-TR');
};

// Haftalık üretim hesaplama
const getWeeklyGenerations = (images: any[]): number[] => {
  const result = [0, 0, 0, 0, 0, 0, 0];
  const now = new Date();

  images.forEach(img => {
    const imgDate = new Date(img.createdAt);
    const diffDays = Math.floor((now.getTime() - imgDate.getTime()) / 86400000);

    if (diffDays >= 0 && diffDays < 7) {
      result[6 - diffDays]++;
    }
  });

  return result;
};

export { db, auth };

