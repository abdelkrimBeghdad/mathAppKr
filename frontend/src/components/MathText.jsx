import { InlineMath, BlockMath } from 'react-katex';

/**
 * MathText component that renders both normal text and LaTeX math formulas.
 * Supports $...$ for inline math and $$...$$ for block math.
 */
export default function MathText({ text, className }) {
    if (!text) return null;

    // First, let's look for common LaTeX commands that might be missing delimiters
    // like \sqrt, \frac, \times, etc.
    // If we find them and they are not wrapped in $, we'll wrap the whole line/block for safety
    // or better yet, just let the user know. But for now, we'll try a smarter split.

    // Split text by $$ for block math and $ for inline math
    const parts = text.split(/(\$\$[\s\S]*?\$\$|\$[\s\S]*?\$)/g);

    return (
        <span className={`${className} whitespace-pre-wrap`}>
            {parts.map((part, index) => {
                if (!part) return null;

                if (part.startsWith('$$') && part.endsWith('$$')) {
                    const math = part.slice(2, -2);
                    return (
                        <div key={index} dir="ltr" className="my-4 overflow-x-auto text-center">
                            <BlockMath math={math} />
                        </div>
                    );
                } else if (part.startsWith('$') && part.endsWith('$')) {
                    const math = part.slice(1, -1);
                    return (
                        <span key={index} dir="ltr" className="inline-block mx-1">
                            <InlineMath math={math} />
                        </span>
                    );
                }

                // Fallback: If part contains common LaTeX but no $, handle it gracefully
                if (part.includes('\\sqrt') || part.includes('\\frac') || part.includes('\\times') || 
                    part.includes('\\div') || part.includes('\\pm') || part.includes('\\deg')) {
                    return (
                        <span key={index} dir="ltr" className="inline-block mx-1">
                            <InlineMath math={part.trim()} />
                        </span>
                    );
                }

                return <span key={index}>{part}</span>;
            })}
        </span>
    );
}
