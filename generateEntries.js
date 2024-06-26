export function findChartOfAccounts({ account, label }) {
    const chartOfAccounts = {
        "275000": "dépôts et cautionnements versés",
        "401000": "fournisseurs",
        "411000": "clients",
        "467000": "autres comptes débiteurs ou créditeurs",
        "512000": "banques",
        "606000": "achats non stockés de matière et fournitures",
        "607000": "achats de marchandises",
        "613000": "locations",
        "625000": "déplacements, missions et réceptions",
        "626000": "frais postaux et de télécommunications",
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
    console.log("generateIncomeStatement")
    return
}