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

/**
 * Returns the ISO date of last year today.
 * @returns
 */
export const lastYear = () => {
  const now = new Date().toISOString()
  const year = parseInt(now.substring(0, 4))
  return `${year - 1}${now.substring(4)}`
}
