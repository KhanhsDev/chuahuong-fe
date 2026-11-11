import { NextRequest, NextResponse } from "next/server"

const PUBLIC_ROUTES = ["/", "/temples", "/tickets", "/news"]

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Authentication is managed client-side because the session token is stored
  // in localStorage and is not available to middleware.
  const isPublicRoute = PUBLIC_ROUTES.some((path) =>
    path === "/"
      ? pathname === "/"
      : pathname === path || pathname.startsWith(`${path}/`)
  )

  if (isPublicRoute) {
    return NextResponse.next()
  }

  // Các route chưa khai báo: mặc định cho đi tiếp.
  // Nên đổi thành quy tắc rõ ràng nếu muốn bảo vệ chặt.
  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.).*)"],
}
