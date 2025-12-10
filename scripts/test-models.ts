import dotenv from "dotenv";

dotenv.config();

async function listModels() {
    const apiKey = process.env.GOOGLE_API_KEY;
    if (!apiKey) {
        console.error("No API KEY found");
        return;
    }

    try {
        console.log("Fetching models with API Key ending in...", apiKey.slice(-4));
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status} ${await response.text()}`);
        }

        const data = await response.json();
        console.log("Available Models:");
        data.models.forEach((m: any) => {
            if (m.supportedGenerationMethods?.includes("generateContent")) {
                console.log(`- ${m.name}`);
            }
        });

    } catch (error) {
        console.error("Error listing models:", error);
    }
}

listModels();
