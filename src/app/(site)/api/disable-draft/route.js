import { draftMode } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request) {
  (await draftMode()).disable();

  // Back to the page the editor was on, if the referer is ours. The checked URL
  // is the one used: rebuilding it from its path would let `//host` leave the site.
  const { origin } = request.nextUrl;
  const from = URL.parse(request.headers.get('referer') ?? '', origin);
  return NextResponse.redirect(
    from?.origin === origin ? from : new URL('/', origin)
  );
}
