const fs = require('fs');
const path = require('path');

const dir = 'c:/Users/ABDELKRIM/.gemini/antigravity/playground/shining-viking/frontend/src/components/lesson';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.jsx'));

const patterns = [
    {
        // Matches <Tag className="classes">{variable}</Tag>
        regex: /<([a-z0-9]+)\s+className="([^"]+)">\{(page\.detail|challenge\.context|challenge\.q|challenge\.hint|challenge\.a)\}<\/\1>/g,
        replace: '<MathText text={$3} className="$2 block" />'
    },
    {
        // Matches <Tag className={`...`}>{variable}</Tag>
        regex: /<([a-z0-9]+)\s+className=\{`([^`]+)`\}>\{(page\.detail|challenge\.context|challenge\.q|challenge\.hint|challenge\.a)\}<\/\1>/g,
        replace: '<MathText text={$3} className={`$2 block`} />'
    },
    {
         // Matches <Tag>{variable}</Tag> without className
        regex: /<([a-z0-9]+)>\{(page\.detail|challenge\.context|challenge\.q|challenge\.hint|challenge\.a)\}<\/\1>/g,
        replace: '<MathText text={$3} className="block" />'
    }
];

let updatedFiles = 0;

for (const file of files) {
    const filePath = path.join(dir, file);
    const originalContent = fs.readFileSync(filePath, 'utf8');
    let content = originalContent;

    for (const pattern of patterns) {
        content = content.replace(pattern.regex, pattern.replace);
    }
    
    // Also, if MathText is not imported, add it
    if (content !== originalContent) {
        if (!content.includes('import MathText')) {
            content = content.replace(/(import React.*?;)/, "$1\nimport MathText from '../MathText';");
        }
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Updated ${file}`);
        updatedFiles++;
    }
}

console.log(`Total files updated: ${updatedFiles}`);
