import Login from "./login";
import Logo from "./logo";
import SignUp from "./sign-up";
import Theme from "./theme";

const Navbar = () => {
  return (
    <nav className="flex w-full items-center justify-between gap-5 px-6 py-4 sm:px-12">
      <Logo showText />

      <div className="flex gap-x-4">
        <Theme />
        <Login />
        <SignUp />
      </div>
    </nav>
  );
};

export default Navbar;
