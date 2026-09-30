// The async clipboard only exists in secure contexts; plain http on the LAN
// still gets a copy through a selection.
function copyBySelection(text) {
  const area = document.createElement('textarea');
  area.value = text;
  area.setAttribute('readonly', '');
  area.style.position = 'fixed';
  area.style.opacity = '0';
  document.body.append(area);
  area.select();
  const ok = document.execCommand('copy');
  area.remove();
  if (!ok) throw new Error('copy failed');
}

export async function copyText(text) {
  if (navigator.clipboard) await navigator.clipboard.writeText(text);
  else copyBySelection(text);
}
