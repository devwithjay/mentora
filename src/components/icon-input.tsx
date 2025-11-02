import React from "react";

import {ControllerRenderProps, FieldValues, Path} from "react-hook-form";

import {Input} from "@/components/ui/input";

interface IconInputProps<
  TFieldValues extends FieldValues,
  TName extends Path<TFieldValues> = Path<TFieldValues>,
> {
  field?: ControllerRenderProps<TFieldValues, TName>;
  placeholder?: string;
  disabled?: boolean;
  type?: "text" | "email" | "search" | "number" | "tel";
  icon: React.ComponentType<{className?: string}>;
  className?: string;
}

const IconInput = <
  TFieldValues extends FieldValues,
  TName extends Path<TFieldValues> = Path<TFieldValues>,
>({
  field,
  placeholder = "Enter text",
  disabled = false,
  type = "text",
  icon: Icon,
  className = "",
}: IconInputProps<TFieldValues, TName>) => {
  return (
    <div
      className={`border-primary flex items-center rounded-md border px-2 py-0.5 shadow-none dark:bg-transparent ${className}`}
    >
      <Icon className="ml-2 size-5 text-(--text-secondary)" />

      <Input
        {...field}
        placeholder={placeholder}
        type={type}
        disabled={disabled}
        className="placeholder:text-secondary min-h-10 border-0 shadow-none hover:outline-none focus:border-0 focus-visible:ring-0 md:text-base dark:bg-transparent"
      />
    </div>
  );
};

export default IconInput;
