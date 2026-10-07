import { anchors } from './anchors';
import uid from './uid';

// The outline of the modules after a table of contents, from the tagged
// headings of the anchors pass: prose h2s with their h3s, one entry per
// Creative module (its first heading, linking to the module), and never an
// accordion question.
export function tocEntries(headings, following) {
  const after = new Set((following ?? []).map(uid));
  const creative = new Set();
  return (headings ?? []).flatMap((heading) => {
    if (!after.has(heading.moduleId)) return [];
    if (heading.kind === 'prose') return heading.level > 1 ? [heading] : [];
    if (heading.kind !== 'creative' || creative.has(heading.moduleId))
      return [];
    creative.add(heading.moduleId);
    return [{ id: heading.moduleId, text: heading.text, level: 2 }];
  });
}

// Sections with their subsections; an h3 before any h2 stands alone.
export const groupsOf = (entries) =>
  entries.reduce((groups, entry) => {
    if (entry.level === 2 || !groups.length)
      groups.push({ ...entry, children: [] });
    else groups.at(-1).children.push(entry);
    return groups;
  }, []);

// Changes whenever a heading is added, removed, renamed or changes level, so
// anything holding the page's heading nodes knows to find them again.
export const structureKey = (entries) =>
  entries.map((entry) => `${entry.level}:${entry.id}`).join();

// The modules beside the rail: those after a table of contents that renders,
// which takes entries. `headings` are the anchors pass's.
export function railedModules(modules, headings = anchors(modules).headings) {
  const list = modules ?? [];
  const at = list.findIndex(
    (module, i) =>
      module._type === 'table-of-contents' &&
      tocEntries(headings, list.slice(i + 1)).length > 0
  );
  return new Set(at < 0 ? [] : list.slice(at + 1));
}

export const tocCount = (modules) =>
  (modules ?? []).filter((module) => module._type === 'table-of-contents')
    .length;
