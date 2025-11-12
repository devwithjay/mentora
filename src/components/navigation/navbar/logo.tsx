import Image from "next/image";
import Link from "next/link";

type LogoProps = {
  className?: string;
  showText?: boolean;
};

const Logo = ({showText = false, className = ""}: LogoProps) => {
  return (
    <Link href="/" className={`flex items-center gap-x-2 ${className}`}>
      <Image
        src="/logo.png"
        alt="Mentora Logo"
        width={38}
        height={38}
        className="block dark:hidden"
      />

      <Image
        src="/logo-dark.png"
        alt="Mentora Logo Dark"
        width={38}
        height={38}
        className="hidden dark:block"
      />

      {showText && (
        <p className="text-primary text-2xl font-semibold">Mentora</p>
      )}
    </Link>
  );
};

export default Logo;
