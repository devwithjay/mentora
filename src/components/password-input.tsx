import {useState} from "react";

import {Eye, EyeOff, LockIcon} from "lucide-react";
import {ControllerRenderProps, FieldValues, Path} from "react-hook-form";

import {Input} from "@/components/ui/input";

interface PasswordInputProps<
  TFieldValues extends FieldValues,
  TName extends Path<TFieldValues> = Path<TFieldValues>,
> {
  field: ControllerRenderProps<TFieldValues, TName>;
  placeholder?: string;
  disabled?: boolean;
}

const PasswordInput = <
  TFieldValues extends FieldValues,
  TName extends Path<TFieldValues> = Path<TFieldValues>,
>({
  field,
  placeholder = "Password",
  disabled = false,
}: PasswordInputProps<TFieldValues, TName>) => {
  const [showPassword, setShowPassword] = useState<boolean>(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="flex items-center rounded-md border border-(--border-primary) px-2 py-0.5 shadow-none dark:bg-transparent">
      <LockIcon className="ml-2 size-[22px] text-(--text-secondary)" />

      <Input
        {...field}
        placeholder={placeholder}
        type={showPassword ? "text" : "password"}
        disabled={disabled}
        className="min-h-10 border-0 shadow-none placeholder:text-(--text-secondary) hover:outline-none focus:border-0 focus-visible:ring-0 md:text-base dark:bg-transparent"
      />
      <button
        type="button"
        onClick={togglePasswordVisibility}
        className="mx-2 -translate-y-1/2 cursor-pointer self-end text-gray-500 hover:text-gray-700 focus:outline-none dark:hover:text-gray-300"
      >
        {showPassword ? (
          <EyeOff className="size-5 text-(--text-secondary)" />
        ) : (
          <Eye className="size-5 text-(--text-secondary)" />
        )}
      </button>
    </div>
  );
};

export default PasswordInput;
