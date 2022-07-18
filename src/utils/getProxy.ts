import fetch from 'node-fetch';
const cheerio = require('cheerio');
import { logger } from '@utils/logger';

async function proxyGenerator() {
  const ip_addresses = [];
  const port_numbers = [];
  const google = [];
  try {
    const response = await fetch('https://sslproxies.org/');
    const html = await response.text();
    const $ = cheerio.load(html);

    $('td:nth-child(1)').each(function (index, value) {
      ip_addresses[index] = $(this).text();
    });

    $('td:nth-child(2)').each(function (index, value) {
      port_numbers[index] = $(this).text();
    });

    $('td:nth-child(6)').each(function (index, value) {
      google[index] = $(this).text();
    });
    console.log(google);

    return [...ip_addresses.map((ip, index) => `http://${ip}:${port_numbers[index]}`)];
  } catch (error) {
    logger.error('Error loading proxy, please try again ', error);
    return [];
  }
}

export default proxyGenerator;
