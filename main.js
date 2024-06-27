import { parseCSV } from './parseCSV.js';
import { lineToEntry, generateLedger, generateIncomeStatement } from './generateEntries.js';
import { injectEntriesIntoTable, injectLedgerEntries, injectIncomeStatementEntries } from './injectEntries.js';

document.addEventListener('DOMContentLoaded', () => {
    const infoBtn = document.getElementById('infoBtn');
    const infoModal = document.getElementById('infoModal');
    const closeBtn = document.querySelector('.close');

    infoBtn.addEventListener('click', () => {
        infoModal.style.display = 'block';
    });

    closeBtn.addEventListener('click', () => {
        infoModal.style.display = 'none';
    });

    window.addEventListener('click', (event) => {
        if (event.target == infoModal) {
            infoModal.style.display = 'none';
        }
    });
});

fetch('002_compta-b2t.csv')
    .then(response => {
        if (!response.ok) throw new Error('Network response was not ok');
        return response.text();
    })
    .then(csvText => {
        const jsonData = parseCSV(csvText);
        const journalEntries = jsonData.flatMap(line => lineToEntry(line));
        if (document.getElementById('journal-entries')) {
            injectEntriesIntoTable(journalEntries);
        }
        if (document.getElementById('ledger-entries')) {
            const ledgerEntries = generateLedger(journalEntries);
            injectLedgerEntries(ledgerEntries);
        }
        if (document.getElementById('income-statement-entries')) {
            const incomeStatementEntries = generateIncomeStatement(journalEntries);
            injectIncomeStatementEntries(incomeStatementEntries);
        }
    })
    .catch(error => console.error('There has been a problem with your fetch operation:', error));