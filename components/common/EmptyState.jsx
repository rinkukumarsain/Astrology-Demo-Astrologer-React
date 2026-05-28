import React from 'react'

function DefaultEmptyIcon() {
  return (
    <svg className="h-5 w-5" width={20} height={20} viewBox="0 0 24 24" fill="currentColor">
      <path d="M19 3H5a2 2 0 0 0-2 2v14l4-2h12a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2Z" />
    </svg>
  )
}

const EmptyState = ({
  title = "No data available",
  text = "There is nothing to show right now.",
  icon,
  className = "",
}) => {
  return (
    <div className={`flex flex-1 items-center justify-center px-4 py-10 ${className}`}>
      <div className="flex max-w-sm flex-col items-center text-center">
        <span className="mb-3 inline-flex h-11 w-11 items-center justify-center rounded-full bg-[#FFF0E5] text-primary" aria-hidden>
          {icon || <DefaultEmptyIcon />}
        </span>
        <p className="text-sm font-semibold text-[#2A2A2A]">{title}</p>
        <p className="mt-1 text-xs leading-5 text-[#8A8A8A]">{text}</p>
      </div>
    </div>
  )
}

export default EmptyState
