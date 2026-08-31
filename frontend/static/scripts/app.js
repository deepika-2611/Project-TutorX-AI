// TutorX AI Core Application Controller

import { initDashboard, updateDashboardStats } from './dashboard.js';
import { initTutor } from './tutor.js';
import { initAssessment } from './assessment.js';
import { initGlossary } from './glossary.js';

// Global application state
const DEFAULT_STATE = {
  xp: 0,
  streak: 1,
  completedTopics: [],
  quizScores: {},
  activeView: 'dashboard',
  medium: 'english',
  hasSimulated: false,
  theme: 'dark',
  student: null,
  serverDashboard: null
};

let state = { ...DEFAULT_STATE };
const AUTH_STORAGE_KEY = 'Tutor_ai_student';
let authSession = null;

function getStateStorageKey(student = state.student) {
  return student?.id ? `Tutor_ai_state_${student.id}` : null;
}

// Load persisted state
function loadState(student) {
  const storageKey = getStateStorageKey(student);
  const saved = storageKey ? localStorage.getItem(storageKey) : null;
  state = { ...DEFAULT_STATE, student };
  if (saved) {
    try {
      state = { ...DEFAULT_STATE, ...JSON.parse(saved), student };
      if (!Array.isArray(state.completedTopics)) state.completedTopics = [];
    } catch (e) {
      console.error("Failed to parse saved state", e);
    }
  }
}

// Persist state
function saveState() {
  const storageKey = getStateStorageKey();
  if (!storageKey) return;
  localStorage.setItem(storageKey, JSON.stringify(state));
}

// Global update callback to keep everything in sync
function updateStatsAndDashboard() {
  saveState();
  updateDashboardStats(state);
  refreshStudentDashboard();
  
  // Also update UI top header
  const xpEl = document.getElementById('stat-xp');
  const streakEl = document.getElementById('stat-streak');
  if (xpEl) xpEl.textContent = `${state.xp} XP`;
  if (streakEl) streakEl.textContent = `${state.streak} Days`;
}

function getStoredAuthSession() {
  const saved = localStorage.getItem(AUTH_STORAGE_KEY);
  if (!saved) return null;
  try {
    const parsed = JSON.parse(saved);
    if (parsed.student && parsed.token) return parsed;
    localStorage.removeItem(AUTH_STORAGE_KEY);
    return null;
  } catch {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    return null;
  }
}

function authHeaders(extraHeaders = {}) {
  return {
    ...extraHeaders,
    ...(authSession?.token ? { Authorization: `Bearer ${authSession.token}` } : {})
  };
}

function clearAuthSession() {
  authSession = null;
  localStorage.removeItem(AUTH_STORAGE_KEY);
}

function getInputValue(id) {
  return document.getElementById(id)?.value.trim() || '';
}

function validateRegistrationPayload(payload) {
  if (payload.password.length < 8) return 'Password must be at least 8 characters long.';
  if (!/[A-Z]/.test(payload.password)) return 'Password must include an uppercase letter.';
  if (!/[a-z]/.test(payload.password)) return 'Password must include a lowercase letter.';
  if (!/\d/.test(payload.password)) return 'Password must include a number.';
  return '';
}

function setAuthMessage(message, type = '') {
  const messageEl = document.getElementById('auth-message');
  if (!messageEl) return;
  messageEl.textContent = message;
  messageEl.className = `auth-message ${type}`.trim();
}

function showAuthForm(mode) {
  const isLogin = mode === 'login';
  document.getElementById('landing-screen')?.setAttribute('hidden', 'hidden');
  document.getElementById('auth-screen')?.removeAttribute('hidden');
  document.getElementById('login-form')?.classList.toggle('active', isLogin);
  document.getElementById('register-form')?.classList.toggle('active', !isLogin);
  document.getElementById('show-login')?.classList.toggle('active', isLogin);
  document.getElementById('show-register')?.classList.toggle('active', !isLogin);
  setAuthMessage('');
}

function initLandingModule() {
  const showRegister = () => showAuthForm('register');
  const showLogin = () => showAuthForm('login');

  document.getElementById('landing-register-btn')?.addEventListener('click', showRegister);
  document.getElementById('landing-primary-cta')?.addEventListener('click', showRegister);
  document.getElementById('landing-login-btn')?.addEventListener('click', showLogin);
  document.getElementById('landing-secondary-cta')?.addEventListener('click', showLogin);
}

async function submitAuth(path, payload) {
  const response = await fetch(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok || !data.student || !data.token) {
    throw new Error(data.error || 'Authentication failed');
  }
  authSession = { student: data.student, token: data.token };
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authSession));
  return data.student;
}

async function verifyStoredAuthSession() {
  const stored = getStoredAuthSession();
  if (!stored) return null;
  authSession = stored;
  try {
    const response = await fetch('/api/auth/session', {
      headers: authHeaders()
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok || !data.student) throw new Error(data.error || 'Session validation failed');
    authSession = { ...stored, student: data.student };
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authSession));
    return data.student;
  } catch (error) {
    console.warn(error.message);
    clearAuthSession();
    return null;
  }
}

function initAuthModule() {
  document.getElementById('show-login')?.addEventListener('click', () => showAuthForm('login'));
  document.getElementById('show-register')?.addEventListener('click', () => showAuthForm('register'));

  document.getElementById('login-form')?.addEventListener('submit', async (event) => {
    event.preventDefault();
    setAuthMessage('Checking credentials...', '');
    try {
      const student = await submitAuth('/api/auth/login', {
        username: getInputValue('login-username'),
        password: document.getElementById('login-password')?.value
      });
      setAuthMessage(`Welcome back, ${student.name}!`, 'success');
      location.reload();
    } catch (error) {
      setAuthMessage(error.message, 'error');
    }
  });

  document.getElementById('register-form')?.addEventListener('submit', async (event) => {
    event.preventDefault();
    setAuthMessage('Creating account...', '');
    try {
      const payload = {
        name: getInputValue('register-name'),
        email: getInputValue('register-email'),
        dob: getInputValue('register-dob'),
        gender: getInputValue('register-gender'),
        password: document.getElementById('register-password')?.value || '',
        grade: '10'
      };
      const validationError = validateRegistrationPayload(payload);
      if (validationError) throw new Error(validationError);
      const student = await submitAuth('/api/auth/register', payload);
      setAuthMessage(`Account created for ${student.name}.`, 'success');
      location.reload();
    } catch (error) {
      setAuthMessage(error.message, 'error');
    }
  });
}

function updateStudentProfile() {
  const name = state.student?.name || state.student?.username || 'Student';
  const initial = name.trim().charAt(0).toUpperCase() || 'S';
  const level = Math.max(1, Math.floor(state.xp / 250) + 1);

  const avatarEl = document.getElementById('student-avatar');
  const nameEl = document.getElementById('student-name-label');
  const levelEl = document.getElementById('student-level-label');
  const dashboardNameEl = document.getElementById('dashboard-student-name');

  if (avatarEl) avatarEl.textContent = initial;
  if (nameEl) nameEl.textContent = name;
  if (levelEl) levelEl.textContent = `Level ${level} Scholar`;
  if (dashboardNameEl) dashboardNameEl.textContent = name;
}

let dashboardRefreshInFlight = false;
async function refreshStudentDashboard() {
  if (!state.student?.id || dashboardRefreshInFlight) return;
  dashboardRefreshInFlight = true;
  try {
    const response = await fetch(`/api/student/dashboard?studentId=${encodeURIComponent(state.student.id)}`, {
      headers: authHeaders()
    });
    const data = await response.json();
    if (response.status === 401) {
      clearAuthSession();
      location.reload();
      return;
    }
    if (!response.ok || !data.dashboard) throw new Error(data.error || 'Dashboard refresh failed');
    state.serverDashboard = data.dashboard;

    if (Array.isArray(data.dashboard.completedTopicIds)) {
      state.completedTopics = data.dashboard.completedTopicIds;
      saveState();
      updateDashboardStats(state);
      window.dispatchEvent(new CustomEvent('student-progress-updated'));
    }

    const tutorSessionsEl = document.getElementById('stats-tutor-sessions');
    const savedRecordsEl = document.getElementById('stats-saved-records');
    if (tutorSessionsEl) tutorSessionsEl.textContent = String(data.dashboard.tutorSessions ?? 0);
    if (savedRecordsEl) {
      const records = Number(data.dashboard.completedTopics ?? 0) + Number(data.dashboard.notes ?? 0);
      savedRecordsEl.textContent = String(records);
    }
    updateStudentProfile();
  } catch (error) {
    console.warn(error.message);
  } finally {
    dashboardRefreshInFlight = false;
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  initLandingModule();
  initAuthModule();
  const student = await verifyStoredAuthSession();

  if (!student) {
    document.getElementById('landing-screen')?.removeAttribute('hidden');
    document.getElementById('auth-screen')?.setAttribute('hidden', 'hidden');
    const appContainer = document.getElementById('app-container');
    if (appContainer) appContainer.style.display = 'none';
    return;
  }

  document.getElementById('landing-screen')?.setAttribute('hidden', 'hidden');
  document.getElementById('auth-screen')?.setAttribute('hidden', 'hidden');
  const appContainer = document.getElementById('app-container');
  if (appContainer) appContainer.style.display = 'flex';

  // 1. Load state
  loadState(student);
  
  // Apply theme on load
  if (state.theme === 'light') {
    document.body.classList.remove('dark-theme');
    document.body.classList.add('light-theme');
    const toggleBtn = document.getElementById('theme-toggle');
    if (toggleBtn) toggleBtn.querySelector('span').textContent = 'Toggle Dark';
  } else {
    document.body.classList.remove('light-theme');
    document.body.classList.add('dark-theme');
  }
  
  // 2. Initialize Navigation and View Switching
  const navItems = document.querySelectorAll('.nav-item');
  const viewPanels = document.querySelectorAll('.view-panel');
  const titleEl = document.getElementById('current-view-title');
  const subtitleEl = document.getElementById('current-view-subtitle');
  
  const viewMeta = {
    dashboard: {
      title: "Scholar Dashboard",
      subtitle: "Track your Samacheer Kalvi syllabus milestones and goals."
    },
    tutor: {
      title: "Interactive AI Tutor",
      subtitle: "Get step-by-step Class 10 Mathematics guidance from the connected textbook RAG."
    },
    assessment: {
      title: "Mastery Evaluation",
      subtitle: "State Board style Mathematics practice assessments with instant corrections."
    },
    glossary: {
      title: "Math Vocabulary",
      subtitle: "Search and study mathematical terms in English and Tamil."
    }
  };
  
  function switchView(viewId) {
    if (viewId === 'lab') viewId = 'dashboard';
    if (!viewMeta[viewId]) viewId = 'dashboard';
    state.activeView = viewId;
    saveState();
    
    // Toggle active class on panels
    viewPanels.forEach(panel => {
      if (panel.id === `view-${viewId}`) {
        panel.classList.add('active');
      } else {
        panel.classList.remove('active');
      }
    });
    
    // Toggle active state in sidebar navigation
    navItems.forEach(item => {
      if (item.getAttribute('data-view') === viewId) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });
    
    // Update Header title
    if (titleEl && viewMeta[viewId]) {
      titleEl.textContent = viewMeta[viewId].title;
    }
    if (subtitleEl && viewMeta[viewId]) {
      subtitleEl.textContent = viewMeta[viewId].subtitle;
    }
    
  }
  
  navItems.forEach(item => {
    item.addEventListener('click', () => {
      const targetView = item.getAttribute('data-view');
      switchView(targetView);
    });
  });
  
  // 3. Initialize Modules
  updateStudentProfile();
  initDashboard(state, switchView);
  initTutor(state, updateStatsAndDashboard);
  initAssessment(state, updateStatsAndDashboard);
  initGlossary();

  document.getElementById('logout-btn')?.addEventListener('click', () => {
    fetch('/api/auth/logout', {
      method: 'POST',
      headers: authHeaders()
    }).catch((error) => console.warn(error.message));
    clearAuthSession();
    location.reload();
  });
  
  // Sync view from state on start
  switchView(state.activeView);
  
  // 4. Set up Theme Toggle
  const themeToggle = document.getElementById('theme-toggle');
  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const isLight = document.body.classList.contains('light-theme');
      if (isLight) {
        document.body.classList.remove('light-theme');
        document.body.classList.add('dark-theme');
        state.theme = 'dark';
        themeToggle.querySelector('span').textContent = 'Toggle Light';
      } else {
        document.body.classList.remove('dark-theme');
        document.body.classList.add('light-theme');
        state.theme = 'light';
        themeToggle.querySelector('span').textContent = 'Toggle Dark';
      }
      saveState();
    });
  }
  
  // 5. Medium Selector Change
  const mediumSelect = document.getElementById('curriculum-medium-select');
  if (mediumSelect) {
    mediumSelect.value = state.medium;
    mediumSelect.addEventListener('change', (e) => {
      state.medium = e.target.value;
      saveState();
    });
  }
  
  // Run initial dashboard display update
  updateStatsAndDashboard();
});
