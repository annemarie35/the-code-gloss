export function Paragraph(props: { text: string }) {
    return (
        <p className="mb-2" data-testid="paragraph">
            {props.text}
        </p>
    )
}
