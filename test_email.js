import emailjs from '@emailjs/browser';

global.location = { href: "http://localhost:3000" };
global.XMLHttpRequest = class {
  open() {}
  send() {
    this.onload && this.onload();
  }
};

async function test() {
  const serviceId = 'default_service';
  const templateId = 'template_gmucd5s';
  const publicKey = 'LyR7uPNP80yEgPXCC';

  const templateParams = {
      to_name: "John",
      order_id: "EH-000001",
      product_name: "Test",
      download_link: "http://example.com",
      email: "test@example.com",
      to_email: "test@example.com",
      name: "Editors Hub Store",
      subject: "Thanks",
      body: "Test body"
  };

  try {
    const res = await emailjs.send(serviceId, templateId, templateParams, { publicKey });
    console.log(res);
  } catch (err) {
    console.error(err);
  }
}

test();
