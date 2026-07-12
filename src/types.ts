export type Category = 'plant' | 'insect' | 'weather' | 'free';

export interface Observation {
  id: string;
  classId?: string;
  studentNo?: string;
  studentName?: string;
  title: string;
  date: string;
  weather: string; // 'sunny' | 'cloudy' | 'rainy' | 'snowy'
  category: Category;
  description: string;
  drawingDataUrl?: string; // Base64 image data from drawing canvas
  tags?: string[];
  emoji?: string;
  aiFeedback?: string; // Gemini-generated growth mindset feedback
  detectedObject?: string; // Recognized plant/insect name
  funFact?: string; // Educational fact
  quiz?: string; // AI recommendation quiz
}

export interface Badge {
  id: string;
  title: string;
  description: string;
  iconName: string; // Lucide icon name
  achieved: boolean;
  requirement: string;
  progress: number; // 0 to 100
  targetCount: number;
  currentCount: number;
  enabled?: boolean; // Teacher can disable/enable for their class
}

export type SidebarTab = 'dashboard' | 'write' | 'encyclopedia' | 'badges' | 'teacher_dashboard';

export interface Student {
  studentNo: string;
  name: string;
  classId: string;
}

export interface SchoolClass {
  id: string;
  name: string;
  activeBadges: string[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: string;
}

export interface EncyclopediaEntry {
  id: string;
  name: string;
  emoji: string;
  category: Category;
  description: string;
  funFact: string;
  ecology: string;
  observedDate: string;
}
