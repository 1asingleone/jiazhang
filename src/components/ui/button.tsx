import * as React from 'react'
import { cn } from '@/lib/utils'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'secondary' | 'ghost' | 'outline'
  size?: 'sm' | 'md' | 'lg'
}

function Button({
  className,
  variant = 'default',
  size = 'md',
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center rounded-lg text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
        variant === 'default' && 'bg-blue-600 text-white hover:bg-blue-700',
        variant === 'secondary' && 'bg-slate-100 text-slate-900 hover:bg-slate-200',
        variant === 'ghost' && 'text-slate-600 hover:bg-slate-100',
        variant === 'outline' && 'border border-slate-300 text-slate-700 hover:bg-slate-50',
        size === 'sm' && 'h-9 px-3 text-xs',
        size === 'md' && 'h-10 px-4',
        size === 'lg' && 'h-12 px-6 text-base',
        className,
      )}
      {...props}
    />
  )
}

export { Button }
