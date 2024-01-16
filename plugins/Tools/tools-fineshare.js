import {
    FineShare
} from '../../lib/ai/fineshare.js'
const FineShare = new FineShare();

let handler = async (m, {
    conn,
    usedPrefix,
    command,
    args
}) => {
    let q = m.quoted ? m.quoted : m
    if (!m.quoted && args[0]) {
        let detail = await FineShare.voiceDetail(args[0])
        let output = Object.entries(detail.data).map(([key, value]) => `  ○ *${key.toUpperCase()}:* ${value}`).join('\n');
        return m.reply(output);
    }
    let mime = (m.quoted ? m.quoted : m.msg).mimetype || ''
    if (!(/audio/.test(mime) && args[0])) return m.reply(`reply voice note you want to convert to with caption *${usedPrefix + command}* jokowi`)
    let media = await q.download?.()
    if (!media) throw 'Can\'t download media'
    let audio = await FineShare.voiceChanger(args[0] || "jokowi", media)
    if (!audio) throw 'Can\'t convert media to audio'
    await conn.sendFile(m.chat, audio, 'audio.mp3', '', m, null, {
        mimetype: 'audio/mp4'
    })
}
handler.help = ['fine'].map(v => v + ' <reply>')
handler.tags = ['audio']

handler.command = /^(fine)$/i

export default handler