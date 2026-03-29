import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva } from "class-variance-authority"
import { cn } from "../../lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-semibold ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 active:scale-[0.97] disabled:pointer-events-none disabled:opacity-50 hover:scale-[1.05] hover:-translate-y-0.5",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm hover:shadow-glow",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-sm hover:shadow-lg",
        outline:
          "border border-border/60 bg-card hover:bg-muted hover:text-foreground shadow-sm hover:shadow-glow-neon hover:border-neon-cyan/50",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80 hover:shadow-glow-purple",
        ghost: "hover:bg-muted hover:text-foreground hover:scale-100 hover:translate-y-0",
        link: "text-neon-cyan underline-offset-4 hover:underline active:scale-100 hover:scale-100 hover:translate-y-0",
        brand: "bg-gradient-to-r from-neon-cyan to-neon-purple text-white hover:shadow-glow-neon hover:from-neon-cyan hover:to-neon-purple",
        accent: "bg-accent text-accent-foreground hover:bg-accent/90 shadow-sm hover:shadow-glow-purple",
      },
      size: {
        default: "h-11 px-5 py-2",
        sm: "h-9 rounded-lg px-3 text-xs",
        lg: "h-12 rounded-xl px-8 text-base",
        icon: "h-11 w-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

const Button = React.forwardRef(({ className, variant, size, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : "button"
  return (
    <Comp
      className={cn(buttonVariants({ variant, size, className }))}
      ref={ref}
      {...props}
    />
  )
})
Button.displayName = "Button"

export { Button, buttonVariants }
