import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"
 
export default auth((req) => {
  const isLoggedIn = !!req.auth
  const isOnDashboard = req.nextUrl.pathname.startsWith("/dashboard") || 
                        req.nextUrl.pathname.startsWith("/inventory") ||
                        req.nextUrl.pathname.startsWith("/sales") ||
                        req.nextUrl.pathname.startsWith("/repairs") || 
                        req.nextUrl.pathname.startsWith("/customers") ||
                        req.nextUrl.pathname === "/"
  
  const isLoginPage = req.nextUrl.pathname.startsWith("/login")

  if (isOnDashboard) {
    if (isLoggedIn) return
    return NextResponse.redirect(new URL("/login", req.url))
  }

  if (isLoginPage) {
      if (isLoggedIn) {
          return NextResponse.redirect(new URL("/dashboard", req.url))
      }
      return
  }
})
 
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
