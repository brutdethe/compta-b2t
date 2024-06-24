import { parseCSV } from './parseCSV.js';
import { lineToEntry, generateLedger } from './generateEntries.js';
import { injectEntriesIntoTable, injectLedgerEntries } from './injectEntries.js';

fetch('001_compta-b2t.csv')
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.text();
    })
    .then(csvText => {
        const jsonData = parseCSV(csvText);
        // const ledgerData = generateLedger(jsonData);

        if (document.getElementById('journal-entries')) {
            const journalEntries = jsonData.flatMap(line => lineToEntry(line));
            injectEntriesIntoTable(journalEntries);
        }

        if (document.getElementById('ledger-entries')) {
            // injectLedgerEntries(ledgerData);
        }
    })
    .catch(error => {
        console.error('There has been a problem with your fetch operation:', error);
    });