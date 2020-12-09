const sleep = require('sleep-promise');
const e = require('./elements');

class Page {
  constructor(page) {
    this.page = page;
  }

  async takePresenter() {
    this.page.evaluate(async () => {
      await document.querySelectorAll('div[class*="userListItem--"] > div > div')[0].parentNode.click()
      await document.querySelectorAll('i[class*="icon-bbb-presentation"]')[0].parentNode.click()  
    })
  }

  async startScreenshare() {
    await this.waitForSelector(e.screenShare);
    await this.click(e.screenShare, true);
  }

  async closeAudioModal() {
    await this.waitForSelector(e.audioDialog);
    await this.click(e.closeAudio, true);
  }

  async click(element, relief = false) {
    if (relief) await sleep(1000);
    await this.waitForSelector(element);
    await this.page.click(element);
  }

  async waitForSelector(element, timeout) {
    await this.page.waitForSelector(element, { timeout: timeout });
  }
}

module.exports = exports = Page;
