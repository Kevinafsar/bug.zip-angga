import { fetch } from "undici";
import crypto from "crypto";
import { FormData, Blob } from "formdata-node";
import { fileTypeFromBuffer } from "file-type";
import chalk from "chalk";
import ora from "ora";

const token = "Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VySWQiOiI5MGZlNzllYS0yODExLTRiMjctYWU0ZS1hZGMzNGFhZDM2NzMiLCJ1c2VyQWNjb3VudCI6InZvaWNlQGZpbmVzaGFyZS5jb20ifQ.AO9q9TKXZ79G6oH70YX5ypOGuSBcLP7K4wEDGIzrDDw";

class VoiceHandler {
    spinner;

    constructor() {
        this.spinner = ora({ text: "", spinner: "moon" });
    }

    async equalvoice(voicename, voicetage) {
        try {
            const url = `https://voiceai.fineshare.com/api/recommendsameTagmodels?voice=${voicename}&tag=${voicetage}&count=5`;
            const options = { method: "GET", headers: { "Authorization": token } };

            this.spinner.text = chalk.yellow.bold("Process:") + chalk.white(" Equal Voice request...");
            this.spinner.render();
            const response = await fetch(url, options);
            const data = await response.json();

            this.spinner.succeed(chalk.green.bold("Success:") + chalk.white(" Equal Voice request."));
            return data.voices || [];
        } catch (error) {
            this.spinner.fail(chalk.red.bold("Error:") + chalk.white(" " + error));
            return [];
        }
    }

    async getallvoice(pageid) {
        try {
            const url = `https://voiceai.fineshare.com/api/pagevoices?categroy=my_voices&page=${pageid}&limit=8`;
            const options = { method: "GET", headers: { "Authorization": token } };

            this.spinner.text = chalk.green.bold("Process:") + chalk.white(" Get All Voice request...");
            this.spinner.render();
            const response = await fetch(url, options);
            const data = await response.json();

            this.spinner.succeed(chalk.green.bold("Success:") + chalk.white(" Get All Voice request."));
            return data.voices || "";
        } catch (error) {
            this.spinner.fail(chalk.red.bold("Error:") + chalk.white(" " + error));
            return null;
        }
    }

    async createaudiofilechanger(voicename, audiofile) {
        try {
            const url = "https://voiceai.fineshare.com/api/createaudiofilechanger";
            const options = {
                method: "POST",
                headers: { "Authorization": token, "Content-Type": "application/json" },
                body: JSON.stringify({ voice: voicename })
            };

            this.spinner.text = chalk.blue.bold("Process:") + chalk.white(" Create Audio File Changer request...");
            this.spinner.render();
            const response = await fetch(url, options);
            const data = await response.json();

            this.spinner.succeed(chalk.green.bold("Success:") + chalk.white(" Create Audio File Changer request."));
            return await this.voiceUpload(data.uuid, data.endpoint, audiofile, voicename, data.type);
        } catch (error) {
            this.spinner.fail(chalk.red.bold("Error:") + chalk.white(" " + error));
        }
    }

    async voiceUpload(uuid, host, audio, name, type) {
        try {
            const { ext, mime } = await fileTypeFromBuffer(audio) || {};
            const blob = new Blob([audio], { type: mime });
            const formData = new FormData();
            formData.append("audioFile", blob, `${crypto.randomBytes(5).toString("hex")}.${ext}`);

            const url = `https://${host}/api/uploadaudiofile/${uuid}`;
            const options = {
                method: "POST",
                body: formData,
                headers: { "Authorization": token, "Changer-Type": type }
            };

            this.spinner.text = chalk.magenta.bold("Process:") + chalk.white(" Voice Upload request...");
            this.spinner.render();
            const response = await fetch(url, options);
            const data = await response.json();

            this.spinner.succeed(chalk.green.bold("Success:") + chalk.white(" Voice Upload request."));
            return await this.voiceStart(uuid, name, 0);
        } catch (error) {
            this.spinner.fail(chalk.red.bold("Error:") + chalk.white(" " + error));
        }
    }

    async voiceStart(uuid, voice, pitch) {
        try {
            const url = "https://voiceai.fineshare.com/api/changeaudiofile";
            const options = {
                method: "POST",
                headers: { "Authorization": token, "Content-Type": "application/json" },
                body: JSON.stringify({ voice, uuid, pitch })
            };

            this.spinner.text = chalk.cyan.bold("Process:") + chalk.white(" Voice Start request...");
            this.spinner.render();
            const response = await fetch(url, options);
            const data = await response.json();

            this.spinner.succeed(chalk.green.bold("Success:") + chalk.white(" Voice Start request."));
            return await this.getvoiceResult(uuid);
        } catch (error) {
            this.spinner.fail(chalk.red.bold("Error:") + chalk.white(" " + error));
        }
    }

    async getvoiceResult(uuid) {
        let dataUrl;
        let attempts = 0;

        do {
            try {
                const url = `https://voiceai.fineshare.com/api/checkfilechangestatus/${uuid}`;
                const options = { method: "GET", headers: { "Authorization": token } };

                this.spinner.text = chalk.red.bold("Process:") + chalk.white(" Get Voice Result request...");
                this.spinner.render();
                const response = await fetch(url, options);
                const data = await response.json();

                if (data.url) {
                    this.spinner.succeed(chalk.green.bold("Success:") + chalk.white(" Get Voice Result request."));
                    dataUrl = data.url;
                } else {
                    this.spinner.text = "Waiting for URL...";
                    this.spinner.render();
                    await new Promise(resolve => setTimeout(resolve, 1000));
                }
            } catch (error) {
                this.spinner.fail(chalk.red.bold("Error:") + chalk.white(" " + error));
                await new Promise(resolve => setTimeout(resolve, 1000));
            }

            attempts++;
        } while (!dataUrl && attempts < 10);

        if (!dataUrl) {
            this.spinner.fail("Exceeded maximum attempts. Unable to retrieve URL.");
        } else {
            this.spinner.succeed("Final URL:");
            console.log("  - " + decodeURIComponent(dataUrl));
        }

        return decodeURIComponent(dataUrl) || null;
    }
}

export {
    VoiceHandler
};
