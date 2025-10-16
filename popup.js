const summarizeBtn = document.getElementById('summarize');
const spinner = document.getElementById('spinner');
const summarizeLabel = document.getElementById('summarize-label');
const resultDiv = document.getElementById('result');
const copyBtn = document.getElementById('copy-summary');

// Converts markdown list (- or *) with/without leading spaces to a proper HTML <ul>
function markdownToHtmlList(md) {
  const lines = md
    .split('\n')
    .filter(line => /^\s*([-*])\s+/.test(line));
  if (lines.length < 1) return md; // No list detected
  return (
    "<ul>" +
    lines
      .map(line =>
        `<li>${line.replace(/^\s*([-*])\s+/, '').trim()}</li>`
      )
      .join('') +
    "</ul>"
  );
}

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
      length: "medium",      // or: short, long
      monitor(m) {
        m.addEventListener('downloadprogress', (e) => {
          resultDiv.innerText = `Downloading AI model: ${(e.loaded * 100).toFixed(0)}%`;
        });
      }
    });

    resultDiv.innerText = "Generating summary...";

    const summary = await summarizer.summarize(selectedText);

    resultDiv.classList.remove('result-warning');
    if (/^\s*([-*])\s+/.test((summary || '').trim())) {
      resultDiv.innerHTML = markdownToHtmlList(summary);
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

// Copy logic
copyBtn.addEventListener('click', async () => {
  const text = resultDiv.innerText;
  try {
    await navigator.clipboard.writeText(text);
    copyBtn.innerText = "Copied!";
    setTimeout(() => {
      copyBtn.innerText = "Copy";
    }, 1500);
  } catch (e) {
    alert("Copying failed.");
  }
});