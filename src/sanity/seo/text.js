// A block's text as the reader sees it: its spans joined, untrimmed.
export const blockText = (block) =>
  (block.children ?? []).map((child) => child.text ?? '').join('');
