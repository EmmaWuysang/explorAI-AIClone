import { FunctionDeclaration } from "@google/genai";

export const getQuestionsTool: FunctionDeclaration = {
    name: "get_prescriptions",
    description: "Get the list of active prescriptions for the current patient. Useful when the user asks 'what medications am I on?' or 'show my prescriptions'.",
    parameters: {
        type: "OBJECT" as any,
        properties: {
            userId: {
                type: "STRING" as any,
                description: "The ID of the user to fetch prescriptions for. If not provided, context will be used.",
            },
        },
        // required: ["userId"] // Making it optional as we might infer from auth context if available
    }
};

export const requestRefillTool: FunctionDeclaration = {
    name: "request_refill",
    description: "Request a refill for a specific prescription. Use this when the user explicitly asks to refill a medication.",
    parameters: {
        type: "OBJECT" as any,
        properties: {
            medicationName: {
                type: "STRING" as any,
                description: "The name of the medication to refill (fuzzy match supported).",
            },
            prescriptionId: {
                type: "STRING" as any,
                description: "The precise ID of the prescription to refill. Only use if the user provided it or if you found it via get_prescriptions.",
            }
        },
        required: ["medicationName"]
    }
};

export const tools = [getQuestionsTool, requestRefillTool];
