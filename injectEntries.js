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

export function injectLedgerEntries(ledgerEntries) {}