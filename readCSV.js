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

    const jsonData = JSON.stringify(data, null, 2)
    return jsonData
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

        console.log(jsonOutput)
    })
    .catch(error => console.error('Erreur lors du chargement du fichier CSV :', error))