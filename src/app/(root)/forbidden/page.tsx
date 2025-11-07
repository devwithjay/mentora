import Link from "next/link";

import {Button} from "@/components/ui/button";
import ROUTES from "@/constants/routes";

const Forbidden = () => {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-6 px-4 text-center">
      <div className="space-y-2">
        <p className="text-primary line-clamp-3 text-xl">
          403 | You do not have permission to access this page.
        </p>
      </div>
      <Link href={ROUTES.HOME}>
        <Button variant="secondary" className="btn-primary gap-2">
          Back to home
        </Button>
      </Link>
    </div>
  );
};

export default Forbidden;
