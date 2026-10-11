import { draftMode } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request) {
  (await draftMode()).disable();

  // Back to the page the editor was on, if the referer is ours. The checked URL
  // is the one used: rebuilding it from its path would let `//host` leave the site.
  const { origin } = request.nextUrl;
  const from = URL.parse(request.headers.get('referer') ?? '', origin);
  if (from?.origin !== origin)
    return NextResponse.redirect(new URL('/', origin));
  // Vercel's draft link turns draft mode straight back on for team members.
  from.searchParams.delete('__vercel_draft');
  return NextResponse.redirect(from);
}
