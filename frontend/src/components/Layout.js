import React from 'react'
import { cn } from "../lib/utils"
export { Card, CardHeader, CardTitle, CardContent, CardFooter } from './ui/card';

export function Layout({ children, className }) {
  return (
    <div className={cn("min-h-screen bg-background text-foreground pb-20 lg:pb-0", className)}>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 lg:py-8 animate-fade-in safe-area-bottom">
        {children}
      </main>
    </div>
  )
}

export function PageHeader({ title, description, children }) {
  return (
    <div className="mb-6 lg:mb-10">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-foreground">{title}</h1>
          {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
        </div>
        {children && <div className="flex items-center gap-3">{children}</div>}
      </div>
    </div>
  )
}

export function Grid({ children, className, cols = 3, mobile = 1 }) {
  const finalClass = mobile === 2
    ? (cols === 3 ? "grid-cols-2 sm:grid-cols-2 lg:grid-cols-3" : "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4")
    : (cols === 3 ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" : (cols === 4 ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4" : "grid-cols-1 md:grid-cols-2"));

  return (
    <div className={cn("grid gap-4 sm:gap-5 lg:gap-6", finalClass, className)}>
      {children}
    </div>
  )
}
