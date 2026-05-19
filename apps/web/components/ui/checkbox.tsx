"use client"

import * as React from "react"
import { Check } from "lucide-react"
import { cn } from "@/lib/utils"

interface CheckboxProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "onChange"> {
  checked?: boolean
  defaultChecked?: boolean
  onCheckedChange?: (checked: boolean) => void
}

const Checkbox = React.forwardRef<HTMLButtonElement, CheckboxProps>(
  ({ checked: controlledChecked, defaultChecked = false, onCheckedChange, className, ...props }, ref) => {
    const [internalChecked, setInternalChecked] = React.useState(defaultChecked)
    const checked = controlledChecked ?? internalChecked

    const toggle = () => {
      const next = !checked
      setInternalChecked(next)
      onCheckedChange?.(next)
    }

    return (
      <button
        ref={ref}
        role="checkbox"
        aria-checked={checked}
        data-state={checked ? "checked" : "unchecked"}
        onClick={toggle}
        className={cn(
          "peer h-4 w-4 shrink-0 rounded border border-input shadow",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          "disabled:cursor-not-allowed disabled:opacity-50",
          checked ? "bg-primary border-primary text-primary-foreground" : "bg-transparent",
          className,
        )}
        {...props}
      >
        {checked && <Check className="h-3.5 w-3.5 m-auto" strokeWidth={3} />}
      </button>
    )
  },
)
Checkbox.displayName = "Checkbox"

export { Checkbox }
