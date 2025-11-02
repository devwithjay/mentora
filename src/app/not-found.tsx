import Link from "next/link";

import {Button} from "@/components/ui/button";
import ROUTES from "@/constants/routes";

const NotFound = () => {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-6 px-4 text-center">
      <div className="space-y-2">
        <p className="text-primary line-clamp-3 text-xl">
          404 | The page you are looking for does not exist.
        </p>
      </div>
      <Link href={ROUTES.HOME}>
        <Button
          variant="secondary"
          className="bg-brand cursor-pointer gap-2 text-white hover:bg-(--background-brand-hover)"
        >
          Back to home
        </Button>
      </Link>
    </div>
  );
};

export default NotFound;
