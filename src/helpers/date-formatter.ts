export const formatDate = (date: string): string => {
    return new Intl.DateTimeFormat('fr-FR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
    }).format(new Date(date))
}
