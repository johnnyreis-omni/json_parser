(() => {
  const input = document.getElementById('jsonInput');
  const parseBtn = document.getElementById('parseBtn');
  const clearBtn = document.getElementById('clearBtn');
  const treeEl = document.getElementById('tree');
  const out = document.getElementById('out');
  const tagEl = document.getElementById('tag');
  const previewEl = document.getElementById('preview');
  const prefixSelect = document.getElementById('prefixSelect');
  const fallbackInput = document.getElementById('fallbackInput');
  const searchBox = document.getElementById('searchBox');
  const resultsEl = document.getElementById('results');
  const expandAllBtn = document.getElementById('expandAll');
  const liveStatus = document.getElementById('live-status');
  const copyStatus = document.getElementById('copy-status');
  const themeBtn = document.getElementById('themeBtn');

  let leafIndex = [];
  let nodeIndex = new Map();
  let lastTokens = null;

  function announce(msg, isError = false) {
    if (!liveStatus) return;

    liveStatus.textContent = msg;
    liveStatus.style.whiteSpace = msg.includes('\n') ? 'pre-wrap' : '';

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
  const isScalar = v => v === null || typeof v !== 'object';
  const isValidIdent = k => /^[A-Za-z_][A-Za-z0-9_]*$/.test(k);
  const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  function tokenToString(t) {
    return t.t === 'key'
      ? isValidIdent(t.v)
        ? '.' + t.v
        : `['${t.v.replace(/'/g, "\\'")}']`
      : `[${t.v}]`;
  }

  function tokensToPath(tokens, { stripLeadingDot = false } = {}) {
    if (!tokens || !tokens.length) return '';

    let s = tokens.map(tokenToString).join('');

    if (stripLeadingDot && s.startsWith('.')) {
      s = s.slice(1);
    }

    return s;
  }

  function buildTag(tokens) {
    const prefix = prefixSelect.value.trim();
    const base = tokensToPath(tokens, { stripLeadingDot: true });
    const fb = fallbackInput.value.trim();

    let core = (prefix ? `${prefix}.` : '') + base;
    let tag = `[[ ${core} ]]`;

    if (fb) {
      tag = `[[ ${core} | default: '${fb.replace(/'/g, "\\'")}' ]]`;
    }

    return tag;
  }

  function summarize(val) {
    if (isScalar(val)) return JSON.stringify(val);
    if (Array.isArray(val)) return `Array(${val.length})`;
    return `Object(${Object.keys(val).length})`;
  }

  function printableChar(ch) {
    if (ch === undefined) return 'end of input';
    if (ch === '\n') return '\\n';
    if (ch === '\r') return '\\r';
    if (ch === '\t') return '\\t';
    return ch;
  }

  function getJsonLocation(text, position) {
    const pos = Math.max(0, Math.min(position, text.length));

    let line = 1;
    let column = 1;
    let lineStart = 0;

    for (let i = 0; i < pos; i++) {
      if (text[i] === '\r') {
        if (text[i + 1] === '\n' && i + 1 < pos) i++;
        line++;
        column = 1;
        lineStart = i + 1;
      } else if (text[i] === '\n') {
        line++;
        column = 1;
        lineStart = i + 1;
      } else {
        column++;
      }
    }

    const nextNewline = text.indexOf('\n', lineStart);
    const nextCarriage = text.indexOf('\r', lineStart);

    let lineEnd;

    if (nextNewline === -1 && nextCarriage === -1) {
      lineEnd = text.length;
    } else if (nextNewline === -1) {
      lineEnd = nextCarriage;
    } else if (nextCarriage === -1) {
      lineEnd = nextNewline;
    } else {
      lineEnd = Math.min(nextNewline, nextCarriage);
    }

    const lineText = text.slice(lineStart, lineEnd);

    return { line, column, lineText };
  }

  function formatJsonError(text, error) {
    const loc = getJsonLocation(text, error.position);

    const maxPreviewLength = 140;
    let preview = loc.lineText;
    let pointerColumn = loc.column;

    if (preview.length > maxPreviewLength) {
      const start = Math.max(0, loc.column - 70);
      const end = Math.min(preview.length, start + maxPreviewLength);

      preview = `${start > 0 ? '…' : ''}${preview.slice(start, end)}${end < loc.lineText.length ? '…' : ''}`;
      pointerColumn = loc.column - start + (start > 0 ? 1 : 0);
    }

    const safePreview = preview || '(empty line)';
    const pointer = `${' '.repeat(Math.max(pointerColumn - 1, 0))}^`;

    return `Invalid JSON at line ${loc.line}, column ${loc.column}: ${error.message}\n${safePreview}\n${pointer}`;
  }

  function selectJsonErrorPosition(position) {
    const pos = Math.max(0, Math.min(position, input.value.length));

    input.focus();

    try {
      input.setSelectionRange(pos, Math.min(pos + 1, input.value.length));
    } catch (e) {}
  }

  function getJsonSyntaxError(text) {
    let pos = 0;
    const len = text.length;

    const isWhitespace = ch => ch === ' ' || ch === '\n' || ch === '\r' || ch === '\t';
    const isDigit = ch => ch >= '0' && ch <= '9';
    const isDigitOneToNine = ch => ch >= '1' && ch <= '9';
    const isHex = ch => /^[0-9a-fA-F]$/.test(ch || '');

    function skipWhitespace() {
      while (pos < len && isWhitespace(text[pos])) pos++;
    }

    function fail(message, at = pos) {
      return {
        message,
        position: Math.max(0, Math.min(at, len))
      };
    }

    function parseLiteral(literal) {
      for (let i = 0; i < literal.length; i++) {
        if (text[pos + i] !== literal[i]) {
          return fail(`Invalid literal. Expected "${literal}".`, pos + i);
        }
      }

      pos += literal.length;
      return null;
    }

    function parseString() {
      if (text[pos] !== '"') {
        return fail('Expected a double-quoted string.');
      }

      pos++;

      while (pos < len) {
        const ch = text[pos];

        if (ch === '"') {
          pos++;
          return null;
        }

        if (ch === '\\') {
          const slashPos = pos;
          pos++;

          if (pos >= len) {
            return fail('Unterminated escape sequence in string.', slashPos);
          }

          const escaped = text[pos];

          if ('"\\/bfnrt'.includes(escaped)) {
            pos++;
            continue;
          }

          if (escaped === 'u') {
            pos++;

            for (let i = 0; i < 4; i++) {
              if (!isHex(text[pos + i])) {
                return fail('Invalid unicode escape. Expected four hexadecimal characters after "\\u".', pos + i);
              }
            }

            pos += 4;
            continue;
          }

          return fail(`Invalid escape character "\\${printableChar(escaped)}".`, pos);
        }

        if (ch === '\n' || ch === '\r') {
          return fail('Unescaped line break inside string. Use "\\n" instead.', pos);
        }

        if (ch.charCodeAt(0) < 0x20) {
          return fail('Invalid control character inside string.', pos);
        }

        pos++;
      }

      return fail('Unterminated string. Expected closing double quote.', pos);
    }

    function parseNumber() {
      if (text[pos] === '-') {
        pos++;

        if (pos >= len) {
          return fail('Expected a digit after "-".', pos);
        }
      }

      if (text[pos] === '0') {
        pos++;

        if (isDigit(text[pos])) {
          return fail('Leading zeroes are not allowed in JSON numbers.', pos);
        }
      } else if (isDigitOneToNine(text[pos])) {
        pos++;

        while (isDigit(text[pos])) pos++;
      } else {
        return fail('Expected a digit.', pos);
      }

      if (text[pos] === '.') {
        pos++;

        if (!isDigit(text[pos])) {
          return fail('Expected at least one digit after the decimal point.', pos);
        }

        while (isDigit(text[pos])) pos++;
      }

      if (text[pos] === 'e' || text[pos] === 'E') {
        pos++;

        if (text[pos] === '+' || text[pos] === '-') pos++;

        if (!isDigit(text[pos])) {
          return fail('Expected at least one digit in the exponent.', pos);
        }

        while (isDigit(text[pos])) pos++;
      }

      return null;
    }

    function parseArray() {
      pos++;
      skipWhitespace();

      if (text[pos] === ']') {
        pos++;
        return null;
      }

      while (pos < len) {
        const valueError = parseValue();
        if (valueError) return valueError;

        skipWhitespace();

        if (text[pos] === ',') {
          const commaPos = pos;
          pos++;
          skipWhitespace();

          if (text[pos] === ']') {
            return fail('Trailing comma found. Remove the comma before "]".', commaPos);
          }

          continue;
        }

        if (text[pos] === ']') {
          pos++;
          return null;
        }

        if (pos >= len) {
          return fail('Expected "," or "]" before the end of the input.', pos);
        }

        return fail(`Expected "," or "]", but found "${printableChar(text[pos])}".`, pos);
      }

      return fail('Expected "]" before the end of the input.', pos);
    }

    function parseObject() {
      pos++;
      skipWhitespace();

      if (text[pos] === '}') {
        pos++;
        return null;
      }

      while (pos < len) {
        skipWhitespace();

        if (text[pos] !== '"') {
          return fail('Expected a double-quoted property name.', pos);
        }

        const keyError = parseString();
        if (keyError) return keyError;

        skipWhitespace();

        if (text[pos] !== ':') {
          return fail('Expected ":" after property name.', pos);
        }

        pos++;

        const valueError = parseValue();
        if (valueError) return valueError;

        skipWhitespace();

        if (text[pos] === ',') {
          const commaPos = pos;
          pos++;
          skipWhitespace();

          if (text[pos] === '}') {
            return fail('Trailing comma found. Remove the comma before "}".', commaPos);
          }

          continue;
        }

        if (text[pos] === '}') {
          pos++;
          return null;
        }

        if (pos >= len) {
          return fail('Expected "," or "}" before the end of the input.', pos);
        }

        return fail(`Expected "," or "}", but found "${printableChar(text[pos])}".`, pos);
      }

      return fail('Expected "}" before the end of the input.', pos);
    }

    function parseValue() {
      skipWhitespace();

      if (pos >= len) {
        return fail('Expected a JSON value, but reached the end of the input.', pos);
      }

      const ch = text[pos];

      if (ch === '{') return parseObject();
      if (ch === '[') return parseArray();
      if (ch === '"') return parseString();
      if (ch === '-' || isDigit(ch)) return parseNumber();
      if (ch === 't') return parseLiteral('true');
      if (ch === 'f') return parseLiteral('false');
      if (ch === 'n') return parseLiteral('null');

      return fail(`Unexpected "${printableChar(ch)}". Expected object, array, string, number, true, false, or null.`, pos);
    }

    skipWhitespace();

    if (pos >= len) {
      return fail('Paste JSON first.', pos);
    }

    const valueError = parseValue();
    if (valueError) return valueError;

    skipWhitespace();

    if (pos < len) {
      return fail(`Unexpected content after the JSON document: "${printableChar(text[pos])}".`, pos);
    }

    return null;
  }

  function makeNode(label, value, tokens, depth = 1) {
    const li = document.createElement('li');
    const pathStr = tokensToPath(tokens, { stripLeadingDot: true });

    li.className = 'collapsed';
    li.setAttribute('role', 'treeitem');
    li.setAttribute('aria-level', String(depth));
    li.setAttribute('aria-selected', 'false');
    li.dataset.path = pathStr;
    nodeIndex.set(pathStr, li);

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
        const childTokens = tokens.concat([{ t: 'index', v: idx }]);
        ul.appendChild(makeNode(`[${idx}]`, v, childTokens, depth + 1));

        if (isScalar(v)) {
          leafIndex.push({
            pathTokens: childTokens,
            pathStr: tokensToPath(childTokens, { stripLeadingDot: true }),
            type: typeof v,
            sample: v
          });
        }
      });
    } else if (isObject(value)) {
      Object.keys(value).sort().forEach(kkey => {
        const childTokens = tokens.concat([{ t: 'key', v: kkey }]);
        ul.appendChild(makeNode(kkey, value[kkey], childTokens, depth + 1));

        if (isScalar(value[kkey])) {
          leafIndex.push({
            pathTokens: childTokens,
            pathStr: tokensToPath(childTokens, { stripLeadingDot: true }),
            type: typeof value[kkey],
            sample: value[kkey]
          });
        }
      });
    }

    node.addEventListener('click', e => {
      e.stopPropagation();

      if (expandable) {
        const expanded = li.getAttribute('aria-expanded') === 'true';
        toggleExpand(li, !expanded);
      }

      selectNode(tokens, value, li);
      focusNode(node);
    });

    chev.addEventListener('click', e => {
      e.stopPropagation();

      if (expandable) {
        const expanded = li.getAttribute('aria-expanded') === 'true';
        toggleExpand(li, !expanded);
        focusNode(node);
      }
    });

    node.addEventListener('keydown', e => {
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

          if (expandable) {
            toggleExpand(current, current.classList.contains('collapsed'));
          }

          selectNode(tokens, value, li);
          break;
      }
    });

    return li;
  }

  function focusNode(nodeEl) {
    treeEl.querySelectorAll('.node[tabindex="0"]').forEach(n => {
      n.tabIndex = -1;
    });

    nodeEl.tabIndex = 0;
    nodeEl.focus();
  }

  function toggleExpand(li, expand = true) {
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
    return i >= 0 && i < items.length - 1 ? items[i + 1] : null;
  }

  function focusPrev(li) {
    const items = [...treeEl.querySelectorAll('li[role="treeitem"]')];
    const i = items.indexOf(li);
    return i > 0 ? items[i - 1] : null;
  }

  function selectNode(tokens, value, liEl) {
    treeEl.querySelectorAll('li[role="treeitem"]').forEach(el => {
      el.classList.remove('selected');
      el.setAttribute('aria-selected', 'false');
    });

    liEl.classList.add('selected');
    liEl.setAttribute('aria-selected', 'true');

    lastTokens = tokens;

    tagEl.textContent = buildTag(tokens);
    previewEl.textContent = summarize(value);
    out.style.display = 'grid';

    out.classList.add('animate-pop');
    setTimeout(() => out.classList.remove('animate-pop'), 220);
  }

  function getTreeItemByTokens(tokens) {
    const path = tokensToPath(tokens, { stripLeadingDot: true });
    return nodeIndex.get(path) || null;
  }

  function revealTreeItem(tokens) {
    const targetLi = getTreeItemByTokens(tokens);
    if (!targetLi) return null;

    let parent = targetLi.parentElement.closest('li[role="treeitem"]');

    while (parent) {
      toggleExpand(parent, true);
      parent = parent.parentElement.closest('li[role="treeitem"]');
    }

    toggleExpand(targetLi, true);

    return targetLi;
  }

  function buildTree(data) {
    treeEl.innerHTML = '';
    leafIndex = [];
    nodeIndex = new Map();
    lastTokens = null;

    const rootUl = document.createElement('ul');
    rootUl.setAttribute('role', 'group');
    treeEl.appendChild(rootUl);

    if (Array.isArray(data)) {
      const li = makeNode('root[]', data, []);
      li.classList.remove('collapsed');
      li.setAttribute('aria-expanded', 'true');
      rootUl.appendChild(li);

      setTimeout(() => {
        li.querySelector(':scope > .node').tabIndex = 0;
      }, 0);
    } else if (isObject(data)) {
      const li = makeNode('root', data, []);
      li.classList.remove('collapsed');
      li.setAttribute('aria-expanded', 'true');
      rootUl.appendChild(li);

      setTimeout(() => {
        li.querySelector(':scope > .node').tabIndex = 0;
      }, 0);
    } else {
      const li = document.createElement('li');
      li.setAttribute('role', 'treeitem');
      li.setAttribute('aria-level', '1');
      li.setAttribute('aria-selected', 'false');
      li.dataset.path = '';
      li.innerHTML = `<div class="node" tabindex="0"><span class="chev" style="visibility:hidden">•</span><span class="k">root</span><span class="meta">${summarize(data)}</span></div>`;
      rootUl.appendChild(li);
      nodeIndex.set('', li);
    }
  }

  function clearOutput() {
    out.style.display = 'none';
    treeEl.innerHTML = '';
    resultsEl.innerHTML = '';
    leafIndex = [];
    nodeIndex = new Map();
    lastTokens = null;
  }

  function tryParse({ auto = false } = {}) {
    const txt = input.value;

    if (!txt.trim()) {
      announce('Paste JSON first', true);
      return;
    }

    const syntaxError = getJsonSyntaxError(txt);

    if (syntaxError) {
      announce(formatJsonError(txt, syntaxError), true);
      selectJsonErrorPosition(syntaxError.position);
      clearOutput();
      return;
    }

    try {
      const data = JSON.parse(txt);

      buildTree(data);

      out.style.display = 'none';
      resultsEl.innerHTML = '';

      announce(auto ? 'Valid JSON pasted and parsed ✓' : 'JSON parsed ✓');

      const first = treeEl.querySelector('.node');
      if (first) first.focus();
    } catch (err) {
      announce('Invalid JSON: ' + err.message, true);
      clearOutput();
    }
  }

  document.addEventListener('click', async e => {
    const btn = e.target.closest('.copy');
    if (!btn) return;

    const targetId = btn.getAttribute('data-copy');
    const el = targetId ? document.getElementById(targetId) : null;
    const text = el ? el.textContent : '';

    if (!text) return;

    const ok = await copyToClipboard(text);
    const original = btn.textContent;

    btn.textContent = ok ? 'Copied!' : 'Copy failed';
    btn.classList.add('animate-pop');

    setTimeout(() => btn.classList.remove('animate-pop'), 220);

    if (copyStatus) {
      copyStatus.textContent = ok
        ? `${btn.getAttribute('aria-label') || 'Copied value'} to clipboard.`
        : 'Unable to copy. You can select the text and press ⌘/Ctrl+C.';
    }

    setTimeout(() => {
      btn.textContent = original;
    }, 1200);
  });

  searchBox.addEventListener('input', () => {
    const q = searchBox.value.trim().toLowerCase();

    resultsEl.innerHTML = '';

    if (!q || !leafIndex.length) return;

    const hits = [];

    for (const p of leafIndex) {
      const keyHit = p.pathStr.toLowerCase().includes(q);
      const valStr = p.sample === null ? 'null' : String(p.sample);
      const valHit = valStr.toLowerCase().includes(q);

      if (keyHit || valHit) hits.push({ ...p, keyHit, valStr });
      if (hits.length >= 100) break;
    }

    for (const h of hits) {
      const div = document.createElement('div');

      div.className = 'hit rounded-lg px-2 py-2 text-sm transition hover:bg-sky-500/10 cursor-pointer flex items-center gap-2';
      div.setAttribute('role', 'option');
      div.setAttribute('tabindex', '0');

      const badge = h.keyHit ? 'key' : 'value';

      div.innerHTML = `
        <span style="font-size:.7rem;color:var(--muted);border:1px solid rgba(148,163,184,.25);border-radius:999px;padding:0 .5rem">${badge}</span>
        <code>${esc(h.pathStr)}</code>
        <span style="font-size:.7rem;color:var(--muted);border:1px solid rgba(148,163,184,.25);border-radius:999px;padding:0 .5rem;max-width:50%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(h.valStr)}</span>
      `;

      const choose = () => {
        const targetLi = revealTreeItem(h.pathTokens);

        if (targetLi) {
          selectNode(h.pathTokens, h.sample, targetLi);

          const nodeEl = targetLi.querySelector(':scope > .node');

          if (nodeEl) {
            focusNode(nodeEl);

            nodeEl.scrollIntoView({
              behavior: 'smooth',
              block: 'center'
            });
          }
        } else {
          tagEl.textContent = buildTag(h.pathTokens);
          previewEl.textContent = summarize(h.sample);
          out.style.display = 'grid';
        }
      };

      div.addEventListener('click', choose);

      div.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          choose();
        }
      });

      resultsEl.appendChild(div);
    }
  });

  expandAllBtn.addEventListener('click', () => {
    treeEl.querySelectorAll('li.collapsed').forEach(li => {
      li.classList.remove('collapsed');
      li.setAttribute('aria-expanded', 'true');
    });
  });

  [prefixSelect, fallbackInput].forEach(el =>
    el.addEventListener('input', () => {
      if (!lastTokens) return;
      tagEl.textContent = buildTag(lastTokens);
    })
  );

  parseBtn.addEventListener('click', () => tryParse());

  clearBtn.addEventListener('click', () => {
    input.value = '';
    searchBox.value = '';
    clearOutput();
    announce('Cleared');
  });

  themeBtn.addEventListener('click', () => {
    const root = document.documentElement;
    const nowDark = root.classList.toggle('dark');

    localStorage.setItem('theme', nowDark ? 'dark' : 'light');

    const sun = document.getElementById('iconSun');
    const moon = document.getElementById('iconMoon');

    sun.classList.toggle('hidden', nowDark);
    moon.classList.toggle('hidden', !nowDark);

    themeBtn.classList.add('animate-pop');
    setTimeout(() => themeBtn.classList.remove('animate-pop'), 220);
  });

  input.addEventListener('paste', () => {
    setTimeout(() => {
      if (!input.value.trim()) return;
      tryParse({ auto: true });
    }, 0);
  });

  input.addEventListener('keydown', e => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      tryParse();
    }
  });
})();
