import * as React from "react";
import * as LabelPrimitive from "@radix-ui/react-label";
import { cva } from "class-variance-authority";
import { cn } from "../../utilities/lib/utils";

const labelVariants = cva(
  "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-50 inline-block"
);

interface LabelProps extends React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root> {
  className?: string;
}

const Label = React.forwardRef<HTMLLabelElement, LabelProps>(
  ({ className, ...props }, ref) => (
    <LabelPrimitive.Root
      ref={ref}
      className={cn(labelVariants())}
      {...props}
    />
  )
);

Label.displayName = LabelPrimitive.Root.displayName;

export { Label };
