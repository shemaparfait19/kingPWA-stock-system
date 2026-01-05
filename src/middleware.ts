import NextAuth from "next-auth"
import { authConfig } from "./lib/auth.config"

const { auth } = NextAuth(authConfig)
 
export default auth((req) => {
  // Logic is now handled in authorized callback in auth.config.ts
})
 
export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
