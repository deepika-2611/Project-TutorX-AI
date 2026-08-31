// TutorX AI Dashboard Component

import { curriculumData } from '../../../data/curriculum/class-10-math.js';

export function initDashboard(state, switchViewCallback) {
  // Bind subject cards to redirect to tutor view
  const mathCard = document.getElementById('subject-maths');
  
  if (mathCard) {
    mathCard.addEventListener('click', () => {
      // Switch to tutor view and set subject to maths
      const subjectSelect = document.getElementById('tutor-subject-select');
      if (subjectSelect) {
        subjectSelect.value = 'maths';
        subjectSelect.dispatchEvent(new Event('change'));
      }
      switchViewCallback('tutor');
    });
  }
  
  // Render stats
  updateDashboardStats(state);
}

export function updateDashboardStats(state) {
  // Update header pills
  const streakEl = document.getElementById('stat-streak');
  const xpEl = document.getElementById('stat-xp');
  if (streakEl) streakEl.textContent = `${state.streak} Day${state.streak !== 1 ? 's' : ''}`;
  if (xpEl) xpEl.textContent = `${state.xp} XP`;

  const studentNameEl = document.getElementById('dashboard-student-name');
  const tutorSessionsEl = document.getElementById('stats-tutor-sessions');
  const savedRecordsEl = document.getElementById('stats-saved-records');
  if (studentNameEl) studentNameEl.textContent = state.student?.name || state.student?.username || 'Student';
  if (tutorSessionsEl) tutorSessionsEl.textContent = String(state.serverDashboard?.tutorSessions ?? 0);
  if (savedRecordsEl) {
    const records = Number(state.serverDashboard?.completedTopics ?? 0) + Number(state.serverDashboard?.notes ?? 0);
    savedRecordsEl.textContent = String(records);
  }
  
  // Calculate total topics in curriculum
  const mathTopics = curriculumData.maths.chapters.flatMap(ch => ch.topics);
  const totalTopicsCount = Number(state.serverDashboard?.totalTopics ?? mathTopics.length);
  const completedTopicsCount = Number(
    state.serverDashboard?.completedTopics ??
    mathTopics.filter(topic => state.completedTopics.includes(topic.id)).length
  );
  const totalChapters = Number(state.serverDashboard?.totalChapters ?? curriculumData.maths.chapters.length);
  const completedChapters = Number(state.serverDashboard?.completedChapters ?? 0);
  const remainingChapters = Number(state.serverDashboard?.remainingChapters ?? Math.max(totalChapters - completedChapters, 0));
  
  // Update details card
  const topicsCountEl = document.getElementById('stats-topics-count');
  if (topicsCountEl) {
    topicsCountEl.textContent = `${completedTopicsCount} / ${totalTopicsCount}`;
  }
  
  // Calculate overall mastery percentage
  const percentage = Number(
    state.serverDashboard?.completionPercentage ??
    (totalTopicsCount > 0 ? Math.round((completedTopicsCount / totalTopicsCount) * 100) : 0)
  );
  
  // Update circular chart
  const progressCircle = document.getElementById('overall-progress-circle');
  const progressText = document.getElementById('overall-progress-text');
  
  if (progressCircle) {
    // Circle circumference is 2 * pi * r = 2 * 3.1415 * 45.75 = 287.4
    const circumference = 287.4;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;
    progressCircle.style.strokeDasharray = `${circumference}`;
    progressCircle.style.strokeDashoffset = `${strokeDashoffset}`;
  }
  
  if (progressText) {
    progressText.textContent = `${percentage}%`;
  }
  
  updateMathProgress(state, percentage);
  updateMathMetrics(state, {
    completedChapters,
    remainingChapters,
    completedTopicsCount,
    totalTopicsCount
  });
  
  // Update achievements/medals
  updateAchievements(state, completedTopicsCount);
}

function updateMathProgress(state, mathPercentage) {
  const mathCard = document.getElementById('subject-maths');
  if (mathCard) {
    const fill = mathCard.querySelector('.progress-bar-fill');
    const txt = mathCard.querySelector('.subject-footer span:first-child');
    const xp = mathCard.querySelector('.xp-badge');
    if (fill) fill.style.width = `${mathPercentage}%`;
    if (txt) txt.textContent = `${mathPercentage}% Mastered`;
    if (xp) xp.textContent = `${Number(state.serverDashboard?.credits ?? state.xp ?? 0)} XP`;
  }
}

function updateMathMetrics(state, counts) {
  const completedChaptersEl = document.getElementById('stats-chapters-completed');
  const remainingChaptersEl = document.getElementById('stats-chapters-remaining');
  const accuracyEl = document.getElementById('stats-accuracy-rate');
  const quizCountEl = document.getElementById('stats-quiz-count');
  const topicChartEl = document.getElementById('topic-progress-chart');
  const recentActivityEl = document.getElementById('recent-activity-list');

  if (completedChaptersEl) completedChaptersEl.textContent = `${counts.completedChapters} / ${counts.completedChapters + counts.remainingChapters}`;
  if (remainingChaptersEl) remainingChaptersEl.textContent = String(counts.remainingChapters);

  const assessments = state.serverDashboard?.assessments;
  if (accuracyEl) accuracyEl.textContent = `${Number(assessments?.average ?? 0)}%`;
  if (quizCountEl) quizCountEl.textContent = `${Number(assessments?.passed ?? 0)} Passed`;

  if (topicChartEl) {
    const progressRows = state.serverDashboard?.topicProgress ?? curriculumData.maths.chapters.map(chapter => {
      const completedTopics = chapter.topics.filter(topic => state.completedTopics.includes(topic.id)).length;
      const totalTopics = chapter.topics.length;
      return {
        title: chapter.title,
        completedTopics,
        totalTopics,
        percentage: totalTopics ? Math.round((completedTopics / totalTopics) * 100) : 0
      };
    });

    topicChartEl.innerHTML = progressRows.map(row => `
      <div class="topic-progress-row ${Number(row.percentage) >= 100 ? 'completed' : ''}">
        <div class="topic-progress-label">
          <span>${row.title.replace(/^Chapter\s+\d+:\s*/, '')}</span>
          <span>${row.completedTopics}/${row.totalTopics}${Number(row.percentage) >= 100 ? ' Completed' : ''}</span>
        </div>
        <div class="progress-bar-container">
          <div class="progress-bar-fill" style="width: ${row.percentage}%;"></div>
        </div>
      </div>
    `).join('');
  }

  if (recentActivityEl) {
    const activities = state.serverDashboard?.recentActivity ?? [];
    if (!activities.length) {
      recentActivityEl.innerHTML = '<p class="description-text">No Mathematics activity saved yet. Finish a lesson or quiz to start your timeline.</p>';
    } else {
      recentActivityEl.innerHTML = activities.map(activity => {
        const topic = curriculumData.maths.chapters
          .flatMap(ch => ch.topics)
          .find(item => item.id === activity.topicId);
        const label = activity.activityType === 'assessment_completed'
          ? `Assessment completed: ${topic?.title ?? 'Mathematics'} (${activity.percentage}%)`
          : activity.activityType === 'chapter_completed'
            ? `Chapter ${activity.chapterNo} completed`
            : `Lesson completed: ${topic?.title ?? 'Mathematics topic'}`;
        return `<div class="activity-item"><span>${label}</span><time>${new Date(activity.createdAt).toLocaleDateString()}</time></div>`;
      }).join('');
    }
  }
}

function updateAchievements(state, completedCount) {
  // Update badge locks
  const badgesGrid = document.querySelector('.badges-grid');
  if (!badgesGrid) return;
  
  const badges = badgesGrid.querySelectorAll('.badge-item');
  
  // 5-Day fire badge (based on streak >= 5)
  if (badges[0]) {
    if (state.streak >= 5) {
      badges[0].classList.add('active');
      badges[0].classList.remove('locked');
    } else {
      badges[0].classList.remove('active');
      badges[0].classList.add('locked');
    }
  }
  
  // Chapter Starter (completed at least one mathematics topic)
  if (badges[1]) {
    if (completedCount >= 1) {
      badges[1].classList.add('active');
      badges[1].classList.remove('locked');
    } else {
      badges[1].classList.remove('active');
      badges[1].classList.add('locked');
    }
  }
  
  // Quiz Climber
  if (badges[2]) {
    if (Number(state.serverDashboard?.assessments?.passed ?? 0) >= 3) {
      badges[2].classList.add('active');
      badges[2].classList.remove('locked');
    } else {
      badges[2].classList.remove('active');
      badges[2].classList.add('locked');
    }
  }
  
  // Syllabus Master (completed >= 3 topics)
  if (badges[3]) {
    if (completedCount >= 3) {
      badges[3].classList.add('active');
      badges[3].classList.remove('locked');
    } else {
      badges[3].classList.remove('active');
      badges[3].classList.add('locked');
    }
  }
}
