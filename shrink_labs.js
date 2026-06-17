const fs = require('fs');
const path = require('path');

const directoryPath = path.join(__dirname, 'frontend/src/components/lesson');

// Dictionary of replacements for round 2: further shrinking
const replacements = {
    // Paddings/Margins
    'p-5 md:p-8': 'p-3 md:p-4',
    'p-6 md:p-8': 'p-4 md:p-5',
    'p-6 md:p-10': 'p-4 md:p-6',
    'px-6 py-3': 'px-4 py-2',
    'py-4': 'py-2',
    'mb-5': 'mb-3',
    'mt-5': 'mt-3',
    
    // Text sizes
    'text-4xl md:text-6xl': 'text-2xl md:text-3xl',
    'text-3xl md:text-5xl': 'text-xl md:text-2xl',
    'text-2xl md:text-4xl': 'text-lg md:text-xl',
    'text-xl md:text-2xl': 'text-base md:text-lg',
    'text-lg md:text-xl': 'text-sm md:text-base',
    'text-4xl': 'text-2xl',
    'text-3xl': 'text-xl',
    
    // Dimensions
    'w-20 md:w-32': 'w-16 md:w-24',
    'md:w-16 md:h-16': 'md:w-12 md:h-12',
    'size={60}': 'size={40}',
    'size={48}': 'size={32}',
    'size={32}': 'size={24}',
    'size={24}': 'size={20}',
    'min-h-[500px]': 'min-h-[300px]',
    'h-64': 'h-48',
    'h-48': 'h-32',
};

fs.readdir(directoryPath, (err, files) => {
    if (err) {
        return console.log('Unable to scan directory: ' + err);
    }
    
    files.forEach(file => {
        if (file.endsWith('.jsx')) {
            const filePath = path.join(directoryPath, file);
            let content = fs.readFileSync(filePath, 'utf8');
            let originalContent = content;
            
            for (const [search, replace] of Object.entries(replacements)) {
                // Using regex for global replacement
                const regex = new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
                content = content.replace(regex, replace);
            }
            
            if (content !== originalContent) {
                fs.writeFileSync(filePath, content, 'utf8');
                console.log(`Updated: ${file}`);
            }
        }
    });
    console.log('Done shrinking sizing classes round 2.');
});
