import { THEMES, Theme } from '@/src/core/domain/models/Glose'
import { ThemePill } from '@/src/components/ui/theme-pill'

type ThemeFilterProps = {
    selectedThemes: Theme[]
    onToggle: (theme: Theme) => void
}

export default function ThemeFilter({ selectedThemes, onToggle }: ThemeFilterProps) {
    return (
        <div className="flex flex-wrap gap-2 my-4">
            {THEMES.map((theme) => (
                <ThemePill key={theme} theme={theme} isSelected={selectedThemes.includes(theme)} onClick={onToggle} />
            ))}
        </div>
    )
}
