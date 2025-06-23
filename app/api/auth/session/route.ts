import { NextResponse } from 'next/server';
import { withAuth } from '@workos-inc/authkit-nextjs';

export async function GET() {
  const { user, role, organizationId } = await withAuth();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return NextResponse.json({ role, organizationId, user });
}
