// TutorX AI Tutor Component

import { curriculumData } from '../../../data/curriculum/class-10-math.js';

let activeSubject = 'maths';
let activeTopicId = null;
let mockDialogueIndex = 0;
let chatHistory = []; // Tracks messages in format: { role: 'user'|'model', text: string }
let backendHealth = { database: false, llm: false, provider: 'offline' };

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

export function initTutor(state, updateStatsCallback) {
  const subjectSelect = document.getElementById('tutor-subject-select');
  const topicTreeEl = document.getElementById('tutor-topic-tree');
  const chatInput = document.getElementById('chat-input-field');
  const chatSendBtn = document.getElementById('chat-send-btn');
  const resetBtn = document.getElementById('reset-conversation');
  
  // Set up subject change
  if (subjectSelect) {
    subjectSelect.addEventListener('change', (e) => {
      activeSubject = e.target.value;
      renderTopicTree(state, updateStatsCallback);
    });
    activeSubject = 'maths';
    subjectSelect.value = 'maths';
  }
  
  // Render topics
  renderTopicTree(state, updateStatsCallback);
  window.addEventListener('student-progress-updated', () => {
    renderTopicTree(state, updateStatsCallback);
  });
  
  // Set up send triggers
  if (chatSendBtn && chatInput) {
    chatSendBtn.addEventListener('click', () => handleStudentSend(state, updateStatsCallback));
    chatInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleStudentSend(state, updateStatsCallback);
      }
    });
  }
  
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      resetChat(state);
    });
  }
  
  // Configure status label initially
  updateApiStatusIndicator(state);
}

export async function updateApiStatusIndicator(state) {
  try {
    const response = await fetch('/api/health');
    if (response.ok) {
      backendHealth = await response.json();
    }
  } catch {
    backendHealth = { database: false, llm: false, provider: 'offline' };
  }
}

function renderTopicTree(state, updateStatsCallback) {
  const topicTreeEl = document.getElementById('tutor-topic-tree');
  if (!topicTreeEl) return;
  
  topicTreeEl.innerHTML = '';
  
  const currentCurriculum = curriculumData[activeSubject];
  if (!currentCurriculum) return;
  
  currentCurriculum.chapters.forEach(chapter => {
    // Add Chapter Header
    const chHeader = document.createElement('div');
    chHeader.className = `chapter-header ${isChapterCompleted(chapter, state) ? 'completed' : ''}`;
    chHeader.textContent = chapter.title;
    topicTreeEl.appendChild(chHeader);
    
    // Add Topics
    chapter.topics.forEach(topic => {
      const topicItem = document.createElement('div');
      topicItem.className = `topic-item ${topic.id === activeTopicId ? 'active' : ''}`;
      
      const isCompleted = state.completedTopics.includes(topic.id);
      topicItem.innerHTML = `
        <span>${topic.title}</span>
        <span class="topic-status">${isCompleted ? '✅' : '⚫'}</span>
      `;
      
      topicItem.addEventListener('click', () => {
        // Deactivate previous active item
        const activeItem = topicTreeEl.querySelector('.topic-item.active');
        if (activeItem) activeItem.classList.remove('active');
        
        topicItem.classList.add('active');
        selectTopic(topic.id, state, updateStatsCallback);
      });
      
      topicTreeEl.appendChild(topicItem);
    });
  });
  
  // Auto-select first topic if none is selected
  if (!activeTopicId && currentCurriculum.chapters.length > 0 && currentCurriculum.chapters[0].topics.length > 0) {
    const firstTopic = currentCurriculum.chapters[0].topics[0];
    selectTopic(firstTopic.id, state, updateStatsCallback);
    // Visual indicator update
    setTimeout(() => {
      const firstItem = topicTreeEl.querySelector('.topic-item');
      if (firstItem) firstItem.classList.add('active');
    }, 50);
  }
}

function selectTopic(topicId, state, updateStatsCallback) {
  activeTopicId = topicId;
  mockDialogueIndex = 0;
  chatHistory = [];
  
  // Get topic details
  let topic = null;
  const currentCurriculum = curriculumData[activeSubject];
  currentCurriculum.chapters.forEach(ch => {
    const found = ch.topics.find(t => t.id === topicId);
    if (found) topic = found;
  });
  
  if (!topic) return;
  
  // Update header text
  const indicator = document.getElementById('chat-topic-indicator');
  if (indicator) {
    indicator.textContent = `Topic: ${topic.title}`;
  }
  
  // Clear messages container and append initial topic dialogue
  const container = document.getElementById('chat-messages-container');
  if (container) {
    container.innerHTML = '';
  }
  
  // Set up topic's first dialogue text
  if (topic.dialogue && topic.dialogue.length > 0) {
    const firstMsg = topic.dialogue[0];
    appendChatMessage('tutor', firstMsg.content);
    chatHistory.push({ role: 'model', text: firstMsg.content });
    mockDialogueIndex = 1;
    
    // Render suggestion chips
    renderSuggestions(topic);
  }
}

function resetChat(state) {
  if (activeTopicId) {
    mockDialogueIndex = 0;
    chatHistory = [];
    
    let topic = null;
    curriculumData[activeSubject].chapters.forEach(ch => {
      const found = ch.topics.find(t => t.id === activeTopicId);
      if (found) topic = found;
    });
    
    if (topic && topic.dialogue && topic.dialogue.length > 0) {
      const container = document.getElementById('chat-messages-container');
      if (container) container.innerHTML = '';
      
      const firstMsg = topic.dialogue[0];
      appendChatMessage('tutor', firstMsg.content);
      chatHistory.push({ role: 'model', text: firstMsg.content });
      mockDialogueIndex = 1;
      renderSuggestions(topic);
    }
  }
}

function renderSuggestions(topic) {
  const container = document.getElementById('chat-suggestions-container');
  if (!container) return;
  
  container.innerHTML = '';
  
  // If we are in mock mode and have a next scripted user message
  if (topic.dialogue && mockDialogueIndex < topic.dialogue.length) {
    const nextMsg = topic.dialogue[mockDialogueIndex];
    if (nextMsg.sender === 'student') {
      const chip = document.createElement('button');
      chip.className = 'suggestion-chip';
      chip.textContent = nextMsg.content;
      chip.addEventListener('click', () => {
        const chatInput = document.getElementById('chat-input-field');
        if (chatInput) {
          chatInput.value = nextMsg.content;
          document.getElementById('chat-send-btn').click();
        }
      });
      container.appendChild(chip);
    }
  }
}

function handleStudentSend(state, updateStatsCallback) {
  const chatInput = document.getElementById('chat-input-field');
  if (!chatInput) return;
  
  const text = chatInput.value.trim();
  if (!text) return;
  
  chatInput.value = '';
  chatInput.style.height = 'auto'; // Reset height
  
  // Append student message
  appendChatMessage('student', text);
  chatHistory.push({ role: 'user', text: text });
  
  // Find current topic
  let topic = null;
  curriculumData[activeSubject].chapters.forEach(ch => {
    const found = ch.topics.find(t => t.id === activeTopicId);
    if (found) topic = found;
  });
  
  // Trigger Tutor response
  showTypingIndicator();
  
  setTimeout(async () => {
    removeTypingIndicator();
    
    if (backendHealth.llm) {
      await queryBackendTutor(text, state, topic, updateStatsCallback);
    } else {
      // Local Mock mode
      handleMockResponse(text, state, topic, updateStatsCallback);
    }
  }, 1000);
}

function isChapterCompleted(chapter, state) {
  const chapterNo = Number(chapter.topics[0]?.chapterNo ?? chapter.chapterNo ?? 0);
  if (state.serverDashboard?.completedChapterNos?.map(Number).includes(chapterNo)) return true;
  return chapter.topics.length > 0 && chapter.topics.every(topic => state.completedTopics.includes(topic.id));
}

async function queryBackendTutor(text, state, topic, updateStatsCallback) {
  try {
    const response = await fetch('/api/tutor', {
      method: 'POST',
      headers: authHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({
        question: text,
        topic: {
          id: topic?.id,
          chapterNo: topic?.chapterNo,
          chapter: getActiveChapterTitle(),
          name: topic?.title,
          formula: '',
        },
        passages: [],
        student: {
          id: state.student?.id,
          name: state.student?.name || state.student?.username || 'Student',
          grade: state.student?.grade || '10',
        },
      }),
    });

    const data = await response.json();
    if (!response.ok || !data.answer) {
      throw new Error(data.error || 'Backend tutor did not return an answer');
    }

    appendChatMessage('tutor', data.answer);
    chatHistory.push({ role: 'model', text: data.answer });

    state.xp += 10;
    updateStatsCallback();
  } catch (error) {
    console.error('Backend Tutor Error:', error);
    appendChatMessage('tutor', `Backend AI is not reachable right now, so I am using the local lesson flow. Error: ${error.message}`);
    handleMockResponse(text, state, topic, updateStatsCallback);
  }
}

function getActiveChapterTitle() {
  const currentCurriculum = curriculumData[activeSubject];
  for (const chapter of currentCurriculum.chapters) {
    if (chapter.topics.some(topic => topic.id === activeTopicId)) {
      return chapter.title;
    }
  }
  return '';
}

function handleMockResponse(text, state, topic, updateStatsCallback) {
  if (!topic || !topic.dialogue) {
    appendChatMessage('tutor', "I'm in offline mode and we haven't selected a topic yet. Please choose a topic from the sidebar.");
    return;
  }
  
  // Check if student input matches the next dialog in sequence or general questions
  if (mockDialogueIndex < topic.dialogue.length) {
    const nextModelMsg = topic.dialogue[mockDialogueIndex];
    
    // In our curriculum schema, dialogue alternating flows: model -> student -> model -> student
    // So if the dialogue expects a student input at index, let's verify if the input matches
    const expectedStudentMsg = topic.dialogue[mockDialogueIndex];
    
    if (expectedStudentMsg.sender === 'student') {
      // Check if student typed the suggestion or something close
      const isMatch = text.toLowerCase().includes(expectedStudentMsg.content.toLowerCase()) || 
                      expectedStudentMsg.content.toLowerCase().includes(text.toLowerCase()) ||
                      (expectedStudentMsg.content === 'Rest' && text.toLowerCase().includes('rest')) ||
                      (expectedStudentMsg.content === '20' && text.includes('20')) ||
                      (expectedStudentMsg.content === '5' && text.includes('5'));
      
      if (isMatch) {
        mockDialogueIndex++; // move past student message
        
        // Now trigger the tutor's response at the next index
        if (mockDialogueIndex < topic.dialogue.length) {
          const tutorResponse = topic.dialogue[mockDialogueIndex];
          appendChatMessage('tutor', tutorResponse.content);
          chatHistory.push({ role: 'model', text: tutorResponse.content });
          mockDialogueIndex++;
          
          // Check if this was the final response in the dialogue
          if (mockDialogueIndex >= topic.dialogue.length) {
            // Mark topic completed
            completeTopic(topic.id, state, updateStatsCallback);
          } else {
            renderSuggestions(topic);
          }
        }
      } else {
        // Fallback response for mismatch
        appendChatMessage('tutor', `I'm following the topic step-by-step. To answer my check, click the suggestion chip below or type **"${expectedStudentMsg.content}"**!`);
        renderSuggestions(topic);
      }
    }
  } else {
    // Already finished or no dialogue left. Offer general mock replies.
    appendChatMessage('tutor', "You have completed this lesson! You can practice your understanding by going to the **Mastery Tests** tab, or select another chapter in the sidebar.");
  }
}

function completeTopic(topicId, state, updateStatsCallback) {
  if (!state.completedTopics.includes(topicId)) {
    state.completedTopics.push(topicId);
    state.xp += 50; // Award 50 XP for lesson completion
    
    // Add success message
    appendChatMessage('tutor', `🎉 **அருமை! (Superb!)** You have successfully completed this learning module and earned **+50 XP**! The curriculum tree is updated.`);
    
    updateStatsCallback();
    saveProgressEvent(state, topicId, 50).then(() => {
      updateStatsCallback();
    });
    
    // Refresh topic tree status indicators
    const currentSubjectSelect = document.getElementById('tutor-subject-select');
    if (currentSubjectSelect) {
      renderTopicTree(state, updateStatsCallback);
    }
  }
}

function saveProgressEvent(state, topicId, credits) {
  if (!state.student?.id) return Promise.resolve();

  return fetch('/api/progress', {
    method: 'POST',
    headers: authHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify({
      studentId: state.student.id,
      topicId,
      eventType: 'topic_completed',
      credits
    })
  }).then(async response => {
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error || 'Could not save progress');
    return data;
  }).catch((error) => {
    console.warn('Could not save progress to database:', error.message);
  });
}

function appendChatMessage(sender, text) {
  const container = document.getElementById('chat-messages-container');
  if (!container) return;
  
  const msgEl = document.createElement('div');
  msgEl.className = `message ${sender === 'tutor' ? 'tutor-msg' : 'student-msg'}`;
  
  const contentEl = document.createElement('div');
  contentEl.className = 'message-content';
  contentEl.innerHTML = parseMarkdown(text);
  msgEl.appendChild(contentEl);
  
  const timeEl = document.createElement('span');
  timeEl.className = 'message-time';
  const now = new Date();
  timeEl.textContent = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  msgEl.appendChild(timeEl);
  
  container.appendChild(msgEl);
  
  // Auto scroll
  container.scrollTop = container.scrollHeight;
}

function showTypingIndicator() {
  const container = document.getElementById('chat-messages-container');
  if (!container) return;
  
  const indicator = document.createElement('div');
  indicator.className = 'message tutor-msg typing-indicator-msg';
  indicator.id = 'typing-indicator';
  indicator.innerHTML = `
    <div class="message-content" style="padding: 10px 16px; min-width: 60px;">
      <span class="typing-dot">.</span><span class="typing-dot">.</span><span class="typing-dot">.</span>
    </div>
  `;
  container.appendChild(indicator);
  container.scrollTop = container.scrollHeight;
  
  // Animation inline styles hack for simplicity
  const style = document.createElement('style');
  style.id = 'typing-styles';
  style.innerHTML = `
    .typing-dot { animation: typingBlink 1.4s infinite both; font-weight: 800; font-size: 16px; margin: 0 1px; }
    .typing-dot:nth-child(2) { animation-delay: .2s; }
    .typing-dot:nth-child(3) { animation-delay: .4s; }
    @keyframes typingBlink { 0% { opacity: .2; } 20% { opacity: 1; } 100% { opacity: .2; } }
  `;
  document.head.appendChild(style);
}

function removeTypingIndicator() {
  const indicator = document.getElementById('typing-indicator');
  if (indicator) indicator.remove();
  const styles = document.getElementById('typing-styles');
  if (styles) styles.remove();
}

function parseMarkdown(text) {
  if (!text) return '';
  
  let html = text;
  
  // Escape HTML entities to prevent rendering issues
  html = html
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
  
  // Re-allow the HTML we want (like math-block, tags)
  html = html.replace(/&lt;span class="math-block"&gt;/g, '<span class="math-block">')
             .replace(/&lt;\/span&gt;/g, '</span>')
             .replace(/&lt;bilingual-tag&gt;/g, '<span class="bilingual-tag">')
             .replace(/&lt;span class="bilingual-tag"&gt;/g, '<span class="bilingual-tag">')
             .replace(/&lt;strong&gt;/g, '<strong>')
             .replace(/&lt;\/strong&gt;/g, '</strong>');

  // Math equations block $$equation$$ or \[ equation \]
  html = html.replace(/\$\$([\s\S]*?)\$\$/g, '<span class="math-block">$1</span>');
  html = html.replace(/\\\[([\s\S]*?)\\\]/g, '<span class="math-block">$1</span>');
  
  // Math equations inline $eq$ or \( eq \)
  html = html.replace(/\$([^\$]+)\$/g, '<code class="math-inline">$1</code>');
  html = html.replace(/\\\(([^\)]+)\\\)/g, '<code class="math-inline">$1</code>');

  // Multi-line code block ```lang\ncode```
  html = html.replace(/```(\w*)\n([\s\S]*?)```/g, '<pre><code>$2</code></pre>');
  
  // Inline code `code`
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>');
  
  // Headers: ###, ##, #
  html = html.replace(/^###\s+(.*)$/gm, '<h5>$1</h5>');
  html = html.replace(/^##\s+(.*)$/gm, '<h5>$1</h5>');
  html = html.replace(/^#\s+(.*)$/gm, '<h5>$1</h5>');
  
  // Bold **bold**
  html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  
  // Italic *italic*
  html = html.replace(/\*([^*]+)\*/g, '<em>$1</em>');
  
  // Custom bilingual format helper from live AI: bilingual-tag:வார்த்தை
  html = html.replace(/bilingual-tag:([^\s,.:;!?"')\]]+)/gi, '<span class="bilingual-tag">$1</span>');

  // Lists: - item
  html = html.replace(/^\s*-\s+(.*)$/gm, '<li>$1</li>');
  // Wrap li groups in ul (simplistic regex, covers single list blocks)
  html = html.replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>');

  // Line breaks to <br> (only outside pre/code)
  // Split by pre blocks first to avoid tampering with code spacing
  const parts = html.split(/(<pre>[\s\S]*?<\/pre>)/);
  for (let i = 0; i < parts.length; i++) {
    if (!parts[i].startsWith('<pre>')) {
      parts[i] = parts[i].replace(/\n/g, '<br>');
    }
  }
  html = parts.join('');

  return html;
}
