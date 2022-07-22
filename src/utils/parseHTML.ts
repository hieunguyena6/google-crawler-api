const cheerio = require('cheerio');

const RESULT_STATS_ID = '#result-stats';
const ADS_CLASS = '.uEierd';
const RESULT_BLOCK_CLASS_1 = '.g';
const RESULT_BLOCK_CLASS_2 = '.zBAuLc';

const parseHTML = (html: string) => {
  const $ = cheerio.load(html);
  const resultText = $(RESULT_STATS_ID).text();
  let totalResult = '0';
  let timeFetch = '0';
  if (resultText) {
    totalResult = resultText.split('(')[0].split(' ')[1] || 0;
    timeFetch = resultText.split('(')[1].split(' ')[0] || 0;
  }
  const totalLink = $(ADS_CLASS).length + $(RESULT_BLOCK_CLASS_1).length + $(RESULT_BLOCK_CLASS_2).length;
  return {
    totalResult,
    timeFetch,
    totalAd: $(ADS_CLASS).length,
    totalLink,
  };
};
export default parseHTML;
