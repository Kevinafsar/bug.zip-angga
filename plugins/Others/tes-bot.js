import {
    fetch
} from 'undici';
let handler = async (m, {
    conn
}) => {
    const response = await fetch("https://techy-api.vercel.app/api/json");
    const data = await response.json();
    await conn.sendMessage(m.chat, {
        text: data.message,
        contextInfo: {
            externalAdReply: {
                title: "The bot is active now.",
                thumbnail: await (await conn.getFile("https://cdn-icons-png.flaticon.com/512/8832/8832108.png")).data
            },
            mentionedJid: [m.sender],
        },
    }, {
        quoted: m
    });
}
handler.customPrefix = /^(tes|tess|test)$/i
handler.command = new RegExp

export default handler