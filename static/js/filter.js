(function() {
  'use strict';

  // Detect which page we're on and set filter configuration accordingly.
  var config;
  var projectControls = document.getElementById('project-controls');
  var byteControls = document.getElementById('byte-controls');
  var libraryControls = document.getElementById('library-controls');

  if (projectControls) {
    config = {
      controls: projectControls,
      list: document.getElementById('project-list-default'),
      sectionHeaderAttr: 'data-year',
      sectionItemAttr: 'data-date',
      sectionMatch: 'year-prefix',
      sectionAllLabel: 'All years',
      sectionHashKey: 'year',
      primaryAttr: 'data-languages',
      primaryMultiValue: true,
      primaryHashKey: 'lang',
      primaryPlaceholder: 'Filter by language...',
      itemLabel: 'projects'
    };
  } else if (byteControls) {
    config = {
      controls: byteControls,
      list: document.getElementById('byte-list-default'),
      sectionHeaderAttr: 'data-year',
      sectionItemAttr: 'data-date',
      sectionMatch: 'year-prefix',
      sectionAllLabel: 'All years',
      sectionHashKey: 'year',
      primaryAttr: 'data-category',
      primaryMultiValue: false,
      primaryHashKey: 'cat',
      primaryPlaceholder: 'Filter by category...',
      itemLabel: 'bytes'
    };
  } else if (libraryControls) {
    config = {
      controls: libraryControls,
      list: document.getElementById('library-list-default'),
      sectionHeaderAttr: 'data-category',
      sectionItemAttr: 'data-category',
      sectionMatch: 'exact',
      sectionAllLabel: 'All categories',
      sectionHashKey: 'cat',
      primaryAttr: null,
      primaryHashKey: null,
      primaryPlaceholder: null,
      itemLabel: 'books'
    };
  }

  if (!config || !config.list) {
    return;
  }

  var primaryFilters = [];
  var sectionFilter = '';
  var primarySelect = null;
  var sectionSelect = null;

  var filterBar = document.getElementById('filter-bar');
  var activeFiltersEl = document.getElementById('active-filters');
  var filterStatus = document.getElementById('filter-status');

  // Reveal controls, restore filters from URL hash, and build the filter bar.
  function init() {
    config.controls.style.display = '';
    parseHashFilters();

    window.addEventListener('hashchange', function() {
      parseHashFilters();
      render();
    });

    buildFilterBar();
    render();
  }

  // Extract the section value from an item's attribute based on the configured match mode.
  function getSectionValue(el) {
    var raw = el.getAttribute(config.sectionItemAttr) || '';
    if (config.sectionMatch === 'year-prefix') {
      return raw.substring(0, 4);
    }
    return raw.toLowerCase();
  }

  // Read all list items and compute whether each passes the current section and primary filters.
  function getItemData() {
    var items = config.list.querySelectorAll('.post-item');
    var result = [];
    for (var i = 0; i < items.length; i++) {
      var el = items[i];
      var section = getSectionValue(el);

      var passesSection = !sectionFilter || section === sectionFilter;
      var passesPrimary = true;

      if (config.primaryAttr && primaryFilters.length > 0) {
        var raw = (el.getAttribute(config.primaryAttr) || '').toLowerCase();
        var values = config.primaryMultiValue ? raw.split(',').filter(Boolean) : (raw ? [raw] : []);
        passesPrimary = false;
        for (var k = 0; k < primaryFilters.length; k++) {
          if (values.indexOf(primaryFilters[k]) !== -1) {
            passesPrimary = true;
            break;
          }
        }
      }

      result.push({
        el: el,
        section: section,
        passesSection: passesSection,
        passesPrimary: passesPrimary
      });
    }
    return result;
  }

  // Collect all section values from section header data attributes.
  function getSections() {
    var headers = config.list.querySelectorAll('.section-header');
    var sections = [];
    for (var i = 0; i < headers.length; i++) {
      var val = headers[i].getAttribute(config.sectionHeaderAttr);
      if (val) {
        sections.push(config.sectionMatch === 'exact' ? val.toLowerCase() : val);
      }
    }
    return sections;
  }

  // Create the section and primary filter dropdowns and append them to the filter bar.
  function buildFilterBar() {
    filterBar.textContent = '';

    sectionSelect = document.createElement('select');
    sectionSelect.className = 'filter-select';
    sectionSelect.setAttribute('aria-label', config.sectionAllLabel);
    sectionSelect.addEventListener('change', function() {
      sectionFilter = sectionSelect.value;
      updateHash();
      render();
    });
    filterBar.appendChild(sectionSelect);

    if (config.primaryAttr) {
      primarySelect = document.createElement('select');
      primarySelect.className = 'filter-select';
      primarySelect.setAttribute('aria-label', config.primaryPlaceholder);
      primarySelect.addEventListener('change', function() {
        if (primarySelect.value) {
          togglePrimaryFilter(primarySelect.value);
          primarySelect.value = '';
        }
      });
      filterBar.appendChild(primarySelect);
    }

    updateSectionOptions();
    updatePrimaryOptions();
  }

  // Rebuild section dropdown options, showing only sections with matching items based on primary filters.
  function updateSectionOptions() {
    sectionSelect.textContent = '';

    var all = document.createElement('option');
    all.value = '';
    all.textContent = config.sectionAllLabel;
    sectionSelect.appendChild(all);

    var data = getItemData();
    var sectionCounts = {};
    for (var i = 0; i < data.length; i++) {
      if (data[i].passesPrimary) {
        sectionCounts[data[i].section] = (sectionCounts[data[i].section] || 0) + 1;
      }
    }

    var sections = getSections();
    for (var i = 0; i < sections.length; i++) {
      var key = config.sectionMatch === 'exact' ? sections[i].toLowerCase() : sections[i];
      var count = sectionCounts[key] || 0;
      if (count === 0 && key !== sectionFilter) {
        continue;
      }

      var opt = document.createElement('option');
      opt.value = key;
      opt.textContent = sections[i] + ' (' + count + ')';

      if (key === sectionFilter) {
        opt.selected = true;
      }
      sectionSelect.appendChild(opt);
    }
  }

  // Rebuild primary filter dropdown options, showing only values with matching items based on section filter.
  function updatePrimaryOptions() {
    if (!primarySelect) {
      return;
    }

    primarySelect.textContent = '';

    var placeholder = document.createElement('option');
    placeholder.value = '';
    placeholder.textContent = config.primaryPlaceholder;
    placeholder.disabled = true;
    placeholder.selected = true;
    primarySelect.appendChild(placeholder);

    var data = getItemData();
    var counts = {};
    for (var i = 0; i < data.length; i++) {
      if (data[i].passesSection) {
        var raw = (data[i].el.getAttribute(config.primaryAttr) || '').toLowerCase();
        var values = config.primaryMultiValue ? raw.split(',').filter(Boolean) : (raw ? [raw] : []);
        for (var j = 0; j < values.length; j++) {
          counts[values[j]] = (counts[values[j]] || 0) + 1;
        }
      }
    }

    var sorted = Object.keys(counts).sort(function(a, b) {
      return counts[b] - counts[a];
    });

    for (var i = 0; i < sorted.length; i++) {
      if (primaryFilters.indexOf(sorted[i]) !== -1) {
        continue;
      }
      var opt = document.createElement('option');
      opt.value = sorted[i];
      opt.textContent = sorted[i] + ' (' + counts[sorted[i]] + ')';
      primarySelect.appendChild(opt);
    }
  }

  // Render active filter chips and the "N of M items" status text.
  function renderActiveFilters() {
    activeFiltersEl.textContent = '';

    var items = config.list.querySelectorAll('.post-item');
    var total = items.length;
    var visible = 0;
    for (var n = 0; n < items.length; n++) {
      if (items[n].style.display !== 'none') {
        visible++;
      }
    }

    if (primaryFilters.length === 0 && !sectionFilter) {
      filterStatus.textContent = '';
      return;
    }

    if (sectionFilter) {
      activeFiltersEl.appendChild(createChip(sectionFilter, function() {
        sectionFilter = '';
        sectionSelect.value = '';
        updateHash();
        render();
      }));
    }

    for (var i = 0; i < primaryFilters.length; i++) {
      (function(name) {
        activeFiltersEl.appendChild(createChip(name, function() {
          togglePrimaryFilter(name);
        }));
      })(primaryFilters[i]);
    }

    var clearBtn = document.createElement('button');
    clearBtn.className = 'clear-filters';
    clearBtn.textContent = 'clear all';
    clearBtn.addEventListener('click', function() {
      primaryFilters = [];
      sectionFilter = '';
      sectionSelect.value = '';
      updateHash();
      render();
    });
    activeFiltersEl.appendChild(clearBtn);

    filterStatus.textContent = visible + ' of ' + total + ' ' + config.itemLabel;
  }

  // Create a removable filter chip element with a close button.
  function createChip(label, onRemove) {
    var chip = document.createElement('span');
    chip.className = 'active-filter-chip';
    chip.textContent = label;

    var btn = document.createElement('button');
    btn.className = 'remove-filter';
    btn.textContent = '\u00d7';
    btn.addEventListener('click', onRemove);
    chip.appendChild(btn);
    return chip;
  }

  // Toggle a primary filter value on or off, then re-render.
  function togglePrimaryFilter(val) {
    val = val.toLowerCase();
    var idx = primaryFilters.indexOf(val);
    if (idx !== -1) {
      primaryFilters.splice(idx, 1);
    } else {
      primaryFilters.push(val);
    }
    updateHash();
    render();
  }

  // Sync current filter state to the URL hash for bookmarking and back/forward navigation.
  function updateHash() {
    var parts = [];
    if (sectionFilter) {
      parts.push(config.sectionHashKey + '=' + encodeURIComponent(sectionFilter));
    }
    if (config.primaryHashKey && primaryFilters.length > 0) {
      parts.push(config.primaryHashKey + '=' + primaryFilters.map(encodeURIComponent).join(','));
    }

    if (parts.length === 0) {
      history.replaceState(null, '', window.location.pathname);
    } else {
      history.replaceState(null, '', '#' + parts.join('&'));
    }
  }

  // Parse filter state from the URL hash on page load or hashchange.
  function parseHashFilters() {
    var hash = window.location.hash.slice(1);
    if (!hash) {
      return;
    }

    var params = hash.split('&');
    for (var i = 0; i < params.length; i++) {
      if (params[i].indexOf(config.sectionHashKey + '=') === 0) {
        sectionFilter = decodeURIComponent(params[i].slice(config.sectionHashKey.length + 1));
      } else if (config.primaryHashKey && params[i].indexOf(config.primaryHashKey + '=') === 0) {
        primaryFilters = params[i].slice(config.primaryHashKey.length + 1).split(',').map(decodeURIComponent).filter(Boolean);
      }
    }
  }

  // Apply filters to list items, hide empty section headers, and update the active filters display.
  function render() {
    updateSectionOptions();
    updatePrimaryOptions();

    var items = config.list.querySelectorAll('.post-item');
    var headers = config.list.querySelectorAll('.section-header');
    var filtering = primaryFilters.length > 0 || sectionFilter;

    if (!filtering) {
      for (var i = 0; i < items.length; i++) {
        items[i].style.display = '';
      }
      for (var j = 0; j < headers.length; j++) {
        headers[j].style.display = '';
        var nextEl = headers[j].nextElementSibling;
        if (nextEl && nextEl.tagName === 'UL') {
          nextEl.style.display = '';
        }
      }
      renderActiveFilters();
      return;
    }

    var data = getItemData();
    for (var i = 0; i < data.length; i++) {
      if (data[i].passesSection && data[i].passesPrimary) {
        data[i].el.style.display = '';
      } else {
        data[i].el.style.display = 'none';
      }
    }

    // Hide section headers that have no visible items beneath them.
    // Items may be direct siblings or nested inside a container element (e.g. <ul>).
    for (var j = 0; j < headers.length; j++) {
      var hasVisible = false;
      var sibling = headers[j].nextElementSibling;
      while (sibling && !sibling.classList.contains('section-header')) {
        if (sibling.classList.contains('post-item') && sibling.style.display !== 'none') {
          hasVisible = true;
          break;
        }
        var nested = sibling.querySelectorAll('.post-item');
        for (var m = 0; m < nested.length; m++) {
          if (nested[m].style.display !== 'none') {
            hasVisible = true;
            break;
          }
        }
        if (hasVisible) {
          break;
        }
        sibling = sibling.nextElementSibling;
      }
      if (hasVisible) {
        headers[j].style.display = '';
      } else {
        headers[j].style.display = 'none';
      }

      // Also hide/show the adjacent list container if present.
      var nextEl = headers[j].nextElementSibling;
      if (nextEl && nextEl.tagName === 'UL') {
        nextEl.style.display = hasVisible ? '' : 'none';
      }
    }

    renderActiveFilters();
  }

  // Boot the filter engine once the DOM is ready.
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
