import { findChartOfAccounts } from './generateEntries.js';

export function injectEntriesIntoTable(entries) {
    const tableBody = document.getElementById('journal-entries');
    entries.forEach(entry => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${entry['Date']}</td>
            <td>${entry['Compte']}</td>
            <td>${entry['Pièce']}</td>
            <td>${entry['Débit (€)']}</td>
            <td>${entry['Crédit (€)']}</td>
        `;
        tableBody.appendChild(row);
    });
}

export function injectLedgerEntries(ledgerEntries) {
    const ledgerContainer = document.getElementById('ledger-entries');
    Object.entries(ledgerEntries)
        .forEach(([account, entries]) => {
                const accountSection = document.createElement('div');
                accountSection.className = 'account';
                accountSection.innerHTML = `<h2>${account} - ${findChartOfAccounts({account}).label}</h2>`;

                const table = document.createElement('table');

                table.innerHTML = `
                    <thead>
                    <tr>
                        <th>Date</th>
                        <th>Libellé</th>
                        <th>Débit (€)</th>
                        <th>Crédit (€)</th>
                    </tr>
                    </thead>
                    <tbody>
                    ${entries.map(entry => `
                        <tr class="${(entry['Libellé'] === "Total" && "total") || (entry['Libellé'] === "Solde" && "sold")}">
                            <td>${entry['Date']}</td>
                            <td>${entry['Libellé']}</td>
                            <td>${entry['Débit (€)']}</td>
                            <td>${entry['Crédit (€)']}</td>
                        </tr>
                    `).join('')}
                    </tbody>
                    `;
    
        accountSection.appendChild(table);
        ledgerContainer.appendChild(accountSection);
    });
}