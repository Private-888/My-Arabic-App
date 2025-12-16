import React from 'react'

interface CardProps {
  children: React.ReactNode
  className?: string
  onClick?: () => void
  interactive?: boolean
}

export function Card({ children, className = '', onClick, interactive = false }: CardProps) {
  const baseStyles = 'bg-primary-700 rounded-2xl p-6 shadow-lg'
  const interactiveStyles = interactive
    ? 'cursor-pointer transition-all duration-200 hover:bg-primary-600 active:scale-95'
    : ''
  
  return (
    <div
      className={`${baseStyles} ${interactiveStyles} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  )
}

