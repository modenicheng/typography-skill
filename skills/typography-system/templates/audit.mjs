#!/usr/bin/env node
// =============================================================================
// typography audit — 保守的排版 token 守门脚本（零依赖 / Node 18+ / ESM）
//
// 目的：扫出「绕过排版 token、随手发明字号 / 字距 / 断行」的写法，给 CI 与编码 Agent 当守门人。
// 用法：node audit.mjs [路径...] [--json] [--max-warnings N] [--no-color] [--self-test]
// 抑制误报（写在违规行的上一行；可写多条规则，`*` 表示全部，缺省即全部）：
//   /* typography-audit-disable-next-line raw-font-size */
//   // typography-audit-disable-next-line uppercase, break-all
//   <!-- typography-audit-disable-next-line * -->
//   整文件豁免（文件前 3KB 内，用于规格页 / 历史遗留）：
//   /* typography-audit-disable-file */
// 保守原则（纯正则，不做 AST）：只报高置信度信号，宁可漏报也不要误报。
//   · 注释内容不扫描；@font-face 内的 font-family 是字体定义，放行；同一位置只保留一条。
//   · 能处理单行 CSS、SCSS 嵌套、以及 JS 模板字符串里的 CSS。
// 退出码：0 通过；1 有 error 或 warnings > --max-warnings；2 参数 / 路径错误。
// JSON：{ filesScanned, errors, warnings, findings:[{ id, severity, message, file, line, column, snippet }] }
// =============================================================================

import { readdirSync, readFileSync, statSync } from 'node:fs';
import { extname, join, relative, resolve, sep } from 'node:path';

const EXTENSIONS = new Set('.css .scss .sass .less .html .vue .svelte .jsx .tsx .js .ts .astro'.split(' '));
const SKIP_DIRS = new Set(['node_modules', '.git', 'dist', 'build', 'out', 'coverage', '.next', '.nuxt', 'vendor']);
const MINIFIED_FILE = /\.min\.[^./\\]+$/i;
const LINE_COMMENT_EXT = new Set('.js .ts .jsx .tsx .mjs .cjs .astro .scss .sass .less .vue .svelte'.split(' '));
const HTML_COMMENT_EXT = new Set(['.html', '.vue', '.svelte', '.astro']);
const INLINE_STYLE_EXT = new Set(['.jsx', '.tsx', '.vue', '.svelte']);
const CSS_WIDE = new Set(['inherit', 'initial', 'unset', 'revert']);
const SIZE_KEYWORD = new Set([...CSS_WIDE, '0', 'smaller', 'larger', 'xx-small', 'x-small', 'small',
  'medium', 'large', 'x-large', 'xx-large', 'xxx-large']);
// 裸长度：数字 + 单位，单位后面不再跟字母（避免命中 --text-13px 这类名字）
const LENGTH_UNIT = /\d\s*(?:px|rem|em|%|pt|pc|ex|ch|rlh|lh|vw|vh|vmin|vmax|dvh|svh|lvh|q|mm|cm|in)(?![a-z])/i;
const LETTER_UNIT = /\d(?:px|em|rem)\b/i;
const LETTER_ZERO = /^0(?:\.0+)?(?:px|em|rem|%)?$/i;
const LH_PX_STEPS = new Set([12, 16, 18, 20, 22, 24, 26, 28, 30, 32, 36, 40, 44, 48, 52, 56, 64]);
const DECL_RE = /(?<=^|[;{}\s])(font-size|font-family|font-weight|letter-spacing|line-height|word-break|text-transform|font)\s*:\s*([^;{}]*)/gi;
const TAILWIND_ARBITRARY_RE = /\b(?:text|leading|tracking)-\[[^\]]+\]/g;
const DISABLE_RE = /typography-audit-disable-next-line([\s\S]*)$/;
const FILE_DISABLE_RE = /typography-audit-disable-file/;
const BODY_SELECTOR_RE = /^(?:html\s+)?body(?:$|[\s:.[#])|^p(?:$|[\s:.[#])|^article(?:$|[\s:.[#])|\.prose(?![-\w])|\.content(?![-\w])|\.markdown-body(?![-\w])/;
const USAGE = [
  'typography audit — 保守的排版 token 守门脚本（零依赖，Node 18+）',
  '用法: node audit.mjs [路径...] [选项]    路径缺省为当前目录，目录递归',
  '扫描: .css .scss .sass .less .html .vue .svelte .jsx .tsx .js .ts .astro',
  '  --json            机器可读输出',
  '  --max-warnings N  warning 超过 N 个时退出码为 1（默认不限制）',
  '  --no-color        关闭 ANSI 颜色',
  '  --self-test       跑内置样例自检',
  '  -h, --help        显示本帮助',
].join('\n');

// --- 基础工具 ----------------------------------------------------------------

/** 把绝对偏移换算成 1 基的 line / column。 */
function makeLocator(text) {
  const starts = [0];
  for (let i = 0; i < text.length; i += 1) if (text.charCodeAt(i) === 10) starts.push(i + 1);
  return (index) => {
    let lo = 0; let hi = starts.length - 1;
    while (lo < hi) {
      const mid = (lo + hi + 1) >> 1;
      if (starts[mid] <= index) lo = mid; else hi = mid - 1;
    }
    return { line: lo + 1, column: index - starts[lo] + 1 };
  };
}

/** 注释替换成空格（保留换行与列位置），后续所有偏移因此和原文对齐。 */
function stripComments(text, ext) {
  const lineComments = LINE_COMMENT_EXT.has(ext);
  const htmlComments = HTML_COMMENT_EXT.has(ext);
  const out = text.split('');
  const n = text.length;
  const blank = (from, to) => { for (let k = from; k < to && k < n; k += 1) if (out[k] !== '\n') out[k] = ' '; };
  for (let i = 0; i < n; i += 1) {
    const ch = text[i];
    const next = text[i + 1];
    if (ch === '/' && next === '*') {
      let j = i + 2;
      while (j < n && !(text[j] === '*' && text[j + 1] === '/')) j += 1;
      blank(i, Math.min(j + 2, n));
      i = Math.min(j + 2, n);
      continue;
    }
    if (lineComments && ch === '/' && next === '/' && text[i - 1] !== ':') { // 不吞 https://
      let j = i;
      while (j < n && text[j] !== '\n') j += 1;
      blank(i, j);
      i = j;
      continue;
    }
    if (htmlComments && ch === '<' && text.startsWith('<!--', i)) {
      const end = text.indexOf('-->', i + 4);
      blank(i, end === -1 ? n : end + 3);
      i = end === -1 ? n : end + 3;
    }
  }
  return out.join('');
}

/** 把 style="..." / style='...' 的引号换成等长分号，使属性里的声明按普通声明参与扫描（列位置不变）。 */
function exposeStyleAttributes(text) {
  return text.replace(/(\bstyle\s*=\s*)(["'])([\s\S]*?)\2/gi, (_, head, _quote, body) => `${head};${body};`);
}

/** 解析 `{...}` 块，记录选择器（前导文本）与父子关系；引号里的花括号跳过，模板字符串照常解析。 */
function parseBlocks(masked) {
  const blocks = [];
  const stack = [];
  let seg = 0;
  for (let i = 0; i < masked.length; i += 1) {
    const ch = masked[i];
    if (ch === '"' || ch === "'") {
      let j = i + 1;
      while (j < masked.length && masked[j] !== ch) { if (masked[j] === '\\') j += 1; j += 1; }
      i = j;
      continue;
    }
    if (ch === '{') {
      const selector = masked.slice(seg, i).replace(/\s+/g, ' ').trim();
      const parent = stack.length ? stack[stack.length - 1] : -1;
      const inFontFace = /@font-face\b/i.test(selector) || (parent >= 0 && blocks[parent].inFontFace);
      blocks.push({ selector, start: i, end: masked.length, parent, inFontFace });
      stack.push(blocks.length - 1);
      seg = i + 1;
    } else if (ch === '}') {
      if (stack.length) blocks[stack.pop()].end = i;
      seg = i + 1;
    } else if (ch === ';') {
      seg = i + 1;
    }
  }
  return blocks;
}

/** 按偏移顺序查找最内层块（blocks 已按 start 升序，指针摊还 O(1)）。 */
function makeBlockLookup(blocks) {
  let p = 0;
  const active = [];
  return (index) => {
    while (p < blocks.length && blocks[p].start < index) {
      if (blocks[p].end > index) active.push(blocks[p]);
      p += 1;
    }
    while (active.length && active[active.length - 1].end <= index) active.pop();
    return active.length ? active[active.length - 1] : null;
  };
}

const normalizeValue = (raw) => raw.replace(/!\s*important/gi, '').replace(/\s+/g, ' ').trim();

/** 只对明显的正文选择器报 tight-leading，避免误报按钮 / 徽标这类紧凑排版。 */
function isBodyish(selector) {
  if (!selector) return false;
  return selector.split(',').some((part) => BODY_SELECTOR_RE.test(part.trim().toLowerCase()));
}

const snippetOf = (lines, line) => (lines[line - 1] || '').trim().slice(0, 200);
const compareFindings = (a, b) => (a.file < b.file ? -1 : a.file > b.file ? 1 : 0)
  || a.line - b.line || a.column - b.column || (a.id < b.id ? -1 : a.id > b.id ? 1 : 0);

/** 收集 `disable-next-line` 的目标行（1 基行号）-> 规则集合。 */
function parseSuppressions(lines) {
  const map = new Map();
  for (let i = 0; i < lines.length; i += 1) {
    const match = DISABLE_RE.exec(lines[i]);
    if (!match) continue;
    const tokens = match[1].replace(/-->/g, ' ').replace(/\*\//g, ' ').trim().split(/[,\s]+/)
      .filter((token) => token === '*' || /^[a-z][a-z-]*$/.test(token));
    const set = map.get(i + 2) || new Set();
    if (!tokens.length || tokens.includes('*')) set.add('*');
    for (const token of tokens) set.add(token);
    map.set(i + 2, set);
  }
  return map;
}

// --- 核心扫描 ----------------------------------------------------------------

function scanFile(text, file) {
  const ext = extname(file).toLowerCase();
  const src = text.replace(/^\uFEFF/, '');
  if (FILE_DISABLE_RE.test(src.slice(0, 3000))) return [];
  const lines = src.split(/\r?\n/);
  const suppressions = parseSuppressions(lines);
  const masked = exposeStyleAttributes(stripComments(src, ext));
  const blocks = parseBlocks(masked);
  const blockAt = makeBlockLookup(blocks);
  const locate = makeLocator(src);
  const findings = [];
  const add = (id, severity, message, index) => {
    const { line, column } = locate(index);
    findings.push({ id, severity, message, file, line, column, snippet: snippetOf(lines, line) });
  };

  const decls = [];
  for (const match of masked.matchAll(DECL_RE)) {
    const prop = match[1].toLowerCase();
    const block = blockAt(match.index);
    decls.push({ prop, value: normalizeValue(match[2]), seg: match[0], index: match.index, block });
  }

  for (const decl of decls) {
    const value = decl.value;
    const lower = value.toLowerCase();
    switch (decl.prop) {
      case 'font-size':
        if (SIZE_KEYWORD.has(lower) || lower.includes('var(--text-')) break;
        if (lower.includes('var(')) add('raw-font-size', 'error', `${value} 不是排版阶梯 token，请改用 var(--text-*)`, decl.index);
        else if (/^(?:calc|clamp|min|max)\(/.test(lower)) add('raw-font-size', 'error', `${value} 需包含 var(--text-*)，否则仍绕过排版阶梯`, decl.index);
        else if (LENGTH_UNIT.test(lower)) add('raw-font-size', 'error', `${value} 不是排版阶梯中的值，请改用 var(--text-*)`, decl.index);
        break;
      case 'font-family':
        if (lower.includes('var(--font-') || CSS_WIDE.has(lower) || (decl.block && decl.block.inFontFace)) break;
        add('raw-font-family', 'error', `${value || '(空值)'} 未使用 var(--font-*) 字体 token`, decl.index);
        break;
      case 'font':
        if (lower.includes('var(--text-') || CSS_WIDE.has(lower)) break;
        if (/(?:^|[\s/])\d+(?:\.\d+)?(?:px|rem|em)\b/.test(lower)) add('raw-font-shorthand', 'error', 'font 简写里出现裸字号；请改用 var(--text-*) 与 var(--font-*)', decl.index);
        break;
      case 'font-weight':
        if (lower.includes('var(') || /^(?:normal|bold|bolder|lighter|inherit|initial|unset|revert)$/.test(lower)) break;
        if (/^\d+$/.test(lower) && ![400, 500, 600, 700].includes(Number(lower))) add('off-scale-font-weight', 'error', `${value} 不在 400/500/600/700 之内，请使用字重 token`, decl.index);
        break;
      case 'letter-spacing':
        if (LETTER_ZERO.test(lower) || lower === 'normal' || CSS_WIDE.has(lower) || lower.includes('var(')) break;
        if (LETTER_UNIT.test(lower)) add('raw-letter-spacing', 'warning', `${value} 是裸字距值，请改用 var(--tracking-*)`, decl.index);
        break;
      case 'word-break':
        if (/^break-all$/i.test(value)) add('break-all', 'error', 'word-break: break-all 会切断英文单词；中文长文本请改用 overflow-wrap', decl.index);
        break;
      case 'text-transform': {
        if (!/^uppercase$/i.test(value)) break;
        const zh = /lang\s*=\s*["']?zh/i.test(lines[locate(decl.index).line - 1] || '');
        add('uppercase', zh ? 'error' : 'warning', zh
          ? 'zh 语境下不要使用 text-transform: uppercase（对中文无意义）'
          : 'text-transform: uppercase 对中文无意义，英文长文本可读性差', decl.index);
        break;
      }
      case 'line-height': {
        const unitless = /^(\d+(?:\.\d+)?)$/.exec(value);
        if (unitless && Number(unitless[1]) < 1.35 && decl.block
          && isBodyish(decl.block.selector)) {
          add('tight-leading', 'warning', `line-height ${value} 低于 1.35，中文正文建议 1.6 以上`, decl.index);
        }
        const px = /^(\d+(?:\.\d+)?)px$/i.exec(value);
        if (px && !LH_PX_STEPS.has(Number(px[1]))) add('hardcoded-lh', 'warning', `line-height ${value} 是固定像素值，请改用无单位值（如 1.6）`, decl.index);
        break;
      }
      default:
        break;
    }
    if (/^(?:font-size|font-family|line-height)$/.test(decl.prop)) {
      const bang = decl.seg.search(/!\s*important/i);
      if (bang >= 0) add('important-font', 'warning', `${decl.prop} 不要使用 !important，请从 token 或选择器层级上解决`, decl.index + bang);
    }
  }

  // 行内样式：JSX/TSX/Vue/Svelte 的 style={{ fontSize }} / :style="{ fontSize }" / style="font-size:"
  if (INLINE_STYLE_EXT.has(ext)) {
    for (const match of masked.matchAll(/\bfont-?[sS]ize\b/g)) {
      const before = masked.slice(Math.max(0, match.index - 400), match.index);
      if (!/(?:^|[\s"'{;])style\s*=\s*["'`;]?\s*\{*[^;{}]*$/i.test(before)) continue;
      add('inline-font-size', 'error', '行内样式直接设置 fontSize/font-size，请改用 class + var(--text-*) token', match.index);
    }
  }

  // Tailwind 任意值：text-[13px] / leading-[1.2] / tracking-[0.1em]；引用 token 的放行
  for (const match of masked.matchAll(TAILWIND_ARBITRARY_RE)) {
    if (match[0].includes('var(--')) continue;
    add('arbitrary-tailwind', 'error', `Tailwind 任意值 ${match[0]} 绕过了排版阶梯，请改用 text-* / leading-* / tracking-* token`, match.index);
  }

  const seen = new Set();
  const result = [];
  for (const finding of findings) {
    const key = `${finding.line}:${finding.column}`;
    if (seen.has(key)) continue;
    const suppressed = suppressions.get(finding.line);
    if (suppressed && (suppressed.has('*') || suppressed.has(finding.id))) continue;
    seen.add(key);
    result.push(finding);
  }
  return result.sort(compareFindings);
}

// --- 文件收集 / 参数 / 输出 --------------------------------------------------

function collectFiles(inputs, cwd) {
  const files = new Set();
  const missing = [];
  const addFile = (absPath) => {
    if (EXTENSIONS.has(extname(absPath).toLowerCase()) && !MINIFIED_FILE.test(absPath)) files.add(absPath);
  };
  const walk = (dir) => {
    let entries;
    try { entries = readdirSync(dir, { withFileTypes: true }); } catch { return; }
    entries.sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0));
    for (const entry of entries) {
      const full = join(dir, entry.name);
      if (entry.isDirectory()) { if (!SKIP_DIRS.has(entry.name)) walk(full); }
      else if (entry.isFile()) addFile(full);
    }
  };
  for (const input of inputs) {
    const abs = resolve(cwd, input);
    let stat;
    try { stat = statSync(abs); } catch { missing.push(input); continue; }
    if (stat.isDirectory()) walk(abs);
    else if (stat.isFile()) addFile(abs);
  }
  return { files: [...files].sort(), missing };
}

function displayPath(abs, cwd) {
  const rel = relative(cwd, abs);
  return (rel && !rel.startsWith('..') ? rel : abs).split(sep).join('/');
}

function parseArgs(argv) {
  const options = { json: false, noColor: false, maxWarnings: Infinity, selfTest: false, help: false, paths: [], error: '' };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--json') options.json = true;
    else if (arg === '--no-color') options.noColor = true;
    else if (arg === '--self-test') options.selfTest = true;
    else if (arg === '--help' || arg === '-h') options.help = true;
    else if (arg === '--max-warnings' || arg.startsWith('--max-warnings=')) {
      const value = arg.includes('=') ? arg.slice(arg.indexOf('=') + 1) : argv[++i];
      if (!/^\d+$/.test(String(value))) return { ...options, error: `--max-warnings 需要非负整数，收到: ${value}` };
      options.maxWarnings = Number(value);
    } else if (arg.startsWith('-') && arg !== '-') return { ...options, error: `未知参数: ${arg}` };
    else options.paths.push(arg);
  }
  return options;
}

function formatHuman(filesScanned, findings, errors, warnings, exitCode, color) {
  const wrap = (code) => (value) => (color ? `\u001b[${code}m${value}\u001b[0m` : String(value));
  const red = wrap(31); const yellow = wrap(33); const dim = wrap(2); const bold = wrap(1); const green = wrap(32);
  const out = [`${bold('typography audit')} · ${filesScanned} files · ${red(`${errors} errors`)} · ${yellow(`${warnings} warnings`)}`, ''];
  if (!findings.length) out.push(green('没有发现绕过排版 token 的写法。'), '');
  for (const finding of findings) {
    const label = finding.severity === 'error' ? red('ERROR') : yellow('WARN ');
    out.push(`${label}  ${finding.id.padEnd(21)}${dim(`${finding.file}:${finding.line}:${finding.column}`)}`);
    out.push(`       ${finding.message}`);
    if (finding.snippet) out.push(dim(`       ${finding.snippet}`));
  }
  if (findings.length) out.push('');
  const summary = `summary: ${errors} errors, ${warnings} warnings (exit ${exitCode})`;
  out.push(exitCode === 0 ? green(summary) : summary);
  return out.join('\n');
}

// --- 自测：每条规则都有正例与反例 --------------------------------------------

const SELF_TESTS = [
  ['raw-font-size 命中裸 px', 'a.css', '.card { font-size: 13px; }', ['raw-font-size']],
  ['raw-font-size 放行 token', 'a.css', '.card { font-size: var(--text-caption-size); }', []],
  ['raw-font-family 命中', 'a.css', '.card { font-family: "Inter", sans-serif; }', ['raw-font-family']],
  ['raw-font-family 放行 token', 'a.css', '.card { font-family: var(--font-sans), sans-serif; }', []],
  ['raw-font-shorthand 命中裸字号', 'a.css', '.card { font: 16px/1.5 var(--font-sans); }', ['raw-font-shorthand']],
  ['raw-font-shorthand 放行 token', 'a.css', '.card { font: var(--weight-regular) var(--text-body-size)/var(--text-body-leading) var(--font-sans); }', []],
  ['off-scale-font-weight 命中 550', 'a.css', '.card { font-weight: 550; }', ['off-scale-font-weight']],
  ['off-scale-font-weight 放行 500', 'a.css', '.card { font-weight: 500; }', []],
  ['raw-letter-spacing 命中裸 em', 'a.css', '.card { letter-spacing: 0.02em; }', ['raw-letter-spacing']],
  ['raw-letter-spacing 放行 normal', 'a.css', '.card { letter-spacing: normal; }', []],
  ['break-all 命中', 'a.css', '.prose { word-break: break-all; }', ['break-all']],
  ['break-all 放行 break-word', 'a.css', '.prose { word-break: break-word; }', []],
  ['uppercase 默认 warning', 'a.css', 'p { text-transform: uppercase; }', ['uppercase'], { uppercase: 'warning' }],
  ['uppercase 同行 zh 升级 error', 'a.html', '<p lang="zh-CN" style="text-transform: uppercase">x</p>', ['uppercase'], { uppercase: 'error' }],
  ['inline-font-size 命中 style={{fontSize}}', 'a.tsx', 'export const A = () => <div style={{ fontSize: "13px" }} />;', ['inline-font-size']],
  ['inline-font-size 放行 class', 'a.tsx', 'export const A = () => <div className="text-caption">x</div>;', []],
  ['arbitrary-tailwind 命中 text-[13px]', 'a.tsx', 'export const A = () => <div className="text-[13px]" />;', ['arbitrary-tailwind']],
  ['arbitrary-tailwind 放行 text-[var(...)]', 'a.tsx', 'export const A = () => <div className="text-[var(--text-body-size)]" />;', []],
  ['tight-leading 正文 1.2 命中', 'a.css', 'body { font-size: var(--text-body-size); line-height: 1.2; }', ['tight-leading']],
  ['tight-leading prose 未声明字号也命中', 'a.css', '.prose { line-height: 1.2; }', ['tight-leading']],
  ['tight-leading 非正文选择器不报', 'a.css', '.badge { font-size: var(--text-caption-size); line-height: 1.1; }', []],
  ['important-font 命中', 'a.css', '.card { font-family: var(--font-sans) !important; }', ['important-font']],
  ['hardcoded-lh 命中 21px', 'a.css', '.card { line-height: 21px; }', ['hardcoded-lh']],
  ['hardcoded-lh 放行 24px', 'a.css', '.card { line-height: 24px; }', []],
  ['disable-next-line 抑制生效', 'a.css', '/* typography-audit-disable-next-line raw-font-size */\n.card { font-size: 13px; }', []],
  ['disable-file 整文件豁免', 'a.css', '/* typography-audit-disable-file */\n.card { font-size: 13px; }', []],
  ['SCSS 嵌套块内命中', 'a.scss', '.card {\n  .title { font-size: 13px; }\n}', ['raw-font-size']],
  ['模板字符串里的 CSS 命中', 'a.ts', 'const css = `\nbody { font-size: 16px; }\n`;', ['raw-font-size']],
  ['font 简写裸字号 / 越阶字重命中', 'a.css', '.x { font: 16px/1.5 Inter; font-weight: 550; }', ['raw-font-shorthand', 'off-scale-font-weight']],
  ['font 简写 / 字重放行 token', 'a.css', '.x { font: var(--text-body-size)/1.5 var(--font-sans); font-weight: var(--weight-medium); }', []],
];

function runSelfTest() {
  const failures = [];
  for (const [name, file, code, expected, severities] of SELF_TESTS) {
    const findings = scanFile(code, file);
    const actual = findings.map((finding) => finding.id).sort();
    const want = [...expected].sort();
    const sameList = actual.length === want.length && actual.every((id, i) => id === want[i]);
    const badSeverity = severities
      ? Object.entries(severities).filter(([id, severity]) => !findings.some((f) => f.id === id && f.severity === severity))
      : [];
    if (sameList && !badSeverity.length) {
      console.log(`PASS  ${name}`);
      continue;
    }
    failures.push(name);
    console.log(`FAIL  ${name}`);
    if (!sameList) {
      console.log(`      expected: ${want.join(', ') || '(none)'}`);
      console.log(`      actual:   ${actual.join(', ') || '(none)'}`);
    }
    for (const [id, severity] of badSeverity) console.log(`      expected severity: ${id} => ${severity}`);
  }
  console.log(`\nself-test: ${SELF_TESTS.length - failures.length} passed, ${failures.length} failed`);
  return failures.length === 0;
}

// --- 入口 --------------------------------------------------------------------

function main() {
  const options = parseArgs(process.argv.slice(2));
  if (options.error) {
    console.error(`typography audit: ${options.error}\n运行 node audit.mjs --help 查看用法`);
    process.exitCode = 2; return;
  }
  if (options.help) { console.log(USAGE); return; }
  if (options.selfTest) { process.exitCode = runSelfTest() ? 0 : 1; return; }
  options.color = !options.noColor;

  const cwd = process.cwd();
  const { files, missing } = collectFiles(options.paths.length ? options.paths : ['.'], cwd);
  if (missing.length) {
    for (const item of missing) console.error(`typography audit: 路径不存在 ${item}`);
    process.exitCode = 2; return;
  }
  const findings = [];
  let filesScanned = 0;
  for (const abs of files) {
    let source;
    try { source = readFileSync(abs, 'utf8'); } catch (error) { console.error(`typography audit: 读取失败 ${abs}: ${error.message}`); continue; }
    filesScanned += 1;
    findings.push(...scanFile(source, displayPath(abs, cwd)));
  }
  findings.sort(compareFindings);
  const errors = findings.filter((finding) => finding.severity === 'error').length;
  const warnings = findings.length - errors;
  const exceeded = Number.isFinite(options.maxWarnings) && warnings > options.maxWarnings;
  const exitCode = errors > 0 || exceeded ? 1 : 0;
  if (options.json) console.log(JSON.stringify({ filesScanned, errors, warnings, findings }, null, 2));
  else console.log(formatHuman(filesScanned, findings, errors, warnings, exitCode, options.color));
  process.exitCode = exitCode;
}

main();
