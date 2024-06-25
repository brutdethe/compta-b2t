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
        const journalEntries = jsonData.flatMap(line => lineToEntry(line));
        let ledgerData = []

        if (document.getElementById('journal-entries')) {
            injectEntriesIntoTable(journalEntries);
        }

        if (document.getElementById('ledger-entries')) {
            ledgerData = generateLedger(journalEntries);
            injectLedgerEntries(ledgerData);
        }
    })
    .catch(error => {
        console.error('There has been a problem with your fetch operation:', error);
    });