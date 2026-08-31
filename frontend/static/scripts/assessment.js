// TutorX AI Quiz & Assessment Component

import { curriculumData } from '../../../data/curriculum/class-10-math.js';

let activeQuiz = null;
let currentQuestionIndex = 0;
let score = 0;
let selectedOptionIndex = null;
let quizTimerInterval = null;
let quizTimeElapsed = 0;
let attemptAnswers = [];

export function initAssessment(state, updateStatsCallback) {
  // Populate practice quiz sidebar list
  renderQuizList(state, updateStatsCallback);
  window.addEventListener('student-progress-updated', () => {
    renderQuizList(state, updateStatsCallback);
  });
  
  // Quiz completion screen actions
  const retryBtn = document.getElementById('result-retry-btn');
  const closeBtn = document.getElementById('result-close-btn');
  
  if (retryBtn) {
    retryBtn.addEventListener('click', () => {
      if (activeQuiz) {
        startQuiz(activeQuiz, state, updateStatsCallback);
      }
    });
  }
  
  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      // Go back to dashboard view
      document.getElementById('nav-dashboard').click();
    });
  }
}

export function renderQuizList(state, updateStatsCallback) {
  const container = document.getElementById('assessment-quiz-tree');
  if (!container) return;
  
  container.innerHTML = '';
  
  // Mathematics-only quizzes
  const subjects = ['maths'];
  
  subjects.forEach(subjectKey => {
    const subj = curriculumData[subjectKey];
    
    // Header for subject
    const header = document.createElement('div');
    header.className = 'chapter-header';
    header.textContent = subj.title;
    container.appendChild(header);
    
    subj.chapters.forEach(ch => {
      const chapterCompleted = isChapterCompleted(ch, state);
      const chapterHeader = document.createElement('div');
      chapterHeader.className = `chapter-header ${chapterCompleted ? 'completed' : ''}`;
      chapterHeader.textContent = ch.title;
      container.appendChild(chapterHeader);

      ch.topics.forEach(topic => {
        // If topic has questions, create a quiz item
        if (topic.questions && topic.questions.length > 0) {
          const card = document.createElement('div');
          card.className = 'quiz-item-card';
          if (activeQuiz && activeQuiz.topicId === topic.id) {
            card.classList.add('active');
          }
          
          const maxScore = state.quizScores[topic.id] !== undefined ? `${state.quizScores[topic.id]}%` : 'Not Taken';
          
          card.innerHTML = `
            <div class="quiz-item-title">${topic.title} Test</div>
            <div class="quiz-item-meta">
              <span>${topic.questions.length} Questions</span>
              <span class="score">Best: ${maxScore}</span>
            </div>
          `;
          
          card.addEventListener('click', () => {
            // Remove active classes
            const activeCard = container.querySelector('.quiz-item-card.active');
            if (activeCard) activeCard.classList.remove('active');
            card.classList.add('active');
            
            startQuiz({
              topicId: topic.id,
              title: `${topic.title} Mastery Test`,
              topicTitle: topic.title,
              questions: topic.questions
            }, state, updateStatsCallback);
          });
          
          container.appendChild(card);
        }
      });
    });
  });
}

function isChapterCompleted(chapter, state) {
  const chapterNo = Number(chapter.topics[0]?.chapterNo ?? chapter.chapterNo ?? 0);
  if (state.serverDashboard?.completedChapterNos?.map(Number).includes(chapterNo)) return true;
  return chapter.topics.length > 0 && chapter.topics.every(topic => state.completedTopics.includes(topic.id));
}

function startQuiz(quiz, state, updateStatsCallback) {
  const sourceQuestions = quiz.sourceQuestions || quiz.questions;
  activeQuiz = {
    ...quiz,
    sourceQuestions,
    questions: buildAttemptQuestions(sourceQuestions)
  };
  currentQuestionIndex = 0;
  score = 0;
  selectedOptionIndex = null;
  quizTimeElapsed = 0;
  attemptAnswers = [];
  
  // Hide empty state & show quiz panel
  document.getElementById('quiz-empty-state').style.display = 'none';
  document.getElementById('quiz-results-panel').style.display = 'none';
  document.getElementById('quiz-active-panel').style.display = 'flex';
  
  // Update Quiz Title
  document.getElementById('quiz-title').textContent = quiz.title;
  
  // Start Timer
  if (quizTimerInterval) clearInterval(quizTimerInterval);
  updateTimerDisplay();
  quizTimerInterval = setInterval(() => {
    quizTimeElapsed++;
    updateTimerDisplay();
  }, 1000);
  
  renderQuestion(state, updateStatsCallback);
}

function shuffleItems(items) {
  return [...items]
    .map(item => ({ item, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ item }) => item);
}

function shuffleQuestionOptions(question) {
  const optionEntries = question.options.map((option, index) => ({
    option,
    originalIndex: index
  }));
  const shuffledOptions = shuffleItems(optionEntries);
  return {
    ...question,
    options: shuffledOptions.map(entry => entry.option),
    answer: shuffledOptions.findIndex(entry => entry.originalIndex === question.answer)
  };
}

function buildAttemptQuestions(questions) {
  const byDifficulty = { easy: [], medium: [], hard: [] };
  questions.forEach(question => {
    const level = byDifficulty[question.difficulty] ? question.difficulty : 'medium';
    byDifficulty[level].push(question);
  });

  const selected = [
    ...shuffleItems(byDifficulty.easy).slice(0, 2),
    ...shuffleItems(byDifficulty.medium).slice(0, 3),
    ...shuffleItems(byDifficulty.hard).slice(0, 2)
  ];

  const fallback = selected.length ? selected : questions;
  return fallback.map(shuffleQuestionOptions);
}

function updateTimerDisplay() {
  const el = document.getElementById('quiz-timer-label');
  if (!el) return;
  const mins = Math.floor(quizTimeElapsed / 60).toString().padStart(2, '0');
  const secs = (quizTimeElapsed % 60).toString().padStart(2, '0');
  el.textContent = `${mins}:${secs}`;
}

function renderQuestion(state, updateStatsCallback) {
  const question = activeQuiz.questions[currentQuestionIndex];
  selectedOptionIndex = null;
  
  // Update progress indicators
  const progressText = document.getElementById('quiz-progress-label');
  const progressBar = document.getElementById('quiz-progress-bar');
  if (progressText) {
    progressText.textContent = `Question ${currentQuestionIndex + 1} of ${activeQuiz.questions.length}`;
  }
  if (progressBar) {
    const pct = ((currentQuestionIndex + 1) / activeQuiz.questions.length) * 100;
    progressBar.style.width = `${pct}%`;
  }
  
  // Set question text
  const questionTextEl = document.getElementById('quiz-question-text');
  if (questionTextEl) questionTextEl.textContent = question.text;
  
  // Render options buttons
  const optionsContainer = document.getElementById('quiz-options-container');
  if (optionsContainer) {
    optionsContainer.innerHTML = '';
    
    question.options.forEach((opt, index) => {
      const button = document.createElement('button');
      button.className = 'option-btn';
      button.innerHTML = `
        <span>${opt}</span>
        <span class="option-indicator" id="ind-${index}"></span>
      `;
      
      button.addEventListener('click', () => {
        if (selectedOptionIndex !== null) return; // Answer locked
        
        selectedOptionIndex = index;
        button.classList.add('selected');
        
        evaluateAnswer(index, question, state, updateStatsCallback);
      });
      
      optionsContainer.appendChild(button);
    });
  }
  
  // Hide feedback panel
  document.getElementById('quiz-feedback-panel').style.display = 'none';
}

function evaluateAnswer(selectedIndex, question, state, updateStatsCallback) {
  const optionsContainer = document.getElementById('quiz-options-container');
  if (!optionsContainer) return;
  
  const buttons = optionsContainer.querySelectorAll('.option-btn');
  const feedbackPanel = document.getElementById('quiz-feedback-panel');
  const feedbackStatus = document.getElementById('quiz-feedback-status');
  const feedbackExplanation = document.getElementById('quiz-feedback-explanation');
  const nextBtn = document.getElementById('quiz-next-btn');
  
  // Highlight correct/incorrect classes
  buttons.forEach((btn, index) => {
    btn.disabled = true; // Lock interaction
    
    const indicator = btn.querySelector('.option-indicator');
    
    if (index === question.answer) {
      btn.classList.add('correct');
      if (indicator) indicator.textContent = '✅';
    } else if (index === selectedIndex) {
      btn.classList.add('incorrect');
      if (indicator) indicator.textContent = '❌';
    }
  });
  
  const isCorrect = selectedIndex === question.answer;
  attemptAnswers[currentQuestionIndex] = {
    id: question.id,
    text: question.text,
    options: question.options,
    selectedIndex,
    correctIndex: question.answer,
    selectedAnswer: question.options[selectedIndex],
    correctAnswer: question.options[question.answer],
    isCorrect,
    explanation: question.explanation,
    difficulty: question.difficulty || 'medium',
    skill: question.skill || 'concept',
    weakArea: question.weakArea || question.topicTitle || activeQuiz.topicTitle || 'Selected topic',
    recommendation: question.recommendation || 'Review this topic and practise similar questions.'
  };

  if (isCorrect) {
    score++;
    if (feedbackStatus) {
      feedbackStatus.innerHTML = '<span class="status-icon">✅</span> <span class="status-text">Correct Answer!</span>';
      feedbackStatus.className = 'feedback-status success-status';
    }
  } else {
    if (feedbackStatus) {
      feedbackStatus.innerHTML = '<span class="status-icon">❌</span> <span class="status-text">Incorrect</span>';
      feedbackStatus.className = 'feedback-status error-status';
    }
  }
  
  if (feedbackExplanation) {
    feedbackExplanation.textContent = question.explanation;
  }
  
  // Display feedback panel
  if (feedbackPanel) feedbackPanel.style.display = 'flex';
  
  // Set next button trigger
  if (nextBtn) {
    // Remove previous event listeners
    const newNextBtn = nextBtn.cloneNode(true);
    nextBtn.parentNode.replaceChild(newNextBtn, nextBtn);
    
    newNextBtn.addEventListener('click', () => {
      currentQuestionIndex++;
      if (currentQuestionIndex < activeQuiz.questions.length) {
        renderQuestion(state, updateStatsCallback);
      } else {
        finishQuiz(state, updateStatsCallback);
      }
    });
  }
}

function finishQuiz(state, updateStatsCallback) {
  if (quizTimerInterval) clearInterval(quizTimerInterval);
  
  const pctScore = Math.round((score / activeQuiz.questions.length) * 100);
  const resultAnalysis = buildResultAnalysis();
  
  // Hide active quiz panel, show results screen
  document.getElementById('quiz-active-panel').style.display = 'none';
  const resultsPanel = document.getElementById('quiz-results-panel');
  if (resultsPanel) resultsPanel.style.display = 'flex';
  
  // Update scores
  const scoreLabel = document.getElementById('result-score-label');
  const feedbackText = document.getElementById('result-feedback-text');
  
  if (scoreLabel) {
    scoreLabel.textContent = `Score: ${score}/${activeQuiz.questions.length} | Mastery: ${pctScore}%`;
  }
  
  let xpEarned = score * 15; // 15 XP per correct answer
  let bonusXp = 0;
  
  if (pctScore === 100) {
    bonusXp = 30; // Perfect score bonus
    if (feedbackText) feedbackText.textContent = "அருமை! (Perfect!) You got every question correct! You're a Samacheer Kalvi master in this unit.";
  } else if (pctScore >= 70) {
    bonusXp = 10;
    if (feedbackText) feedbackText.textContent = "நன்று! (Very Good!) You have a strong grasp of these concepts. Keep practicing to reach 100%!";
  } else {
    if (feedbackText) feedbackText.textContent = "Don't worry! Virtual learning is a process. Re-read the chapter with Tutor Tutor and try the quiz again.";
  }
  
  const totalXp = xpEarned + bonusXp;
  state.xp += totalXp;
  
  // Update best score in state
  const prevBest = state.quizScores[activeQuiz.topicId] || 0;
  if (pctScore > prevBest) {
    state.quizScores[activeQuiz.topicId] = pctScore;
  }
  
  saveAssessmentAttempt(state, {
    topicId: activeQuiz.topicId,
    score,
    totalQuestions: activeQuiz.questions.length,
    percentage: pctScore,
    durationSeconds: quizTimeElapsed,
    answers: attemptAnswers,
    skillPerformance: resultAnalysis.skillPerformance,
    weakAreas: resultAnalysis.weakAreas,
    recommendations: resultAnalysis.recommendations
  }).then(() => {
    updateStatsCallback();
  });
  
  // Show rewards display
  const rewardsContainer = document.querySelector('.rewards-earned');
  if (rewardsContainer) {
    rewardsContainer.innerHTML = `
      <div class="reward-pill">+${totalXp} XP</div>
      <div class="reward-pill">${pctScore}% Mastery</div>
    `;
  }

  renderResultBreakdown(resultAnalysis, pctScore);
  
  // Update stats
  updateStatsCallback();
  
  // Refresh sidebar list to show new score
  renderQuizList(state, updateStatsCallback);
}

function buildResultAnalysis() {
  const skillTotals = {};
  const weakAreaCounts = new Map();
  const recommendationCounts = new Map();

  attemptAnswers.forEach(answer => {
    const skill = answer.skill || 'concept';
    if (!skillTotals[skill]) {
      skillTotals[skill] = { correct: 0, total: 0, percentage: 0 };
    }
    skillTotals[skill].total++;
    if (answer.isCorrect) {
      skillTotals[skill].correct++;
    } else {
      weakAreaCounts.set(answer.weakArea, (weakAreaCounts.get(answer.weakArea) || 0) + 1);
      recommendationCounts.set(answer.recommendation, (recommendationCounts.get(answer.recommendation) || 0) + 1);
    }
  });

  Object.values(skillTotals).forEach(skill => {
    skill.percentage = Math.round((skill.correct / skill.total) * 100);
  });

  const weakAreas = [...weakAreaCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([area, misses]) => ({ area, misses }));

  const recommendations = [...recommendationCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([text]) => text);

  return {
    answers: attemptAnswers,
    skillPerformance: skillTotals,
    weakAreas,
    recommendations: recommendations.length
      ? recommendations
      : ['Attempt a harder mixed quiz next, then revise formulas from the same chapter.']
  };
}

function renderResultBreakdown(resultAnalysis, pctScore) {
  const breakdown = document.getElementById('result-breakdown');
  if (!breakdown) return;

  const skillRows = Object.entries(resultAnalysis.skillPerformance).map(([skill, stats]) => `
    <div class="result-metric">
      <strong>${formatLabel(skill)}</strong>
      <span>${stats.correct}/${stats.total} correct (${stats.percentage}%)</span>
    </div>
  `).join('');

  const weakAreaRows = resultAnalysis.weakAreas.length
    ? resultAnalysis.weakAreas.map(item => `<li>${item.area} (${item.misses} missed)</li>`).join('')
    : '<li>No weak areas detected in this attempt.</li>';

  const recommendationRows = resultAnalysis.recommendations
    .map(item => `<li>${item}</li>`)
    .join('');

  const reviewRows = resultAnalysis.answers.map((answer, index) => `
    <div class="answer-review ${answer.isCorrect ? 'correct' : 'incorrect'}">
      <strong>Q${index + 1}. ${answer.text}</strong>
      <span>Your answer: ${answer.selectedAnswer}</span>
      <span>Correct answer: ${answer.correctAnswer}</span>
      <p>${answer.explanation}</p>
    </div>
  `).join('');

  breakdown.innerHTML = `
    <div class="mastery-summary">
      <div class="result-metric">
        <strong>Mastery Level</strong>
        <span>${getMasteryLabel(pctScore)}</span>
      </div>
      ${skillRows}
    </div>
    <div class="result-section">
      <h4>Weak Areas</h4>
      <ul>${weakAreaRows}</ul>
    </div>
    <div class="result-section">
      <h4>Recommended Practice</h4>
      <ul>${recommendationRows}</ul>
    </div>
    <div class="result-section">
      <h4>Answer Review</h4>
      <div class="answer-review-list">${reviewRows}</div>
    </div>
  `;
}

function formatLabel(value) {
  return String(value).replace(/_/g, ' ').replace(/\b\w/g, letter => letter.toUpperCase());
}

function getMasteryLabel(score) {
  if (score >= 90) return 'Excellent mastery';
  if (score >= 70) return 'Good mastery';
  if (score >= 50) return 'Developing mastery';
  return 'Needs revision';
}

function authHeaders(extraHeaders = {}) {
  try {
    const session = JSON.parse(localStorage.getItem('Tutor_ai_student') || 'null');
    return {
      ...extraHeaders,
      ...(session?.token ? { Authorization: `Bearer ${session.token}` } : {})
    };
  } catch {
    return extraHeaders;
  }
}

function saveAssessmentAttempt(state, result) {
  if (!state.student?.id) return Promise.resolve();

  return fetch('/api/assessments', {
    method: 'POST',
    headers: authHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify({
      studentId: state.student.id,
      ...result
    })
  }).then(async response => {
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error || 'Could not save assessment');
    return data;
  }).catch(error => {
    console.warn('Could not save assessment attempt to database:', error.message);
  });
}
