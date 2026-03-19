'use client';

import { useAuth } from '@/contexts/AuthContext';
import RecommendationsGrid from '@/components/ai/RecommendationsGrid';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { GraduationCap, Sparkles, TrendingUp } from 'lucide-react';
import Badge from '@/components/ui/Badge';

export default function StudentRecommendationsPage() {
  const { user } = useAuth();

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-2xl p-8 text-white">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-14 w-14 rounded-xl bg-white/20 flex items-center justify-center">
              <GraduationCap className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Your Learning Path</h1>
              <p className="text-white/80">Personalized recommendations based on your progress</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <div className="bg-white/10 rounded-lg p-4 backdrop-blur">
              <div className="text-2xl font-bold">12</div>
              <div className="text-sm text-white/80">Courses Enrolled</div>
            </div>
            <div className="bg-white/10 rounded-lg p-4 backdrop-blur">
              <div className="text-2xl font-bold">7</div>
              <div className="text-sm text-white/80">Completed</div>
            </div>
            <div className="bg-white/10 rounded-lg p-4 backdrop-blur">
              <div className="text-2xl font-bold">85%</div>
              <div className="text-sm text-white/80">Avg Score</div>
            </div>
            <div className="bg-white/10 rounded-lg p-4 backdrop-blur">
              <div className="text-2xl font-bold">45</div>
              <div className="text-sm text-white/80">Hours Learned</div>
            </div>
          </div>
        </div>

        {/* Recommendations */}
        <RecommendationsGrid 
          studentName={user?.name || 'Student'}
          onAccept={(id) => console.log('Accepted:', id)}
          onDismiss={(id) => console.log('Dismissed:', id)}
          onViewCourse={(courseId) => console.log('View course:', courseId)}
        />
      </div>
    </DashboardLayout>
  );
}
