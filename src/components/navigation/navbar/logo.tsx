import Image from "next/image";
import Link from "next/link";

const Logo = () => {
  return (
    <Link href="/" className="flex items-center gap-x-2">
      <Image
        src="/logo.png"
        alt="Mentora Logo"
        width={34}
        height={34}
        className="block dark:hidden"
      />

      <Image
        src="/logo-dark.png"
        alt="Mentora Logo Dark"
        width={34}
        height={34}
        className="hidden dark:block"
      />

      <p className="text-2xl font-semibold text-(--text-primary)">Mentora</p>
    </Link>
  );
};

export default Logo;
