type HTMLConvertProps = {
    html?: string | null;
    className?: string;
};

export default function HTMLConvert({ html, className = '' }: HTMLConvertProps) {
    if (!html) {
        return null;
    }

    return (
        <div
            className={`tiptap-html ${className}`}
            dangerouslySetInnerHTML={{ __html: html }}
        />
    );
}
