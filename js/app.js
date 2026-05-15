const $ = (selector, scope = document) => scope.querySelector(selector);
const $$ = (selector, scope = document) => Array.from(scope.querySelectorAll(selector));

const state = {
  page: 'dashboard',
  stage: 'input',
  selectedIdea: 0,
  selectedDate: 23,
  selectedTime: '7:00 PM',
  selectedPlatform: 'Instagram',
  posted: false,
  feedbackSubmitted: false,
  hashtags: ['#MorningBoost', '#CoffeeLover', '#Espresso', '#GoodVibesOnly', '#CoffeeTime', '#CafeVibes'],
  ideas: [
    {
      title: 'Morning Coffee Vibes ☕',
      desc: 'A bright and cozy post featuring your espresso blend to start the day right.',
      tags: ['#MorningBoost', '#CoffeeLover', '#Espresso'],
      image: 'assets/coffee.jpg',
      type: 'Image Post'
    },
    {
      title: 'Iced Coffee = Good Mood 🧊',
      desc: 'Show off your refreshing iced coffee, perfect for a hot day.',
      tags: ['#IcedCoffee', '#ChillVibes', '#CoffeeTime'],
      image: 'assets/iced-coffee.jpg',
      type: 'Image Post'
    },
    {
      title: 'From Bean to Cup 🌱',
      desc: 'A carousel post that takes your audience through the brewing process.',
      tags: ['#CoffeeProcess', '#BehindTheBeans', '#CraftedWithCare'],
      image: 'assets/beans.jpg',
      type: 'Carousel'
    },
    {
      title: 'Meet Our Cozy Café 🏡',
      desc: 'Give your audience a peek into the warm and cozy space they will love.',
      tags: ['#CafeVibes', '#CozySpot', '#YourHappyPlace'],
      image: 'assets/cafe.jpg',
      type: 'Story'
    }
  ],
  captions: [
`Good coffee. Good mood. Good day. ☕✨

Start your morning with our signature espresso blend, crafted to give you the perfect boost!

Smooth, rich, and made with love. 💛

What’s your go-to coffee order?

#MorningBoost #CoffeeLover #Espresso #GoodVibesOnly #CafeVibes #CoffeeTime`,
`Your morning deserves a better start. ☕

Our espresso blend brings together bold flavor, smooth texture, and a cozy café feeling in every cup.

Drop by today and make your coffee break count.

#MorningBoost #CoffeeLover #DailyBrew #CafeVibes #SupportLocal`,
`Coffee first, everything else follows. ☕✨

Start the day with a cup that feels warm, smooth, and made just for you.

Visit us today and enjoy your favorite blend.

#CoffeeTime #Espresso #GoodVibesOnly #CafeVibes #CoffeeAddict`
  ],
  captionIndex: 0
};

const stageByPage = {
  dashboard: 'input',
  ideas: 'ideas',
  caption: 'review',
  schedule: 'schedule',
  plan: 'output',
  feedback: 'feedback',
  analytics: 'feedback',
  profile: 'input'
};
const pageTitles = {
  dashboard: ['Dashboard', 'Human–AI Content Planning'],
  ideas: ['AI Generated Ideas', 'AI Processing'],
  caption: ['Caption Studio', 'Human Review'],
  schedule: ['Plan Schedule', 'Output Action'],
  plan: ['Final Content Plan', 'Human Approval'],
  feedback: ['Feedback Loop', 'AI Learning'],
  analytics: ['Analytics', 'Performance Monitoring'],
  profile: ['Profile & Settings', 'User Preferences']
};
const stageIndex = ['input', 'ideas', 'review', 'schedule', 'output', 'feedback'];
const stageLabels = {
  input: 'Input setup',
  ideas: 'AI processing',
  review: 'Human review',
  schedule: 'Scheduling',
  output: 'Output action',
  feedback: 'Feedback loop'
};

function toast(message) {
  const t = $('#toast');
  t.textContent = message;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2200);
}

function showAuth(id) {
  $('#welcomeScreen').classList.toggle('hidden', id !== 'welcomeScreen');
  $('#loginScreen').classList.toggle('hidden', id !== 'loginScreen');
}

function login() {
  $('#welcomeScreen').classList.add('hidden');
  $('#loginScreen').classList.add('hidden');
  $('#appShell').classList.remove('hidden');
  setPage('dashboard');
  toast('Welcome to ContentFlow AI');
}

function setPage(page) {
  if (page === 'feedback' && !state.posted) {
    // Still open the page, but show the locked message.
  }
  state.page = page;
  state.stage = stageByPage[page] || 'input';
  $$('.page').forEach(el => el.classList.remove('active'));
  const pageEl = $(`#page-${page}`);
  if (pageEl) pageEl.classList.add('active');
  $$('#sideNav button').forEach(btn => btn.classList.toggle('active', btn.dataset.page === page));
  const [title, eyebrow] = pageTitles[page] || pageTitles.dashboard;
  $('#sectionTitle').textContent = title;
  $('#sectionEyebrow').textContent = eyebrow;
  updateStageStrip();
  updateFeedbackGate();
  updateSideStage();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function updateSideStage() {
  $('#sideStage').textContent = stageLabels[state.stage];
  const idx = Math.max(1, stageIndex.indexOf(state.stage) + 1);
  const progress = Math.round((idx / stageIndex.length) * 100);
  const bar = $('.mini-progress i');
  if (bar) bar.style.width = `${progress}%`;
}

function updateStageStrip() {
  const current = stageIndex.indexOf(state.stage);
  $$('#stageStrip button').forEach((btn) => {
    const idx = stageIndex.indexOf(btn.dataset.stage);
    btn.classList.toggle('active', btn.dataset.stage === state.stage);
    btn.classList.toggle('done', idx < current);
  });
}

function selectedIdea() {
  return state.ideas[state.selectedIdea] || state.ideas[0];
}

function renderIdeas() {
  const list = $('#ideasList');
  if (!list) return;
  list.innerHTML = state.ideas.map((idea, index) => `
    <article class="idea-item card" data-index="${index}">
      <img src="${idea.image}" alt="${idea.title}">
      <div>
        <h3><span class="pill">${index + 1}</span> ${idea.title}</h3>
        <p>${idea.desc}</p>
        <div class="tag-row">${idea.tags.map(tag => `<span>${tag}</span>`).join('')}</div>
      </div>
      <div class="idea-actions">
        <button class="primary use-idea">✓ Use</button>
        <button class="secondary edit-idea">✎ Edit</button>
        <button class="secondary reject-idea">× Reject</button>
      </div>
    </article>
  `).join('');

  $$('.use-idea', list).forEach(btn => btn.addEventListener('click', (e) => {
    const card = e.target.closest('.idea-item');
    state.selectedIdea = Number(card.dataset.index);
    refreshSelectedIdea();
    setPage('caption');
    toast('Idea selected for human review');
  }));

  $$('.edit-idea', list).forEach(btn => btn.addEventListener('click', (e) => {
    const card = e.target.closest('.idea-item');
    const index = Number(card.dataset.index);
    const newTitle = prompt('Edit idea title:', state.ideas[index].title);
    if (!newTitle) return;
    const newDesc = prompt('Edit idea description:', state.ideas[index].desc) || state.ideas[index].desc;
    state.ideas[index].title = newTitle;
    state.ideas[index].desc = newDesc;
    renderIdeas();
    toast('Idea updated');
  }));

  $$('.reject-idea', list).forEach(btn => btn.addEventListener('click', (e) => {
    const card = e.target.closest('.idea-item');
    if (state.ideas.length <= 1) return toast('Keep at least one idea in the list');
    state.ideas.splice(Number(card.dataset.index), 1);
    state.selectedIdea = 0;
    renderIdeas();
    refreshSelectedIdea();
    toast('Idea rejected');
  }));
}

function refreshSelectedIdea() {
  const idea = selectedIdea();
  $('#captionImage').src = idea.image;
  $('#previewImage').src = idea.image;
  $('#captionIdeaTitle').textContent = idea.title;
  $('#captionIdeaDesc').textContent = idea.desc;
  $('#scheduleTitle').textContent = idea.title;
  $('#finalTitle').textContent = idea.title;
  $('#scheduleSnippet').textContent = getCaptionPreview(90);
  renderCaption();
}

function renderCaption() {
  const text = state.captions[state.captionIndex];
  $('#captionText').value = text;
  $('#previewCaption').textContent = getCaptionPreview(260);
  $('#finalCaption').textContent = text;
  renderHashtags();
}

function getCaptionPreview(max = 180) {
  const text = ($('#captionText') && $('#captionText').value) || state.captions[state.captionIndex];
  return text.length > max ? text.slice(0, max).trim() + '...' : text;
}

function renderHashtags() {
  const box = $('#hashtagBox');
  if (!box) return;
  box.innerHTML = state.hashtags.map((tag, i) => `<button class="${i < 5 ? 'active' : ''}">${tag}</button>`).join('');
  $$('#hashtagBox button').forEach(btn => btn.addEventListener('click', () => btn.classList.toggle('active')));
}

function buildCalendar() {
  const grid = $('#calendarGrid');
  if (!grid) return;
  const labels = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
  const pre = [27, 28, 29, 30];
  const days = [...pre.map(n => ({ n, muted: true })), ...Array.from({length: 31}, (_, i) => ({ n: i + 1 }))];
  grid.innerHTML = labels.map(d => `<span>${d}</span>`).join('') + days.map(d => `
    <button class="${d.muted ? 'muted-day' : ''} ${d.n === state.selectedDate ? 'selected' : ''} ${d.n === 23 ? 'soft-day' : ''}" data-day="${d.n}">${d.n}</button>
  `).join('');
  $$('#calendarGrid button').forEach(btn => btn.addEventListener('click', () => {
    if (btn.classList.contains('muted-day')) return;
    state.selectedDate = Number(btn.dataset.day);
    buildCalendar();
    updateFinalSchedule();
  }));
}

function buildTimes() {
  const slots = [
    ['7:00 AM', 'Best'],
    ['9:00 AM', 'Good'],
    ['12:00 PM', ''],
    ['3:00 PM', 'Good'],
    ['7:00 PM', 'Best'],
    ['9:00 PM', '']
  ];
  const wrap = $('#timeSlots');
  if (!wrap) return;
  wrap.innerHTML = slots.map(([time, label]) => `
    <button data-time="${time}" class="${state.selectedTime === time ? 'selected' : ''}"><span>${time}</span>${label ? `<small>${label}</small>` : ''}</button>
  `).join('');
  $$('#timeSlots button').forEach(btn => btn.addEventListener('click', () => {
    state.selectedTime = btn.dataset.time;
    buildTimes();
    updateFinalSchedule();
  }));
}

function updateFinalSchedule() {
  const dateText = `May ${state.selectedDate}, 2025 • ${state.selectedTime}`;
  $('#finalDateTime').textContent = dateText;
  $('#insightTime').textContent = `${state.selectedTime} – 9:00 PM`;
}

function updateFeedbackGate() {
  const lock = $('#feedbackLock');
  const content = $('#feedbackContent');
  if (!lock || !content) return;
  lock.classList.toggle('hidden', state.posted);
  content.classList.toggle('hidden', !state.posted);
  const navBtn = $('#sideNav button[data-page="feedback"]');
  if (navBtn) navBtn.classList.toggle('locked', !state.posted);
}

function addIdeaFromPrompt() {
  const value = $('#promptInput').value.trim() || 'coffee shop content';
  state.ideas.unshift({
    title: value.toLowerCase().includes('coffee') ? 'Signature Brew Spotlight ☕' : 'Fresh Content Spotlight ✨',
    desc: `A polished post idea generated from: “${value}”. It is ready for human review and editing.`,
    tags: value.toLowerCase().includes('coffee') ? ['#SignatureBrew', '#CafeVibes', '#SupportLocal'] : ['#ContentIdeas', '#BrandStory', '#SocialGrowth'],
    image: value.toLowerCase().includes('coffee') ? 'assets/coffee.jpg' : 'assets/cafe.jpg',
    type: 'Image Post'
  });
  state.selectedIdea = 0;
  renderIdeas();
  refreshSelectedIdea();
  setPage('ideas');
  toast('AI generated ideas from your input');
}

function setupEvents() {
  $$('[data-go-auth]').forEach(btn => btn.addEventListener('click', () => showAuth(btn.dataset.goAuth)));
  $$('[data-login-demo]').forEach(btn => btn.addEventListener('click', login));
  $('#logoutBtn').addEventListener('click', () => {
    $('#appShell').classList.add('hidden');
    showAuth('welcomeScreen');
  });
  $('#togglePassword').addEventListener('click', () => {
    const input = $('#passwordInput');
    input.type = input.type === 'password' ? 'text' : 'password';
  });

  $$('#sideNav button').forEach(btn => btn.addEventListener('click', () => setPage(btn.dataset.page)));
  $$('[data-page-shortcut]').forEach(el => el.addEventListener('click', () => setPage(el.dataset.pageShortcut)));
  $$('.avatar').forEach(el => el.addEventListener('click', () => setPage('profile')));

  $('#promptGenerate').addEventListener('click', addIdeaFromPrompt);
  $('#promptInput').addEventListener('keydown', (e) => { if (e.key === 'Enter') addIdeaFromPrompt(); });

  $('#generateMoreIdeas').addEventListener('click', () => {
    const next = {
      title: 'Customer Favorite of the Week ⭐',
      desc: 'Feature a bestselling drink and invite followers to comment their favorite order.',
      tags: ['#CustomerFavorite', '#CoffeeCommunity', '#CafeLife'],
      image: 'assets/iced-coffee.jpg',
      type: 'Image Post'
    };
    state.ideas.push(next);
    renderIdeas();
    toast('New AI idea added');
  });

  $('#regenerateCaption').addEventListener('click', () => {
    state.captionIndex = (state.captionIndex + 1) % state.captions.length;
    renderCaption();
    toast('Caption regenerated');
  });

  $('#captionText').addEventListener('input', () => {
    state.captions[state.captionIndex] = $('#captionText').value;
    $('#previewCaption').textContent = getCaptionPreview(260);
    $('#finalCaption').textContent = $('#captionText').value;
  });

  $('#copyCaption').addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText($('#captionText').value);
      toast('Caption copied');
    } catch {
      toast('Copy unavailable in this browser');
    }
  });
  $('#copyFinal').addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText($('#finalCaption').textContent);
      toast('Final caption copied');
    } catch {
      toast('Copy unavailable in this browser');
    }
  });
  $('#polishCaption').addEventListener('click', () => {
    const text = $('#captionText').value.trim();
    $('#captionText').value = text.replace('perfect boost!', 'perfect daily boost!') + '\n\nVisit us today and enjoy your next cup. ✨';
    $('#captionText').dispatchEvent(new Event('input'));
    toast('Caption polished');
  });
  $('#editHashtags').addEventListener('click', () => {
    const updated = prompt('Edit hashtags separated by spaces:', state.hashtags.join(' '));
    if (!updated) return;
    state.hashtags = updated.split(/\s+/).filter(Boolean).map(tag => tag.startsWith('#') ? tag : `#${tag}`);
    renderHashtags();
    const lines = $('#captionText').value.split('\n');
    const withoutHashLine = lines.filter(line => !line.trim().startsWith('#')).join('\n').trim();
    $('#captionText').value = `${withoutHashLine}\n\n${state.hashtags.join(' ')}`;
    $('#captionText').dispatchEvent(new Event('input'));
    toast('Hashtags updated');
  });
  $('#saveCaption').addEventListener('click', () => {
    $('#captionText').dispatchEvent(new Event('input'));
    toast('Caption saved for scheduling');
  });

  $$('#platformTabs button').forEach(btn => btn.addEventListener('click', () => {
    $$('#platformTabs button').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    state.selectedPlatform = btn.dataset.platform;
    toast(`${state.selectedPlatform} preview selected`);
  }));

  $$('#schedulePlatforms button').forEach(btn => btn.addEventListener('click', () => {
    $$('#schedulePlatforms button').forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
    const label = btn.textContent.trim().replace(/^[^A-Za-z]+/, '');
    state.selectedPlatform = label || 'Instagram';
  }));

  $('#useRecommended').addEventListener('click', () => {
    state.selectedDate = 23;
    state.selectedTime = '7:00 PM';
    buildCalendar();
    buildTimes();
    updateFinalSchedule();
    toast('Recommended time applied');
  });

  $('#schedulePost').addEventListener('click', () => {
    updateFinalSchedule();
    setPage('plan');
    toast('Post scheduled. Final plan is ready.');
  });

  $('#postNow').addEventListener('click', () => {
    state.posted = true;
    updateFeedbackGate();
    setPage('feedback');
    toast('Content posted/exported. Feedback is now available.');
  });

  $$('#starRow button').forEach(btn => btn.addEventListener('click', () => {
    $$('#starRow button').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
  }));
  $$('.choice-grid button').forEach(btn => btn.addEventListener('click', () => btn.classList.toggle('active')));
  $('#submitFeedback').addEventListener('click', () => {
    state.feedbackSubmitted = true;
    toast('Feedback submitted. AI preferences updated.');
    setPage('analytics');
  });

  $('#darkModeToggle').addEventListener('change', (e) => document.body.classList.toggle('dark', e.target.checked));
  $('#globalSearch').addEventListener('input', (e) => {
    const q = e.target.value.toLowerCase().trim();
    if (!q) return;
    if (q.includes('caption')) setPage('caption');
    else if (q.includes('schedule') || q.includes('calendar')) setPage('schedule');
    else if (q.includes('profile')) setPage('profile');
    else if (q.includes('feedback')) setPage('feedback');
    else if (q.includes('idea')) setPage('ideas');
  });
}

function init() {
  renderIdeas();
  refreshSelectedIdea();
  buildCalendar();
  buildTimes();
  updateFinalSchedule();
  setupEvents();
}

init();
