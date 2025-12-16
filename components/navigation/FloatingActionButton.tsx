'use client'

import Link from 'next/link'
import React from 'react'

interface FloatingActionButtonProps {
  href: string
  label?: string
  icon?: React.ReactNode
}

export function FloatingActionButton({
  href,
  label = 'Start Practice',
  icon = '▶️',
}: FloatingActionButtonProps) {
  return (
    <Link
      href={href}
      className="fixed bottom-24 right-6 z-40 bg-accent-400 text-primary-900 rounded-full p-4 shadow-2xl hover:bg-accent-300 transition-all duration-200 active:scale-95 flex items-center gap-2 font-bold"
    >
      <span className="text-2xl">{icon}</span>
      {label && <span className="hidden sm:inline">{label}</span>}
    </Link>
  )
}

