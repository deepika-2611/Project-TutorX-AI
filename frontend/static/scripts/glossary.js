// TutorX AI Bilingual Glossary Component

import { glossaryData } from '../../../data/curriculum/class-10-math.js';

let activeCategory = 'all';
let searchQuery = '';

export function initGlossary() {
  const searchInput = document.getElementById('glossary-search');
  const filterChips = document.querySelectorAll('.filter-chip');
  
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value.toLowerCase().trim();
      renderGlossary();
    });
  }
  
  filterChips.forEach(chip => {
    chip.addEventListener('click', () => {
      // Toggle active states
      document.querySelector('.filter-chip.active')?.classList.remove('active');
      chip.classList.add('active');
      
      activeCategory = chip.getAttribute('data-category');
      renderGlossary();
    });
  });
  
  // Initial render
  renderGlossary();
}

function renderGlossary() {
  const grid = document.getElementById('glossary-results-grid');
  if (!grid) return;
  
  grid.innerHTML = '';
  
  const filtered = glossaryData.filter(term => {
    // 1. Category Filter
    const matchesCategory = activeCategory === 'all' || term.category === activeCategory;
    
    // 2. Search Query Filter (Matches English, Tamil, phonetic or definition)
    const matchesSearch = !searchQuery || 
      term.english.toLowerCase().includes(searchQuery) ||
      term.tamil.toLowerCase().includes(searchQuery) ||
      term.phonetic.toLowerCase().includes(searchQuery) ||
      term.definition.toLowerCase().includes(searchQuery);
      
    return matchesCategory && matchesSearch;
  });
  
  if (filtered.length === 0) {
    grid.innerHTML = `
      <div class="empty-state" style="grid-column: span 3; padding: 40px; text-align: center; width: 100%;">
        <div class="empty-icon">🔍</div>
        <h2>No Terms Found</h2>
        <p>Try searching for another mathematical term in Tamil or English.</p>
      </div>
    `;
    return;
  }
  
  filtered.forEach(term => {
    const card = document.createElement('div');
    card.className = 'glossary-card';
    
    card.innerHTML = `
      <div class="glossary-card-header">
        <h4>${term.english}</h4>
        <span class="glossary-subject-badge">${term.category}</span>
      </div>
      <div class="glossary-translation">
        <span class="tamil-word">${term.tamil}</span>
        <span class="phonetic">Pronounced: ${term.phonetic}</span>
      </div>
      <p class="glossary-description">${term.definition}</p>
      <div class="glossary-example">
        <strong>Example (உதாரணம்):</strong> ${term.example}
      </div>
    `;
    
    grid.appendChild(card);
  });
}
