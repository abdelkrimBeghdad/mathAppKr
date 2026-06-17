const fs = require('fs');
const path = require('path');

const dir = 'c:/Users/ABDELKRIM/.gemini/antigravity/playground/shining-viking/frontend/src/components/lesson';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.jsx'));

// Find and replace text tags containing `{page.detail}` with `<MathText text={page.detail} ... />`
const variablesToReplace = ['page.detail', 'challenge.context', 'challenge.q', 'challenge.hint', 'challenge.a'];

let updatedFiles = 0;

for (const file of files) {
    const filePath = path.join(dir, file);
    const originalContent = fs.readFileSync(filePath, 'utf8');
    let content = originalContent;

    for (const variable of variablesToReplace) {
        // Matches e.g., <p className="something">{variable}</p>
        const regex1 = new RegExp(`<([a-zA-Z0-9]+)\\s+className="([^"]+)">\\{${variable.replace('.', '\\.')}\\}\\<\\/\\1>`, 'g');
        content = content.replace(regex1, `<MathText text={${variable}} className="$2 block" />`);
        
        // Matches e.g., <div className={\`...\`}>{variable}</div>
        const regex2 = new RegExp(`<([a-zA-Z0-9]+)\\s+className=\\{(\`[^\`]+\`)\\}\\>\\{${variable.replace('.', '\\.')}\\}\\<\\/\\1>`, 'g');
        content = content.replace(regex2, `<MathText text={${variable}} className={$2 + " block"} />`);

        // Matches without className: <p>{variable}</p>
        const regex3 = new RegExp(`<([a-zA-Z0-9]+)\\>\\{${variable.replace('.', '\\.')}\\}\\<\\/\\1>`, 'g');
        content = content.replace(regex3, `<MathText text={${variable}} className="block" />`);
        
        // Let's also replace things like `>{variable}<` inside another tag if not matched above
        // Well, this might be risky, but we can do a simpler replacement just over `<p ...>{variable}</p>` and `<div ...>{variable}</div>`
    }
    
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
