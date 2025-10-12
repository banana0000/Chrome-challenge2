document.getElementById('summarize').addEventListener('click', async () => {
  const resultDiv = document.getElementById('result');
  const copyBtn = document.getElementById('copy-summary');
  const targetLang = document.getElementById('translator-lang').value;

  resultDiv.innerText = "Translating...";
  copyBtn.style.display = 'none';

  // Select text from the active tab:
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
    resultDiv.innerText = 'No text selected.';
    return;
  }

  // FIRST: Translate the text
  if ('translator' in navigator && 'summary' in navigator) {
    try {
      const translation = await navigator.translator.translate({
        text: selectedText,
        targetLanguage: targetLang
      });

      resultDiv.innerText = "Summarizing...";
      // SECOND: Summarize the translated text
      const summary = await navigator.summary.getSummary({
        context: translation.translatedText
      });

      resultDiv.classList.remove('result-warning');
      resultDiv.innerText = summary.text || "No summary returned.";
      copyBtn.style.display = "block";
    } catch (e) {
      resultDiv.classList.add('result-warning');
      resultDiv.innerText = "Error: " + e.message;
      copyBtn.style.display = "block";
    }
  } else {
    resultDiv.classList.add('result-warning');
    resultDiv.innerText =
      "[DEMO: Translator/Summarizer API not available]\n\n" + selectedText;
    copyBtn.style.display = "block";
  }
});

// Copy button logic:
document.getElementById('copy-summary').addEventListener('click', async () => {
  const text = document.getElementById('result').innerText;
  try {
    await navigator.clipboard.writeText(text);
    const btn = document.getElementById('copy-summary');
    btn.innerText = "Copied!";
    setTimeout(() => {
      btn.innerText = "Copy";
    }, 1500);
  } catch (e) {
    alert("Copying failed.");
  }
});




