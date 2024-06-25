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
    let cleanString = euroString.replace(/\s/g, '').replace('€', '');
    cleanString = cleanString.replace(',', '.');

    return parseFloat(cleanString || 0);
}

function formatToCurrency(number) {
    if (typeof number === 'number') {
        return number
            .toFixed(2)
            .replace('.', ',') + ' €';
    }

    return number;
}

function createEntry(date, account, piece, debit, credit) {
    return { 'Date': date, 'Compte': account, 'Pièce': piece || '', 'Débit (€)': debit || '', 'Crédit (€)': credit || '' };
}

function refundEntry(line) {
    return [
        createEntry(line['date'], '467000', line['qui reçoit'], line['montant'], ''),
        createEntry(line['date'], '512000', '', '', line['montant'])
    ];
}

function chargeB2TEntry(line) {
    const piece = line['Facture correspondante'] ? `<a href="${line['Facture correspondante']}">facture</a>` : '';
    return [
        createEntry(line['date'], findChartOfAccounts({ label: line['poste'] }).account, '', line['montant'], ''),
        createEntry(line['date'], '401000', piece, '', line['montant']),
        createEntry(line['date'], '401000', piece, line['montant'], ''),
        createEntry(line['date'], '512000', '', '', line['montant'])
    ];
}

function chargePersonEntry(line) {
    const piece = line['Facture correspondante'] ? `<a href="${line['Facture correspondante']}">facture</a>` : '';
    return [
        createEntry(line['date'], findChartOfAccounts({ label: line['poste'] }).account, '', line['montant'], ''),
        createEntry(line['date'], '467000', piece, '', line['montant'])
    ];
}

function saleEntry(line) {
    return [
        createEntry(line['date'], findChartOfAccounts({ label: line['poste'] }).account, '', '', line['montant']),
        createEntry(line['date'], '411000', line['Facture correspondante'], line['montant'], ''),
        createEntry(line['date'], '411000', line['Facture correspondante'], '', line['montant']),
        createEntry(line['date'], '512000', '', line['montant'], '')
    ];
}

export function lineToEntry(line) {
    const accountNumber = findChartOfAccounts({ label: line['poste'] }).account;
    if (accountNumber.startsWith('4')) {
        return refundEntry(line);
    }
    if (accountNumber.startsWith('6')) {
        if (line['qui paye ?'] === 'B2T') {
            return chargeB2TEntry(line);
        } else {
            return chargePersonEntry(line);
        }
    }
    if (accountNumber.startsWith('7')) {
        return saleEntry(line);
    }

    throw new Error(`L'écriture ${JSON.stringify(line)} n'a pu être rendue !`);
}

export function generateLedger(journalEntries) {
    const ledgerEntries = {};
    const accounts = Array.from(new Set(journalEntries.map(({ Compte }) => Compte).sort()))
    accounts.map(account => {
        let total = { credit: 0, debit: 0 };

        ledgerEntries[account] = journalEntries
            .filter(({ Compte }) => Compte === account)
            .map(entry => {
                total.credit += convertToNumber(entry["Débit (€)"]);
                total.debit += convertToNumber(entry["Crédit (€)"]);
                return {
                    Date: entry.Date,
                    Libellé: findChartOfAccounts({ account: entry.Compte }).label,
                    "Débit (€)": entry["Débit (€)"],
                    "Crédit (€)": entry["Crédit (€)"],
                }
            });

        ledgerEntries[account].push({ Date: "31/12/2021", Libellé: "Total", "Débit (€)": formatToCurrency(total.debit), "Crédit (€)": formatToCurrency(total.credit) })
        ledgerEntries[account].push({ Date: "31/12/2021", Libellé: "Solde", "Débit (€)": formatToCurrency(total.debit > total.credit ? total.debit - total.credit : ""), "Crédit (€)": formatToCurrency(total.debit < total.credit ? total.credit - total.debit : "") })
    })

    return ledgerEntries;
}