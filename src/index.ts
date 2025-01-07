import { Hono } from 'hono'
import { basicAuth } from 'hono/basic-auth'

type Bindings = {
    // Add ScheduledEvent type to Bindings
    EVENT_TYPE?: 'scheduled';
    WHATSAPP_API_URL: string;
    WHATSAPP_CHAT_ID: string;
    WHATSAPP_SESSION: string;
    WHATSAPP_AUTH_USER: string;
    WHATSAPP_AUTH_PASS: string;
    WHATSAPP_GROUP_URL: string;
};

const app = new Hono<{ Bindings: Bindings }>();

// Shared function to send verse
async function sendDailyVerse(env: Bindings, showTyping: boolean = true) {
    // Fetch the daily verse
    const verseResponse = await fetch('https://www.resursecrestine.ro/xml/feed/versetul-zilei');
    const verseText = await verseResponse.text();

    // Get current date in "7 mai 2025" format
    const date = new Date();
    const day = date.getDate();
    const monthNames = [
        'ianuarie', 'februarie', 'martie', 'aprilie', 
        'mai', 'iunie', 'iulie', 'august',
        'septembrie', 'octombrie', 'noiembrie', 'decembrie'
    ];
    const month = monthNames[date.getMonth()];
    const year = date.getFullYear();
    const formattedDate = `${day} ${month} ${year}`;

    // Extract the verse text from CDATA
    const verseMatch = verseText.match(/<!\[CDATA\[(.*?)\]\]>/);
    if (!verseMatch || !verseMatch[1]) {
        throw new Error('Could not extract verse from XML');
    }
    const verse = verseMatch[1].trim();

    // Format the message
    const message = `Versetul zilei ${formattedDate}:\n\n${verse}\n\n${env.WHATSAPP_GROUP_URL}`;

    // Send seen indicator
    await fetch(`${env.WHATSAPP_API_URL}/api/sendSeen`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Basic ' + btoa(`${env.WHATSAPP_AUTH_USER}:${env.WHATSAPP_AUTH_PASS}`)
        },
        body: JSON.stringify({
            chatId: env.WHATSAPP_CHAT_ID,
            session: env.WHATSAPP_SESSION
        })
    });

    if (showTyping) {
        // Start typing indicator
        await fetch(`${env.WHATSAPP_API_URL}/api/startTyping`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Basic ' + btoa(`${env.WHATSAPP_AUTH_USER}:${env.WHATSAPP_AUTH_PASS}`)
            },
            body: JSON.stringify({
                chatId: env.WHATSAPP_CHAT_ID,
                session: env.WHATSAPP_SESSION
            })
        });

        // Calculate typing duration (50ms per character)
        const typingDuration = message.length * 50;
        await new Promise(resolve => setTimeout(resolve, typingDuration));

        // Stop typing indicator
        await fetch(`${env.WHATSAPP_API_URL}/api/stopTyping`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Basic ' + btoa(`${env.WHATSAPP_AUTH_USER}:${env.WHATSAPP_AUTH_PASS}`)
            },
            body: JSON.stringify({
                chatId: env.WHATSAPP_CHAT_ID,
                session: env.WHATSAPP_SESSION
            })
        });
    }

    // Send the verse via WhatsApp
    const whatsappResponse = await fetch(`${env.WHATSAPP_API_URL}/api/sendText`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Basic ' + btoa(`${env.WHATSAPP_AUTH_USER}:${env.WHATSAPP_AUTH_PASS}`)
        },
        body: JSON.stringify({
            chatId: env.WHATSAPP_CHAT_ID,
            text: message,
            linkPreview: true,
            session: env.WHATSAPP_SESSION
        })
    });

    if (!whatsappResponse.ok) {
        throw new Error(`WhatsApp API error: ${await whatsappResponse.text()}`);
    }

    return message;
}

// Handle scheduled events
app.get('/__scheduled', async (c) => {
    if (c.env.EVENT_TYPE === 'scheduled') {
        try {
            const verse = await sendDailyVerse(c.env);
            return c.json({ success: true, message: `Verse sent successfully: ${verse}` });
        } catch (error: any) {
            return c.json({ success: false, error: error.message }, 500);
        }
    }
    return c.text('Not a scheduled event');
});

app.get('/', (c) => {
    return c.redirect(c.env.WHATSAPP_GROUP_URL)
})


// Basic auth middleware for the API
// app.use('*', async (c, next) => {
//     const auth = basicAuth({
//         username: c.env.WHATSAPP_AUTH_USER,
//         password: c.env.WHATSAPP_AUTH_PASS,
//     });
//     return auth(c, next);
// });

app.get('/send-daily-verse', async (c) => {
    try {
        const showTyping = c.req.query('typing') !== 'false';
        const verse = await sendDailyVerse(c.env, showTyping);
        return c.json({ 
            success: true, 
            message: `Verse sent successfully: ${verse}`,
            typingIndicators: showTyping
        });
    } catch (error: any) {
        return c.json({ success: false, error: error.message }, 500);
    }
});

export default {
    ...app,
    async scheduled(event: any, env: any, ctx: any) {
        ctx.waitUntil(sendDailyVerse(env));
    },
};
