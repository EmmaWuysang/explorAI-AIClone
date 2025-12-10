
import { getPatientPrescriptions, requestRefill } from "@/lib/actions/prescription";
import { getAllClients } from "@/lib/actions/user";

interface ToolContext {
    userId?: string;
    dashboardContext?: string;
}

async function getTargetUserId(contextUserId?: string): Promise<string> {
    if (contextUserId) return contextUserId;

    // Fallback: Get the first client from DB just like the dashboard does
    const clientsRes = await getAllClients();
    if (clientsRes.success && clientsRes.data && clientsRes.data.length > 0) {
        console.log(`[Tool] Using found client ID: ${clientsRes.data[0].id} `);
        return clientsRes.data[0].id;
    }

    console.warn("[Tool] No clients found in DB, falling back to 'client-1'");
    return "client-1";
}

export const toolRegistry: Record<string, (args: any, context?: ToolContext) => Promise<any>> = {
    get_prescriptions: async (args: { userId?: string }, context) => {
        const targetUserId = await getTargetUserId(args.userId || context?.userId);
        console.log(`[Tool] Fetching prescriptions for ${targetUserId}`);
        return await getPatientPrescriptions(targetUserId);
    },

    request_refill: async (args: { medicationName: string, prescriptionId?: string }, context) => {
        const { medicationName, prescriptionId } = args;

        // If we have an ID, use it directly
        if (prescriptionId) {
            return await requestRefill(prescriptionId);
        }

        // Otherwise need to find the ID first (Chain of thought would typically handle this, 
        // but let's be robust)
        const targetUserId = await getTargetUserId(context?.userId);
        const prescriptions = await getPatientPrescriptions(targetUserId);

        if (!prescriptions.success || !prescriptions.data) {
            return { success: false, error: "Could not fetch prescriptions to find medication ID." };
        }

        const match = (prescriptions.data as any[]).find((p: any) =>
            p.medicationName.toLowerCase().includes(medicationName.toLowerCase())
        );

        if (!match) {
            return { success: false, error: `Medication '${medicationName}' not found in your active prescriptions.` };
        }

        console.log(`[Tool] Requesting refill for ${match.medicationName}(${match.id})`);
        return await requestRefill(match.id);
    }
};
