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
    ledgerEntries = {}
    const ledgerContainer = document.getElementById('ledger-entries');
    ["", ""].forEach(([account = "Compte 512000 - Banques", entries]) => {
        const accountSection = document.createElement('div');
        accountSection.className = 'account';
        accountSection.innerHTML = `<h2>${account}</h2>`;

        const table = document.createElement('table');

        table.innerHTML = `
            <table>
            <thead>
                <tr>
                <th>Date</th>
                <th>Libellé</th>
                <th>Débit (€)</th>
                <th>Crédit (€)</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                <td>03/01/2021</td>
                <td>Achat matériel</td>
                <td>1000,00</td>
                <td></td>
                </tr>
                <tr>
                <td>05/01/2021</td>
                <td>Vente</td>
                <td></td>
                <td>2000,00</td>
                </tr>
                <tr>
                <td>12/01/2021</td>
                <td>Déplacement</td>
                <td>500,00</td>
                <td></td>
                </tr>
                <tr class="total">
                <td>31/12/2021</td>
                <td>Total</td>
                <td>1500,00</td>
                <td>2000,00</td>
                </tr>
                <tr class="sold">
                <td>31/12/2021</td>
                <td>Solde</td>
                <td></td>
                <td>500,00</td>
                </tr>
            </tbody>
            </table>
    `

        accountSection.appendChild(table);
        ledgerContainer.appendChild(accountSection);
    })
}