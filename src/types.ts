export type Gender = 'masculino' | 'feminino';
export type Goal = 'ganho_massa' | 'perda_peso' | 'hipertrofia';

export interface UserProfile {
  uid: string;
  gender: Gender;
  goal: Goal;
  weight: number; // kg
  height: number; // cm
  age: number;
  timelineMonths: number;
  bmr: number; // TMB
  tdee: number; // GET
  targetCalories: number;
  targetMacros: {
    carbs: number;
    protein: number;
    fat: number;
  };
  createdAt: any;
  updatedAt?: any;
}

export interface FoodItem {
  id: string;
  name: string;
  calories: number;
  macros: {
    carbs: number;
    protein: number;
    fat: number;
  };
  timestamp: number;
  imageUrl?: string;
}

export interface DietPlan {
  days: {
    day: string;
    meals: {
      type: string;
      suggestions: string[];
    }[];
  }[];
}

export interface WorkoutPlan {
  days: {
    day: string;
    focus: string;
    exercises: {
      name: string;
      sets: string;
      reps: string;
      rest?: string;
    }[];
  }[];
}
