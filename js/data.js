class DataManager {
    constructor() {
        this.SHEET_ID = '你的Google Sheet ID';  // 稍後替換
        this.API_KEY = '你的API Key';  // 稍後替換
        this.RANGE = 'Sheet1!A:Z';
    }

    async initializeGoogleSheetsAPI() {
        return new Promise((resolve, reject) => {
            gapi.load('client', async () => {
                try {
                    await gapi.client.init({
                        apiKey: this.API_KEY,
                        discoveryDocs: ['https://sheets.googleapis.com/$discovery/rest?version=v4']
                    });
                    resolve();
                } catch (error) {
                    reject(error);
                }
            });
        });
    }

    async getData() {
        try {
            await this.initializeGoogleSheetsAPI();
            const response = await gapi.client.sheets.spreadsheets.values.get({
                spreadsheetId: this.SHEET_ID,
                range: this.RANGE
            });
            return response.result.values || [];
        } catch (error) {
            console.error('Error reading data:', error);
            return [];
        }
    }

    async saveData(data) {
        try {
            await this.initializeGoogleSheetsAPI();
            await gapi.client.sheets.spreadsheets.values.append({
                spreadsheetId: this.SHEET_ID,
                range: this.RANGE,
                valueInputOption: 'RAW',
                insertDataOption: 'INSERT_ROWS',
                resource: {
                    values: [data]
                }
            });
            return true;
        } catch (error) {
            console.error('Error saving data:', error);
            return false;
        }
    }
}
