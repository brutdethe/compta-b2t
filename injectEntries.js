import { findChartOfAccounts } from './generateEntries.js';

function formatToCurrency(number) {
    return number ? number.toFixed(2).replace('.', ',') + ' €' : '';
}

export function injectEntriesIntoTable(entries) {
    const tableBody = document.getElementById('journal-entries');
    tableBody.innerHTML = entries.map(entry => `
        <tr>
            <td>${entry.Date}</td>
            <td>${entry.Compte}</td>
            <td>${entry.Pièce}</td>
            <td>${formatToCurrency(entry['Débit (€)'])}</td>
            <td>${formatToCurrency(entry['Crédit (€)'])}</td>
        </tr>
    `).join('');
}

export function injectLedgerEntries(ledgerEntries) {
    const ledgerContainer = document.getElementById('ledger-entries');
    ledgerContainer.innerHTML = Object.entries(ledgerEntries).map(([account, entries]) => {
                const accountLabel = findChartOfAccounts({ account }).label;
                return `
            <div class="account">
                <h2>${account} - ${accountLabel}</h2>
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
                        ${entries.map(entry => `
                            <tr class="${entry.Libellé === 'Total' ? 'total' : entry.Libellé === 'Solde' ? 'solde' : ''}">
                                <td>${entry.Date}</td>
                                <td>${entry.Libellé}</td>
                                <td>${formatToCurrency(entry['Débit (€)'])}</td>
                                <td>${formatToCurrency(entry['Crédit (€)'])}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    }).join('');
}

export function injectIncomeStatementEntries(entries) {
    const tableBody = document.getElementById('income-statement-entries');
    tableBody.innerHTML = `
        <tr>
            <td class="income-statement-title">Produits d'exploitation</td>
            <td></td>
        </tr>
        <tr>
            <td>&nbsp;&nbsp;&nbsp;Cotisations des membres</td>
            <td>${formatToCurrency(entries.contributions)}</td>
        </tr>
        <tr>
            <td>&nbsp;&nbsp;&nbsp;Dons</td>
            <td>${formatToCurrency(entries.donations)}</td>
        </tr>
        <tr>
            <td>&nbsp;&nbsp;&nbsp;Ventes de produits</td>
            <td>${formatToCurrency(entries.productSales)}</td>
        </tr>
        <tr>
            <td>&nbsp;&nbsp;&nbsp;Prestations de services</td>
            <td>${formatToCurrency(entries.serviceRevenue)}</td>
        </tr>
        <tr class="total">
            <td>Total des produits d'exploitation</td>
            <td>${formatToCurrency(entries.totalOperatingIncome)}</td>
        </tr>
        <tr>
            <td class="income-statement-title">Charges d'exploitation</td>
            <td></td>
        </tr>
        <tr>
            <td>&nbsp;&nbsp;&nbsp;Achats consommés de matières et fournitures</td>
            <td>${formatToCurrency(entries.materialsAndSupplies)}</td>
        </tr>
        <tr>
            <td>&nbsp;&nbsp;&nbsp;Services extérieurs</td>
            <td>${formatToCurrency(entries.externalServices)}</td>
        </tr>
        <tr>
            <td>&nbsp;&nbsp;&nbsp;Autres charges externes</td>
            <td>${formatToCurrency(entries.otherExternalCharges)}</td>
        </tr>
        <tr>
            <td>&nbsp;&nbsp;&nbsp;Impôts, taxes et versements assimilés</td>
            <td>${formatToCurrency(entries.taxes)}</td>
        </tr>
        <tr>
            <td>&nbsp;&nbsp;&nbsp;Charges financières</td>
            <td>${formatToCurrency(entries.financialCharges)}</td>
        </tr>
        <tr>
            <td>&nbsp;&nbsp;&nbsp;Dotations aux amortissements et provisions</td>
            <td>${formatToCurrency(entries.depreciationAndProvisions)}</td>
        </tr>
        <tr class="total">
            <td>Total des charges d'exploitation</td>
            <td>${formatToCurrency(entries.totalOperatingExpenses)}</td>
        </tr>
        <tr class="total">
            <td>Résultat courant avant impôts</td>
            <td>${formatToCurrency(entries.currentResultBeforeTax)}</td>
        </tr>
        <tr>
            <td>Impôt sur les bénéfices</td>
            <td>${formatToCurrency(entries.taxOnProfits)}</td>
        </tr>
        <tr class="total">
            <td>Résultat net</td>
            <td>${formatToCurrency(entries.netResult)}</td>
        </tr>
    `;
}