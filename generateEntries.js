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
        createEntry(line['date'], '467000', line['qui reçoit'], line['qui reçoit'], convertToNumber(line['montant']), ''),
        createEntry(line['date'], '512000', line['qui reçoit'], '', '', convertToNumber(line['montant']))
    ];
}

function chargeB2TEntry(line) {
    const piece = line['Facture correspondante'] ? `<a href="${line['Facture correspondante']}">facture</a>` : '';
    return [
        createEntry(line['date'], findChartOfAccounts({ label: line['poste'] }).account, line['qui reçoit'], '', convertToNumber(line['montant']), ''),
        createEntry(line['date'], '401000', line['qui reçoit'], piece, '', convertToNumber(line['montant'])),
        createEntry(line['date'], '401000', line['qui reçoit'], piece, convertToNumber(line['montant']), ''),
        createEntry(line['date'], '512000', line['qui reçoit'], '', '', convertToNumber(line['montant']))
    ];
}

function chargePersonEntry(line) {
    const piece = line['Facture correspondante'] ? `<a href="${line['Facture correspondante']}">facture</a>` : '';
    return [
        createEntry(line['date'], findChartOfAccounts({ label: line['poste'] }).account, line['qui reçoit'], '', convertToNumber(line['montant']), ''),
        createEntry(line['date'], '467000', line['qui reçoit'], piece, '', convertToNumber(line['montant']))
    ];
}

function saleEntry(line) {
    return [
        createEntry(line['date'], findChartOfAccounts({ label: line['poste'] }).account, line['qui reçoit'], '', '', convertToNumber(line['montant'])),
        createEntry(line['date'], '411000', line['qui reçoit'], line['Facture correspondante'], convertToNumber(line['montant']), ''),
        createEntry(line['date'], '411000', line['qui reçoit'], line['Facture correspondante'], '', convertToNumber(line['montant'])),
        createEntry(line['date'], '512000', line['qui reçoit'], '', convertToNumber(line['montant']), '')
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
                total.debit += +entry['Débit (€)'];
                total.credit += +entry['Crédit (€)'];
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
            'Débit (€)': total.debit,
            'Crédit (€)': total.credit
        });

        ledgerEntries[account].push({
            Date: '31/12/2021',
            Libellé: 'Solde',
            'Débit (€)': total.debit > total.credit ? +total.debit - +total.credit : '',
            'Crédit (€)': total.debit < total.credit ? +total.credit - +total.debit : ''
        });
    });

    return ledgerEntries;
}

export function generateIncomeStatement(journalEntries) {
    const incomeStatementEntries = {
        contributions: getAccountBalance(journalEntries, "756000"),
        donations: getAccountBalance(journalEntries, "754100"),
        productSales: getAccountBalance(journalEntries, "707000"),
        serviceRevenue: getAccountBalance(journalEntries, "706000"),
        totalOperatingIncome: 0.00,
        materialsAndSupplies: getAccountBalance(journalEntries, "602600") + getAccountBalance(journalEntries, "606000") + getAccountBalance(journalEntries, "607000"),
        externalServices: getAccountBalance(journalEntries, "613000") + getAccountBalance(journalEntries, "618500") + getAccountBalance(journalEntries, "622000") + getAccountBalance(journalEntries, "624100") + getAccountBalance(journalEntries, "625000") + getAccountBalance(journalEntries, "626000") + getAccountBalance(journalEntries, "627000"),
        otherExternalCharges: 0.00,
        taxes: 0.00,
        financialCharges: 0.00,
        depreciationAndProvisions: 0.00,
        totalOperatingExpenses: 0.00,
        currentResultBeforeTax: 0.00,
        taxOnProfits: 0.00,
        netResult: 0.00
    };

    function getAccountBalance(entries, accountNumber) {
        return entries
            .filter(entry => entry.Compte === accountNumber)
            .reduce((balance, entry) => balance + entry["Crédit (€)"] - entry["Débit (€)"], 0);
    }

    function getTotalOperatingIncome() {
        return +incomeStatementEntries.contributions +
            incomeStatementEntries.donations +
            incomeStatementEntries.productSales +
            incomeStatementEntries.serviceRevenue
    }

    function getTotalOperatingExpenses() {
        return +incomeStatementEntries.materialsAndSupplies +
            incomeStatementEntries.externalServices +
            incomeStatementEntries.otherExternalCharges +
            incomeStatementEntries.taxes +
            incomeStatementEntries.financialCharges +
            incomeStatementEntries.depreciationAndProvisions
    }

    incomeStatementEntries.totalOperatingIncome = getTotalOperatingIncome()
    incomeStatementEntries.totalOperatingExpenses = getTotalOperatingExpenses()
    incomeStatementEntries.currentResultBeforeTax = getTotalOperatingIncome() + getTotalOperatingExpenses()
    incomeStatementEntries.taxOnProfits = (getTotalOperatingIncome() + getTotalOperatingExpenses()) > 0 ? (getTotalOperatingIncome() + getTotalOperatingExpenses()) * .15 : 0.00
    incomeStatementEntries.netResult = getTotalOperatingIncome() + getTotalOperatingExpenses() - incomeStatementEntries.taxOnProfits

    return incomeStatementEntries
}