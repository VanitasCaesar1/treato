import { AuthKitProvider, withAuth } from "@workos-inc/authkit-nextjs";
import { UsersManagement, WorkOsWidgets } from "@workos-inc/widgets";
import '@radix-ui/themes/styles.css';

export default async function UserTable() {
  const { accessToken : token } = await withAuth()

  return (
      <WorkOsWidgets>
        <UsersManagement authToken={token} />
      </WorkOsWidgets>
  );
}
