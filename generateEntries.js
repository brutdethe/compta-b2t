function getNumberOfChartOfAccounts(title) {
    const chartOfAccounts = {
        "dépôts et cautionnements versés": "275000",
        "fournisseurs": "401000",
        "clients": "411000",
        "autres comptes débiteurs ou créditeurs": "467000",
        "banques": "512000",
        "achats non stockés de matière et fournitures": "606000",
        "achats de marchandises": "607000",
        "locations": "613000",
        "déplacements, missions et réceptions": "625000",
        "frais postaux et de télécommunications": "626000",
        "prestations de services": "706000",
        "ventes de marchandises": "707000",
        "dons manuels": "754100",
        "cotisations": "756000"
    };

    return chartOfAccounts[title] || 'xxxx';
}


function createEntry(date, account, piece, debit, credit) {
    return { 'Date': date, 'Compte': account, 'Pièce': piece || '', 'Débit (€)': debit || '', 'Crédit (€)': credit || '' };
}

function refundEntry(line) {
    return [
        createEntry(line['date'], '407000', line['qui reçoit'], line['montant'], ''),
        createEntry(line['date'], '512000', '', '', line['montant'])
    ];
}

function chargeB2TEntry(line) {
    const piece = line['Facture correspondante'] ? `<a href="${line['Facture correspondante']}">facture</a>` : '';
    return [
        createEntry(line['date'], getNumberOfChartOfAccounts(line['poste']), '', line['montant'], ''),
        createEntry(line['date'], '401000', piece, '', line['montant']),
        createEntry(line['date'], '401000', piece, line['montant'], ''),
        createEntry(line['date'], '512000', '', '', line['montant'])
    ];
}

function chargePersonEntry(line) {
    const piece = line['Facture correspondante'] ? `<a href="${line['Facture correspondante']}">facture</a>` : '';
    return [
        createEntry(line['date'], getNumberOfChartOfAccounts(line['poste']), '', line['montant'], ''),
        createEntry(line['date'], '407000', piece, '', line['montant'])
    ];
}

function saleEntry(line) {
    return [
        createEntry(line['date'], getNumberOfChartOfAccounts(line['poste']), '', '', line['montant']),
        createEntry(line['date'], '411000', line['Facture correspondante'], line['montant'], ''),
        createEntry(line['date'], '411000', line['Facture correspondante'], '', line['montant']),
        createEntry(line['date'], '512000', '', line['montant'], '')
    ];
}

export function lineToEntry(line) {
    const accountNumber = getNumberOfChartOfAccounts(line['poste']);
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

export function generateLedger(jsonOutput) {

}