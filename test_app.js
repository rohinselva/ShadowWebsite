const fs = require('fs');
const { JSDOM } = require('jsdom');

let html = fs.readFileSync('index.html', 'utf8');
const dom = new JSDOM(html, { url: "http://localhost:8080/#product=1" });

global.window = dom.window;
global.document = dom.window.document;
global.localStorage = {
  getItem: () => null,
  setItem: () => {}
};
global._firebaseAuthReady = () => {};
global._firebaseAuth = {};
global.event = { stopPropagation: () => {} };

try {
  let code = fs.readFileSync('app.js', 'utf8');
  eval(code);
  console.log("App evaluated.");
  
  if (typeof initApp === 'function') {
    initApp();
  } else if (typeof window.initApp === 'function') {
    window.initApp();
  } else {
    const event = dom.window.document.createEvent('Event');
    event.initEvent('DOMContentLoaded', true, true);
    dom.window.document.dispatchEvent(event);
  }
  
  console.log("main content HTML length:", document.getElementById('main-content').innerHTML.length);
} catch (e) {
  console.error("Error during runtime:", e);
}
