import emailjs from '@emailjs/browser';
import fetch from 'node-fetch';

global.fetch = fetch;
global.location = { href: "http://localhost:3000", pathname: "/" };
global.XMLHttpRequest = class {
  open() {}
  send() {
    this.onload && this.onload();
  }
};
Object.defineProperty(global, 'navigator', {
  value: { webdriver: false, languages: ["en-US"] },
  writable: true
});

async function test() {
  const serviceId = 'service_xpkewvr';
  const templateId = 'template_m3uwyfs';
  const publicKey = 'LyR7uPNP80yEgPXCC';

  const templateParams = {
      email: "aniketrajcargal123@gmail.com",
      name: "Editors Hub Store",
      subject: "Test Subject",
      message: "Test Message"
  };

  try {
    const res = await emailjs.send(serviceId, templateId, templateParams, { publicKey });
    console.log("Success:", res);
  } catch (err) {
    console.error("Error:", err);
  }
}

test();
