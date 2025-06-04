const fs = require('fs');
const path = require('path');

const dataFolderPath = path.join(__dirname, 'data');
const outputFilePath = path.join(__dirname, 'data', 'entries.json');
const parentDisabilityFolder = 'data';

let disabilityEntries = [];

try {
    const topLevelItems = fs.readdirSync(dataFolderPath, { withFileTypes: true });

    for (const item of topLevelItems) {
        if (item.isDirectory() && !item.name.startsWith('.') && item.name !== 'entries.json') {
            const disabilityName = item.name;
            const disabilityFolderPath = path.join(dataFolderPath, disabilityName);
            const languagesAvailable = [];

            try {
                const disabilityFolderContents = fs.readdirSync(disabilityFolderPath, { withFileTypes: true });

                disabilityFolderContents.forEach(file => {
                    if (file.isFile() && file.name.endsWith('.md')) {
                        const languageCode = file.name.replace(/\.md$/, '');
                        if (languageCode) {
                            languagesAvailable.push(languageCode);
                        }
                    }
                });
                languagesAvailable.sort();

                disabilityEntries.push({
                    name: disabilityName,
                    path: path.join(parentDisabilityFolder, disabilityName),
                    languages_available: languagesAvailable
                });

            } catch (innerError) {
                disabilityEntries.push({
                    name: disabilityName,
                    path: path.join(parentDisabilityFolder, disabilityName),
                    languages_available: []
                });
            }
        }
    }

    disabilityEntries.sort((a, b) => a.name.localeCompare(b.name));

    const outputJson = {
        disabilities: disabilityEntries,
        total_count: disabilityEntries.length,
        generated_at: new Date().toISOString()
    };

    fs.writeFileSync(outputFilePath, JSON.stringify(outputJson, null, 2), 'utf8');

} catch (error) {
    process.exit(1);
}
