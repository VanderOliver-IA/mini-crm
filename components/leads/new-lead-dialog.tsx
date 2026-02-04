'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Instagram, Globe, Users as UsersIcon, MessageCircle, MoreHorizontal } from 'lucide-react';
import { createLead } from '@/lib/actions';
import { useRouter } from 'next/navigation';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

const formSchema = z.object({
    name: z.string().min(2, 'Nome é obrigatório'),
    email: z.string().email('Email inválido').optional().or(z.literal('')),
    company: z.string().optional(),
    phone: z.string().optional(),
    estimatedValue: z.string().optional(),
    source: z.string().default('direto'),
    nextContactAt: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

const SOURCES = [
    { id: 'direto', label: 'Direto / Site', icon: Globe },
    { id: 'instagram', label: 'Instagram', icon: Instagram },
    { id: 'whatsapp', label: 'WhatsApp', icon: MessageCircle },
    { id: 'indicacao', label: 'Indicação', icon: UsersIcon },
    { id: 'outros', label: 'Outros', icon: MoreHorizontal },
];

export function NewLeadDialog() {
    const [open, setOpen] = useState(false);
    const [selectedSource, setSelectedSource] = useState('direto');
    const router = useRouter();

    const { register, handleSubmit, reset, formState: { errors, isSubmitting }, setValue } = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: '',
            email: '',
            company: '',
            phone: '',
            estimatedValue: '',
            source: 'direto',
        }
    });

    const onSubmit = async (data: FormValues) => {
        try {
            const payload = {
                ...data,
                estimatedValue: data.estimatedValue ? Number(data.estimatedValue) : 0,
                nextContactAt: data.nextContactAt ? new Date(data.nextContactAt) : undefined,
                source: selectedSource
            };

            await createLead(payload);
            setOpen(false);
            reset();
            router.refresh();
        } catch (error) {
            console.error(error);
            alert('Erro ao criar lead');
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/20">
                    <Plus className="w-4 h-4 mr-2" /> Novo Lead
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Cadastrar Nova Oportunidade</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2 col-span-2">
                            <label className="text-xs font-bold uppercase text-slate-500">Nome do Lead</label>
                            <Input {...register('name')} placeholder="Ex: João Silva" />
                            {errors.name && <p className="text-red-500 text-xs">{errors.name.message}</p>}
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase text-slate-500">Empresa</label>
                            <Input {...register('company')} placeholder="Nome da empresa" />
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase text-slate-500">Valor Estimado (R$)</label>
                            <Input {...register('estimatedValue')} type="number" step="0.01" placeholder="0.00" />
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase text-slate-500">Origem (Source)</label>
                            <Select onValueChange={setSelectedSource} defaultValue="direto">
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecione a origem" />
                                </SelectTrigger>
                                <SelectContent>
                                    {SOURCES.map(source => (
                                        <SelectItem key={source.id} value={source.id}>
                                            <div className="flex items-center gap-2">
                                                <source.icon className="w-4 h-4" />
                                                <span>{source.label}</span>
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase text-slate-500">Próximo Contato</label>
                            <Input {...register('nextContactAt')} type="date" />
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase text-slate-500">Email</label>
                            <Input {...register('email')} placeholder="email@exemplo.com" />
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase text-slate-500">Telefone</label>
                            <Input {...register('phone')} placeholder="(00) 00000-0000" />
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-6">
                        <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
                        <Button type="submit" disabled={isSubmitting} className="bg-blue-600">
                            {isSubmitting ? 'Salvando...' : 'Criar Negócio'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
