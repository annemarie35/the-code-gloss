type ThemePillProps<T extends string> = {
    theme: T
    isSelected?: boolean
    onClick?: (theme: T) => void
}

const baseClasses = 'px-4 py-1 rounded-full text-sm font-medium border transition-colors duration-200'
const selectedClasses = 'bg-gray-800 text-white border-gray-800'
const unselectedClasses = 'bg-white text-gray-700 border-gray-300'

export function ThemePill<T extends string>({ theme, isSelected = false, onClick }: ThemePillProps<T>) {
    const stateClasses = isSelected ? selectedClasses : unselectedClasses

    if (!onClick) {
        return <span className={`${baseClasses} ${stateClasses}`}>{theme}</span>
    }

    return (
        <button
            type="button"
            onClick={() => onClick(theme)}
            aria-pressed={isSelected}
            className={`${baseClasses} ${stateClasses} ${isSelected ? '' : 'hover:border-gray-500'}`}
        >
            {theme}
        </button>
    )
}
