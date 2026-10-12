const MAX_DEPTH = 4;
const MAX_PATH = 200;

// A page's URL path as its Cloudinary folder: "/" is home, "/About Me" is
// about-me. Shared by the signing route and the Studio, so the folder the
// editor is shown is the one the upload lands in.
export function folderFor(path) {
  if (typeof path !== 'string' || path.length > MAX_PATH) return null;
  if (path === '/') return 'Website/Pages/home';
  const [lead, ...segments] = path.toLowerCase().split('/');
  if (lead !== '' || !segments.length || segments.length > MAX_DEPTH)
    return null;
  const clean = segments.map((segment) =>
    segment
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      // Fixed-folder accounts read a segment like "v2" as a URL's version.
      .replace(/^v\d/, 'page-$&')
  );
  return clean.every(Boolean) ? `Website/Pages/${clean.join('/')}` : null;
}
