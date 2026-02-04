'use client';

import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { updateLeadStatus, deleteLead } from "@/lib/actions";
import { MoreHorizontal, Trash2, ArrowRight, Phone, Mail } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { LeadDetailsDialog } from "./lead-details-dialog";

type Lead = {
    id: string;
    name: string;
    company: string | null;
    estimatedValue: number | null;
    status: string | null;
    email: string | null;
    phone: string | null;
    source: string | null;
    nextContactAt: Date | null;
};

const STATUS_COLUMNS = [
    { id: 'novo', label: 'Novo Lead', color: 'border-blue-500/20 bg-blue-500/5' },
    { id: 'contato', label: 'Em Contato', color: 'border-yellow-500/20 bg-yellow-500/5' },
    { id: 'proposta', label: 'Proposta', color: 'border-purple-500/20 bg-purple-500/5' },
    { id: 'negociacao', label: 'Negociação', color: 'border-orange-500/20 bg-orange-500/5' },
    { id: 'fechado', label: 'Fechado', color: 'border-green-500/20 bg-green-500/5' },
];

export function KanbanBoard({ leads: initialLeads }: { leads: Lead[] }) {
    const router = useRouter();
    const [leads, setLeads] = useState<Lead[]>(initialLeads);
    const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);

    // Sync state when props change
    useEffect(() => {
        setLeads(initialLeads);
    }, [initialLeads]);

    const onDragEnd = async (result: DropResult) => {
        const { destination, source, draggableId } = result;

        if (!destination) return;
        if (destination.droppableId === source.droppableId && destination.index === source.index) return;

        // Optimistic Update
        const newLeads = Array.from(leads);
        const leadIndex = newLeads.findIndex(l => l.id === draggableId);
        if (leadIndex !== -1) {
            newLeads[leadIndex].status = destination.droppableId;
            setLeads(newLeads);
        }

        // Persist to DB
        await updateLeadStatus(draggableId, destination.droppableId);
        router.refresh();
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
        <DragDropContext onDragEnd={onDragEnd}>
            <div className="flex flex-col xl:flex-row gap-6 overflow-x-auto pb-6 h-[calc(100vh-14rem)] min-w-full custom-scrollbar">
                {STATUS_COLUMNS.map((col) => {
                    const columnLeads = leads.filter(lead => (lead.status || 'novo') === col.id);
                    const totalValue = columnLeads.reduce((acc, lead) => acc + (lead.estimatedValue || 0), 0);

                    return (
                        <div key={col.id} className="min-w-[320px] max-w-[320px] flex-1 flex flex-col gap-4">
                            {/* Column Header */}
                            <div className={`p-4 rounded-xl border ${col.color} backdrop-blur-sm sticky top-0 z-10`}>
                                <div className="flex justify-between items-center mb-1">
                                    <h3 className="font-bold text-xs uppercase tracking-widest opacity-90">{col.label}</h3>
                                    <Badge variant="outline" className="bg-background/50 text-[10px]">{columnLeads.length}</Badge>
                                </div>
                                <p className="text-[11px] opacity-60 font-semibold">{formatCurrency(totalValue)}</p>
                            </div>

                            {/* Leads List */}
                            <Droppable droppableId={col.id}>
                                {(provided, snapshot) => (
                                    <div
                                        {...provided.droppableProps}
                                        ref={provided.innerRef}
                                        className={`flex-1 overflow-y-auto space-y-4 pr-2 transition-colors rounded-xl p-1 ${snapshot.isDraggingOver ? 'bg-slate-800/10' : ''
                                            }`}
                                    >
                                        {columnLeads.map((lead, index) => (
                                            <Draggable key={lead.id} draggableId={lead.id} index={index}>
                                                {(provided, snapshot) => (
                                                    <div
                                                        ref={provided.innerRef}
                                                        {...provided.draggableProps}
                                                        {...provided.dragHandleProps}
                                                        onClick={() => {
                                                            setSelectedLead(lead);
                                                            setIsDetailsOpen(true);
                                                        }}
                                                        className="cursor-pointer"
                                                        style={{
                                                            ...provided.draggableProps.style,
                                                            userSelect: 'none',
                                                        }}
                                                    >
                                                        <Card className={`group transition-all border-slate-800 hover:border-blue-500/50 ${snapshot.isDragging ? 'rotate-2 scale-105 shadow-2xl border-blue-500 z-50 ring-2 ring-blue-500/20' : 'hover:shadow-lg'
                                                            } dark:bg-slate-900/80`}>
                                                            <CardHeader className="p-4 pb-2 space-y-0">
                                                                <div className="flex justify-between items-start">
                                                                    <div className="flex-1">
                                                                        <div className="flex items-center gap-2 mb-1">
                                                                            <Badge variant="secondary" className="text-[9px] h-4 px-1 bg-slate-800 text-slate-400 capitalize">
                                                                                {lead.source || 'direto'}
                                                                            </Badge>
                                                                        </div>
                                                                        <CardTitle className="text-sm font-bold leading-tight line-clamp-2">{lead.name}</CardTitle>
                                                                        {lead.company && <p className="text-[11px] text-muted-foreground mt-1 line-clamp-1 italic">{lead.company}</p>}
                                                                    </div>

                                                                    <DropdownMenu>
                                                                        <DropdownMenuTrigger asChild>
                                                                            <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                                <MoreHorizontal className="h-4 w-4" />
                                                                            </Button>
                                                                        </DropdownMenuTrigger>
                                                                        <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                                                                            <DropdownMenuLabel>Ações</DropdownMenuLabel>
                                                                            <DropdownMenuSeparator />
                                                                            <DropdownMenuItem onClick={() => handleDelete(lead.id)} className="text-red-500 focus:text-red-500">
                                                                                <Trash2 className="w-4 h-4 mr-2" /> Excluir
                                                                            </DropdownMenuItem>
                                                                        </DropdownMenuContent>
                                                                    </DropdownMenu>
                                                                </div>
                                                            </CardHeader>
                                                            <CardContent className="p-4 pt-2">
                                                                <div className="flex items-center gap-3 mt-1 text-slate-500">
                                                                    {lead.phone && <Phone className="w-3 h-3 hover:text-blue-500 cursor-help" />}
                                                                    {lead.email && <Mail className="w-3 h-3 hover:text-blue-500 cursor-help" />}
                                                                </div>
                                                                <div className="flex justify-between items-center mt-3 pt-3 border-t border-slate-800/50">
                                                                    <span className="text-xs font-bold text-emerald-400">
                                                                        {formatCurrency(lead.estimatedValue)}
                                                                    </span>
                                                                </div>
                                                            </CardContent>
                                                        </Card>
                                                    </div>
                                                )}
                                            </Draggable>
                                        ))}
                                        {provided.placeholder}
                                        {columnLeads.length === 0 && (
                                            <div className="h-24 border-2 border-dashed border-slate-800/50 rounded-xl flex items-center justify-center text-slate-700 text-xs font-medium">
                                                Arraste aqui
                                            </div>
                                        )}
                                    </div>
                                )}
                            </Droppable>
                        </div>
                    );
                })}
            </div>

            <LeadDetailsDialog
                lead={selectedLead as any}
                open={isDetailsOpen}
                onOpenChange={setIsDetailsOpen}
            />
        </DragDropContext>
    );
}
