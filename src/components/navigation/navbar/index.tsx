import Theme from "./theme";

const Navbar = () => {
  return (
    <nav className="flex w-full items-center justify-between gap-5 px-6 py-4 sm:px-12">
      <p className="text-xl text-gray-900 dark:text-amber-50">Next Starter</p>

      <Theme />
    </nav>
  );
};

export default Navbar;
