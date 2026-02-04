import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RevenueChart, FunnelBarChart, SourcePieChart } from "@/components/dashboard/charts";
import { DollarSign, TrendingUp, Users, Activity } from "lucide-react";

export default function DashboardPage() {
    return (
        <div className="space-y-6 animate-in fade-in-50 duration-500">
            {/* Stats Row */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="bg-gradient-to-br from-blue-600 to-blue-700 border-none text-white shadow-lg shadow-blue-900/20 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10"><DollarSign className="w-24 h-24" /></div>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium opacity-90">Receita Total</CardTitle>
                        <DollarSign className="h-4 w-4 opacity-75" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">R$ 45.231,89</div>
                        <p className="text-xs opacity-75">+20.1% em relação ao mês anterior</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Novos Leads</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">+128</div>
                        <p className="text-xs text-muted-foreground">+12 novos esta semana</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Propostas Ativas</CardTitle>
                        <Activity className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">45</div>
                        <p className="text-xs text-muted-foreground">Valor em pipeline: R$ 120k</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Taxa de Conversão</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">24.5%</div>
                        <p className="text-xs text-muted-foreground text-green-500 font-semibold">+2.4% este mês</p>
                    </CardContent>
                </Card>
            </div>

            {/* Main Charts Row */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-1 md:col-span-4 shadow-sm">
                    <CardHeader>
                        <CardTitle>Receita Mensal</CardTitle>
                        <CardDescription>Crescimento de receita nos últimos 6 meses</CardDescription>
                    </CardHeader>
                    <CardContent className="pl-2">
                        <RevenueChart />
                    </CardContent>
                </Card>
                <Card className="col-span-1 md:col-span-3 shadow-sm">
                    <CardHeader>
                        <CardTitle>Origem dos Leads</CardTitle>
                        <CardDescription>Principais canais de aquisição</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <SourcePieChart />
                    </CardContent>
                </Card>
            </div>

            {/* Funnel Row */}
            <div className="grid gap-4 md:grid-cols-1">
                <Card className="shadow-sm">
                    <CardHeader>
                        <CardTitle>Funil de Vendas</CardTitle>
                        <CardDescription>Conversão por etapa do pipeline</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <FunnelBarChart />
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
