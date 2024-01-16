import fetch from "node-fetch";
import crypto from "crypto";
import {
    FormData,
    Blob
} from "formdata-node";
import {
    fileTypeFromBuffer
} from "file-type";
import chalk from 'chalk';

const token = "Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VySWQiOiI5MGZlNzllYS0yODExLTRiMjctYWU0ZS1hZGMzNGFhZDM2NzMiLCJ1c2VyQWNjb3VudCI6InZvaWNlQGZpbmVzaGFyZS5jb20ifQ.AO9q9TKXZ79G6oH70YX5ypOGuSBcLP7K4wEDGIzrDDw";

class VoiceHandler {
    async equalvoice(voicename, voicetage) {
        try {
            const response = await fetch(`https://voiceai.fineshare.com/api/recommendsameTagmodels?voice=${voicename}&tag=${voicetage}&count=5`, {
                method: "GET",
                headers: {
                    "Authorization": token
                }
            });

            const data = await response.json();
            console.log(chalk.green('Success: Equal Voice request.'), data);
            return data.voices || [];
        } catch (error) {
            console.error(chalk.red('Error:', error));
            return [];
        }
    }

    async getallvoice(pageid) {
        try {
            const response = await fetch(`https://voiceai.fineshare.com/api/pagevoices?categroy=my_voices&page=${pageid}&limit=8`, {
                method: "GET",
                headers: {
                    "Authorization": token
                }
            });

            const data = await response.json();
            console.log(chalk.green('Success: Get All Voice request.'), data);
            return data.voices || '';
        } catch (error) {
            console.error(chalk.red('Error:', error));
            return '';
        }
    }

    async createaudiofilechanger(voicename, audiofile) {
        try {
            const response = await fetch("https://voiceai.fineshare.com/api/createaudiofilechanger", {
                method: "POST",
                headers: {
                    "Authorization": token,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    voice: voicename
                })
            });

            const data = await response.json();
            console.log(chalk.green('Success: Create Audio File Changer request.'), data);
            await this.voiceUpload(data.uuid, data.endpoint, audiofile, voicename, data.type);
        } catch (error) {
            console.error(chalk.red('Error:', error));
        }
    }

    async voiceUpload(uuid, host, audio, name, type) {
        try {
            const {
                ext,
                mime
            } = await fileTypeFromBuffer(audio) || {};
            const blob = new Blob([audio], {
                type: mime
            });

            const formData = new FormData();
            formData.append('audioFile', blob, `${crypto.randomBytes(5).toString("hex")}.${ext}`);

            const response = await fetch(`https://${host}/api/uploadaudiofile/${uuid}`, {
                method: "POST",
                body: formData,
                headers: {
                    "Authorization": token,
                    "Changer-Type": type
                }
            });

            const data = await response.json();
            console.log(chalk.green('Success: Voice Upload request.'), data);
            await this.voiceStart(uuid, name, 0);
        } catch (error) {
            console.error(chalk.red('Error:', error));
        }
    }

    async voiceStart(uuid, voice, pitch) {
        try {
            const response = await fetch("https://voiceai.fineshare.com/api/changeaudiofile", {
                method: "POST",
                headers: {
                    "Authorization": token,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    voice,
                    uuid,
                    pitch
                })
            });

            const data = await response.json();
            console.log(chalk.green('Success: Voice Start request.'), data);
            await this.getvoiceResult(uuid);
        } catch (error) {
            console.error(chalk.red('Error:', error));
        }
    }

    async getvoiceResult(uuid) {
        try {
            const response = await fetch(`https://voiceai.fineshare.com/api/checkfilechangestatus/${uuid}`, {
                method: "GET",
                headers: {
                    "Authorization": token
                }
            });

            const data = await response.json();
            console.log(chalk.green('Success: Get Voice Result request.'), data);
            return data.url;
        } catch (error) {
            console.error(chalk.red('Error:', error));
        }
    }
}

export {
    VoiceHandler
};