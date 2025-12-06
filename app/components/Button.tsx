import { ReactNode } from "react"
import Link from "next/link"

type ButtonProps = {
  children: ReactNode
  variant?: "white" | "brown"
  className?: string
  onClick?: () => void
  href?: string
}

export const Button = ({ children, variant = "brown", className = "", onClick, href }: ButtonProps) => {
  const baseStyles = "px-6 py-3 rounded-full font-medium transition-all hover:opacity-90 cursor-pointer inline-block"
  
  const variantStyles = {
    white: "bg-white text-[#443104]",
    brown: "bg-[#443104] text-white"
  }

  const combinedClassName = `${baseStyles} ${variantStyles[variant]} ${className}`

  if (href) {
    return (
      <Link href={href} className={combinedClassName}>
        {children}
      </Link>
    )
  }

  return (
    <button 
      className={combinedClassName}
      onClick={onClick}
    >
      {children}
    </button>
  )
}

