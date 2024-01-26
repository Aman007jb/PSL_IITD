// Function to fetch and parse BibTeX file
function fetchBibTeX(url) {
    return fetch(url)
        .then(response => response.text())
        .then(data => parseBibTeX(data));
}

// Function to parse BibTeX data into HTML table
function parseBibTeX(data) {
    const entries = data.split('\n\n');
    
    const formattedEntries = entries.map(entry => {
        const lines = entry.trim().split('\n');
        const entryData = {};
        let currentKey = '';
        lines.forEach(line => {
            const trimmedLine = line.trim();
            const match = trimmedLine.match(/@([^@{]*){([^,]*)/);
            if (match) {
                entryData['Type'] = match[1].trim();
                entryData['Identifier'] = match[2].trim();
            } else {
                const keyValueMatch = trimmedLine.match(/(.*)\s*=\s*\{(.*)\},?/);
                if (keyValueMatch) {
                    const key = keyValueMatch[1].trim();
                    let value = keyValueMatch[2].trim();
                    if (value.startsWith('{') && value.endsWith('}')) {
                        value = value.slice(1, -1); // Remove curly braces
                    }
                    entryData[key] = value;
                } else if (trimmedLine.startsWith('}')) {
                    currentKey = '';
                } else if (currentKey) {
                    entryData[currentKey] += ' ' + trimmedLine;
                } else {
                    const keyValueMatch = trimmedLine.match(/(.*)\s*=\s*\{(.*)/);
                    if (keyValueMatch) {
                        currentKey = keyValueMatch[1].trim();
                        let value = keyValueMatch[2].trim();
                        if (value.endsWith('},')) {
                            value = value.slice(0, -2); // Remove comma
                        }
                        entryData[currentKey] = value;
                    }
                }
            }
        });

        return entryData;
    });

    // Sort entries by year
    formattedEntries.sort((a, b) => {
        const yearA = parseInt(a.year) || 0;
        const yearB = parseInt(b.year) || 0;
        return yearB - yearA;
    });

    // Format sorted entries as table rows
    const htmlEntries = formattedEntries.map(entryData => {
        const author = entryData.author || entryData.editor || 'Unknown';
        const title = entryData.title || 'Untitled';
        const journal = entryData.journal || entryData.booktitle || 'N/A';
        const year = entryData.year || 'N/A';
        
        return `<tr>
                    <td>${entryData.Type || 'Unknown'}</td>
                    <td>${author}</td>
                    <td>${title}</td>
                    <td>${journal}</td>
                    <td>${year}</td>
                </tr>`;
    });

    return htmlEntries.join('');
}





// Fetch and display BibTeX content on page load
window.onload = function() {
    const bibUrl = 'LOP.bib'; // Update with your .bib file URL
    fetchBibTeX(bibUrl)
        .then(html => {
            document.getElementById('bib-entries').innerHTML = html;
        })
        .catch(error => {
            console.error('Error fetching BibTeX:', error);
        });
};

// Wait for the DOM content to be fully loaded
// document.addEventListener('DOMContentLoaded', function() {
//     const bibtexUrl = 'LOP.bib';
//     fetchBibTeX(bibtexUrl)
//         .then(html => {
//             const bibtexContent = document.getElementById('bibtex-content');
//             if (bibtexContent) {
//                 bibtexContent.innerHTML = html;
//             } else {
//                 console.error('Element with ID "bibtex-content" not found.');
//             }
//         })
//         .catch(error => {
//             console.error('Error fetching BibTeX:', error);
//         });
// });
