"use client"

import { animate } from "animejs"

export function runSelectionPathAnimation(sourceEl: HTMLElement, targetSelector = "#favorites-cta") {
  if (typeof window === "undefined" || typeof document === "undefined") return

  const targetEl = document.querySelector<HTMLElement>(targetSelector)
  if (!targetEl) return

  const sourceImg = sourceEl.querySelector<HTMLImageElement>("img")
  const sourceRect = (sourceImg ?? sourceEl).getBoundingClientRect()
  const targetRect = targetEl.getBoundingClientRect()

  const ghost = (sourceImg ?? sourceEl).cloneNode(true) as HTMLElement
  ghost.style.position = "fixed"
  ghost.style.left = `${sourceRect.left}px`
  ghost.style.top = `${sourceRect.top}px`
  ghost.style.width = `${sourceRect.width}px`
  ghost.style.height = `${sourceRect.height}px`
  ghost.style.pointerEvents = "none"
  ghost.style.zIndex = "9999"
  ghost.style.borderRadius = "12px"
  ghost.style.objectFit = "cover"
  ghost.style.boxShadow = "0 16px 40px rgba(0,0,0,0.45), 0 0 24px rgba(212,175,55,0.35)"
  ghost.style.transformOrigin = "center center"

  document.body.appendChild(ghost)

  const startCenterX = sourceRect.left + sourceRect.width / 2
  const startCenterY = sourceRect.top + sourceRect.height / 2
  const endCenterX = targetRect.left + targetRect.width / 2
  const endCenterY = targetRect.top + targetRect.height / 2

  const dx = endCenterX - startCenterX
  const dy = endCenterY - startCenterY

  animate(sourceEl, {
    scale: [1, 1.03, 1],
    duration: 260,
    ease: "outQuad",
  })

  animate(ghost, {
    translateX: [0, dx],
    translateY: [0, dy],
    scale: [1, 0.14],
    rotate: [0, -6],
    opacity: [1, 1, 0.2],
    duration: 760,
    ease: "outCubic",
    onComplete: () => {
      ghost.remove()
    },
  })

  animate(targetEl, {
    scale: [1, 1.12, 1],
    boxShadow: [
      "0 0 0 rgba(212,175,55,0)",
      "0 0 34px rgba(212,175,55,0.5)",
      "0 0 0 rgba(212,175,55,0)",
    ],
    duration: 520,
    delay: 320,
    ease: "outQuad",
  })
}
