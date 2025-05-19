import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { routing } from "../../i18n/routing";

export async function updateSession(
  request: NextRequest,
  response: NextResponse
) {
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Get current URL and path
  const url = new URL(request.url);

  // Get locale from URL or use default locale
  const pathParts = url.pathname.split("/").filter(Boolean);
  const locale = pathParts[0] || routing.defaultLocale;

  // Check if the path is already the login page or auth-related pages
  const isLoginPage = url.pathname.includes(`/${locale}/login`);
  const isAuthCallback = url.pathname.includes(`/${locale}/auth/callback`);

  // If user is not authenticated and not already on login page or auth callback, redirect to login
  if (!user && !isLoginPage && !isAuthCallback) {
    const redirectUrl = new URL(`/${locale}/login`, url.origin);
    return NextResponse.redirect(redirectUrl);
  }

  return response;
}
