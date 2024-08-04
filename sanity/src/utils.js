export function count(
	arr,
	singular = 'item',
	plural,
) {
	return `${arr?.length || 0} ${arr?.length === 1 ? singular : plural || singular + 's'}`
}