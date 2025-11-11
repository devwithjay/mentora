import {LoaderCircle} from "lucide-react";

const Loading = () => {
  return (
    <div className="flex h-full flex-col items-center justify-center">
      <LoaderCircle className="animate-spin" />
    </div>
  );
};

export default Loading;
