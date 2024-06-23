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

function parseCSV(csv) {
    const [headerLine, ...lines] = csv.trim().split(/\r?\n/);
    const headers = headerLine.split(',').map(header => header.trim());
    const data = lines.map(line => {
        const rowData = [];
        let insideQuotes = false;
        let field = '';

        for (let char of line.trim()) {
            if (char === '"') {
                insideQuotes = !insideQuotes;
            } else if (char === ',' && !insideQuotes) {
                rowData.push(field);
                field = '';
            } else {
                field += char;
            }
        }

        rowData.push(field);
        const rowObject = {};
        headers.forEach((header, index) => {
            rowObject[header] = rowData[index] ? rowData[index].trim().replace(/"/g, '') : '';
        });

        return rowObject;
    });

    return data;
}

function chargeEntry(line) {
    const entries = [{
            'Date': line['date'],
            'Compte': getNumberOfChartOfAccounts(line['poste']),
            'Pièce': '',
            'Débit (€)': line['montant'],
            'Crédit (€)': ''
        },
        {
            'Date': line['date'],
            'Compte': '401000',
            'Pièce': line['Facture correspondante'] && `<a href="${line['Facture correspondante']}">facture</a>`,
            'Débit (€)': '',
            'Crédit (€)': line['montant']
        },
        {
            'Date': line['date'],
            'Compte': '401000',
            'Pièce': line['Facture correspondante'] && `<a href="${line['Facture correspondante']}">facture</a>`,
            'Débit (€)': line['montant'],
            'Crédit (€)': ''
        },
        {
            'Date': line['date'],
            'Compte': line['qui paye ?'] === 'B2T' ? '512000' : '467000',
            'Pièce': '',
            'Débit (€)': '',
            'Crédit (€)': line['montant']
        }
    ];

    return entries;
}


function saleEntry(line) {
    const entries = [{
            'Date': line['date'],
            'Compte': getNumberOfChartOfAccounts(line['poste']),
            'Pièce': '',
            'Débit (€)': '',
            'Crédit (€)': line['montant']
        },
        {
            'Date': line['date'],
            'Compte': '411000',
            'Pièce': line['Facture correspondante'],
            'Débit (€)': line['montant'],
            'Crédit (€)': ''
        },
        {
            'Date': line['date'],
            'Compte': '411000',
            'Pièce': line['Facture correspondante'],
            'Débit (€)': '',
            'Crédit (€)': line['montant']
        },
        {
            'Date': line['date'],
            'Compte': '512000',
            'Pièce': '',
            'Débit (€)': line['montant'],
            'Crédit (€)': ''
        },
    ];

    return entries;
}

function lineToEntry(line) {
    const accountNumber = getNumberOfChartOfAccounts(line['poste']);
    if (accountNumber.startsWith('6')) {
        return chargeEntry(line);
    }
    if (accountNumber.startsWith('7')) {
        return saleEntry(line);
    }

    throw new Error(`L'écriture ${JSON.stringify(line)} n'a pu être rendue !`);
}

function injectEntriesIntoTable(entries) {
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

const url = '001_compta-b2t.csv';

fetch(url)
    .then(response => {
        if (!response.ok) {
            throw new Error(`Erreur HTTP ${response.status} - ${response.statusText}`);
        }
        return response.text();
    })
    .then(csvData => {
        const jsonOutput = parseCSV(csvData);
        const allEntries = jsonOutput.flatMap(line => lineToEntry(line));
        injectEntriesIntoTable(allEntries);
    })
    .catch(error => console.error('Erreur lors du chargement du fichier CSV :', error));