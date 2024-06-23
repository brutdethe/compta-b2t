function parseCSV(csv) {
    const rows = csv.split(/\r?\n/)
    const headers = rows[0].split(',')
    const data = []

    for (let i = 1; i < rows.length; i++) {
        const rowData = []
        let currentRow = rows[i].trim()

        let insideQuotes = false
        let field = ''

        for (let j = 0; j < currentRow.length; j++) {
            const char = currentRow[j]
            if (char === '"') {
                insideQuotes = !insideQuotes
            } else if (char === ',' && !insideQuotes) {
                rowData.push(field)
                field = ''
            } else {
                field += char
            }
        }

        rowData.push(field);
        const rowObject = {};
        headers.forEach((header, index) => {
            rowObject[header.trim()] = rowData[index] ? rowData[index].trim().replace(/"/g, '') : ''
        });

        data.push(rowObject)
    }

    return data
}

function lineToEntry(line) {
    const chartOfAccounts = {
        'location': '613000'
    }
    const entries = []

    entries.push({
        'Date': line['date'],
        'Compte': chartOfAccounts[line['poste']],
        'Pièce': '',
        'Débit (€)': line['montant'],
        'Crédit (€)': ''
    })

    entries.push({
        'Date': line['date'],
        'Compte': '401000',
        'Pièce': '<a href="' + line['Facture correspondante'] + '">facture</a>',
        'Débit (€)': '',
        'Crédit (€)': line['montant']
    })

    entries.push({
        'Date': line['date'],
        'Compte': '512000',
        'Pièce': '',
        'Débit (€)': '',
        'Crédit (€)': line['montant']
    })

    entries.push({
        'Date': line['date'],
        'Compte': '401000',
        'Pièce': '<a href="' + line['Facture correspondante'] + '">facture</a>',
        'Débit (€)': line['montant'],
        'Crédit (€)': ''
    })

    return entries
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


const url = '001_compta-b2t.csv'

fetch(url)
    .then(response => {
        if (!response.ok) {
            throw new Error(`Erreur HTTP ${response.status} - ${response.statusText}`)
        }
        return response.text()
    })
    .then(csvData => {
        const jsonOutput = parseCSV(csvData)
        const allEntries = jsonOutput.flatMap(line => lineToEntry(line))
        injectEntriesIntoTable(allEntries)
    })
    .catch(error => console.error('Erreur lors du chargement du fichier CSV :', error))