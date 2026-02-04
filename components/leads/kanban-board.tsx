'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { updateLeadStatus, deleteLead } from "@/lib/actions";
import { MoreHorizontal, Trash2, ArrowRight } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
    DropdownMenuSub,
    DropdownMenuSubTrigger,
    DropdownMenuSubContent,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

type Lead = {
    id: string;
    name: string;
    company: string | null;
    estimatedValue: number | null;
    status: string | null;
    email: string | null; // Added for completeness if needed
};

const STATUS_COLUMNS = [
    { id: 'novo', label: 'Novo Lead', color: 'border-blue-500/20 bg-blue-500/5' },
    { id: 'contato', label: 'Em Contato', color: 'border-yellow-500/20 bg-yellow-500/5' },
    { id: 'proposta', label: 'Proposta', color: 'border-purple-500/20 bg-purple-500/5' },
    { id: 'negociacao', label: 'Negociação', color: 'border-orange-500/20 bg-orange-500/5' },
    { id: 'fechado', label: 'Fechado', color: 'border-green-500/20 bg-green-500/5' },
];

export function KanbanBoard({ leads }: { leads: Lead[] }) {
    const router = useRouter();

    const handleStatusChange = async (leadId: string, newStatus: string) => {
        await updateLeadStatus(leadId, newStatus);
        router.refresh(); // Optimistic update would be better but this is MVP
    };

    const handleDelete = async (leadId: string) => {
        if (confirm('Tem certeza que deseja excluir este lead?')) {
            await deleteLead(leadId);
            router.refresh();
        }
    };

    const formatCurrency = (value: number | null) => {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0);
    };

    return (
        <div className="flex flex-col xl:flex-row gap-6 overflow-x-auto pb-6 h-[calc(100vh-12rem)] min-w-full">
            {STATUS_COLUMNS.map((col) => {
                const columnLeads = leads.filter(lead => (lead.status || 'novo') === col.id);
                const totalValue = columnLeads.reduce((acc, lead) => acc + (lead.estimatedValue || 0), 0);

                return (
                    <div key={col.id} className="min-w-[300px] flex-1 flex flex-col gap-4">
                        {/* Column Header */}
                        <div className={`p-4 rounded-xl border ${col.color} backdrop-blur-sm`}>
                            <div className="flex justify-between items-center mb-1">
                                <h3 className="font-semibold text-sm uppercase tracking-wide opacity-90">{col.label}</h3>
                                <Badge variant="outline" className="bg-background/50">{columnLeads.length}</Badge>
                            </div>
                            <p className="text-xs opacity-60 font-medium">{formatCurrency(totalValue)}</p>
                        </div>

                        {/* Leads List */}
                        <div className="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
                            {columnLeads.map((lead) => (
                                <Card key={lead.id} className="group hover:border-blue-500/50 transition-all hover:shadow-md cursor-pointer dark:bg-slate-900/50">
                                    <CardHeader className="p-4 pb-2 space-y-0">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <CardTitle className="text-sm font-bold line-clamp-1">{lead.name}</CardTitle>
                                                {lead.company && <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{lead.company}</p>}
                                            </div>

                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity -mr-2 -mt-1">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuLabel>Ações</DropdownMenuLabel>
                                                    <DropdownMenuSeparator />

                                                    <DropdownMenuSub>
                                                        <DropdownMenuSubTrigger>
                                                            <ArrowRight className="w-4 h-4 mr-2" /> Mover para
                                                        </DropdownMenuSubTrigger>
                                                        <DropdownMenuSubContent>
                                                            {STATUS_COLUMNS.filter(c => c.id !== col.id).map(c => (
                                                                <DropdownMenuItem key={c.id} onClick={() => handleStatusChange(lead.id, c.id)}>
                                                                    {c.label}
                                                                </DropdownMenuItem>
                                                            ))}
                                                        </DropdownMenuSubContent>
                                                    </DropdownMenuSub>

                                                    <DropdownMenuItem className="text-red-500 focus:text-red-500" onClick={() => handleDelete(lead.id)}>
                                                        <Trash2 className="w-4 h-4 mr-2" /> Excluir
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="p-4 pt-2">
                                        <div className="flex justify-between items-center mt-2">
                                            <span className="text-xs font-semibold text-green-400 bg-green-400/10 px-2 py-1 rounded-full">
                                                {formatCurrency(lead.estimatedValue)}
                                            </span>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                            {columnLeads.length === 0 && (
                                <div className="h-24 border-2 border-dashed border-slate-800 rounded-xl flex items-center justify-center text-slate-600 text-xs">
                                    Vazio
                                </div>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
