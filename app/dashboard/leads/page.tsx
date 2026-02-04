import { getLeads } from "@/lib/actions";
import { KanbanBoard } from "@/components/leads/kanban-board";
import { NewLeadDialog } from "@/components/leads/new-lead-dialog";
import { Users } from "lucide-react";

export default async function LeadsPage() {
    const leads = await getLeads();

    return (
        <div className="flex flex-col h-[calc(100vh-6rem)]">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Leads & Pipeline</h1>
                    <p className="text-muted-foreground mt-1">Gerencie suas oportunidades de venda</p>
                </div>
                <NewLeadDialog />
            </div>

            {/* Kanban Board */}
            <div className="flex-1 overflow-hidden">
                <KanbanBoard leads={leads} />
            </div>
        </div>
    );
}
