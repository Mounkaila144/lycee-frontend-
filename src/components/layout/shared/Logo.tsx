'use client'

// React Imports
import { useEffect, useRef } from 'react'
import type { CSSProperties } from 'react'

// Next Imports
import Image from 'next/image'

// Type Imports
import type { VerticalNavContextProps } from '@menu/contexts/verticalNavContext'

// Hook Imports
import useVerticalNav from '@menu/hooks/useVerticalNav'
import { useSettings } from '@core/hooks/useSettings'

const Logo = ({ color }: { color?: CSSProperties['color'] }) => {
  // Refs
  const logoRef = useRef<HTMLDivElement>(null)

  // Hooks
  const { isHovered, transitionDuration, isBreakpointReached } = useVerticalNav()
  const { settings } = useSettings()

  // Vars
  const { layout } = settings
  const isCollapsed = !isBreakpointReached && layout === 'collapsed' && !isHovered

  useEffect(() => {
    if (layout !== 'collapsed') {
      return
    }

    if (logoRef && logoRef.current) {
      if (!isBreakpointReached && layout === 'collapsed' && !isHovered) {
        logoRef.current.style.width = '32px'
      } else {
        logoRef.current.style.width = '120px'
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isHovered, layout, isBreakpointReached])

  return (
    <div
      ref={logoRef}
      className='flex items-center min-bs-[24px]'
      style={{
        width: isCollapsed ? '32px' : '120px',
        overflow: 'hidden',
        transition: `width ${transitionDuration}ms ease-in-out`
      }}
    >
      <Image
        src='/logo.png'
        alt='Jandoo'
        width={120}
        height={40}
        style={{ objectFit: 'contain', minWidth: isCollapsed ? '32px' : '120px' }}
        priority
      />
    </div>
  )
}

export default Logo
