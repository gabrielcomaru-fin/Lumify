import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input, CurrencyInput } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Receipt, Repeat, DollarSign, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useFinance } from '@/contexts/FinanceDataContext';

export function ExpenseForm({ onSubmit, expenseToEdit, onOpenChange, isOpen }) {
  const { categories } = useFinance();
  const expenseCategories = categories.filter(c => c.tipo === 'gasto');

  const defaultFormData = {
    descricao: '',
    valor: '',
    categoria_id: '',
    recorrente: false,
    pago: false,
    data: new Date().toISOString().split('T')[0]
  };

  const [formData, setFormData] = useState(defaultFormData);
  const [errorMessage, setErrorMessage] = useState(''); // Estado para mensagem de erro
  const currencyRef = useRef(null);

  const formatCurrencyForInput = (value) => {
    if (value == null || value === '') return '';
    const numberValue = Number(value);
    if (isNaN(numberValue)) return '';
    return numberValue.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  useEffect(() => {
    if (expenseToEdit?.id) {
      setFormData({
        descricao: expenseToEdit.descricao || '',
        valor: formatCurrencyForInput(expenseToEdit.valor),
        categoria_id: expenseToEdit.categoria_id || '',
        recorrente: expenseToEdit.recorrente || false,
        pago: expenseToEdit.pago || false,
        data: expenseToEdit.data ? new Date(expenseToEdit.data).toISOString().split('T')[0] : defaultFormData.data
      });
    } else {
      setFormData(defaultFormData);
    }
    setErrorMessage(''); // Limpa mensagem de erro ao abrir
  }, [expenseToEdit, isOpen]);

  useEffect(() => {
    const input = currencyRef.current?.input;
    if (input) {
      const length = input.value.length;
      input.setSelectionRange(length, length);
    }
  }, [formData.valor]);

  const parseCurrency = (value) => {
    if (!value) return 0;
    const normalized = String(value).replace(/\./g, '').replace(',', '.');
    const number = parseFloat(normalized);
    return isNaN(number) ? 0 : number;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const parsedValor = parseCurrency(formData.valor);

    if (parsedValor <= 0) {
      setErrorMessage('Informe um valor válido maior que zero.');
      return;
    }

    if (expenseCategories.length === 0) {
      setErrorMessage('Cadastre pelo menos uma categoria de gasto nas Configurações antes de adicionar despesas.');
      return;
    }
    if (!formData.categoria_id) {
      setErrorMessage('Selecione uma categoria para a despesa.');
      return;
    }

    // Se chegou aqui, todos os campos estão corretos
    onSubmit({ ...formData, valor: parsedValor }, expenseToEdit?.id);
    handleReset();
  };

  const handleReset = () => {
    setFormData(defaultFormData);
    setErrorMessage('');
  };

  const handleOpenChange = (open) => {
    onOpenChange(open);
    if (!open) handleReset();
  };

  const handleCurrencyChange = (value) => {
    setFormData({ ...formData, valor: value });
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      {!expenseToEdit?.id && (
        <DialogTrigger asChild>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Nova Despesa
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Receipt className="w-5 h-5" />
            {expenseToEdit?.id ? 'Editar Despesa' : 'Adicionar Despesa'}
          </DialogTitle>
          <DialogDescription>
            {expenseToEdit?.id ? 'Atualize os detalhes da sua despesa.' : 'Registre uma nova despesa para controlar seus gastos.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Input
              id="description"
              placeholder="Ex: Almoço no restaurante"
              value={formData.descricao}
              onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
              required
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Valor (R$)</Label>
              <CurrencyInput
                id="amount"
                placeholder="0,00"
                value={formData.valor}
                onChange={handleCurrencyChange}
                ref={currencyRef}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="date">Data</Label>
              <Input
                id="date"
                type="date"
                value={formData.data}
                onChange={(e) => setFormData({ ...formData, data: e.target.value })}
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="category">Categoria</Label>
            {expenseCategories.length > 0 ? (
              <>
                <Select
                  value={formData.categoria_id}
                  onValueChange={(value) => {
                    setFormData({ ...formData, categoria_id: value });
                    setErrorMessage(''); // limpa erro quando seleciona
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {expenseCategories.map((category) => (
                      <SelectItem key={category.id} value={category.id.toString()}>
                        {category.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errorMessage && (
                  <p className="text-sm text-red-600 mt-1">{errorMessage}</p>
                )}
              </>
            ) : (
              <div className="rounded-lg border border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/50 p-3">
                <p className="text-sm font-medium text-amber-800 dark:text-amber-200 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  Cadastre uma categoria de gasto primeiro
                </p>
                <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                  Vá em <Link to="/configuracoes" className="underline font-medium hover:text-amber-900 dark:hover:text-amber-100">Configurações</Link> para criar categorias.
                </p>
              </div>
            )}
          </div>
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isRecurring"
                checked={formData.recorrente}
                onChange={(e) => setFormData({ ...formData, recorrente: e.target.checked })}
                className="rounded accent-primary"
              />
              <Label htmlFor="isRecurring" className="flex items-center gap-2 text-sm">
                <Repeat className="w-4 h-4" />
                Despesa recorrente
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isPaid"
                checked={formData.pago}
                onChange={(e) => setFormData({ ...formData, pago: e.target.checked })}
                className="rounded accent-primary"
              />
              <Label htmlFor="isPaid" className="flex items-center gap-2 text-sm">
                <DollarSign className="w-4 h-4" />
                Despesa já paga
              </Label>
            </div>
          </div>
          <Button type="submit" className="w-full">
            {expenseToEdit?.id ? 'Salvar Alterações' : 'Adicionar Despesa'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}