import { Theme, themeLabel } from '@/src/core/domain/models/Glose'

type ThemePillProps = {
    theme: Theme
    isSelected?: boolean
    onClick?: (theme: Theme) => void
}

const baseClasses = 'px-4 py-1 rounded-full text-sm font-medium border transition-colors duration-200'
const selectedClasses = 'bg-gray-800 text-white border-gray-800'
const unselectedClasses = 'bg-white text-gray-700 border-gray-300'

export function ThemePill({ theme, isSelected = false, onClick }: ThemePillProps) {
    const stateClasses = isSelected ? selectedClasses : unselectedClasses

    if (!onClick) {
        return <span className={`${baseClasses} ${stateClasses}`}>{themeLabel(theme)}</span>
    }

    return (
        <button
            type="button"
            onClick={() => onClick(theme)}
            aria-pressed={isSelected}
            className={`${baseClasses} ${stateClasses} ${isSelected ? '' : 'hover:border-gray-500'}`}
        >
            {themeLabel(theme)}
        </button>
    )
}
