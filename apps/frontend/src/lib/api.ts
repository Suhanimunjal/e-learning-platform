import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api',
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export const auth = {
  login: async (email: string, password: string) => {
    const res = await api.post('/auth/login', { email, password });
    if (res.data.accessToken) {
      localStorage.setItem('token', res.data.accessToken);
      localStorage.setItem('user', JSON.stringify(res.data.user));
    }
    return res.data;
  },
  register: async (name: string, email: string, password: string) => {
    const res = await api.post('/auth/register', { name, email, password });
    return res.data;
  },
  me: async () => {
    const res = await api.get('/auth/me');
    return res.data;
  },
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },
};

export const courses = {
  getAll: async () => {
    const res = await api.get('/courses');
    return res.data;
  },
  getById: async (id: string) => {
    const res = await api.get(`/courses/${id}`);
    return res.data;
  },
  create: async (data: any) => {
    const res = await api.post('/courses', data);
    return res.data;
  },
  update: async (id: string, data: any) => {
    const res = await api.patch(`/courses/${id}`, data);
    return res.data;
  },
  delete: async (id: string) => {
    const res = await api.delete(`/courses/${id}`);
    return res.data;
  },
};

export const enrollments = {
  enroll: async (courseId: string) => {
    const res = await api.post(`/enrollments/${courseId}`);
    return res.data;
  },
  getMyCourses: async () => {
    const res = await api.get('/enrollments/my-courses');
    return res.data;
  },
  getCourseStudents: async (courseId: string) => {
    const res = await api.get(`/enrollments/course/${courseId}/students`);
    return res.data;
  },
};

export const analytics = {
  getMyAnalytics: async () => {
    const res = await api.get('/analytics/my-analytics');
    return res.data;
  },
  getCourseAnalytics: async (courseId: string) => {
    const res = await api.get(`/analytics/courses/${courseId}`);
    return res.data;
  },
  getPlatformAnalytics: async () => {
    const res = await api.get('/analytics/platform');
    return res.data;
  },
  getTopCourses: async () => {
    const res = await api.get('/analytics/platform/top-courses');
    return res.data;
  },
  getEngagementMetrics: async () => {
    const res = await api.get('/analytics/platform/engagement');
    return res.data;
  },
};

export const modules = {
  create: async (data: { title: string; sectionId: string; type: 'LESSON' | 'QUIZ' | 'ASSIGNMENT' | 'DISCUSSION' | 'SCORM'; order?: number }) => {
    const res = await api.post('/modules', data);
    return res.data;
  },
  getBySection: async (sectionId: string) => {
    const res = await api.get(`/modules/section/${sectionId}`);
    return res.data;
  },
  getById: async (id: string) => {
    const res = await api.get(`/modules/${id}`);
    return res.data;
  },
  // Standardized response format: { content, audioUrl, videoUrl, quiz, assignment }
  generateContent: async (moduleId: string, topic: string) => {
    const res = await api.post(`/modules/${moduleId}/generate-content`, { topic });
    // Return standardized format
    return {
      status: res.data.status,
      content: res.data.content,
      audioUrl: res.data.audioUrl || null,
      videoUrl: res.data.videoUrl || null,
      quiz: res.data.quiz || [],
      assignment: res.data.assignment || null,
    };
  },
  updateContent: async (moduleId: string, content: any) => {
    const res = await api.patch(`/modules/${moduleId}/content`, { content });
    return {
      status: 'UPDATED',
      content: res.data.generatedContent,
      audioUrl: res.data.audioUrl || null,
      videoUrl: res.data.videoUrl || null,
    };
  },
  approveContent: async (moduleId: string) => {
    const res = await api.post(`/modules/${moduleId}/approve-content`);
    return res.data;
  },
  getVideoStatus: async (moduleId: string) => {
    const res = await api.get(`/modules/${moduleId}/video-status`);
    // Return standardized format with hasVideo flag
    return {
      moduleId: res.data.moduleId,
      topic: res.data.topic,
      content: res.data.content,
      contentStatus: res.data.contentStatus,
      videoStatus: res.data.videoStatus,
      audioUrl: res.data.audioUrl || null,
      videoUrl: res.data.videoUrl || null,
      transcript: res.data.transcript || null,
      retryCount: res.data.retryCount || 0,
      canRetry: res.data.canRetry !== false,
      canGenerateVideo: res.data.canGenerateVideo !== false,
      hasVideo: res.data.hasVideo === true, // CRITICAL: Include hasVideo
    };
  },
  generateVideo: async (moduleId: string, voiceId?: string) => {
    const res = await api.post(`/modules/${moduleId}/generate-video`, { voiceId });
    // Return standardized format
    return {
      status: res.data.status,
      content: res.data.content,
      audioUrl: res.data.audioUrl,
      videoUrl: res.data.videoUrl,
      duration: res.data.duration,
      transcript: res.data.transcript,
      quiz: res.data.quiz || [],
      assignment: res.data.assignment || null,
    };
  },
  getVideoPreview: async (moduleId: string) => {
    const res = await api.get(`/modules/${moduleId}/video-preview`);
    return {
      audioUrl: res.data.audioUrl,
      videoUrl: res.data.audioUrl,
      transcript: res.data.transcript,
    };
  },
  approveVideo: async (moduleId: string) => {
    const res = await api.post(`/modules/${moduleId}/approve-video`);
    return res.data;
  },
  rejectVideo: async (moduleId: string, reason?: string) => {
    const res = await api.post(`/modules/${moduleId}/reject-video`, { reason });
    return res.data;
  },
  getVoices: async () => {
    const res = await api.get('/modules/voices');
    return res.data;
  },
};

export const sections = {
  getByCourse: async (courseId: string) => {
    const res = await api.get(`/sections/course/${courseId}`);
    return res.data;
  },
  create: async (data: { title: string; courseId: string; order?: number }) => {
    const res = await api.post('/sections', data);
    return res.data;
  },
  update: async (id: string, data: any) => {
    const res = await api.patch(`/sections/${id}`, data);
    return res.data;
  },
  delete: async (id: string) => {
    const res = await api.delete(`/sections/${id}`);
    return res.data;
  },
};

export const payments = {
  createOrder: async (courseId: string, amount: number) => {
    const res = await api.post('/payments/create-order', { courseId, amount });
    return res.data;
  },
};

export const plugins = {
  getInstalled: async () => {
    const res = await api.get('/plugins');
    return res.data;
  },
  getAvailable: async (category?: string) => {
    const res = await api.get('/plugins/available', { params: { category } });
    return res.data;
  },
  getCategories: async () => {
    const res = await api.get('/plugins/categories');
    return res.data;
  },
  getStats: async () => {
    const res = await api.get('/plugins/stats');
    return res.data;
  },
  getById: async (pluginId: string) => {
    const res = await api.get(`/plugins/${pluginId}`);
    return res.data;
  },
  install: async (pluginId: string) => {
    const res = await api.post('/plugins/install', { pluginId });
    return res.data;
  },
  uninstall: async (pluginId: string) => {
    const res = await api.post(`/plugins/uninstall/${pluginId}`);
    return res.data;
  },
  toggle: async (pluginId: string, enabled: boolean) => {
    const res = await api.patch(`/plugins/${pluginId}/toggle`, { enabled });
    return res.data;
  },
  configure: async (pluginId: string, config: Record<string, any>) => {
    const res = await api.patch(`/plugins/${pluginId}/configure`, config);
    return res.data;
  },
};

// AI API Calls
export const ai = {
  // Content Generation
  generateAssignment: async (data: { topic: string; tone: string }) => {
    const res = await api.post('/ai/generate-assignment', data);
    return res.data;
  },
  generateExamples: async (data: { topic: string; tone: string }) => {
    const res = await api.post('/ai/generate-examples', data);
    return res.data;
  },
  summarizeContent: async (data: { content: string; tone: string }) => {
    const res = await api.post('/ai/summarize-content', data);
    return res.data;
  },

  // Auto-Grading
  gradeSubmission: async (submissionId: string, data?: any) => {
    const res = await api.post(`/ai/grade/${submissionId}`, data);
    return res.data;
  },
  getFeedback: async (submissionId: string) => {
    const res = await api.get(`/ai/grade/${submissionId}/feedback`);
    return res.data;
  },
  overrideGrade: async (submissionId: string, data: { score: number; feedback?: string }) => {
    const res = await api.post(`/ai/grade/${submissionId}/override`, data);
    return res.data;
  },

  // Recommendations
  getRecommendations: async (studentId: string) => {
    const res = await api.get(`/ai/recommendations/${studentId}`);
    return res.data;
  },
  trackProgress: async (data: { studentId: string; topic: string; score: number }) => {
    const res = await api.post('/ai/recommendations/track', data);
    return res.data;
  },

  // Translation
  translate: async (data: { text: string; targetLang: string; sourceLang?: string }) => {
    const res = await api.post('/ai/translate', data);
    return res.data;
  },
  detectLanguage: async (data: { text: string }) => {
    const res = await api.post('/ai/detect-language', data);
    return res.data;
  },

  // Smart Search
  search: async (query: string, filters?: Record<string, any>) => {
    const res = await api.get('/ai/search', { params: { query, ...filters } });
    return res.data;
  },
  getSuggestions: async (query: string) => {
    const res = await api.get('/ai/search/suggestions', { params: { query } });
    return res.data;
  },

  // Chatbot
  chat: async (data: { message: string; sessionId?: string; courseId?: string }) => {
    const res = await api.post('/ai/chat', data);
    return res.data;
  },
  getChatHistory: async (sessionId: string) => {
    const res = await api.get(`/ai/chat/history/${sessionId}`);
    return res.data;
  },
  createSession: async (data?: { courseId?: string }) => {
    const res = await api.post('/ai/chat/session', data);
    return res.data;
  },
};

// Grading API Calls
export const grading = {
  // Quiz Generation
  generateQuiz: async (courseId: string, data: {
    questionTypes: string[];
    questionCount: number;
  }) => {
    const res = await api.post(`/ai/generate-quiz/${courseId}`, data);
    return res.data;
  },
  
  // Get quiz questions
  getQuizQuestions: async (quizId: string) => {
    const res = await api.get(`/quizzes/${quizId}/questions`);
    return res.data;
  },
  
  // Student submissions
  getSubmissions: async (quizId: string) => {
    const res = await api.get(`/quizzes/${quizId}/submissions`);
    return res.data;
  },
  
  // AI Grading
  gradeSubmission: async (submissionId: string) => {
    const res = await api.post(`/ai/grade/${submissionId}`);
    return res.data;
  },
  
  // Get grading feedback
  getFeedback: async (submissionId: string) => {
    const res = await api.get(`/ai/grade/${submissionId}/feedback`);
    return res.data;
  },
  
  // Override grade
  overrideGrade: async (submissionId: string, data: {
    score: number;
    feedback?: string;
  }) => {
    const res = await api.post(`/ai/grade/${submissionId}/override`, data);
    return res.data;
  },
  
  // Save all grades
  saveGrades: async (submissionId: string, grades: Record<string, {
    points: number;
    feedback: string;
  }>) => {
    const res = await api.post(`/submissions/${submissionId}/grades`, grades);
    return res.data;
  },
  
  // Publish quiz
  publishQuiz: async (quizId: string) => {
    const res = await api.post(`/quizzes/${quizId}/publish`);
    return res.data;
  },
};

// Video Generation API Calls
export const videoGeneration = {
  generateVideo: async (moduleId: string) => {
    const res = await api.post(`/video-generation/generate/${moduleId}`);
    return res.data;
  },
  getByModuleId: async (moduleId: string) => {
    const res = await api.get(`/video-generation/module/${moduleId}`);
    return res.data;
  },
  getById: async (id: string) => {
    const res = await api.get(`/video-generation/${id}`);
    return res.data;
  },
  getByCourse: async (courseId: string) => {
    const res = await api.get(`/video-generation/course/${courseId}`);
    return res.data;
  },
  retry: async (id: string) => {
    const res = await api.post(`/video-generation/${id}/retry`);
    return res.data;
  },
  getStats: async () => {
    const res = await api.get('/video-generation/stats/all');
    return res.data;
  },
};

export default api;

// Quiz API Calls
export const quizzes = {
  create: async (data: any) => {
    const res = await api.post('/quizzes', data);
    return res.data;
  },
  getById: async (id: string) => {
    const res = await api.get(`/quizzes/${id}`);
    return res.data;
  },
  getByModule: async (moduleId: string) => {
    const res = await api.get(`/quizzes/module/${moduleId}`);
    return res.data;
  },
  getByCourse: async (courseId: string) => {
    const res = await api.get(`/quizzes/course/${courseId}/all`);
    return res.data;
  },
  update: async (id: string, data: any) => {
    const res = await api.patch(`/quizzes/${id}`, data);
    return res.data;
  },
  delete: async (id: string) => {
    const res = await api.delete(`/quizzes/${id}`);
    return res.data;
  },
  publish: async (id: string) => {
    const res = await api.post(`/quizzes/${id}/publish`);
    return res.data;
  },
  unpublish: async (id: string) => {
    const res = await api.post(`/quizzes/${id}/unpublish`);
    return res.data;
  },
  addQuestion: async (quizId: string, data: any) => {
    const res = await api.post(`/quizzes/${quizId}/questions`, data);
    return res.data;
  },
  updateQuestion: async (questionId: string, data: any) => {
    const res = await api.patch(`/quizzes/questions/${questionId}`, data);
    return res.data;
  },
  deleteQuestion: async (questionId: string) => {
    const res = await api.delete(`/quizzes/questions/${questionId}`);
    return res.data;
  },
};
