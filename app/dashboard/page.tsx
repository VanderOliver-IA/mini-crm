import { getDashboardStats } from "@/lib/actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, Users, Target, Calendar, ArrowUpRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ValueByStatusChart, LeadSourceChart } from "@/components/dashboard/charts";

export default async function DashboardPage() {
    const stats = await getDashboardStats();

    const formatCurrency = (val: number) =>
        new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Atividade Comercial</h1>
                <p className="text-muted-foreground mt-1">Visão geral da sua performance de vendas</p>
            </div>

            {/* Top Cards/KPIs */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="border-blue-500/20 bg-blue-500/5">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium">Pipeline Total</CardTitle>
                        <DollarSign className="w-4 h-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(stats.totalPipeline)}</div>
                        <p className="text-xs text-muted-foreground mt-1 flex items-center">
                            Valor total em negociação <ArrowUpRight className="w-3 h-3 ml-1 text-green-500" />
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium">Follow-ups Hoje</CardTitle>
                        <Calendar className="w-4 h-4 text-purple-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.tasksToday.length}</div>
                        <p className="text-xs text-muted-foreground mt-1">Contatos agendados para hoje</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium">Leads Novos</CardTitle>
                        <Users className="w-4 h-4 text-yellow-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {stats.byStatus.find(s => s.status === 'novo')?.count || 0}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">Aguardando primeiro contato</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium">Conversão</CardTitle>
                        <Target className="w-4 h-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {stats.byStatus.find(s => s.status === 'fechado')?.count || 0}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">Negócios fechados com sucesso</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <ValueByStatusChart data={stats.byStatus} />
                <LeadSourceChart data={stats.bySource} />
            </div>

            {/* Today's Tasks */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-blue-500" /> Agenda de Contatos (Hoje)
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {stats.tasksToday.length > 0 ? (
                        <div className="space-y-4">
                            {stats.tasksToday.map(lead => (
                                <div key={lead.id} className="flex items-center justify-between p-4 rounded-lg border bg-slate-900/50">
                                    <div>
                                        <p className="font-bold">{lead.name}</p>
                                        <p className="text-xs text-muted-foreground">{lead.company || 'Pessoa Física'}</p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500/20 capitalize">
                                            {lead.status}
                                        </Badge>
                                        <Button size="sm" variant="secondary">Entrar em contato</Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8 text-muted-foreground italic">
                            Nenhum compromisso agendado para hoje.
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
