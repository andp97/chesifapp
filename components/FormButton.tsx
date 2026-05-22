"use client";

import { useFormStatus } from "react-dom";

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  pendingLabel?: React.ReactNode;
};

export function FormButton({ children, pendingLabel, disabled, ...props }: Props) {
  const { pending } = useFormStatus();
  return (
    <button disabled={pending || disabled} {...props}>
      {pending ? (pendingLabel ?? children) : children}
    </button>
  );
}
