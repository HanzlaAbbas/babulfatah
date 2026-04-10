import { withAuth } from "next-auth/middleware";

export default withAuth({
  callbacks: {
    authorized({ req, token }) {
      const { pathname } = req.nextUrl;

      // Protect /admin routes (except login page)
      if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
        if (!token) return false;
        return token.role === "ADMIN";
      }

      // Protect /api/admin routes
      if (pathname.startsWith("/api/admin")) {
        if (!token) return false;
        return token.role === "ADMIN";
      }

      return true;
    },
  },
  pages: {
    signIn: "/admin/login",
  },
});

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
