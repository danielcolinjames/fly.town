const axios = require('axios');

const publishTopic = '0xcb48f64979fb3b71e89dc0f98135b462fe71da71985c6975b34682c682326c33'

async function fetchEventLogsByAddress(address, apiKey, topic0 = publishTopic, offset = 0) {
    const baseUrl = 'https://api.basescan.org/api';
    try {
        const response = await axios.get(baseUrl, {
            params: {
                module: 'logs',
                action: 'getLogs',
                address: address,
                page: 1,
                topic0: topic0,
                offset: offset,
                apikey: apiKey
            }
        });
        console.log(response.data)

        if (response.data && response.data.status === '1') {
            return response.data.result;
        } else {
            throw new Error('Failed to fetch event logs or no logs found');
        }
    } catch (error) {
        console.error('Error fetching event logs from BaseScan:', error.message);
        throw error;
    }
}

module.exports = { fetchEventLogsByAddress };
