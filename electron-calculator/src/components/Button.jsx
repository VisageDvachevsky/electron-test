import { cva } from "class-variance-authority";

const buttonVariants = cva(
  "px-4 py-2 rounded-lg font-bold transition",
  {
    variants: {
      variant: {
        default: "bg-gray-700 text-white hover:bg-gray-600",
        primary: "bg-blue-500 text-white hover:bg-blue-400",
        danger: "bg-red-500 text-white hover:bg-red-400",
        success: "bg-green-500 text-white hover:bg-green-400",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export function Button({ children, variant, onClick }) {
  return (
    <button className={buttonVariants({ variant })} onClick={onClick}>
      {children}
    </button>
  );
}
