export function formatDate(dateInput: string | number | Date) {
  const date = new Date(dateInput)
  const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' }
  let formattedDate = date.toLocaleDateString('en-US', options)

  // Add ordinal suffixes
  const day = date.getDate()
  let suffix = 'th'
  if (day % 10 === 1 && day !== 11) {
    suffix = 'st'
  } else if (day % 10 === 2 && day !== 12) {
    suffix = 'nd'
  } else if (day % 10 === 3 && day !== 13) {
    suffix = 'rd'
  }
  // Replace the day number with the day number + suffix
  formattedDate = formattedDate.replace(/\d+/, `${day}${suffix}`)

  return formattedDate
}
