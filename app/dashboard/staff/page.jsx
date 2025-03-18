import { AuthKitProvider, withAuth } from "@workos-inc/authkit-nextjs";
import { UsersManagement, WorkOsWidgets } from "@workos-inc/widgets";
import '@radix-ui/themes/styles.css';

export default async function UserTable() {
  const { accessToken : token } = await withAuth()

  return (
    <>
      <div className="p-4">
        <h1 className=" text-3xl">User Management</h1>
      </div>
      <div className="p-4">
      <WorkOsWidgets className="p-6 rounded-3xl">
        <UsersManagement authToken={token} />
      </WorkOsWidgets>
      </div>
     
    </>
  );
}
