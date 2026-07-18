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
global.navigator = { webdriver: false, languages: ["en-US"] };

async function test() {
  const serviceId = 'service_xpkewvr';
  const templateId = 'template_m3uwyfs';
  const publicKey = 'LyR7uPNP80yEgPXCC';

  const templateParams = {
      to_name: "Test",
      order_id: "TEST-01",
      product_name: "Test",
      download_link: "http://test",
      email: "aniketrajcargal123@gmail.com",
      name: "Editors Hub Store",
      subject: "Test Subject",
      message: "Test Message"
  };

  try {
    const res = await emailjs.send(serviceId, templateId, templateParams, { publicKey });
    console.log(res);
  } catch (err) {
    console.error(err);
  }
}

test();
