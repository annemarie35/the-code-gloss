import { THEMES, Theme } from '@/src/core/domain/models/Glose'

type ThemeFilterProps = {
    selectedThemes: Theme[]
    onToggle: (theme: Theme) => void
}

export default function ThemeFilter({ selectedThemes, onToggle }: ThemeFilterProps) {
    return (
        <div className="flex flex-wrap gap-2 my-4">
            {THEMES.map((theme) => {
                const isSelected = selectedThemes.includes(theme)
                return (
                    <button
                        key={theme}
                        onClick={() => onToggle(theme)}
                        aria-pressed={isSelected}
                        className={`px-4 py-1 rounded-full text-sm font-medium border transition-colors duration-200 ${
                            isSelected
                                ? 'bg-gray-800 text-white border-gray-800'
                                : 'bg-white text-gray-700 border-gray-300 hover:border-gray-500'
                        }`}
                    >
                        {theme}
                    </button>
                )
            })}
        </div>
    )
}
