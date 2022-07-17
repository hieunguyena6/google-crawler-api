const cheerio = require('cheerio');
import fetch from 'node-fetch';
import { UAs } from '@/utils/userAgents';
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const mkdirp = require('mkdirp');

class GoogleSpider {
  public async crawlData(keyword: string) {
    const options = {
      method: 'GET',
      headers: {
        'user-agent': UAs[Math.floor(Math.random() * UAs.length)],
      },
    };
    const response = await fetch(`https://google.com/search?q=${keyword.split(' ').join('+')}&gl=s&hl=en`, options);
    const html = await response.text();
    const $ = cheerio.load(html);
    const resultText = $('#result-stats').text();
    let totalResult = '0';
    let timeFetch = '0';
    if (resultText) {
      totalResult = resultText.split('(')[0].split(' ')[1] || 0;
      timeFetch = resultText.split('(')[1].split(' ')[0] || 0;
    }
    const totalLink = $('.uEierd').length + $('.g').length + $('.zBAuLc').length;
    const file_path = `uploads/html/${uuidv4()}-${keyword}.html`;
    await mkdirp('uploads/html');
    await this.writeFile(file_path, html);
    return {
      totalResult,
      timeFetch,
      totalAd: $('.uEierd').length,
      totalLink,
      cachePath: file_path,
    };
  }
  private async writeFile(filename, writedata) {
    try {
      fs.writeFileSync(filename, writedata, 'utf8');
    } catch (err) {
      console.log(err);
    }
  }
}

export default GoogleSpider;
