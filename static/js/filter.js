(function() {
  'use strict';

  // Detect which page we're on and set filter configuration accordingly.
  var config;
  var projectControls = document.getElementById('project-controls');
  var byteControls = document.getElementById('byte-controls');

  if (projectControls) {
    config = {
      controls: projectControls,
      list: document.getElementById('project-list-default'),
      attr: 'data-languages',
      multiValue: true,
      hashKey: 'lang',
      itemLabel: 'projects',
      placeholder: 'Filter by language...'
    };
  } else if (byteControls) {
    config = {
      controls: byteControls,
      list: document.getElementById('byte-list-default'),
      attr: 'data-category',
      multiValue: false,
      hashKey: 'cat',
      itemLabel: 'bytes',
      placeholder: 'Filter by category...'
    };
  }

  if (!config || !config.list) {
    return;
  }

  var primaryFilters = [];
  var yearFilter = '';
  var primarySelect = null;
  var yearSelect = null;

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

  // Read all list items and compute whether each passes the current year and primary filters.
  function getItemData() {
    var items = config.list.querySelectorAll('.post-item');
    var result = [];
    for (var i = 0; i < items.length; i++) {
      var el = items[i];
      var date = el.getAttribute('data-date') || '';
      var raw = (el.getAttribute(config.attr) || '').toLowerCase();
      var values = config.multiValue ? raw.split(',').filter(Boolean) : (raw ? [raw] : []);

      var passesYear = !yearFilter || date.substring(0, 4) === yearFilter;
      var passesPrimary = primaryFilters.length === 0;
      if (!passesPrimary) {
        for (var k = 0; k < primaryFilters.length; k++) {
          if (values.indexOf(primaryFilters[k]) !== -1) {
            passesPrimary = true;
            break;
          }
        }
      }

      result.push({
        el: el,
        date: date,
        values: values,
        passesYear: passesYear,
        passesPrimary: passesPrimary
      });
    }
    return result;
  }

  // Collect all year values from section header data attributes.
  function getYears() {
    var headers = config.list.querySelectorAll('.section-header');
    var years = [];
    for (var i = 0; i < headers.length; i++) {
      var y = headers[i].getAttribute('data-year');
      if (y) {
        years.push(y);
      }
    }
    return years;
  }

  // Create the year and primary filter dropdowns and append them to the filter bar.
  function buildFilterBar() {
    filterBar.textContent = '';

    yearSelect = document.createElement('select');
    yearSelect.className = 'filter-select';
    yearSelect.addEventListener('change', function() {
      yearFilter = yearSelect.value;
      updateHash();
      render();
    });
    filterBar.appendChild(yearSelect);

    primarySelect = document.createElement('select');
    primarySelect.className = 'filter-select';
    primarySelect.addEventListener('change', function() {
      if (primarySelect.value) {
        togglePrimaryFilter(primarySelect.value);
        primarySelect.value = '';
      }
    });
    filterBar.appendChild(primarySelect);

    updateYearOptions();
    updatePrimaryOptions();
  }

  // Rebuild year dropdown options, showing only years with matching items based on primary filters.
  function updateYearOptions() {
    yearSelect.textContent = '';

    var all = document.createElement('option');
    all.value = '';
    all.textContent = 'All years';
    yearSelect.appendChild(all);

    var data = getItemData();
    var yearCounts = {};
    for (var i = 0; i < data.length; i++) {
      if (data[i].passesPrimary) {
        var y = data[i].date.substring(0, 4);
        yearCounts[y] = (yearCounts[y] || 0) + 1;
      }
    }

    var years = getYears();
    for (var i = 0; i < years.length; i++) {
      var count = yearCounts[years[i]] || 0;
      if (count === 0 && years[i] !== yearFilter) {
        continue;
      }

      var opt = document.createElement('option');
      opt.value = years[i];
      opt.textContent = years[i] + ' (' + count + ')';

      if (years[i] === yearFilter) {
        opt.selected = true;
      }
      yearSelect.appendChild(opt);
    }
  }

  // Rebuild primary filter dropdown options, showing only values with matching items based on year filter.
  function updatePrimaryOptions() {
    primarySelect.textContent = '';

    var placeholder = document.createElement('option');
    placeholder.value = '';
    placeholder.textContent = config.placeholder;
    placeholder.disabled = true;
    placeholder.selected = true;
    primarySelect.appendChild(placeholder);

    var data = getItemData();
    var counts = {};
    for (var i = 0; i < data.length; i++) {
      if (data[i].passesYear) {
        for (var j = 0; j < data[i].values.length; j++) {
          var v = data[i].values[j];
          counts[v] = (counts[v] || 0) + 1;
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

    if (primaryFilters.length === 0 && !yearFilter) {
      filterStatus.textContent = '';
      return;
    }

    if (yearFilter) {
      activeFiltersEl.appendChild(createChip(yearFilter, function() {
        yearFilter = '';
        yearSelect.value = '';
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
      yearFilter = '';
      yearSelect.value = '';
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
    if (yearFilter) {
      parts.push('year=' + yearFilter);
    }
    if (primaryFilters.length > 0) {
      parts.push(config.hashKey + '=' + primaryFilters.map(encodeURIComponent).join(','));
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
      if (params[i].indexOf(config.hashKey + '=') === 0) {
        primaryFilters = params[i].slice(config.hashKey.length + 1).split(',').map(decodeURIComponent).filter(Boolean);
      } else if (params[i].indexOf('year=') === 0) {
        yearFilter = params[i].slice(5);
      }
    }
  }

  // Apply filters to list items, hide empty year headers, and update the active filters display.
  function render() {
    updateYearOptions();
    updatePrimaryOptions();

    var items = config.list.querySelectorAll('.post-item');
    var headers = config.list.querySelectorAll('.section-header');
    var filtering = primaryFilters.length > 0 || yearFilter;

    if (!filtering) {
      for (var i = 0; i < items.length; i++) {
        items[i].style.display = '';
      }
      for (var j = 0; j < headers.length; j++) {
        headers[j].style.display = '';
      }
      renderActiveFilters();
      return;
    }

    var data = getItemData();
    for (var i = 0; i < data.length; i++) {
      if (data[i].passesYear && data[i].passesPrimary) {
        data[i].el.style.display = '';
      } else {
        data[i].el.style.display = 'none';
      }
    }

    // Hide year headers that have no visible items beneath them.
    for (var j = 0; j < headers.length; j++) {
      var hasVisible = false;
      var sibling = headers[j].nextElementSibling;
      while (sibling && !sibling.classList.contains('section-header')) {
        if (sibling.classList.contains('post-item') && sibling.style.display !== 'none') {
          hasVisible = true;
          break;
        }
        sibling = sibling.nextElementSibling;
      }
      if (hasVisible) {
        headers[j].style.display = '';
      } else {
        headers[j].style.display = 'none';
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
