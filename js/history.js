// Message history functionality for easy phrase reuse

import { elements } from "./core.js";

// Configuration
const MAX_HISTORY_ITEMS = 10; // Maximum number of history items to store

// Initialize the history array (could be persisted to localStorage in a full implementation)
let messageHistory = [];

// Create and initialize the history panel
function initHistoryPanel() {
  // Create the history panel container
  const historyPanel = document.createElement("div");
  historyPanel.id = "historyPanel";
  historyPanel.className = "history-panel";

  // Create the header with title
  const header = document.createElement("div");
  header.className = "history-header";

  const title = document.createElement("span");
  title.textContent = "Recent Messages";
  title.className = "history-title";

  const clearBtn = document.createElement("button");
  clearBtn.textContent = "Clear History";
  clearBtn.className = "history-clear-btn";
  clearBtn.addEventListener("click", clearHistory);

  header.appendChild(title);
  header.appendChild(clearBtn);
  historyPanel.appendChild(header);

  // Create the scrollable container for history items
  const scrollContainer = document.createElement("div");
  scrollContainer.className = "history-items-container";
  historyPanel.appendChild(scrollContainer);

  // Insert the history panel above the text output area
  const textContainer = elements.selectedWordsContainer.parentNode;
  textContainer.parentNode.insertBefore(historyPanel, textContainer);

  // Add CSS for the history panel
  addHistoryStyles();

  return historyPanel;
}

// Add a phrase to the history
function addToHistory(phrase) {
  if (!phrase || phrase.trim() === "") return;

  // Remove duplicate if it exists (to move it to the top)
  messageHistory = messageHistory.filter((item) => item !== phrase);

  // Add to the beginning of the array
  messageHistory.unshift(phrase);

  // Limit the number of items
  if (messageHistory.length > MAX_HISTORY_ITEMS) {
    messageHistory.pop();
  }

  // Update the UI
  updateHistoryDisplay();
}

// Clear all history items
function clearHistory() {
  messageHistory = [];
  updateHistoryDisplay();
}

// Update the history panel with current items
function updateHistoryDisplay() {
  const container = document.querySelector(".history-items-container");
  if (!container) return;

  // Clear current items
  container.innerHTML = "";

  // If no history items, show a message
  if (messageHistory.length === 0) {
    const emptyMessage = document.createElement("div");
    emptyMessage.className = "history-empty";
    emptyMessage.textContent = "No history yet";
    container.appendChild(emptyMessage);
    return;
  }

  // Add each history item
  messageHistory.forEach((phrase) => {
    const historyItem = document.createElement("div");
    historyItem.className = "history-item";
    historyItem.textContent = phrase;

    // Add click handler to reuse the phrase
    historyItem.addEventListener("click", () => {
      reuseHistoryItem(phrase);
    });

    container.appendChild(historyItem);
  });
}

// Reuse a history item by placing it in the text box
function reuseHistoryItem(phrase) {
  elements.selectedWordsContainer.textContent = phrase;

  // Visual feedback that the item was selected
  const items = document.querySelectorAll(".history-item");
  items.forEach((item) => {
    if (item.textContent === phrase) {
      item.classList.add("history-item-selected");
      setTimeout(() => {
        item.classList.remove("history-item-selected");
      }, 500);
    }
  });
}

// Add CSS styles for the history panel
function addHistoryStyles() {
  const styleElement = document.createElement("style");
  styleElement.textContent = `
    .history-panel {
      max-width: 650px;
      width: 100%;
      margin: 0 auto 15px auto;
      border-radius: 8px;
      background-color: rgba(255, 255, 255, 0.95);
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
      overflow: hidden;
      display: flex;
      flex-direction: column;
      transition: all 0.3s ease;
    }
    
    .history-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 10px 15px;
      background-color: #f5f5f5;
      border-bottom: 1px solid #e0e0e0;
    }
    
    .history-title {
      font-weight: bold;
      color: #424242;
    }
    
    .history-clear-btn {
      background-color: #f44336;
      color: white;
      border: none;
      border-radius: 4px;
      padding: 5px 10px;
      font-size: 12px;
      cursor: pointer;
      transition: background-color 0.2s;
    }
    
    .history-clear-btn:hover {
      background-color: #d32f2f;
    }
    
    .history-items-container {
      max-height: 150px;
      overflow-y: auto;
      padding: 5px;
    }
    
    .history-item {
      padding: 8px 12px;
      margin: 5px;
      background-color: #e3f2fd;
      border-radius: 4px;
      cursor: pointer;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      transition: all 0.2s;
    }
    
    .history-item:hover {
      background-color: #bbdefb;
      transform: translateY(-2px);
    }
    
    .history-item-selected {
      background-color: #4caf50 !important;
      color: white;
    }
    
    .history-empty {
      padding: 15px;
      text-align: center;
      color: #9e9e9e;
      font-style: italic;
    }
    
    /* Add a pulsing animation for new entries */
    @keyframes historyPulse {
      0% { transform: scale(1); }
      50% { transform: scale(1.02); }
      100% { transform: scale(1); }
    }
    
    .history-item-new {
      animation: historyPulse 1s;
    }
  `;
  document.head.appendChild(styleElement);
}

// Listen for text updates and add to history when appropriate
function setupHistoryListeners() {
  // When "Say This!" button is clicked - add the current text to history
  const sayButton = document.querySelector('.key-enter[data-action="enter"]');
  if (sayButton) {
    sayButton.addEventListener("click", () => {
      const currentText = elements.selectedWordsContainer.textContent.trim();
      if (currentText) {
        addToHistory(currentText);
      }
    });
  }

  // When a sentence is selected - add to history
  document.addEventListener("sentenceSelected", (e) => {
    if (e.detail && e.detail.sentence) {
      addToHistory(e.detail.sentence);
    }
  });
}

export { initHistoryPanel, addToHistory, clearHistory, setupHistoryListeners };
