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
                <td>${entries.contributions}</td>
            </tr>
            <tr>
                <td>&nbsp;&nbsp;&nbsp;Dons</td>
                <td>${entries.donations}</td>
            </tr>
            <tr>
                <td>&nbsp;&nbsp;&nbsp;Ventes de produits</td>
                <td>${entries.productSales}</td>
            </tr>
            <tr>
                <td>&nbsp;&nbsp;&nbsp;Prestations de services</td>
                <td>${entries.serviceRevenue}</td>
            </tr>
            <tr class="total">
                <td>Total des produits d'exploitation</td>
                <td>${entries.totalOperatingIncome}</td>
            </tr>
            <tr>
                <td>Charges d'exploitation</td>
                <td></td>
            </tr>
            <tr>
                <td>&nbsp;&nbsp;&nbsp;Achats consommés de matières et fournitures</td>
                <td>${entries.materialsAndSupplies}</td>
            </tr>
            <tr>
                <td>&nbsp;&nbsp;&nbsp;Services extérieurs</td>
                <td>${entries.externalServices}</td>
            </tr>
            <tr>
                <td>&nbsp;&nbsp;&nbsp;Autres charges externes</td>
                <td>${entries.otherExternalCharges}</td>
            </tr>
            <tr>
                <td>&nbsp;&nbsp;&nbsp;Impôts, taxes et versements assimilés</td>
                <td>${entries.taxes}</td>
            </tr>
            <tr>
                <td>&nbsp;&nbsp;&nbsp;Charges financières</td>
                <td>${entries.financialCharges}</td>
            </tr>
            <tr>
                <td>&nbsp;&nbsp;&nbsp;Dotations aux amortissements et provisions</td>
                <td>${entries.depreciationAndProvisions}</td>
            </tr>
            <tr class="total">
                <td>Total des charges d'exploitation</td>
                <td>${entries.totalOperatingExpenses}</td>
            </tr>
            <tr class="total">
                <td>Résultat d'exploitation</td>
                <td>${entries.operatingResult}</td>
            </tr>
            <tr class="total">
                <td>Résultat financier</td>
                <td>${entries.financialResult}</td>
            </tr>
            <tr class="total">
                <td>Résultat courant avant impôts</td>
                <td>${entries.currentResultBeforeTax}</td>
            </tr>
            <tr>
                <td>Impôt sur les bénéfices</td>
                <td>${entries.taxOnProfits}</td>
            </tr>
            <tr class="total">
                <td>Résultat net</td>
                <td>${entries.netResult}</td>
            </tr>
        `;
}