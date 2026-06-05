import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

// المسارات المحمية
const PROTECTED_PATHS = [
  '/dashboard',
  '/chat',
  '/projects',
  '/analytics',
  '/memory',
  '/notifications',
  '/profile',
  '/settings',
  '/files',
  '/tasks',
  '/rooms',
];

// المسارات العامة (للمستخدمين غير المسجلين)
const AUTH_PATHS = ['/login', '/register'];

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value);
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  const path = request.nextUrl.pathname;

  // التحقق من المسارات المحمية
  const isProtectedPath = PROTECTED_PATHS.some(p => path.startsWith(p));
  const isAuthPath = AUTH_PATHS.some(p => path === p);

  if (isProtectedPath && !user) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (isAuthPath && user) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
