import { useEffect, useRef } from 'react'

export function useAutoGrowTextarea(value: string) {
  const ref = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    el.style.height = 'auto'
    const borderHeight = parseFloat(getComputedStyle(el).borderTopWidth) + parseFloat(getComputedStyle(el).borderBottomWidth)
    el.style.height = `${el.scrollHeight + borderHeight}px`
  }, [value])

  return ref
}
