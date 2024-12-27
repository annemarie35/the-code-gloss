import React from 'react'
import { Paragraph } from '@/src/components/ui/paragraph'
import PageLayout from '@/src/pages/pageLayout'

const textsToDisplay: string[] = [
    'Je prends beaucoup de notes en travaillant, parfois un lien, un mot, une notion, une citation liés à ma pratique quotidienne de développeuse.',
    "Mais il s'agit de papiers, de carnets, d'un TIL public et d'un TIL privé, et, j'ai essayé evernote, joplin, zetllr, des cartes mentales, en français ou en anglais, et divers outils et ce sont des sources de vérité différentes.",
    '💎 Mon objectif est donc de créer un glossaire définitif du code, le glossaire du code 💎',
    "C'est un travail en cours, peut-être que je trouverai un jour la méthodologie ultime pour prendre des notes.",
    "Mon préféré est un simple fichier markdown, il rete mon entière propriété (l'exportation de fichiers d'un outil à l'autre est parfois un cauchemar ou une perte de temps).",
    'Donc, code gloss sera une forme simple pour le moment.'
]

const About = () => (
    <PageLayout title="À propos">
        <div>
            {textsToDisplay.map((textToDisplay, index) => (
                <Paragraph key={index} text={textToDisplay} />
            ))}
        </div>
    </PageLayout>
)
export default About
