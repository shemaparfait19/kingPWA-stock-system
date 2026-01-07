import { getToken } from "next-auth/jwt";
import { NextRequest } from "next/server";
import { prisma } from "./prisma";

/**
 * Retrieves the fully authenticated user from the database based on the session token.
 * This bypasses NextAuth's internal session cache to ensure permissions are real-time
 * and verifies against the actual database table.
 */
export async function getSessionUser(request: NextRequest) {
  try {
    // 1. Get the token from the cookie
    // We try secret from process.env.AUTH_SECRET (standard) or NEXTAUTH_SECRET (legacy)
    const secret = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET;
    
    if (!secret) {
        console.error("AUTH_SECRET is not set");
        return null;
    }

    // Try standard retrieval first (NextAuth auto-detects based on NEXTAUTH_URL/NODE_ENV usually)
    let token = await getToken({ req: request, secret });

    // If that fails, try forcibly looking for the production secure cookie
    if (!token) {
        token = await getToken({ 
            req: request, 
            secret, 
            salt: "__Secure-next-auth.session-token"
        });
    }

    // If that fails, try forcibly looking for the dev cookie
    if (!token) {
        token = await getToken({ 
            req: request, 
            secret, 
            salt: "next-auth.session-token"
        });
    }

    if (!token || !token.sub) {
      console.warn("getSessionUser: No token found. Cookies:", request.headers.get("cookie"));
      return null;
    }

    // 2. Query the database directly
    const user = await prisma.user.findUnique({
      where: { id: token.sub },
      select: {
          id: true,
          email: true,
          fullName: true,
          role: true,
          active: true
      }
    });

    if (!user) {
         console.warn("getSessionUser: Token valid but user not found in DB:", token.sub);
         return null;
    }

    if (!user.active) {
         console.warn("getSessionUser: User inactive:", user.email);
         return null;
    }

    // 3. Construct a session-like object or just return the user
    return {
        user: {
            id: user.id,
            email: user.email,
            name: user.fullName,
            role: user.role
        }
    };

  } catch (error) {
    console.error("Error in getSessionUser:", error);
    return null;
  }
}
