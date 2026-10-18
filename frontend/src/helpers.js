export function formatDate(dateStr) {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

export function getBmiCategory(bmi) {
  if (bmi < 18.5) return { label: 'Underweight', color: '#ffc107' }
  if (bmi < 25) return { label: 'Normal', color: '#28a745' }
  if (bmi < 30) return { label: 'Overweight', color: '#ff9800' }
  return { label: 'Obese', color: '#dc3545' }
}

export function calcBMI(heightCm, weightKg) {
  const h = parseFloat(heightCm) / 100
  const w = parseFloat(weightKg)
  if (!h || !w || h <= 0) return 0
  return parseFloat((w / (h * h)).toFixed(2))
}

export function getInitials(name) {
  if (!name) return '?'
  const parts = name.trim().split(/\s+/)
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase()
  return parts[0].charAt(0).toUpperCase()
}
