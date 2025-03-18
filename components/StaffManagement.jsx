"use client";
import { useAuth } from "@workos-inc/authkit-nextjs";
import { UsersManagement, WorkOsWidgets } from "@workos-inc/widgets";

export default async function UserTable() {
  const { accessToken: token } = await withAuth();
  if (isLoading) {
    return "...";
  }
    return (
      <WorkOsWidgets>
        <UsersManagement authToken={token} />
      </WorkOsWidgets>
    );
}

