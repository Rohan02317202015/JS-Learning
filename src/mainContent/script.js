// Module script extracted from content.html

// Read query params to populate template
function getQuery() {
  const params = new URLSearchParams(window.location.search);
  return {
    pattern: params.get('pattern') || 'Unknown Pattern',
    category: params.get('category') || 'Unspecified Category'
  };
}

function renderList(container, items) {
  container.innerHTML = '';
  const ul = document.createElement('ul');
  items.forEach(item => {
    const li = document.createElement('li');
    li.textContent = item;
    ul.appendChild(li);
  });
  container.appendChild(ul);
}

async function loadSnippet(data) {
  if (data && data.snippet) return data.snippet;
  if (data && data.snippetPath) {
    // normalize path: remove leading 'src/' or leading slash
    let rel = data.snippetPath.replace(/^src\//, '').replace(/^\//, '');

    // If we're inside the mainContent folder, adjust path to reach src root
    if (location.pathname.includes('/mainContent/')) {
      rel = '../' + rel;
    }

    try {
      const res = await fetch(rel);
      if (!res.ok) throw new Error(res.status + ' ' + res.statusText);
      const contentType = res.headers.get('content-type') || '';
      const text = await res.text();

      // If HTML, parse and extract a snippet element (prefer #snippet, then <pre>, then <code>)
      if (contentType.includes('html') || text.trim().startsWith('<')) {
        const doc = new DOMParser().parseFromString(text, 'text/html');
        const sel = doc.querySelector('#snippet') || doc.querySelector('pre') || doc.querySelector('code') || doc.body;
        return sel ? sel.textContent.trim() : text;
      }

      // For JS/plain text, return raw text
      return text;
    } catch (err) {
      return `// Unable to load snippet (${rel}): ${err.message}`;
    }
  }
  return '// No snippet available';
}

async function loadExample(data) {
  if (!data || !data.example) return { text: 'No example specified' };

  const s = String(data.example).trim();
  const looksLikePath = /\.(html?|htm)$/i.test(s) || s.includes('/') || s.startsWith('src/') || s.startsWith('./') || s.startsWith('../');

  // If not a path, treat as inline HTML/text
  if (!looksLikePath) {
    if (/<\/?[a-z][\s\S]*>/i.test(s)) {
      const doc = new DOMParser().parseFromString(s, 'text/html');
      doc.querySelectorAll('script').forEach(n => n.remove());
      return { html: doc.body.innerHTML };
    }
    return { text: s };
  }

  // Build candidate paths to resolve the file URL
  const raw = s.replace(/^\//, '');
  const withoutSrc = raw.replace(/^src\//, '');
  const candidates = [];
  if (/^https?:\/\//i.test(s)) candidates.push(s);
  candidates.push(s);
  if (withoutSrc !== s) candidates.push(withoutSrc);
  if (!s.startsWith('..')) candidates.push('../' + s);
  if (!withoutSrc.startsWith('..')) candidates.push('../' + withoutSrc);
  candidates.push('./' + withoutSrc);
  const uniq = [...new Set(candidates)];

  // Try candidates until one fetches successfully
  for (const c of uniq) {
    try {
      const res = await fetch(c);
      if (!res.ok) continue;
      const contentType = res.headers.get('content-type') || '';
      const finalUrl = res.url || (new URL(c, location.href)).href;

      // If HTML, load into an iframe to isolate styles/scripts
      if (contentType.includes('html') || /\.(html?|htm)$/i.test(finalUrl)) {
        const exampleContainer = document.getElementById('example');
        if (!exampleContainer) return { text: '// No example container found' };
        // clear
        exampleContainer.innerHTML = '';
        const iframe = document.createElement('iframe');
        iframe.src = finalUrl;
        iframe.style.width = '100%';
        iframe.style.height = data.exampleHeight || '480px';
        iframe.style.border = '0';
        iframe.setAttribute('loading', 'lazy');
        exampleContainer.appendChild(iframe);
        // wait for iframe load (best-effort)
        await new Promise(resolve => iframe.addEventListener('load', resolve, { once: true }));
        return { html: exampleContainer.innerHTML };
      }

      // otherwise treat as plain text
      const text = await res.text();
      const exampleContainer = document.getElementById('example');
      if (exampleContainer) exampleContainer.textContent = text;
      return { text };
    } catch (err) {
      // try next candidate
    }
  }

  return { text: `// Unable to load example (tried: ${uniq.join(', ')})` };
}

async function renderScreen(){
 // ensure DOM is parsed before we query elements (script may be placed above content)
  if (document.readyState === 'loading') {
    await new Promise(resolve => document.addEventListener('DOMContentLoaded', resolve));
  }

  const q = getQuery();
  console.log('pattern query:', q);

  // Set title elements early so user sees pattern immediately
  document.getElementById('patternTitle').textContent = q.pattern;
  document.getElementById('patternMeta').textContent = q.category + ' • Content Page';

  // Try dynamic import so we can catch and show errors
  let contentMap;
  try {
    const mod = await import('../dataHolder/creationalContent.js');
    // support both default and named exports
    contentMap = mod.default || mod.contentMap || mod;
  } catch (err) {
    console.error('Failed to import content map:', err);
    document.getElementById('concept').textContent = 'Unable to load content data.';
    document.getElementById('application').textContent = '';
    document.getElementById('example').textContent = '';
    document.querySelector('#snippet code').textContent = `// Import error: ${err.message}`;
    return;
  }

  const data = contentMap[q.pattern];
  const codeEl = document.querySelector('#snippet code');

  if (!data) {
    document.getElementById('concept').textContent = 'Content coming soon for ' + q.pattern + '.';
    document.getElementById('application').textContent = '';
    document.getElementById('example').textContent = '';
    codeEl.textContent = '// No snippet available yet';
    document.title = q.pattern + ' — Design Patterns';
    return;
  }

  try {
    document.getElementById('concept').textContent = data.concept || '';

    const appEl = document.getElementById('application');
    if (Array.isArray(data.application)) {
      renderList(appEl, data.application);
    } else {
      appEl.textContent = data.application || '';
    }

    // clear existing example while we load the real content
    const exampleEl = document.getElementById('example');
    exampleEl.textContent = '';

    const snippetText = await loadSnippet(data);
    codeEl.textContent = snippetText;

    // load example (may be HTML) and render safely
    await loadExample(data);
    // if (exampleRes.html !== undefined) {
    //   exampleEl.innerHTML = exampleRes.html; // scripts removed by parser
    // } else {
    //   exampleEl.textContent = exampleRes.text || '';
    // }

    document.title = q.pattern + ' — Design Patterns';
  } catch (err) {
    console.error('Error rendering content:', err);
    document.getElementById('concept').textContent = 'Error rendering content.';
    codeEl.textContent = `// Render error: ${err.message}`;
  }
}


// Kick off rendering
renderScreen().catch(err => {
  console.error('Unexpected error during render:', err);

});
