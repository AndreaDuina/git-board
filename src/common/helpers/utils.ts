export const colorFromString = (str: string) => {
  if (!str) {
    return '#' + Math.floor(Math.random() * 16777215).toString(16)
  }

  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash)
  }
  let color = '#'
  for (let i = 0; i < 3; i++) {
    let value = (hash >> (i * 8)) & 0xff
    color += ('00' + value.toString(16)).substr(-2)
  }

  return color
}

export const invertColor = (hexColor: string) => {
  let color: string | number = hexColor
  color = color.substring(1) // remove #
  color = parseInt(color, 16) // convert to integer
  color = 0xffffff ^ color // invert three bytes
  color = color.toString(16) // convert to hex
  color = ('000000' + color).slice(-6) // pad with leading zeros
  color = '#' + color // prepend #
  return color.toString()
}

export const todayIso = () => new Date().toISOString()

/**
 * Returns the ISO date of last year today.
 * @returns
 */
export const lastYear = (from: Date = new Date()) => {
  const now = from.toISOString()
  const year = parseInt(now.substring(0, 4))
  return `${year - 1}${now.substring(4)}`
}

function hexToRgb(hex: string) {
  const bigint = parseInt(hex.slice(1), 16)
  return {
    r: (bigint >> 16) & 255,
    g: (bigint >> 8) & 255,
    b: bigint & 255
  }
}

function rgbToHex(r: number, g: number, b: number) {
  return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)
}

function darkenColor(color: string, percent: number) {
  const { r, g, b } = hexToRgb(color)
  return rgbToHex(
    Math.max(0, Math.min(255, Math.round(r * (1 - percent)))),
    Math.max(0, Math.min(255, Math.round(g * (1 - percent)))),
    Math.max(0, Math.min(255, Math.round(b * (1 - percent))))
  )
}

export function generateShades(baseColor: string, steps: number) {
  const shades = [baseColor]
  const darkenStep = 1 / steps

  for (let i = 1; i < steps; i++) {
    const darkerColor = darkenColor(shades[i - 1], darkenStep)
    shades.push(darkerColor)
  }

  return shades.reverse()
}
