export function findChartOfAccounts({ account, label }) {
    const chartOfAccounts = {
        "275000": "dépôts et cautionnements versés",
        "401000": "fournisseurs",
        "411000": "clients",
        "467000": "autres comptes débiteurs ou créditeurs",
        "512000": "banques",
        "606000": "achats non stockés de matière et fournitures",
        "602600": "emballages",
        "607000": "achats de marchandises",
        "613000": "locations",
        "618300": "documentation technique",
        "618500": "frais de colloques, séminaires, conférences",
        "622000": "rémunérations d'intermédiaires et honoraires",
        "624100": "transports sur achats",
        "625000": "déplacements, missions et réceptions",
        "626000": "frais postaux et de télécommunications",
        "627000": "services bancaires et assimilés",
        "706000": "prestations de services",
        "707000": "ventes de marchandises",
        "754100": "dons manuels",
        "756000": "cotisations"
    };

    for (const [key, value] of Object.entries(chartOfAccounts)) {
        if (account === key || label === value) {
            return { account: key, label: value };
        }
    }

    return { account: 'xxxxxx', label: 'non défini' };
}

function convertToNumber(euroString) {
    const cleanString = euroString.replace(/\s/g, '').replace('€', '').replace(',', '.');
    return parseFloat(cleanString || 0);
}

function formatToCurrency(number) {
    return number.toFixed(2).replace('.', ',') + ' €';
}

function createEntry(date, account, receiver, piece, debit, credit) {
    return {
        'Date': date,
        'Compte': account,
        'Libellé': receiver,
        'Pièce': piece || '',
        'Débit (€)': debit || '',
        'Crédit (€)': credit || ''
    };
}

function refundEntry(line) {
    return [
        createEntry(line['date'], '467000', line['qui reçoit'], line['qui reçoit'], line['montant'], ''),
        createEntry(line['date'], '512000', line['qui reçoit'], '', '', line['montant'])
    ];
}

function chargeB2TEntry(line) {
    const piece = line['Facture correspondante'] ? `<a href="${line['Facture correspondante']}">facture</a>` : '';
    return [
        createEntry(line['date'], findChartOfAccounts({ label: line['poste'] }).account, line['qui reçoit'], '', line['montant'], ''),
        createEntry(line['date'], '401000', line['qui reçoit'], piece, '', line['montant']),
        createEntry(line['date'], '401000', line['qui reçoit'], piece, line['montant'], ''),
        createEntry(line['date'], '512000', line['qui reçoit'], '', '', line['montant'])
    ];
}

function chargePersonEntry(line) {
    const piece = line['Facture correspondante'] ? `<a href="${line['Facture correspondante']}">facture</a>` : '';
    return [
        createEntry(line['date'], findChartOfAccounts({ label: line['poste'] }).account, line['qui reçoit'], '', line['montant'], ''),
        createEntry(line['date'], '467000', line['qui reçoit'], piece, '', line['montant'])
    ];
}

function saleEntry(line) {
    return [
        createEntry(line['date'], findChartOfAccounts({ label: line['poste'] }).account, line['qui reçoit'], '', '', line['montant']),
        createEntry(line['date'], '411000', line['qui reçoit'], line['Facture correspondante'], line['montant'], ''),
        createEntry(line['date'], '411000', line['qui reçoit'], line['Facture correspondante'], '', line['montant']),
        createEntry(line['date'], '512000', line['qui reçoit'], '', line['montant'], '')
    ];
}

export function lineToEntry(line) {
    const accountNumber = findChartOfAccounts({ label: line.poste }).account;
    if (accountNumber.startsWith('4')) return refundEntry(line);
    if (accountNumber.startsWith('6')) return line['qui paye ?'] === 'B2T' ? chargeB2TEntry(line) : chargePersonEntry(line);
    if (accountNumber.startsWith('7')) return saleEntry(line);

    throw new Error(`L'écriture ${JSON.stringify(line)} n'a pu être rendue !`);
}

export function generateLedger(journalEntries) {
    const ledgerEntries = {};
    const accounts = [...new Set(journalEntries.map(({ Compte }) => Compte))].sort();
    accounts.forEach(account => {
        let total = { credit: 0, debit: 0 };

        ledgerEntries[account] = journalEntries
            .filter(entry => entry.Compte === account)
            .map(entry => {
                total.debit += convertToNumber(entry['Débit (€)']);
                total.credit += convertToNumber(entry['Crédit (€)']);
                return {
                    Date: entry.Date,
                    Libellé: entry.Libellé,
                    'Débit (€)': entry['Débit (€)'],
                    'Crédit (€)': entry['Crédit (€)'],
                };
            });

        ledgerEntries[account].push({
            Date: '31/12/2021',
            Libellé: 'Total',
            'Débit (€)': formatToCurrency(total.debit),
            'Crédit (€)': formatToCurrency(total.credit)
        });

        ledgerEntries[account].push({
            Date: '31/12/2021',
            Libellé: 'Solde',
            'Débit (€)': total.debit > total.credit ? formatToCurrency(total.debit - total.credit) : '',
            'Crédit (€)': total.debit < total.credit ? formatToCurrency(total.credit - total.debit) : ''
        });
    });

    return ledgerEntries;
}

export function generateIncomeStatement(journalEntries) {
    const incomeStatementEntries = {
        contributions: formatToCurrency(getAccountBalance(journalEntries, "756000")),
        donations: formatToCurrency(getAccountBalance(journalEntries, "754100")),
        productSales: formatToCurrency(getAccountBalance(journalEntries, "707000")),
        serviceRevenue: formatToCurrency(getAccountBalance(journalEntries, "706000")),
        totalOperatingIncome: "0,00 €",
        materialsAndSupplies: formatToCurrency(getAccountBalance(journalEntries, "602600") + getAccountBalance(journalEntries, "606000") + getAccountBalance(journalEntries, "607000")),
        externalServices: formatToCurrency(getAccountBalance(journalEntries, "613000") + getAccountBalance(journalEntries, "618500") + getAccountBalance(journalEntries, "622000") + getAccountBalance(journalEntries, "624100") + getAccountBalance(journalEntries, "625000") + getAccountBalance(journalEntries, "626000") + getAccountBalance(journalEntries, "627000")),
        otherExternalCharges: "0,00 €",
        taxes: "0,00 €",
        financialCharges: "0,00 €",
        depreciationAndProvisions: "0,00 €",
        totalOperatingExpenses: "0,00 €",
        currentResultBeforeTax: "0,00 €",
        taxOnProfits: "0,00 €",
        netResult: "0,00 €"
    };

    function getAccountBalance(entries, accountNumber) {
        return entries
            .filter(entry => entry.Compte === accountNumber)
            .reduce((balance, entry) => balance + convertToNumber(entry["Crédit (€)"]) - convertToNumber(entry["Débit (€)"]), 0);
    }

    function getTotalOperatingIncome() {
        return convertToNumber(incomeStatementEntries.contributions) +
            convertToNumber(incomeStatementEntries.donations) +
            convertToNumber(incomeStatementEntries.productSales) +
            convertToNumber(incomeStatementEntries.serviceRevenue)
    }

    function getTotalOperatingExpenses() {
        return convertToNumber(incomeStatementEntries.materialsAndSupplies) +
            convertToNumber(incomeStatementEntries.externalServices) +
            convertToNumber(incomeStatementEntries.otherExternalCharges) +
            convertToNumber(incomeStatementEntries.taxes) +
            convertToNumber(incomeStatementEntries.financialCharges) +
            convertToNumber(incomeStatementEntries.depreciationAndProvisions)
    }

    incomeStatementEntries.totalOperatingIncome = formatToCurrency(getTotalOperatingIncome())
    incomeStatementEntries.totalOperatingExpenses = formatToCurrency(getTotalOperatingExpenses())
    incomeStatementEntries.currentResultBeforeTax = formatToCurrency(getTotalOperatingIncome() + getTotalOperatingExpenses())
    incomeStatementEntries.taxOnProfits = (getTotalOperatingIncome() + getTotalOperatingExpenses()) > 0 ? formatToCurrency((getTotalOperatingIncome() + getTotalOperatingExpenses()) * .15) : "0,00 €"
    incomeStatementEntries.netResult = formatToCurrency(getTotalOperatingIncome() + getTotalOperatingExpenses() - convertToNumber(incomeStatementEntries.taxOnProfits))

    return incomeStatementEntries
}