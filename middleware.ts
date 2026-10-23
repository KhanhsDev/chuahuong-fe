
import { NextRequest, NextResponse } from "next/server";

const AUTH_ROUTES = ["/login", "/register"];
const PUBLIC_ROUTES = [
  "/",
  "/temples",
  "/tickets",
  "/news",
];

const LOGIN_PATH = "/login";
const HOME_PATH = "/";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Lấy token từ cookie
  const token = request.cookies.get("access_token")?.value;

  // 1. AUTH: login/register
  // Đã có token thì chuyển về trang chủ
  const isAuthRoute = AUTH_ROUTES.some(
    (path) =>
      pathname === path || pathname.startsWith(`${path}/`)
  );

  if (isAuthRoute && token) {
    return NextResponse.redirect(new URL(HOME_PATH, request.url));
  }

  // 2. AUTHENTICATED: yêu cầu đăng nhập
  const isAuthenticatedRoute =
    pathname === "/profile" ||
    pathname.startsWith("/profile/") ||
    pathname === "/my-tickets" ||
    pathname.startsWith("/my-tickets/");

  if (isAuthenticatedRoute && !token) {
    const loginUrl = new URL(LOGIN_PATH, request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);

    return NextResponse.redirect(loginUrl);
  }

  // 3. PUBLIC: ai cũng có thể truy cập
  // Không cần kiểm tra token
  const isPublicRoute = PUBLIC_ROUTES.some(
    (path) =>
      path === "/" ? pathname === "/" :
      pathname === path || pathname.startsWith(`${path}/`)
  );

  if (isPublicRoute) {
    return NextResponse.next();
  }

  // Các route chưa khai báo: mặc định cho đi tiếp.
  // Nên đổi thành quy tắc rõ ràng nếu muốn bảo vệ chặt.
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.).*)",
  ],
};
