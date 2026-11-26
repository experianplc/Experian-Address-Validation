// Tracks the most recent API call per validation type so the "JSON" tab can render it.
window.__apiExchanges = { address: null, email: null, phone: null };
let activeJsonType = 'address';

function formatApiExchangeJson(value) {
  if (value === null || value === undefined) {
    return null;
  }
  try {
    return JSON.stringify(value, null, 2);
  } catch (error) {
    return String(value);
  }
}

function renderApiExchangeView() {
  const requestPre = document.getElementById('json-view-request');
  const responsePre = document.getElementById('json-view-response');
  if (!requestPre || !responsePre) {
    return;
  }

  const exchange = window.__apiExchanges[activeJsonType];
  if (!exchange) {
    requestPre.textContent = 'No request has been made yet.';
    responsePre.textContent = 'No response received yet.';
    return;
  }

  requestPre.textContent = formatApiExchangeJson(exchange.request) || 'No request has been made yet.';
  responsePre.textContent = formatApiExchangeJson(exchange.response) || 'No response received yet.';
}

// The tab bar is hidden until the first result comes back, so it isn't shown on the blank page.
function showResultsViewTabs() {
  const tabs = document.getElementById('results-view-tabs');
  if (tabs) {
    tabs.classList.remove('hidden');
  }
}

// Hide the tab bar again and fall back to the Visual view, ready for the next search.
function resetResultsViewToVisual() {
  const tabs = document.getElementById('results-view-tabs');
  const visualTab = document.getElementById('results-view-tab-visual');
  const jsonTab = document.getElementById('results-view-tab-json');
  const visualPanel = document.getElementById('visual-view-panel');
  const jsonPanel = document.getElementById('json-view-panel');

  if (tabs) {
    tabs.classList.add('hidden');
  }
  if (visualTab) {
    visualTab.classList.add('active');
  }
  if (jsonTab) {
    jsonTab.classList.remove('active');
  }
  if (visualPanel) {
    visualPanel.classList.remove('hidden');
  }
  if (jsonPanel) {
    jsonPanel.classList.add('hidden');
  }

  activeJsonType = 'address';
  document.querySelectorAll('.json-view-subtab').forEach(function (subtab) {
    subtab.classList.toggle('active', subtab.dataset.jsonType === 'address');
  });
}

// Switches which stored exchange is shown and keeps the sub-tab buttons in sync.
function setActiveJsonType(type) {
  activeJsonType = type;
  document.querySelectorAll('.json-view-subtab').forEach(function (subtab) {
    subtab.classList.toggle('active', subtab.dataset.jsonType === type);
  });
  renderApiExchangeView();
}

// Called by the validation handlers whenever an address/email/phone call completes.
window.updateApiExchangeView = function (type, requestInfo, responseInfo) {
  window.__apiExchanges[type] = { request: requestInfo, response: responseInfo };
  showResultsViewTabs();
  // Follow the latest validation so switching to JSON shows its request/response.
  setActiveJsonType(type);
};

document.addEventListener('DOMContentLoaded', function () {
  const visualTab = document.getElementById('results-view-tab-visual');
  const jsonTab = document.getElementById('results-view-tab-json');
  const visualPanel = document.getElementById('visual-view-panel');
  const jsonPanel = document.getElementById('json-view-panel');
  const jsonSubtabs = Array.from(document.querySelectorAll('.json-view-subtab'));
  const themeToggle = document.getElementById('json-view-theme-toggle');
  const leftColumn = document.querySelector('.left-column');
  const JSON_THEME_STORAGE_KEY = 'eav-json-view-theme';

  if (!visualTab || !jsonTab || !visualPanel || !jsonPanel) {
    return;
  }

  // Dark/light theme for the Request/Response code boxes, persisted across visits.
  function applyJsonViewTheme(theme) {
    const isDark = theme === 'dark';
    jsonPanel.classList.toggle('theme-dark', isDark);

    if (!themeToggle) {
      return;
    }

    themeToggle.setAttribute('aria-pressed', String(isDark));
    const label = themeToggle.querySelector('.json-view-theme-toggle-label');
    if (label) {
      label.textContent = isDark ? 'Light' : 'Dark';
    }
  }

  function getStoredJsonViewTheme() {
    try {
      return window.localStorage.getItem(JSON_THEME_STORAGE_KEY) || 'light';
    } catch (error) {
      return 'light';
    }
  }

  function storeJsonViewTheme(theme) {
    try {
      window.localStorage.setItem(JSON_THEME_STORAGE_KEY, theme);
    } catch (error) {
      // Ignore persistence errors (e.g. storage disabled/full).
    }
  }

  applyJsonViewTheme(getStoredJsonViewTheme());

  if (themeToggle) {
    themeToggle.addEventListener('click', function () {
      const nextTheme = jsonPanel.classList.contains('theme-dark') ? 'light' : 'dark';
      applyJsonViewTheme(nextTheme);
      storeJsonViewTheme(nextTheme);
    });
  }

  // Cap the JSON Request/Response boxes to the left column's rendered height so they
  // end at the same level as the "Reset all" button, instead of growing with content.
  function syncJsonViewHeight() {
    if (!leftColumn) {
      return;
    }

    const isStackedLayout = window.matchMedia('(max-width: 768px)').matches;
    if (isStackedLayout) {
      jsonPanel.style.height = '';
      return;
    }

    const leftColumnBottom = leftColumn.getBoundingClientRect().bottom;
    const jsonPanelTop = jsonPanel.getBoundingClientRect().top;
    jsonPanel.style.height = Math.max(leftColumnBottom - jsonPanelTop, 0) + 'px';
  }

  function setActiveView(view) {
    const showJson = view === 'json';
    visualTab.classList.toggle('active', !showJson);
    jsonTab.classList.toggle('active', showJson);
    visualPanel.classList.toggle('hidden', showJson);
    jsonPanel.classList.toggle('hidden', !showJson);

    if (showJson) {
      renderApiExchangeView();
      syncJsonViewHeight();
    }
  }

  visualTab.addEventListener('click', function () {
    setActiveView('visual');
  });

  jsonTab.addEventListener('click', function () {
    setActiveView('json');
  });

  jsonSubtabs.forEach(function (subtab) {
    subtab.addEventListener('click', function () {
      setActiveJsonType(subtab.dataset.jsonType);
    });
  });

  window.addEventListener('validation-reset', function () {
    window.__apiExchanges = { address: null, email: null, phone: null };
    resetResultsViewToVisual();
    renderApiExchangeView();
  });

  window.addEventListener('resize', syncJsonViewHeight);

  // Re-measure whenever the left column's own content changes size (collapsible panels, etc).
  if (leftColumn && typeof ResizeObserver !== 'undefined') {
    new ResizeObserver(syncJsonViewHeight).observe(leftColumn);
  }
});


