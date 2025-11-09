import {notFound} from "next/navigation";

const Profile = async ({params}: RouteParams) => {
  const {username} = await params;
  if (!username) notFound();

  return (
    <section className="flex h-full flex-col items-center justify-center px-12">
      <pre className="mt-2 text-xl">{username}</pre>
    </section>
  );
};

export default Profile;
