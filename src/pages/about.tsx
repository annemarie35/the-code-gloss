import PageLayout from '@/src/pages/pageLayout'

const About = () => (
    <PageLayout title="À propos">
        <div>
            <p className="mb-2">
                Je prends beaucoup de notes en travaillant, parfois un lien, un mot, une notion, une citation liés à ma
                pratique quotidienne de développeuse.{' '}
            </p>
            <p className="mb-2">
                Mais il s&#39;agit de papiers, de carnets, d&#39;un TIL public et d&#39;un TIL privé, et, j&#39;ai
                essayé evernote, joplin, zetllr, des cartes mentales, en français ou en anglais, et divers outils et ce
                sont des sources de vérité différentes.
            </p>
            <p className="mb-2">
                :gem : Mon objectif est donc de créer un glossaire définitif du code, le glossaire du code :gem :
                C&#39;est un travail en cours, peut-être que je trouverai un jour la méthodologie ultime pour prendre
                des notes.
            </p>
            <p className="mb-2">
                Mon préféré est un simple fichier markdown, il rete mon entière propriété (l&#39;exportation de fichiers
                d&#39;un outil à l&#39;autre est parfois un cauchemar ou une perte de temps).
            </p>
            <p className="mb-2">Donc, code gloss sera une forme simple pour le moment.</p>
        </div>
    </PageLayout>
)
export default About
