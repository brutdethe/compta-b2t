import { findChartOfAccounts } from './generateEntries.js';

export function injectEntriesIntoTable(entries) {
    const tableBody = document.getElementById('journal-entries');
    entries.forEach(entry => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${entry.Date}</td>
            <td>${entry.Compte}</td>
            <td>${entry.Pièce}</td>
            <td>${entry['Débit (€)']}</td>
            <td>${entry['Crédit (€)']}</td>
        `;
        tableBody.appendChild(row);
    });
}

export function injectLedgerEntries(ledgerEntries) {
    const ledgerContainer = document.getElementById('ledger-entries');
    Object.entries(ledgerEntries).forEach(([account, entries]) => {
                const accountSection = document.createElement('div');
                accountSection.className = 'account';
                accountSection.innerHTML = `<h2>${account} - ${findChartOfAccounts({ account }).label}</h2>`;

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
                    <tr class="${entry.Libellé === 'Total' ? 'total' : entry.Libellé === 'Solde' ? 'solde' : ''}">
                        <td>${entry.Date}</td>
                        <td>${entry.Libellé}</td>
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

export function injectIncomeStatementEntries(entries) {
    const tableBody = document.getElementById('income-statement-entries');
        tableBody.innerHTML = `
            <tr>
                <td>Produits d'exploitation</td>
                <td></td>
            </tr>
            <tr>
                <td>&nbsp;&nbsp;&nbsp;Cotisations des membres</td>
                <td>5,000.00 €</td>
            </tr>
            <tr>
                <td>&nbsp;&nbsp;&nbsp;Subventions d'exploitation</td>
                <td>10,000.00 €</td>
            </tr>
            <tr>
                <td>&nbsp;&nbsp;&nbsp;Dons et legs</td>
                <td>2,000.00 €</td>
            </tr>
            <tr>
                <td>&nbsp;&nbsp;&nbsp;Ventes de produits ou services</td>
                <td>8,000.00 €</td>
            </tr>
            <tr>
                <td>&nbsp;&nbsp;&nbsp;Autres produits d'exploitation</td>
                <td>1,000.00 €</td>
            </tr>
            <tr class="total">
                <td>Total des produits d'exploitation</td>
                <td>26,000.00 €</td>
            </tr>
            <tr>
                <td>Charges d'exploitation</td>
                <td></td>
            </tr>
            <tr>
                <td>&nbsp;&nbsp;&nbsp;Achats consommés de matières et fournitures</td>
                <td>(5,000.00 €)</td>
            </tr>
            <tr>
                <td>&nbsp;&nbsp;&nbsp;Services extérieurs</td>
                <td>(6,000.00 €)</td>
            </tr>
            <tr>
                <td>&nbsp;&nbsp;&nbsp;Autres charges externes</td>
                <td>(1,500.00 €)</td>
            </tr>
            <tr>
                <td>&nbsp;&nbsp;&nbsp;Impôts, taxes et versements assimilés</td>
                <td>(500.00 €)</td>
            </tr>
            <tr>
                <td>&nbsp;&nbsp;&nbsp;Charges financières</td>
                <td>(200.00 €)</td>
            </tr>
            <tr>
                <td>&nbsp;&nbsp;&nbsp;Dotations aux amortissements et provisions</td>
                <td>(800.00 €)</td>
            </tr>
            <tr class="total">
                <td>Total des charges d'exploitation</td>
                <td>(14,000.00 €)</td>
            </tr>
            <tr class="total">
                <td>Résultat d'exploitation</td>
                <td>12,000.00 €</td>
            </tr>
            <tr>
                <td>Produits financiers</td>
                <td></td>
            </tr>
            <tr>
                <td>&nbsp;&nbsp;&nbsp;Revenus de placements</td>
                <td>500.00 €</td>
            </tr>
            <tr class="total">
                <td>Résultat financier</td>
                <td>500.00 €</td>
            </tr>
            <tr class="total">
                <td>Résultat courant avant impôts</td>
                <td>12,500.00 €</td>
            </tr>
            <tr>
                <td>Résultat exceptionnel</td>
                <td></td>
            </tr>
            <tr>
                <td>&nbsp;&nbsp;&nbsp;Produits exceptionnels</td>
                <td>300.00 €</td>
            </tr>
            <tr>
                <td>&nbsp;&nbsp;&nbsp;Charges exceptionnelles</td>
                <td>(100.00 €)</td>
            </tr>
            <tr class="total">
                <td>Résultat exceptionnel</td>
                <td>200.00 €</td>
            </tr>
            <tr class="total">
                <td>Résultat courant avant impôts</td>
                <td>12,700.00 €</td>
            </tr>
            <tr>
                <td>Impôt sur les bénéfices</td>
                <td>(2,500.00 €)</td>
            </tr>
            <tr class="total">
                <td>Résultat net</td>
                <td>10,200.00 €</td>
            </tr>
        `;
}