'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus } from 'lucide-react';
import { createLead } from '@/lib/actions';
import { useRouter } from 'next/navigation';

const formSchema = z.object({
    name: z.string().min(2, 'Nome é obrigatório'),
    email: z.string().email('Email inválido').optional().or(z.literal('')),
    company: z.string().optional(),
    phone: z.string().optional(),
    estimatedValue: z.coerce.number().optional(),
});

export function NewLeadDialog() {
    const [open, setOpen] = useState(false);
    const router = useRouter();

    const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
    });

    const onSubmit = async (data: z.infer<typeof formSchema>) => {
        try {
            await createLead(data);
            setOpen(false);
            reset();
            router.refresh(); // Ensure the page updates
        } catch (error) {
            console.error(error);
            alert('Erro ao criar lead');
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="bg-blue-600 hover:bg-blue-500 text-white">
                    <Plus className="w-4 h-4 mr-2" /> Novo Lead
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Adicionar Novo Lead</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Nome</label>
                        <Input {...register('name')} placeholder="Ex: João Silva" />
                        {errors.name && <p className="text-red-500 text-xs">{errors.name.message}</p>}
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Empresa</label>
                        <Input {...register('company')} placeholder="Ex: Acme Corp" />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Email</label>
                        <Input {...register('email')} placeholder="joao@exemplo.com" />
                        {errors.email && <p className="text-red-500 text-xs">{errors.email.message}</p>}
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Telefone</label>
                        <Input {...register('phone')} placeholder="(11) 99999-9999" />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Valor Estimado (R$)</label>
                        <Input {...register('estimatedValue')} type="number" placeholder="0.00" />
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? 'Salvando...' : 'Salvar Lead'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
