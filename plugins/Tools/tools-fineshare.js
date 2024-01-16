import {
    VoiceHandler
} from '../../lib/ai/fineshare.js'
const voiceHandler = new VoiceHandler();

let handler = async (m, {
    conn,
    usedPrefix,
    command,
    args
}) => {
    let q = m.quoted ? m.quoted : m
    let mime = (m.quoted ? m.quoted : m.msg).mimetype || ''
    if (!/audio/.test(mime)) throw `reply voice note you want to convert to with caption *${usedPrefix + command}* jokowi`
    let media = await q.download?.()
    if (!media) throw 'Can\'t download media'
    let audio = await voiceHandler.createaudiofilechanger(args[0] || "jokowi", media)
    if (!audio) throw 'Can\'t convert media to audio'
    await conn.sendFile(m.chat, audio, 'audio.mp3', '', m, null, {
        mimetype: 'audio/mp4'
    })
}
handler.help = ['fine'].map(v => v + ' <reply>')
handler.tags = ['audio']

handler.command = /^(fine)$/i

export default handler