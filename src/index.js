
// BlueButton open source conferencing system - http://www.bigbluebutton.org/
//
// Copyright (c) 2020 BigBlueButton Inc. and by respective authors (see below).
//
// This program is free software; you can redistribute it and/or modify it under the
// terms of the GNU Lesser General Public License as published by the Free Software
// Foundation; either version 3.0 of the License, or (at your option) any later
// version.
//
// BigBlueButton is distributed in the hope that it will be useful, but WITHOUT ANY
// WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A
// PARTICULAR PURPOSE. See the GNU Lesser General Public License for more details.
//
// You should have received a copy of the GNU Lesser General Public License along
// with BigBlueButton; if not, see <http://www.gnu.org/licenses/>.

const puppeteer = require('puppeteer');
const BbbClient = require('./core/page');
const Xvfb = require('xvfb');
const sleep = require('sleep-promise');
const useXvfb = true;

(async () => {
    var xvfb = new Xvfb({
        silent: true,
        xvfb_args: ["-screen", "0", '1280x720x24', "-ac"],
    });
    
    let xvfbDisplay;
    if(useXvfb) {
        console.log("> Starting XVFB");
        const xvfbReturn = xvfb.startSync();
        xvfbDisplay = xvfbReturn.spawnargs[1];
        console.log("< XVFB started, display", xvfbDisplay);
    }

    const args = [ 
        '--start-maximized', 
        '--enable-usermedia-screen-capturing', 
        '--window-size=1280,720', 
        '--no-sandbox', 
        '--no-default-browser-check',  
        '--use-fake-ui-for-media-stream', 
        '--lang=en-US', 
        '--start-fullscreen', 
        useXvfb ? '--display='+xvfbDisplay : undefined
    ].filter((e)=> e);

    console.log('debugging args ', args)

    const browser = await puppeteer.launch( { headless: false, args, ignoreDefaultArgs: ['--enable-automation']} );
    console.log(`Running with useXvfb: `, useXvfb);
    const joinURL = process.argv[2];
    const waitTime = process.argv[3];
    
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 720 });
    await page.setDefaultTimeout(3600000);

    const bbbClient = new BbbClient(page);

    console.log("> Opening page", joinURL);
    await page.goto(joinURL);
    console.log("< Page loaded", joinURL);

    // closeAudioModal
    console.log("> Closing Audio Modal!")
    await bbbClient.closeAudioModal();
    console.log("< Audio Modal closed!")

    // Take Presenter
    await bbbClient.takePresenter();
    
    // Start Sharingscreen
    await bbbClient.startScreenshare();

    
    // Listening to webcams
    setInterval(async () => {
        await page.evaluate(()=>{
          let canvas = document.querySelectorAll('[class^="videoCanvas"]');
          if(canvas.length)
          canvas[0].requestFullscreen()
        });
    }, 1000)

    // Listening to Logout screen
    setInterval(async () => {
        const logout = await page.evaluate(()=> document.querySelectorAll('[description="Logs you out of the meeting"]').length === 1);
        if(logout) process.exit(0);
    }, 1000)
    
    console.log('> Before waiting');
    await sleep(parseInt(waitTime) || 60*60*1000);
    console.log('< After waiting');

    console.log("> Stopping XVFB");
    if(useXvfb) {
        xvfb.stopSync();
    }

    console.log("> XVFB stopped");

    console.log("All done, bye!");
})();

