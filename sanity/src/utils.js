export const singleton = ( S, id, title ) =>
	S.listItem()
		.id(id)
		.title(
			title ||
				id
					.split(/(?=[A-Z])/)
					.map((w) => w.charAt(0).toUpperCase() + w.slice(1))
					.join(' '),
		)
		.child(S.editor().id(id).schemaType(id).documentId(id))

export const group = (S ,title , items) =>
	S.listItem().title(title).child(S.list().title(title).items(items))

export function count(
	arr,
	singular = 'item',
	plural,
) {
	return `${arr?.length || 0} ${arr?.length === 1 ? singular : plural || singular + 's'}`
}