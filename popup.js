const summarizeBtn = document.getElementById('summarize');
const spinner = document.getElementById('spinner');
const summarizeLabel = document.getElementById('summarize-label');
const resultDiv = document.getElementById('result');
const copyBtn = document.getElementById('copy-summary');

// Controls
const lengthSelect = document.getElementById('length');
const clearBtn = document.getElementById('clear');
const themeSwitch = document.getElementById('theme-switch');
const themeIcon = document.querySelector('.theme-icon');

// Escape HTML to avoid unsafe injection when building list items
function escapeHtml(text) {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// Converts any lines that start with - or * (with or without a space) into an HTML <ul>
function markdownToHtmlList(md) {
  const items = [];
  const lines = String(md).split('\n');
  for (const line of lines) {
    const m = line.match(/^\s*([-*])\s*(.+)$/); // allow missing space after marker
    if (m && m[2].trim().length) {
      items.push(m[2].trim());
    }
  }
  if (items.length === 0) return null;
  return (
    '<ul>' + items.map(txt => `<li>${escapeHtml(txt)}</li>`).join('') + '</ul>'
  );
}

function getSelectedLength() {
  const v = (lengthSelect && lengthSelect.value) || 'medium';
  return (v === 'short' || v === 'medium' || v === 'long') ? v : 'medium';
}

// Theme management
function initTheme() {
  const savedTheme = localStorage.getItem('ai-summarizer-theme');
  const isLight = savedTheme === 'light';
  
  if (isLight) {
    document.body.classList.add('light-theme');
    themeSwitch.checked = true;
    themeIcon.textContent = '☀️';
  } else {
    themeIcon.textContent = '🌙';
  }
}

function toggleTheme() {
  const isLight = document.body.classList.contains('light-theme');
  
  if (isLight) {
    document.body.classList.remove('light-theme');
    themeIcon.textContent = '🌙';
    localStorage.setItem('ai-summarizer-theme', 'dark');
  } else {
    document.body.classList.add('light-theme');
    themeIcon.textContent = '☀️';
    localStorage.setItem('ai-summarizer-theme', 'light');
  }
}

// Initialize theme on load
initTheme();

summarizeBtn.addEventListener('click', async () => {
  summarizeBtn.disabled = true;
  spinner.style.display = "inline-block";
  summarizeLabel.innerText = "Summarizing...";

  resultDiv.classList.remove('result-warning');
  resultDiv.innerText = "Please wait while AI analyzes your text...";
  copyBtn.style.display = 'none';

  // Get selected text from active tab  
  let selectedText = '';
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    const [{ result }] = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => window.getSelection().toString()
    });
    selectedText = result;
  } catch {
    selectedText = '';
  }

  if (!selectedText) {
    resultDiv.classList.add('result-warning');
    resultDiv.innerText = 'No text selected.';
    summarizeBtn.disabled = false;
    spinner.style.display = "none";
    summarizeLabel.innerText = "Summarize Selected Text";
    return;
  }

  // Check Summarizer API
  if (!('Summarizer' in self)) {
    resultDiv.classList.add('result-warning');
    resultDiv.innerText = 'The built-in Summarizer API is not supported in this browser/version.';
    summarizeBtn.disabled = false;
    spinner.style.display = "none";
    summarizeLabel.innerText = "Summarize Selected Text";
    return;
  }

  try {
    const availability = await Summarizer.availability();
    if (availability === "unavailable") {
      resultDiv.classList.add('result-warning');
      resultDiv.innerText =
        "The Summarizer API is unavailable on this device.\n" +
        "Supported: Chrome 138+, 16 GB RAM, 22 GB of free disk space.";
      summarizeBtn.disabled = false;
      spinner.style.display = "none";
      summarizeLabel.innerText = "Summarize Selected Text";
      return;
    }

    const summarizer = await Summarizer.create({
      type: "key-points",    // or: tldr, teaser, headline, etc.
      format: "markdown",    // or "plain-text"
      length: getSelectedLength(),
      monitor(m) {
        m.addEventListener('downloadprogress', (e) => {
          resultDiv.innerText = `Downloading AI model: ${(e.loaded * 100).toFixed(0)}%`;
        });
      }
    });

    resultDiv.innerText = "Generating summary...";

    const summary = await summarizer.summarize(selectedText);

    resultDiv.classList.remove('result-warning');
    const listHtml = markdownToHtmlList(summary);
    if (listHtml) {
      resultDiv.innerHTML = listHtml;
    } else {
      resultDiv.innerText = summary;
    }
    copyBtn.style.display = "inline-block";
  } catch (e) {
    resultDiv.classList.add('result-warning');
    resultDiv.innerText = "Error: " + e.message;
  } finally {
    summarizeBtn.disabled = false;
    spinner.style.display = "none";
    summarizeLabel.innerText = "Summarize Selected Text";
  }
});

// Theme toggle logic
if (themeSwitch) {
  themeSwitch.addEventListener('change', toggleTheme);
}

// Clear logic
if (clearBtn) {
  clearBtn.addEventListener('click', () => {
    resultDiv.innerText = '';
    resultDiv.classList.remove('result-warning');
    copyBtn.style.display = 'none';
  });
}

// Copy logic
copyBtn.addEventListener('click', async () => {
  const text = resultDiv.innerText;
  try {
    await navigator.clipboard.writeText(text);
    const copyText = copyBtn.querySelector('.copy-text');
    const copyIcon = copyBtn.querySelector('.copy-icon');
    copyText.textContent = "Copied!";
    copyIcon.textContent = "✓";
    setTimeout(() => {
      copyText.textContent = "Copy Summary";
      copyIcon.textContent = "📋";
    }, 1500);
  } catch (e) {
    alert("Copying failed.");
  }
});