import image from './assets/mochi-wordmark.data-url.txt' with { type: 'text' }

/** User-supplied PNG, embedded unchanged for the host's self-contained frontend. */
export function mochiWordmark(): HTMLImageElement {
  const mark = document.createElement('img')
  mark.className = 'mochi-wordmark-image'
  mark.src = image
  mark.alt = 'Mochi'
  mark.width = 2172
  mark.height = 724
  mark.draggable = false
  return mark
}
