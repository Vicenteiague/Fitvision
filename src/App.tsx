import React, { useState, useEffect } from 'react';
import { Onboarding } from './components/Onboarding';
import { Dashboard } from './components/Dashboard';
import { VisionTracker } from './components/VisionTracker';
import { DietPlanner } from './components/DietPlanner';
import { Login } from './components/Login';
import { AICoach } from './components/AICoach';
import type { UserProfile, FoodItem } from './types';
import { auth, db, handleFirestoreError, OperationType, signOut } from './lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc, setDoc, collection, onSnapshot, query, orderBy, serverTimestamp } from 'firebase/firestore';
import { Loader2, LogOut } from 'lucide-react';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [foodHistory, setFoodHistory] = useState<FoodItem[]>([]);
  const [view, setView] = useState<'dashboard' | 'vision' | 'diet'>('dashboard');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (user) {
      setProfileLoading(true);
      const profileRef = doc(db, 'users', user.uid);
      
      // We manually attempt to get the profile. Since getDoc bypasses security rules listeners occasionally, let's just use it
      getDoc(profileRef).then(snap => {
        if (snap.exists()) {
          setProfile(snap.data() as UserProfile);
        } else {
          setProfile(null);
        }
      }).catch(err => {
        handleFirestoreError(err, OperationType.GET, `users/${user.uid}`);
      }).finally(() => {
        setProfileLoading(false);
      });

      const foodsRef = collection(db, 'users', user.uid, 'foods');
      const q = query(foodsRef, orderBy('timestamp', 'desc'));
      
      const unsubs = onSnapshot(q, (snapshot) => {
        const foods: FoodItem[] = [];
        snapshot.forEach(doc => {
          foods.push(doc.data() as FoodItem);
        });
        setFoodHistory(foods);
      }, (err) => {
         handleFirestoreError(err, OperationType.LIST, `users/${user.uid}/foods`);
      });

      return () => unsubs();
    } else {
      setProfile(null);
      setFoodHistory([]);
    }
  }, [user]);

  const handleCompleteOnboarding = async (p: Omit<UserProfile, 'uid' | 'createdAt'>) => {
    if (!user) return;
    
    const newProfile: UserProfile = {
      ...p,
      uid: user.uid,
      createdAt: serverTimestamp()
    };
    
    try {
      await setDoc(doc(db, 'users', user.uid), newProfile);
      setProfile(newProfile);
      setView('dashboard');
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `users/${user.uid}`);
    }
  };

  const handleAddFood = async (food: FoodItem) => {
    if (!user) return;
    try {
      await setDoc(doc(db, 'users', user.uid, 'foods', food.id), food);
      setView('dashboard');
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `users/${user.uid}/foods/${food.id}`);
    }
  };

  if (authLoading || profileLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-[#39FF14] animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  if (!profile) {
    return (
      <div className="relative">
        <button 
          onClick={signOut}
          className="absolute top-6 right-6 p-2 bg-[#121212] rounded-full text-gray-400 hover:text-white z-10"
        >
          <LogOut className="w-5 h-5" />
        </button>
        <Onboarding onComplete={handleCompleteOnboarding} />
      </div>
    );
  }

  if (view === 'vision') {
    return <VisionTracker onBack={() => setView('dashboard')} onAddFood={handleAddFood} />;
  }

  if (view === 'diet') {
    return <DietPlanner profile={profile} foodHistory={foodHistory} onBack={() => setView('dashboard')} />;
  }

  if (view === 'coach') {
    return <AICoach profile={profile} onBack={() => setView('dashboard')} />
  }

  return (
    <div className="relative">
      <button 
        onClick={signOut}
        className="absolute top-6 right-6 p-2 bg-[#121212] border border-gray-800 rounded-full text-gray-400 hover:text-white z-10"
      >
        <LogOut className="w-5 h-5" />
      </button>
      <Dashboard 
        profile={profile} 
        foodHistory={foodHistory} 
        onOpenTracker={() => setView('vision')}
        onOpenDiet={() => setView('diet')}
        onOpenCoach={() => setView('coach')}
      />
    </div>
  );
}

