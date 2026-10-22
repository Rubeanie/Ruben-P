import { codeToHtml } from 'shiki';
import { stegaClean } from '@sanity/client/stega';
import CopyButton from './CopyButton';
import WrapButton from './WrapButton';
import styles from '@/styles/components/RichText.module.scss';

// Shiki inlines its theme background on <pre>; the plate under it is ours.
// It also separates lines with newline text nodes, which select as a visible
// block at each line end; the lines are blocks instead, so selections and the
// clipboard still break where the code does. The <code> is the scroller here,
// so it takes the keyboard focus Shiki puts on the <pre>.
const dropBackground = {
  pre(node) {
    node.properties.style = String(node.properties.style ?? '').replace(
      /background-color:[^;]*;?/g,
      ''
    );
    delete node.properties.tabindex;
  },
  code(node) {
    node.properties.tabindex = 0;
    node.children = node.children.filter(
      (child) => !(child.type === 'text' && !child.value.trim())
    );
    // A blank line needs a character, or it has no height and drops out of copied selections.
    for (const line of node.children)
      if (line.children.length === 0)
        line.children.push({ type: 'text', value: ' ' });
  }
};

// Each line carries its own indent, so a wrapped row hangs past it the way an
// editor's does (tabs stop every two columns, as tab-size does).
const indentLines = (rows) => ({
  line(node, line) {
    const lead = rows[line - 1].match(/^[ \t]*/)[0];
    const indent = [...lead].reduce(
      (column, char) =>
        char === '\t' ? column + 2 - (column % 2) : column + 1,
      0
    );
    if (indent) node.properties.style = `--indent:${indent}ch`;
  }
});

// Shiki knows these under other names.
const alias = { golang: 'go', mysql: 'sql', batchfile: 'bat' };

async function highlight(code, lang) {
  const options = {
    theme: 'github-dark-high-contrast',
    transformers: [dropBackground, indentLines(code.split('\n'))]
  };
  try {
    return await codeToHtml(code, { ...options, lang: alias[lang] ?? lang });
  } catch {
    return codeToHtml(code, { ...options, lang: 'text' });
  }
}

export default async function Code({ value, sanity }) {
  const code = stegaClean(value?.code);
  if (!code) return null;

  const lang = stegaClean(value.language) || 'text';
  const html = await highlight(code, lang);

  const filename = stegaClean(value.filename) || '';
  const cut = filename.lastIndexOf('/');
  const dir = cut > -1 ? filename.slice(0, cut + 1) : '';
  const base = cut > -1 ? filename.slice(cut + 1) : filename;

  // Short snippets read as noise with a gutter beside them.
  const lines = code.split('\n').length;
  const noGutter = lines < 4;

  return (
    <div
      className={`${styles.code}${noGutter ? ` ${styles.codeNoGutter}` : ''}`}
      // The gutter grows with the widest line number.
      style={{ '--gutter': `${Math.max(2, String(lines).length)}ch` }}
      {...(sanity && { 'data-sanity': sanity })}>
      <div className={styles.codeHeader}>
        {filename ? (
          <span className={styles.codeName}>
            {dir && <span className={styles.codePath}>{dir}</span>}
            {base}
          </span>
        ) : (
          <span className={styles.codeLang}>{lang}</span>
        )}
        <div className={styles.codeActions}>
          <WrapButton />
          <CopyButton code={code} />
        </div>
      </div>
      {/* Shiki escapes the source it highlights, so its output is trusted. */}
      <div
        className={styles.codeBody}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  );
}
