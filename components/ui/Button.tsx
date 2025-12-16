import React from 'react'
import Link from 'next/link'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'accent' | 'secondary' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  fullWidth?: boolean
  asChild?: boolean
  href?: string
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  className = '',
  asChild = false,
  href,
  ...props
}: ButtonProps) {
  const baseStyles = 'font-semibold rounded-xl transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed inline-block text-center'
  
  const variants = {
    primary: 'bg-primary-500 text-white hover:bg-primary-600',
    accent: 'bg-accent-400 text-primary-900 hover:bg-accent-300',
    secondary: 'bg-primary-700 text-white hover:bg-primary-600',
    ghost: 'bg-transparent text-gray-300 hover:bg-primary-700',
  }
  
  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  }
  
  const widthClass = fullWidth ? 'w-full' : ''
  const classes = `${baseStyles} ${variants[variant]} ${sizes[size]} ${widthClass} ${className}`
  
  if (asChild && href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    )
  }
  
  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    )
  }
  
  return (
    <button
      className={classes}
      {...props}
    >
      {children}
    </button>
  )
}

