(() => {
  const bodyEl = document.body;
  const input = document.getElementById('jsonInput');
  const parseBtn = document.getElementById('parseBtn');
  const clearBtn = document.getElementById('clearBtn');
  const treeEl = document.getElementById('tree');
  const out = document.getElementById('out');
  const selMeta = document.getElementById('selMeta');
  const dotPathEl = document.getElementById('dotPath');
  const tagEl = document.getElementById('tag');
  const dynBox = document.getElementById('dynBox');
  const dynTagEl = document.getElementById('dynTag');
  const previewEl = document.getElementById('preview');
  const prefixSelect = document.getElementById('prefixSelect');
  const fallbackInput = document.getElementById('fallbackInput');
  const searchBox = document.getElementById('searchBox');
  const resultsEl = document.getElementById('results');
  const expandAllBtn = document.getElementById('expandAll');
  const liveStatus = document.getElementById('live-status');
  const copyStatus = document.getElementById('copy-status');
  const contrastBtn = document.getElementById('contrastBtn');

  let rootData = null;
  let leafIndex = [];
  let lastTokens = null;

  function announce(msg, isError=false) {
    liveStatus.textContent = msg;
    liveStatus.classList.toggle('bad', isError);
    liveStatus.classList.toggle('good', !isError);
  }

  async function copyToClipboard(text) {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
        return true;
      }
    } catch (e) {}
    try {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.setAttribute('readonly', '');
      ta.style.position = 'fixed';
      ta.style.top = '-9999px';
      ta.style.left = '-9999px';
      document.body.appendChild(ta);
      ta.focus();
      ta.select();
      const ok = document.execCommand('copy');
      document.body.removeChild(ta);
      return ok;
    } catch (e) {
      return false;
    }
  }

  const isObject = v => v && typeof v === 'object' && !Array.isArray(v);
  const isScalar = v => (v === null) || (typeof v !== 'object');
  const isValidIdent = k => /^[A-Za-z_][A-Za-z0-9_]*$/.test(k);
  const esc = s => String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');

  function tokenToString(t) {
    if (t.t === 'key') {
      return isValidIdent(t.v) ? '.' + t.v : `['${t.v.replace(/'/g,"\\'")}']`;
    } else {
      return `[${t.v}]`;
    }
  }
  function tokensToPath(tokens, {stripLeadingDot=false} = {}) {
    if (!tokens || !tokens.length) return '';
    let s = tokens.map(tokenToString).join('');
    if (stripLeadingDot && s.startsWith('.')) s = s.slice(1);
    return s;
  }
  function tokensAfterFirstIndex(tokens) {
    const i = tokens.findIndex(t => t.t === 'index');
    if (i === -1) return null;
    return tokens.slice(i+1);
  }
  function buildTag(tokens) {
    const prefix = prefixSelect.value.trim();
    const base = tokensToPath(tokens, {stripLeadingDot: true});
    const fb = fallbackInput.value.trim();
    let core = (prefix ? `${prefix}.` : '') + base;
    let tag = `[[ ${core} ]]`;
    if (fb) tag = `[[ ${core} | default: '${fb.replace(/'/g,"\\'")}' ]]`;
    return tag;
  }
  function buildDynamicAliasTag(tokens) {
    const after = tokensAfterFirstIndex(tokens);
    if (!after) return null;
    const inner = tokensToPath(after, {stripLeadingDot: true});
    const fb = fallbackInput.value.trim();
    let tag = `[[ item.${inner} ]]`;
    if (fb) tag = `[[ item.${inner} | default: '${fb.replace(/'/g,"\\'")}' ]]`;
    return tag;
  }
  function summarize(val) {
    if (isScalar(val)) return JSON.stringify(val);
    if (Array.isArray(val)) return `Array(${val.length})`;
    return `Object(${Object.keys(val).length})`;
  }

  function makeNode(label, value, tokens, depth=1) {
    const li = document.createElement('li');
    li.className = 'collapsed';
    li.setAttribute('role', 'treeitem');
    li.setAttribute('aria-level', String(depth));
    li.setAttribute('aria-selected', 'false');

    const expandable = !isScalar(value);
    li.setAttribute('aria-expanded', expandable ? 'false' : 'true');

    const node = document.createElement('div');
    node.className = 'node';
    node.tabIndex = -1;

    const chev = document.createElement('span');
    chev.className = 'chev';
    chev.textContent = '▸';
    if (!expandable) chev.style.visibility = 'hidden';

    const k = document.createElement('span');
    k.className = 'k';
    k.innerHTML = esc(label);

    const meta = document.createElement('span');
    meta.className = 'meta';
    if (isScalar(value)) {
      li.classList.remove('collapsed');
      meta.textContent = summarize(value);
    } else if (Array.isArray(value)) {
      meta.textContent = `Array(${value.length})`;
    } else {
      meta.textContent = `Object(${Object.keys(value).length})`;
    }

    node.appendChild(chev);
    node.appendChild(k);
    node.appendChild(meta);
    li.appendChild(node);

    const ul = document.createElement('ul');
    ul.setAttribute('role', 'group');
    li.appendChild(ul);

    if (Array.isArray(value)) {
      value.forEach((v, idx) => {
        const childTokens = tokens.concat([{t:'index', v: idx}]);
        ul.appendChild(makeNode(`[${idx}]`, v, childTokens, depth+1));
        if (isScalar(v)) {
          leafIndex.push({ pathTokens: childTokens, pathStr: tokensToPath(childTokens, {stripLeadingDot:true}), type: typeof v, sample: v });
        }
      });
    } else if (isObject(value)) {
      Object.keys(value).sort().forEach(kkey => {
        const childTokens = tokens.concat([{t:'key', v: kkey}]);
        ul.appendChild(makeNode(kkey, value[kkey], childTokens, depth+1));
        if (isScalar(value[kkey])) {
          leafIndex.push({ pathTokens: childTokens, pathStr: tokensToPath(childTokens, {stripLeadingDot:true}), type: typeof value[kkey], sample: value[kkey] });
        }
      });
    }

    node.addEventListener('click', (e) => {
      e.stopPropagation();
      if (expandable) {
        const expanded = li.getAttribute('aria-expanded') === 'true';
        toggleExpand(li, !expanded);
      }
      selectNode(tokens, value, li);
      focusNode(node);
    });

    chev.addEventListener('click', (e) => {
      e.stopPropagation();
      if (expandable) {
        const expanded = li.getAttribute('aria-expanded') === 'true';
        toggleExpand(li, !expanded);
        focusNode(node);
      }
    });

    node.addEventListener('keydown', (e) => {
      const key = e.key;
      const current = li;
      switch (key) {
        case 'ArrowRight':
          e.preventDefault();
          if (expandable && current.classList.contains('collapsed')) {
            toggleExpand(current, true);
            focusNode(node);
          } else {
            const firstChild = current.querySelector(':scope > ul > li > .node');
            if (firstChild) firstChild.focus();
          }
          break;
        case 'ArrowLeft':
          e.preventDefault();
          if (expandable && !current.classList.contains('collapsed')) {
            toggleExpand(current, false);
            focusNode(node);
          } else {
            const parentLi = current.parentElement.closest('li[role="treeitem"]');
            if (parentLi) parentLi.querySelector(':scope > .node').focus();
          }
          break;
        case 'ArrowDown':
          e.preventDefault();
          focusNext(current)?.querySelector(':scope > .node')?.focus();
          break;
        case 'ArrowUp':
          e.preventDefault();
          focusPrev(current)?.querySelector(':scope > .node')?.focus();
          break;
        case 'Home':
          e.preventDefault();
          treeEl.querySelector('li[role="treeitem"] > .node')?.focus();
          break;
        case 'End':
          e.preventDefault();
          const all = [...treeEl.querySelectorAll('li[role="treeitem"]')];
          if (all.length) all[all.length - 1].querySelector(':scope > .node').focus();
          break;
        case 'Enter':
        case ' ':
          e.preventDefault();
          if (expandable) toggleExpand(current, current.classList.contains('collapsed'));
          selectNode(tokens, value, li);
          break;
      }
    });

    return li;
  }

  function focusNode(nodeEl) {
    treeEl.querySelectorAll('.node[tabindex="0"]').forEach(n => n.tabIndex = -1);
    nodeEl.tabIndex = 0;
    nodeEl.focus();
  }

  function toggleExpand(li, expand=true) {
    if (expand) {
      li.classList.remove('collapsed');
      li.setAttribute('aria-expanded', 'true');
    } else {
      li.classList.add('collapsed');
      li.setAttribute('aria-expanded', 'false');
    }
  }

  function focusNext(li) {
    const items = [...treeEl.querySelectorAll('li[role="treeitem"]')];
    const i = items.indexOf(li);
    if (i >= 0 && i < items.length - 1) return items[i+1];
    return null;
  }
  function focusPrev(li) {
    const items = [...treeEl.querySelectorAll('li[role="treeitem"]')];
    const i = items.indexOf(li);
    if (i > 0) return items[i-1];
    return null;
  }

  function selectNode(tokens, value, liEl) {
    treeEl.querySelectorAll('li[role="treeitem"]').forEach(el => {
      el.classList.remove('selected');
      el.setAttribute('aria-selected', 'false');
    });
    liEl.classList.add('selected');
    liEl.setAttribute('aria-selected', 'true');

    lastTokens = tokens;

    const path = tokensToPath(tokens, {stripLeadingDot:true});
    selMeta.innerHTML = `Path: <code>${esc(path)}</code> · Type: <b>${Array.isArray(value) ? 'array' : (isObject(value) ? 'object' : typeof value)}</b>`;
    dotPathEl.textContent = path;
    tagEl.textContent = buildTag(tokens);
    previewEl.textContent = summarize(value);
    out.style.display = 'grid';

    const dyn = buildDynamicAliasTag(tokens);
    if (dyn) {
      dynBox.style.display = '';
      dynTagEl.textContent = dyn;
    } else {
      dynBox.style.display = 'none';
      dynTagEl.textContent = '';
    }
  }

  function buildTree(data) {
    treeEl.innerHTML = '';
    leafIndex = [];
    const rootUl = document.createElement('ul');
    rootUl.setAttribute('role', 'group');
    treeEl.appendChild(rootUl);

    if (Array.isArray(data)) {
      const li = makeNode('root[]', data, []);
      li.classList.remove('collapsed');
      li.setAttribute('aria-expanded','true');
      rootUl.appendChild(li);
      setTimeout(()=> li.querySelector(':scope > .node').tabIndex = 0, 0);
    } else if (isObject(data)) {
      const li = makeNode('root', data, []);
      li.classList.remove('collapsed');
      li.setAttribute('aria-expanded','true');
      rootUl.appendChild(li);
      setTimeout(()=> li.querySelector(':scope > .node').tabIndex = 0, 0);
    } else {
      const li = document.createElement('li');
      li.setAttribute('role','treeitem');
      li.setAttribute('aria-level','1');
      li.innerHTML = `<div class="node leaf" tabindex="0"><span class="chev" style="visibility:hidden">•</span><span class="k">root</span><span class="meta">${summarize(data)}</span></div>`;
      rootUl.appendChild(li);
    }
  }

  function tryParse() {
    const txt = input.value.trim();
    if (!txt) { announce('Paste JSON first', true); return; }
    try {
      const data = JSON.parse(txt);
      rootData = data;
      buildTree(data);
      out.style.display = 'none';
      resultsEl.innerHTML = '';
      announce('JSON parsed ✓');
      const first = treeEl.querySelector('.node');
      if (first) focusNode(first);
    } catch (err) {
      announce('Invalid JSON: ' + err.message, true);
      out.style.display = 'none';
      treeEl.innerHTML = '';
    }
  }

  document.addEventListener('click', async (e) => {
    const btn = e.target.closest('.copy');
    if (!btn) return;
    const targetId = btn.getAttribute('data-copy');
    const el = targetId ? document.getElementById(targetId) : null;
    const text = el ? el.textContent : '';
    if (!text) return;
    const ok = await copyToClipboard(text);
    const original = btn.textContent;
    btn.textContent = ok ? 'Copied!' : 'Copy failed';
    copyStatus.textContent = ok
      ? `${btn.getAttribute('aria-label') || 'Copied value'} to clipboard.`
      : `Unable to copy. You can select the text and press ⌘/Ctrl+C.`;
    setTimeout(() => { btn.textContent = original; }, 1200);
  });

  searchBox.addEventListener('input', () => {
    const q = searchBox.value.trim().toLowerCase();
    resultsEl.innerHTML = '';
    if (!q || !leafIndex.length) return;
    const hits = leafIndex.filter(p => p.pathStr.toLowerCase().includes(q)).slice(0, 50);
    for (const h of hits) {
      const div = document.createElement('div');
      div.className = 'hit';
      div.setAttribute('role','option');
      div.setAttribute('tabindex','0');
      div.innerHTML = `<span class="pill">${esc(typeof h.sample)}</span> <code>${esc(h.pathStr)}</code> <span class="pill">${esc(summarize(h.sample))}</span>`;
      const choose = () => {
        selectNode(h.pathTokens, h.sample, treeEl.querySelector('li.selected') || document.createElement('li'));
        dotPathEl.scrollIntoView({behavior:'smooth', block:'center'});
      };
      div.addEventListener('click', choose);
      div.addEventListener('keydown', (e)=>{ if(e.key==='Enter' || e.key===' ') { e.preventDefault(); choose(); }});
      resultsEl.appendChild(div);
    }
  });

  expandAllBtn.addEventListener('click', () => {
    treeEl.querySelectorAll('li.collapsed').forEach(li => {
      li.classList.remove('collapsed');
      li.setAttribute('aria-expanded','true');
    });
  });

  [prefixSelect, fallbackInput].forEach(el => el.addEventListener('input', () => {
    if (!lastTokens) return;
    tagEl.textContent = buildTag(lastTokens);
    const dyn = buildDynamicAliasTag(lastTokens);
    if (dyn) {
      dynBox.style.display = '';
      dynTagEl.textContent = dyn;
    } else {
      dynBox.style.display = 'none';
      dynTagEl.textContent = '';
    }
  }));

  parseBtn.addEventListener('click', tryParse);
  clearBtn.addEventListener('click', () => {
    input.value = '';
    treeEl.innerHTML = '';
    resultsEl.innerHTML = '';
    out.style.display = 'none';
    announce('Cleared');
    searchBox.value = '';
  });

  contrastBtn.addEventListener('click', () => {
    const on = bodyEl.classList.toggle('contrast-boost');
    contrastBtn.setAttribute('aria-pressed', on ? 'true' : 'false');
  });

  input.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault(); tryParse();
    }
  });
})();
