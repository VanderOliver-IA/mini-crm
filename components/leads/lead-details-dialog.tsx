'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getLeadActivities, logActivity } from "@/lib/actions";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar, Building, Mail, Phone, Clock, MessageSquare, Send } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

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

type Activity = {
    id: string;
    type: string;
    content: string | null;
    createdAt: Date;
};

export function LeadDetailsDialog({ lead, open, onOpenChange }: {
    lead: Lead | null;
    open: boolean;
    onOpenChange: (open: boolean) => void
}) {
    const [activities, setActivities] = useState<Activity[]>([]);
    const [note, setNote] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (lead && open) {
            loadActivities();
        }
    }, [lead, open]);

    const loadActivities = async () => {
        if (!lead) return;
        const data = await getLeadActivities(lead.id);
        setActivities(data);
    };

    const handleAddNote = async () => {
        if (!lead || !note.trim()) return;
        setLoading(true);
        try {
            await logActivity(lead.id, 'note', note);
            setNote('');
            await loadActivities();
        } finally {
            setLoading(false);
        }
    };

    if (!lead) return null;

    const formatCurrency = (val: number | null) =>
        new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val || 0);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[700px] h-[80vh] flex flex-col p-0 overflow-hidden">
                <div className="p-6 border-b bg-slate-900/50">
                    <DialogHeader>
                        <div className="flex justify-between items-start">
                            <div>
                                <Badge className="mb-2 bg-blue-500/20 text-blue-500 hover:bg-blue-500/20 capitalize border-blue-500/30">
                                    {lead.source || 'direto'}
                                </Badge>
                                <DialogTitle className="text-2xl font-bold">{lead.name}</DialogTitle>
                                <p className="text-slate-400 mt-1 flex items-center gap-2">
                                    <Building className="w-4 h-4" /> {lead.company || 'Pessoa Física'}
                                </p>
                            </div>
                            <div className="text-right">
                                <p className="text-sm font-bold text-emerald-400 text-xl">{formatCurrency(lead.estimatedValue)}</p>
                                <Badge variant="outline" className="mt-2 text-[10px] uppercase tracking-wider">{lead.status}</Badge>
                            </div>
                        </div>
                    </DialogHeader>
                </div>

                <div className="flex-1 flex overflow-hidden">
                    {/* Left Side: Info */}
                    <div className="w-1/3 border-r p-6 space-y-6 bg-slate-950/20 overflow-y-auto">
                        <section className="space-y-4">
                            <h4 className="text-xs font-bold uppercase text-slate-500 tracking-widest">Contato</h4>
                            <div className="space-y-3">
                                <div className="flex items-center gap-2 text-sm">
                                    <Mail className="w-4 h-4 text-slate-500" />
                                    <span className="truncate">{lead.email || 'Não informado'}</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                    <Phone className="w-4 h-4 text-slate-500" />
                                    <span>{lead.phone || 'Não informado'}</span>
                                </div>
                            </div>
                        </section>

                        <section className="space-y-4 pt-4 border-t border-slate-800">
                            <h4 className="text-xs font-bold uppercase text-slate-500 tracking-widest">Compromissos</h4>
                            <div className="flex items-center gap-2 text-sm p-3 rounded-lg bg-purple-500/10 border border-purple-500/20">
                                <Calendar className="w-4 h-4 text-purple-500" />
                                <div>
                                    <p className="text-[10px] text-purple-500 uppercase font-bold">Próximo Contato</p>
                                    <p className="font-semibold">
                                        {lead.nextContactAt
                                            ? format(new Date(lead.nextContactAt), "dd 'de' MMMM", { locale: ptBR })
                                            : 'Não agendado'}
                                    </p>
                                </div>
                            </div>
                        </section>
                    </div>

                    {/* Right Side: Timeline & Notes */}
                    <div className="flex-1 flex flex-col overflow-hidden">
                        {/* Notes Input */}
                        <div className="p-4 border-b space-y-3">
                            <div className="flex items-center gap-2 mb-1">
                                <MessageSquare className="w-4 h-4 text-blue-500" />
                                <span className="text-xs font-bold">Nova Anotação</span>
                            </div>
                            <div className="relative">
                                <Textarea
                                    placeholder="Escreva detalhes da conversa ou próximos passos..."
                                    className="min-h-[80px] bg-slate-900 border-slate-800 pr-12 focus-visible:ring-blue-500"
                                    value={note}
                                    onChange={(e) => setNote(e.target.value)}
                                />
                                <Button
                                    size="icon"
                                    className="absolute bottom-2 right-2 h-8 w-8 bg-blue-600 hover:bg-blue-500"
                                    onClick={handleAddNote}
                                    disabled={loading || !note.trim()}
                                >
                                    <Send className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>

                        {/* Timeline */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-6">
                            <div className="flex items-center gap-2 mb-4">
                                <Clock className="w-4 h-4 text-slate-500" />
                                <span className="text-xs font-bold uppercase text-slate-500">Histórico de Atividade</span>
                            </div>

                            <div className="space-y-6 border-l-2 border-slate-800 ml-2 pl-6 relative">
                                {activities.length > 0 ? activities.map((act) => (
                                    <div key={act.id} className="relative">
                                        <div className="absolute -left-[31px] top-1 w-3 h-3 rounded-full bg-slate-800 border-2 border-black" />
                                        <div className="space-y-1">
                                            <p className="text-[10px] text-slate-500 font-bold uppercase">
                                                {format(new Date(act.createdAt), "dd MMM · HH:mm", { locale: ptBR })}
                                            </p>
                                            <div className={`p-3 rounded-lg text-sm ${act.type === 'note' ? 'bg-blue-500/5 text-slate-300 border border-blue-500/10' : 'text-slate-400 italic'
                                                }`}>
                                                {act.content}
                                            </div>
                                        </div>
                                    </div>
                                )) : (
                                    <div className="text-center py-10 text-slate-600 text-xs italic">
                                        Nenhuma atividade registrada ainda.
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
