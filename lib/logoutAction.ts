// logoutAction.ts
"use server";

import { signOut } from '@workos-inc/authkit-nextjs';

export async function handleLogout() {
  await signOut();
  // Redirect is handled by the signOut function
}