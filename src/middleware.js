import { NextResponse } from 'next/server';

export function middleware(request) {
  const url = request.nextUrl.clone();
  const hostname = request.headers.get('host');
  
  // Skip middleware for localhost during development
  if (hostname?.includes('localhost') || hostname?.includes('127.0.0.1')) {
    return NextResponse.next();
  }
  
  // Handle subdomain routing for production
  if (hostname) {
    // Check if we have a subdomain (not www, not the main domain)
    const subdomain = getSubdomain(hostname);
    
    if (subdomain && subdomain !== 'www' && subdomain !== 'api') {
      // This is a user subdomain like dimas.apiplayground.com
      const pathSegments = url.pathname.split('/').filter(Boolean);
      
      if (pathSegments.length > 0) {
        // Route dimas.apiplayground.com/project-name to /:username/:projectName
        const projectName = pathSegments[0];
        url.pathname = `/${subdomain}/${projectName}`;
        
        // Add query parameters to indicate this is a subdomain request
        url.searchParams.set('subdomain', 'true');
        
        return NextResponse.rewrite(url);
      } else {
        // Root subdomain - could redirect to user profile or show user's docs list
        url.pathname = `/${subdomain}`;
        url.searchParams.set('subdomain', 'true');
        return NextResponse.rewrite(url);
      }
    }
  }
  
  return NextResponse.next();
}

function getSubdomain(hostname) {
  const parts = hostname.split('.');
  
  // For localhost or IP addresses, no subdomain
  if (parts.length < 3) return null;
  
  // Return the first part as subdomain
  return parts[0];
}

// Configure which paths this middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - auth (authentication routes)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|auth).*)',
  ],
};