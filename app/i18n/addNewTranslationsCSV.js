'use strict';
const fs = require('fs');
const path = require('path');
const csv = require('fast-csv');

if (!process.env.CUSTOM_PATH) {
    throw Error('Please specify "export CUSTOM_PATH" on the node env by setting process.env in bash');
}

const csvHeaders = ['en', 'de', 'es', 'fr', 'it', 'jp', 'ko', 'pt', 'zh', 'ru'];
const writeStreams = {};
csvHeaders.forEach((header) => {
    if (header !== 'en') {
        const stream = fs.createWriteStream(path.resolve(__dirname, `./template-${header}.po`), {flags: 'a'});
        stream.write(`\n# ${(new Date()).toISOString()}\n`);
        writeStreams[header] = stream;
    }
});

/**
 * Parses csv file where headers equal en,de,es,fr,it,jp,ko,pt,zh,ru
 */
fs.createReadStream(path.resolve(process.env.CUSTOM_PATH))
    .pipe(csv.parse({ headers: true }))
    .on('error', error => console.error(error))
    .on('data', row => {
        csvHeaders.forEach((header) => {
            if (header !== 'en') {
                const id = `msgid "${row.en.trim()}"\n`;
                const str = `msgstr "${row[header].trim()}"\n\n`;
                const stream = writeStreams[header];
                stream.write(id);
                stream.write(str);
            }
        });
    });
