export function parseCSV(csv) {
    const [headerLine, ...lines] = csv.trim().split(/\r?\n/);
    const headers = headerLine.split(',').map(header => header.trim());

    return lines.map(line => {
        const rowData = [];
        let insideQuotes = false;
        let field = '';

        for (let char of line.trim()) {
            if (char === '"') {
                insideQuotes = !insideQuotes;
            } else if (char === ',' && !insideQuotes) {
                rowData.push(field.trim().replace(/"/g, ''));
                field = '';
            } else {
                field += char;
            }
        }
        rowData.push(field.trim().replace(/"/g, ''));

        return headers.reduce((obj, header, index) => {
            obj[header] = rowData[index] || '';
            return obj;
        }, {});
    });
}