require('dotenv').config();

const qrcode = require('qrcode-terminal');
const { Client, LocalAuth } = require('whatsapp-web.js');
const calendar = require('./calendar');
const generator = require('./textGenerator');
const { convert } = require('html-to-text');

const client = new Client({
    authStrategy: new LocalAuth(),
})

client.on('qr', qr => {
    qrcode.generate(qr, {small: true});
});

client.on('ready', async () => {
    try {
        const calendarAuth = await calendar.authorize();
        const events = await calendar.getEvents(calendarAuth);
        for (const event of events) {
            if (event.summary) {
                const message = convert(event.description) || await generator.generate(event.summary)
                for (const attender of event.attendees)
                    if (/[0-9]+@c.us]/.test(attender.email))
                        client.sendMessage(attender.email, message);
            }
        }
    } catch (err) {
        console.error(err);
    }
    process.exit();
});

client.initialize();