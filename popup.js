document.addEventListener('DOMContentLoaded', () => {
  const enabledToggle = document.getElementById('enabled');
  const targetsList = document.getElementById('targets');
  const newTargetInput = document.getElementById('newTarget');
  const addBtn = document.getElementById('addBtn');
  const statusDiv = document.getElementById('status');

  const DEFAULT_TARGETS = ['Skip', 'Skip Ad', 'Skip Ads', 'Skip Intro', 'Skip intro'];
  let targets = DEFAULT_TARGETS;

  // Load settings
  chrome.storage.sync.get(['autoClickEnabled', 'targetTexts'], (result) => {
    enabledToggle.checked = result.autoClickEnabled !== false;
    targets = result.targetTexts?.length > 0 ? result.targetTexts : DEFAULT_TARGETS;
    renderTargets();
  });

  // Save settings
  function save() {
    chrome.storage.sync.set({ autoClickEnabled: enabledToggle.checked, targetTexts: targets });
  }

  // Render target tags
  function renderTargets() {
    targetsList.innerHTML = '';
    targets.forEach((t, i) => {
      const tag = document.createElement('div');
      tag.className = 'tag';
      tag.innerHTML = `<span class="tag-text">${t}</span><button class="tag-remove" data-i="${i}">×</button>`;
      targetsList.appendChild(tag);
    });
  }

  // Event listeners
  enabledToggle.addEventListener('change', () => {
    save();
    showStatus(enabledToggle.checked ? 'Enabled' : 'Disabled', 'success');
  });

  targetsList.addEventListener('click', (e) => {
    if (e.target.classList.contains('tag-remove')) {
      targets.splice(parseInt(e.target.dataset.i), 1);
      renderTargets();
      save();
    }
  });

  addBtn.addEventListener('click', addTarget);
  newTargetInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') addTarget(); });

  function addTarget() {
    const val = newTargetInput.value.trim();
    if (!val) return;
    if (targets.includes(val)) { showStatus('Already exists', 'error'); return; }
    targets.push(val);
    renderTargets();
    save();
    newTargetInput.value = '';
    showStatus('Added: ' + val, 'success');
  }

  function showStatus(msg, type) {
    statusDiv.textContent = msg;
    statusDiv.className = 'status show ' + type;
    setTimeout(() => { statusDiv.className = 'status'; }, 2000);
  }
});
