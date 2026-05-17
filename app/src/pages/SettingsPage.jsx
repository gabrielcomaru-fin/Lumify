import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { supabase } from '@/lib/customSupabaseClient';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input, CurrencyInput } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/components/ui/use-toast';
import { 
  Sun, 
  Moon, 
  Edit, 
  Plus, 
  Trash2, 
  Check, 
  X, 
  AlertTriangle, 
  User, 
  Mail, 
  Star, 
  CheckCircle, 
  Wallet,
  Settings,
  Bell,
  Shield,
  CreditCard,
  Banknote,
  Smartphone,
  Building2,
  FileText,
  Palette,
  Database,
  ChevronRight,
  MessageSquare
} from 'lucide-react';
import { useFinance } from '@/contexts/FinanceDataContext';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { useTheme } from '@/hooks/useTheme';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { AccountForm } from '@/components/AccountForm';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';


// Componente para gerenciar categorias usando a mesma lógica do AccountForm
function CategoryManager({ type }) {
    const { categories, addCategory, updateCategory, deleteCategory } = useFinance();
    const { canSetCategoryLimit } = useSubscription();
    const { toast } = useToast();
    const [isOpen, setIsOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);
    const [formData, setFormData] = useState({ nome: '', limite: '' });

    const filteredCategories = categories.filter(c => c.tipo === type);
    const title = type === 'gasto' ? 'Categorias de Gastos' : 'Categorias de Investimentos';
    const icon = type === 'gasto' ? '💰' : '📈';

    const handleCurrencyChange = (value) => {
        setFormData({ ...formData, limite: value });
    };

    const parseCurrency = (value) => {
        if (value === '' || value === null || value === undefined) return null;
        if (typeof value === 'number') return value;
        const clean = value.replace(/\./g, '').replace(',', '.');
        const num = parseFloat(clean);
        return isNaN(num) ? null : num;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.nome.trim()) {
            toast({
                title: "Erro",
                description: "O nome da categoria é obrigatório.",
                variant: "destructive"
            });
            return;
        }

        const limiteValue = parseCurrency(formData.limite);

        try {
            if (editingCategory) {
                await updateCategory(editingCategory.id, {
                    nome: formData.nome,
                    limite: limiteValue,
                });
                toast({
                    title: "Categoria atualizada!",
                    description: `${formData.nome}${limiteValue ? ` - Limite: R$ ${limiteValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : ''}`,
                });
            } else {
                await addCategory({
                    nome: formData.nome,
                    tipo: type,
                    limite: limiteValue,
                });
                toast({
                    title: "Categoria adicionada!",
                    description: `${formData.nome}${limiteValue ? ` - Limite: R$ ${limiteValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : ''}`,
                });
            }

            setFormData({ nome: '', limite: '' });
            setEditingCategory(null);
            setIsOpen(false);
        } catch (error) {
            toast({
                title: "Erro",
                description: error.message,
                variant: "destructive"
            });
        }
    };

    const handleEdit = (category) => {
        setEditingCategory(category);
        setFormData({
            nome: category.nome,
            limite: typeof category.limite === 'number' ? category.limite : (category.limite ? parseFloat(String(category.limite).replace(/\./g, '').replace(',', '.')) : ''),
        });
        setIsOpen(true);
    };

    const handleDelete = async (categoryId) => {
        if (window.confirm('Tem certeza que deseja excluir esta categoria?')) {
            try {
                await deleteCategory(categoryId);
                toast({
                    title: "Categoria excluída!",
                    description: "A categoria foi removida com sucesso.",
                });
            } catch (error) {
                toast({
                    title: "Erro",
                    description: error.message,
                    variant: "destructive"
                });
            }
        }
    };

    const handleOpenChange = (open) => {
        setIsOpen(open);
        if (!open) {
            setEditingCategory(null);
            setFormData({ nome: '', limite: '' });
        }
    };

    return (
        <div className="space-y-6">
            <Dialog open={isOpen} onOpenChange={handleOpenChange}>
                <DialogTrigger asChild>
                    <Button>
                        <Plus className="w-4 h-4 mr-2" />
                        Nova Categoria
                    </Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <span className="text-lg">{icon}</span>
                            {editingCategory ? 'Editar Categoria' : 'Adicionar Categoria'}
                        </DialogTitle>
                        <DialogDescription>
                            {editingCategory ? 'Atualize os dados da categoria.' : `Registre uma nova categoria de ${type === 'gasto' ? 'gastos' : 'investimentos'}.`}
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Nome da Categoria</Label>
                            <Input
                                id="name"
                                placeholder={`Ex: ${type === 'gasto' ? 'Alimentação, Transporte, Lazer' : 'Ações, Fundos, CDB'}`}
                                value={formData.nome}
                                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                                required
                            />
                        </div>
                        
                        {type === 'gasto' && (
                            <div className="space-y-2">
                                <Label htmlFor="limit">Limite Mensal (R$) - Opcional</Label>
                                <CurrencyInput
                                    id="limit"
                                    placeholder="0,00"
                                    value={formData.limite}
                                    onChange={handleCurrencyChange}
                                    disabled={!canSetCategoryLimit}
                                />
                                {!canSetCategoryLimit ? (
                                    <p className="text-xs text-amber-600 dark:text-amber-400">
                                        Teto de gastos por categoria é um recurso do plano Pro. <a href="/planos" className="underline font-medium">Fazer upgrade</a>
                                    </p>
                                ) : (
                                    <p className="text-xs text-muted-foreground">
                                        Defina um limite mensal para controlar seus gastos nesta categoria
                                    </p>
                                )}
                            </div>
                        )}
                        
                        <Button type="submit" className="w-full">
                            {editingCategory ? 'Atualizar Categoria' : 'Adicionar Categoria'}
                        </Button>
                    </form>
                </DialogContent>
            </Dialog>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <span className="text-lg">{icon}</span>
                        {title}
                    </CardTitle>
                    <CardDescription>
                        {type === 'gasto' ? 'Organize seus gastos por categoria' : 'Categorize seus investimentos'}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {filteredCategories.length === 0 ? (
                        <div className="text-center text-muted-foreground py-8">
                            <span className="text-4xl mb-4 block opacity-50">{icon}</span>
                            <p className="font-semibold">Nenhuma categoria registrada ainda.</p>
                            <p className="text-sm">Adicione categorias para organizar melhor suas finanças!</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {filteredCategories.map((category, index) => (
                                <motion.div
                                    key={category.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className="flex justify-between items-center p-4 bg-secondary rounded-lg"
                                >
                                    <div>
                                        <p className="font-semibold">{category.nome}</p>
                                        <p className="text-sm text-muted-foreground">
                                            {type === 'gasto' ? 'Categoria de Gasto' : 'Categoria de Investimento'}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        {category.limite > 0 && (
                                            <div className="text-right">
                                                <p className="text-xs text-muted-foreground">Limite</p>
                                                <p className="font-medium text-sm text-primary">
                                                    R$ {category.limite.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                                </p>
                                            </div>
                                        )}
                                        <div className="flex gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleEdit(category)}
                                                className="h-8 w-8 p-0"
                                            >
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleDelete(category.id)}
                                                className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

// Componente para configurações de perfil
function ProfileSettings() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [userData, setUserData] = useState({
    name: user?.user_metadata?.nome || user?.email?.split('@')[0] || '',
    email: user?.email || '',
  });

  const handleSave = () => {
    toast({
      title: "🚧 Funcionalidade em desenvolvimento!",
      description: "A atualização de perfil será implementada em breve.",
    });
    setIsEditing(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
          <User className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h3 className="text-lg font-semibold">Informações Pessoais</h3>
          <p className="text-sm text-muted-foreground">Gerencie seus dados de perfil</p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Nome</Label>
          <Input 
            id="name" 
            placeholder="Seu nome" 
            value={userData.name}
            onChange={(e) => setUserData({...userData, name: e.target.value})}
            disabled={!isEditing}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <div className="flex items-center gap-2">
            <Mail className="w-4 h-4 text-muted-foreground" />
            <Input 
              id="email" 
              type="email" 
              value={userData.email}
              disabled 
              className="bg-muted"
            />
          </div>
          <p className="text-xs text-muted-foreground">O email não pode ser alterado</p>
        </div>
        <div className="flex gap-2">
          {isEditing ? (
            <>
              <Button onClick={handleSave}>Salvar Alterações</Button>
              <Button variant="outline" onClick={() => setIsEditing(false)}>Cancelar</Button>
            </>
          ) : (
            <Button variant="outline" onClick={() => setIsEditing(true)}>
              <Edit className="w-4 h-4 mr-2" />
              Editar Perfil
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

// Componente para configurações de aparência
function AppearanceSettings() {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
          <Palette className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h3 className="text-lg font-semibold">Aparência</h3>
          <p className="text-sm text-muted-foreground">Personalize a interface</p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between p-4 rounded-lg border">
          <div className="space-y-1">
            <Label htmlFor="dark-mode" className="text-base font-medium">Modo Escuro</Label>
            <p className="text-sm text-muted-foreground">Alternar entre tema claro e escuro</p>
          </div>
          <div className="flex items-center gap-3">
            <Sun className="h-5 w-5 text-muted-foreground" />
            <Switch
              id="dark-mode"
              checked={theme === 'dark'}
              onCheckedChange={toggleTheme}
            />
            <Moon className="h-5 w-5 text-muted-foreground" />
          </div>
        </div>
      </div>
    </div>
  );
}

// Componente para configurações de notificações
function NotificationSettings() {
  const { toast } = useToast();
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    weekly: true,
    monthly: true
  });

  const handleNotificationChange = (key, value) => {
    setNotifications(prev => ({ ...prev, [key]: value }));
    toast({
      title: "🚧 Funcionalidade em desenvolvimento!",
      description: "As configurações de notificação serão implementadas em breve.",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
          <Bell className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h3 className="text-lg font-semibold">Notificações</h3>
          <p className="text-sm text-muted-foreground">Configure como você quer ser notificado</p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between p-4 rounded-lg border">
          <div className="space-y-1">
            <Label className="text-base font-medium">Email</Label>
            <p className="text-sm text-muted-foreground">Receber notificações por email</p>
          </div>
          <Switch
            checked={notifications.email}
            onCheckedChange={(value) => handleNotificationChange('email', value)}
          />
        </div>

        <div className="flex items-center justify-between p-4 rounded-lg border">
          <div className="space-y-1">
            <Label className="text-base font-medium">Push</Label>
            <p className="text-sm text-muted-foreground">Notificações no navegador</p>
          </div>
          <Switch
            checked={notifications.push}
            onCheckedChange={(value) => handleNotificationChange('push', value)}
          />
        </div>

        <div className="flex items-center justify-between p-4 rounded-lg border">
          <div className="space-y-1">
            <Label className="text-base font-medium">Relatórios Semanais</Label>
            <p className="text-sm text-muted-foreground">Resumo semanal das suas finanças</p>
          </div>
          <Switch
            checked={notifications.weekly}
            onCheckedChange={(value) => handleNotificationChange('weekly', value)}
          />
        </div>

        <div className="flex items-center justify-between p-4 rounded-lg border">
          <div className="space-y-1">
            <Label className="text-base font-medium">Relatórios Mensais</Label>
            <p className="text-sm text-muted-foreground">Análise mensal detalhada</p>
          </div>
          <Switch
            checked={notifications.monthly}
            onCheckedChange={(value) => handleNotificationChange('monthly', value)}
          />
        </div>
      </div>
    </div>
  );
}

// Componente para configurações de segurança
function SecuritySettings() {
  const { toast } = useToast();

  const handlePasswordChange = () => {
    toast({
      title: "🚧 Funcionalidade em desenvolvimento!",
      description: "A alteração de senha será implementada em breve.",
    });
  };

  const handleTwoFactor = () => {
    toast({
      title: "🚧 Funcionalidade em desenvolvimento!",
      description: "A autenticação de dois fatores será implementada em breve.",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
          <Shield className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h3 className="text-lg font-semibold">Segurança</h3>
          <p className="text-sm text-muted-foreground">Proteja sua conta</p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between p-4 rounded-lg border">
          <div className="space-y-1">
            <Label className="text-base font-medium">Alterar Senha</Label>
            <p className="text-sm text-muted-foreground">Atualize sua senha regularmente</p>
          </div>
          <Button variant="outline" onClick={handlePasswordChange}>
            Alterar
          </Button>
        </div>

        <div className="flex items-center justify-between p-4 rounded-lg border">
          <div className="space-y-1">
            <Label className="text-base font-medium">Autenticação de Dois Fatores</Label>
            <p className="text-sm text-muted-foreground">Adicione uma camada extra de segurança</p>
          </div>
          <Button variant="outline" onClick={handleTwoFactor}>
            Configurar
          </Button>
        </div>
      </div>
    </div>
  );
}

// Componente para configurações de contas bancárias
function BankSettings() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
          <Wallet className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h3 className="text-lg font-semibold">Contas Bancárias</h3>
          <p className="text-sm text-muted-foreground">Gerencie suas instituições financeiras</p>
        </div>
      </div>

      <AccountForm />
    </div>
  );
}

// Componente para gerenciar meios de pagamento
function PaymentMethodsManager() {
  const { paymentMethods, addPaymentMethod, updatePaymentMethod, deletePaymentMethod } = useFinance();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState({ nome: '', tipo: 'dinheiro', cor: '#3b82f6' });

  const paymentTypes = [
    { value: 'dinheiro', label: 'Dinheiro' },
    { value: 'pix', label: 'Pix' },
    { value: 'cartao_credito', label: 'Cartão de Crédito' },
    { value: 'cartao_debito', label: 'Cartão de Débito' },
    { value: 'transferencia', label: 'Transferência' },
    { value: 'boleto', label: 'Boleto' },
    { value: 'outros', label: 'Outros' },
  ];

  const getPaymentMethodIcon = (tipo) => {
    const iconMap = {
      cartao_credito: CreditCard,
      cartao_debito: CreditCard,
      dinheiro: Banknote,
      pix: Smartphone,
      transferencia: Building2,
      boleto: FileText,
      outros: Wallet,
    };
    return iconMap[tipo] || Wallet;
  };

  const handleOpenChange = (open) => {
    setIsOpen(open);
    if (!open) {
      setEditing(null);
      setFormData({ nome: '', tipo: 'dinheiro', cor: '#3b82f6' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.nome.trim()) {
      toast({ title: 'Erro', description: 'O nome é obrigatório.', variant: 'destructive' });
      return;
    }
    try {
      if (editing) {
        await updatePaymentMethod(editing.id, {
          nome: formData.nome,
          tipo: formData.tipo,
          cor: formData.cor,
        });
        toast({ title: 'Meio de pagamento atualizado!' });
      } else {
        await addPaymentMethod({
          nome: formData.nome,
          tipo: formData.tipo,
          cor: formData.cor,
          ativo: true,
        });
        toast({ title: 'Meio de pagamento adicionado!' });
      }
      setIsOpen(false);
      setEditing(null);
      setFormData({ nome: '', tipo: 'dinheiro', cor: '#3b82f6' });
    } catch (error) {
      toast({ title: 'Erro', description: error.message, variant: 'destructive' });
    }
  };

  const handleEdit = (pm) => {
    setEditing(pm);
    setFormData({ nome: pm.nome || '', tipo: pm.tipo || 'dinheiro', cor: pm.cor || '#3b82f6' });
    setIsOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Tem certeza que deseja excluir este meio de pagamento?')) return;
    try {
      await deletePaymentMethod(id);
      toast({ title: 'Meio de pagamento excluído!' });
    } catch (error) {
      toast({ title: 'Erro', description: error.message, variant: 'destructive' });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
          <CreditCard className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h3 className="text-lg font-semibold">Meios de Pagamento</h3>
          <p className="text-sm text-muted-foreground">Crie e personalize suas formas de pagamento</p>
        </div>
      </div>

      <Dialog open={isOpen} onOpenChange={handleOpenChange}>
        <div className="flex">
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Novo Meio de Pagamento
            </Button>
          </DialogTrigger>
        </div>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? 'Editar Meio de Pagamento' : 'Adicionar Meio de Pagamento'}</DialogTitle>
            <DialogDescription>
              {editing ? 'Atualize os dados do meio de pagamento.' : 'Cadastre um novo meio de pagamento.'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex items-center gap-3 p-3 rounded-md border bg-muted/30">
              {(() => {
                const Icon = getPaymentMethodIcon(formData.tipo);
                return <Icon className="w-5 h-5" style={{ color: formData.cor }} />;
              })()}
              <span className="text-sm text-muted-foreground">Prévia do ícone</span>
            </div>
            <div className="space-y-2">
              <Label htmlFor="pm-nome">Nome</Label>
              <Input id="pm-nome" value={formData.nome} onChange={(e) => setFormData({ ...formData, nome: e.target.value })} placeholder="Ex: Nubank, Carteira, Itaú" />
            </div>
            <div className="space-y-2">
              <Label>Tipo</Label>
              <div className="flex items-center gap-3">
                <Input
                  id="pm-cor"
                  type="color"
                  value={formData.cor}
                  onChange={(e) => setFormData({ ...formData, cor: e.target.value })}
                  className="w-6 h-6 p-0 rounded-full border-0 overflow-hidden cursor-pointer appearance-none"
                />
                <Select value={formData.tipo} onValueChange={(v) => setFormData({ ...formData, tipo: v })}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    {paymentTypes.map((t) => (
                      <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button type="submit" className="w-full">{editing ? 'Atualizar' : 'Adicionar'}</Button>
          </form>
        </DialogContent>
      </Dialog>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">Lista de Meios de Pagamento</CardTitle>
          <CardDescription>Edite ou remova quando precisar</CardDescription>
        </CardHeader>
        <CardContent>
          {paymentMethods?.length ? (
            <div className="space-y-3">
              {paymentMethods.map((pm, index) => (
                <motion.div
                  key={pm.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center justify-between p-4 bg-secondary rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    {(() => {
                      const Icon = getPaymentMethodIcon(pm.tipo);
                      return <Icon className="w-4 h-4" style={{ color: pm.cor || '#94a3b8' }} />;
                    })()}
                    <div>
                      <p className="font-semibold">{pm.nome}</p>
                      <p className="text-xs text-muted-foreground">{paymentTypes.find(t => t.value === pm.tipo)?.label || 'Outro'}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleEdit(pm)} className="h-8 w-8 p-0">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleDelete(pm.id)} className="h-8 w-8 p-0 text-destructive hover:text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center text-muted-foreground py-8">
              <CreditCard className="w-6 h-6 mx-auto opacity-60 mb-2" />
              <p className="font-medium">Nenhum meio de pagamento cadastrado.</p>
              <p className="text-sm">Adicione um novo clicando em "Novo Meio de Pagamento".</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Componente para vincular WhatsApp
function WhatsAppSettings() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [phone, setPhone] = useState('');
  const [savedPhone, setSavedPhone] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function loadPhone() {
      if (!user) return;
      const { data } = await supabase
        .from('usuarios')
        .select('whatsapp_phone')
        .eq('id', user.id)
        .single();
      const current = data?.whatsapp_phone || '';
      setSavedPhone(current);
      setPhone(formatPhoneDisplay(current));
      setLoading(false);
    }
    loadPhone();
  }, [user]);

  function formatPhoneDisplay(raw) {
    if (!raw) return '';
    const digits = raw.replace(/\D/g, '');
    if (digits.length === 13) {
      return `+${digits.slice(0, 2)} (${digits.slice(2, 4)}) ${digits.slice(4, 9)}-${digits.slice(9)}`;
    }
    if (digits.length === 11) {
      return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
    }
    return raw;
  }

  function parsePhoneRaw(display) {
    return display.replace(/\D/g, '');
  }

  async function handleSave() {
    const raw = parsePhoneRaw(phone);
    if (raw.length < 10 || raw.length > 13) {
      toast({
        title: 'Número inválido',
        description: 'Informe um número com DDD e dígito 9. Ex: (11) 91234-5678.',
        variant: 'destructive',
      });
      return;
    }
    const normalized = raw.length === 11 ? `55${raw}` : raw;
    setSaving(true);
    const { error } = await supabase
      .from('usuarios')
      .update({ whatsapp_phone: normalized })
      .eq('id', user.id);
    setSaving(false);
    if (error) {
      toast({
        title: 'Erro ao salvar',
        description: error.message,
        variant: 'destructive',
      });
      return;
    }
    setSavedPhone(normalized);
    toast({
      title: 'WhatsApp vinculado!',
      description: 'Agora você pode registrar despesas pelo WhatsApp.',
    });
  }

  async function handleRemove() {
    setSaving(true);
    const { error } = await supabase
      .from('usuarios')
      .update({ whatsapp_phone: null })
      .eq('id', user.id);
    setSaving(false);
    if (!error) {
      setSavedPhone('');
      setPhone('');
      toast({ title: 'Número removido', description: 'Vínculo com WhatsApp desfeito.' });
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center">
          <MessageSquare className="w-6 h-6 text-green-500" />
        </div>
        <div>
          <h3 className="text-lg font-semibold">Agente WhatsApp</h3>
          <p className="text-sm text-muted-foreground">
            Registre despesas e receitas enviando mensagens pelo WhatsApp
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Vincular número</CardTitle>
          <CardDescription>
            Informe seu número do WhatsApp para que o agente reconheça suas mensagens e crie lançamentos automaticamente.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {loading ? (
            <p className="text-sm text-muted-foreground">Carregando...</p>
          ) : (
            <>
              <div className="space-y-2">
                <Label htmlFor="whatsapp-phone">Número do WhatsApp</Label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <MessageSquare className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="whatsapp-phone"
                      placeholder="(11) 91234-5678"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                  <Button onClick={handleSave} disabled={saving}>
                    {saving ? 'Salvando...' : savedPhone ? 'Atualizar' : 'Vincular'}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Digite com DDD. Ex: (11) 91234-5678
                </p>
              </div>

              {savedPhone && (
                <div className="flex items-center justify-between p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-sm font-medium text-green-700 dark:text-green-400">
                      Número vinculado: +{savedPhone}
                    </span>
                  </div>
                  <Button variant="ghost" size="sm" onClick={handleRemove} disabled={saving} className="text-destructive hover:text-destructive h-7 px-2">
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              )}

              <div className="rounded-lg border p-4 space-y-2">
                <p className="text-sm font-medium">Como usar:</p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• <span className="font-mono bg-muted px-1 rounded">Gastei 200 em gasolina</span> → cria despesa</li>
                  <li>• <span className="font-mono bg-muted px-1 rounded">Recebi 3000 de salário</span> → cria receita</li>
                  <li>• <span className="font-mono bg-muted px-1 rounded">!ajuda</span> → lista os comandos</li>
                </ul>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Componente para planos e assinatura
function PlansSettings() {
  const navigate = useNavigate();

  const handleGoToPlans = () => {
    navigate('/planos');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
          <Star className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h3 className="text-lg font-semibold">Planos e Assinatura</h3>
          <p className="text-sm text-muted-foreground">
            Gerencie seu plano Free, Pro ou Premium, faça upgrade e veja os benefícios diretamente na tela de planos.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Gerenciar planos</CardTitle>
          <CardDescription>
            Acesse a tela completa de planos para escolher ou alterar sua assinatura Lumify.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button className="w-full" onClick={handleGoToPlans}>
            Ver planos e fazer upgrade
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

// Página principal de configurações
export function SettingsPage() {
  return (
    <>
      <Helmet>
        <title>Configurações - Lumify</title>
        <meta name="description" content="Gerencie suas preferências e configurações de conta." />
      </Helmet>
      
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Settings className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Configurações</h1>
            <p className="text-muted-foreground">Gerencie suas preferências e configurações</p>
          </div>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="w-4 h-4" />
              <span className="hidden sm:inline">Perfil</span>
            </TabsTrigger>
            <TabsTrigger value="finance" className="flex items-center gap-2">
              <Wallet className="w-4 h-4" />
              <span className="hidden sm:inline">Financeiro</span>
            </TabsTrigger>
            <TabsTrigger value="preferences" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">Preferências</span>
            </TabsTrigger>
            <TabsTrigger value="billing" className="flex items-center gap-2">
              <CreditCard className="w-4 h-4" />
              <span className="hidden sm:inline">Cobrança</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardContent className="pt-6">
                  <ProfileSettings />
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <SecuritySettings />
                </CardContent>
              </Card>
            </div>
            <Card>
              <CardContent className="pt-6">
                <WhatsAppSettings />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="preferences" className="space-y-6">
            <Card>
              <CardContent className="pt-6">
                <AppearanceSettings />
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <NotificationSettings />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="finance" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardContent className="pt-6">
                  <BankSettings />
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <PaymentMethodsManager />
                </CardContent>
              </Card>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardContent className="pt-6">
                  <CategoryManager type="gasto" />
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <CategoryManager type="investimento" />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="billing" className="space-y-6">
            <Card>
              <CardContent className="pt-6">
                <PlansSettings />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}