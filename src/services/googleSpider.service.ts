import fetch from 'node-fetch';
import { UAs } from '@/utils/userAgents';
const GOOGLE_URL = 'https://google.com/search';
class GoogleSpider {
  public async crawlData(keyword: string) {
    const options = {
      method: 'GET',
      headers: {
        'user-agent': UAs[Math.floor(Math.random() * UAs.length)],
      },
    };
    const response = await fetch(`${GOOGLE_URL}?q=${keyword.split(' ').join('+')}&gl=s&hl=en`, options);
    const html = await response.text();
    return html;
  }
}

export default GoogleSpider;
