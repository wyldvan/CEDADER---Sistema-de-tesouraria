import React, { useState, useMemo } from 'react';
import { useTransactions } from '../hooks/useTransactions';
import { usePrebenda } from '../hooks/usePrebenda';
import { useAuth } from '../contexts/AuthContext';
import { Transaction, Prebenda, FIELDS, SECTORS, MONTHS } from '../types';
import { format, getYear, getMonth } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Receipt, Download, Printer, Search, Filter, X, Calendar, FileText, CheckCircle, ArrowUpCircle, ArrowDownCircle, Eye, MapPin } from 'lucide-react';
import jsPDF from 'jspdf';
import { formatCurrency } from '../utils/formatters';

export function ReceiptsPanel() {
  const { transactions } = useTransactions();
  const { prebendas } = usePrebenda();
  const { user } = useAuth();

  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [fieldFilter, setFieldFilter] = useState('');
  const [monthFilter, setMonthFilter] = useState('');
  const [yearFilter, setYearFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [entryTypeFilter, setEntryTypeFilter] = useState('');
  const [selectedEntries, setSelectedEntries] = useState<Set<string>>(new Set());

  // Generate year range from 2000 to 2030
  const availableYears = useMemo(() => {
    const years = [];
    for (let year = 2000; year <= 2030; year++) {
      years.push(year);
    }
    return years.reverse(); // Most recent first
  }, []);

  // Get unique fields from entries
  const availableFields = useMemo(() => {
    const transactionFields = transactions.filter(t => t.type === 'entry').map(t => t.field).filter(Boolean);
    const prebendaFields = prebendas.filter(p => p.type === 'entry').map(p => p.field).filter(Boolean);
    const allFields = [...transactionFields, ...prebendaFields];
    return [...new Set(allFields)].sort();
  }, [transactions, prebendas]);

  // Combine and filter entry transactions and prebendas
  const allEntries = useMemo(() => {
    const entryTransactions = transactions
      .filter(t => entryTypeFilter === 'exit' ? t.type === 'exit' : t.type === 'entry')
      .map(t => ({
        ...t,
        source: 'transaction' as const,
        pastor: undefined,
        isAuxilio: undefined,
        isPrebenda: undefined
      }));

    const entryPrebendas = prebendas
      .filter(p => entryTypeFilter === 'exit' ? p.type === 'exit' : p.type === 'entry')
      .map(p => ({
        ...p,
        source: 'prebenda' as const,
        category: 'Auxílio/Prebenda',
        startDate: undefined
      }));

    return [...entryTransactions, ...entryPrebendas];
  }, [transactions, prebendas, entryTypeFilter]);

  const filteredEntries = useMemo(() => {
    return allEntries.filter(entry => {
      // Search filter
      if (searchTerm) {
        const search = searchTerm.toLowerCase();
        const matchesDescription = entry.description.toLowerCase().includes(search);
        const matchesCategory = entry.category.toLowerCase().includes(search);
        const matchesField = entry.field?.toLowerCase().includes(search);
        const matchesDocumentNumber = entry.documentNumber?.toLowerCase().includes(search);
        const matchesPastor = entry.source === 'prebenda' && entry.pastor?.toLowerCase().includes(search);
        if (!matchesDescription && !matchesCategory && !matchesField && !matchesDocumentNumber && !matchesPastor) return false;
      }

      // Field filter
      if (fieldFilter && entry.field !== fieldFilter) return false;

      // Month filter
      if (monthFilter) {
        const monthIndex = MONTHS.indexOf(monthFilter);
        if (monthIndex !== -1 && getMonth(new Date(entry.date)) !== monthIndex) return false;
      }

      // Year filter
      if (yearFilter && getYear(new Date(entry.date)).toString() !== yearFilter) return false;

      // Entry type filter
      if (entryTypeFilter) {
        if (entryTypeFilter === 'transaction' && entry.source !== 'transaction') return false;
        if (entryTypeFilter === 'prebenda' && entry.source !== 'prebenda') return false;
        if (entryTypeFilter === 'exit' && entry.type !== 'exit') return false;
      }

      return true;
    }).sort((a, b) => {
      // Sort by date (newest first)
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });
  }, [allEntries, searchTerm, fieldFilter, monthFilter, yearFilter]);

  const clearAllFilters = () => {
    setSearchTerm('');
    setFieldFilter('');
    setMonthFilter('');
    setYearFilter('');
    setEntryTypeFilter('');
  };

  const activeFiltersCount = [
    searchTerm !== '',
    fieldFilter !== '',
    monthFilter !== '',
    yearFilter !== '',
    entryTypeFilter !== ''
  ].filter(Boolean).length;

  const handleSelectEntry = (entryId: string) => {
    const newSelected = new Set(selectedEntries);
    if (newSelected.has(entryId)) {
      newSelected.delete(entryId);
    } else {
      newSelected.add(entryId);
    }
    setSelectedEntries(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedEntries.size === filteredEntries.length) {
      setSelectedEntries(new Set());
    } else {
      setSelectedEntries(new Set(filteredEntries.map(e => e.id)));
    }
  };

  const generateReceiptsPDF = () => {
    if (selectedEntries.size === 0) {
      alert('Selecione pelo menos uma entrada para gerar o recibo.');
      return;
    }

    const selectedEntriesData = filteredEntries.filter(e => selectedEntries.has(e.id));
    const pdf = new jsPDF();
    const pageWidth = pdf.internal.pageSize.width;
    const isExit = entryTypeFilter === 'exit';

    // Header
    pdf.setFontSize(18);
    pdf.setTextColor(16, 185, 129);
    pdf.text('CEDADER - Convenção Estadual das Assembleia de Deus', pageWidth / 2, 20, { align: 'center' });

    pdf.setFontSize(16);
    pdf.setTextColor(0, 0, 0);
    pdf.text(isExit ? 'RECIBO - SAÍDA' : 'RECIBO - ENTRADA', pageWidth / 2, 35, { align: 'center' });

    pdf.setFontSize(10);
    pdf.text(`Gerado em: ${format(new Date(), 'dd/MM/yyyy HH:mm', { locale: ptBR })}`, pageWidth / 2, 45, { align: 'center' });
    pdf.text(`Gerado por: ${user?.fullName || user?.username}`, pageWidth / 2, 55, { align: 'center' });

    // Table headers
    const headers = ['Data', 'Tipo', 'Categoria', 'Valor', 'Método', 'Nº Doc', 'Campo', 'Mês', 'Descrição'];
    const startY = 70;
    let currentY = startY;

    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'bold');

    const colWidths = [18, 16, 24, 18, 16, 16, 20, 16, 40];
    let currentX = 10;

    headers.forEach((header, index) => {
      pdf.text(header, currentX, currentY);
      currentX += colWidths[index];
    });

    currentY += 10;
    pdf.setFont('helvetica', 'normal');

    // Table rows
    let totalValue = 0;
    selectedEntriesData.forEach((entry) => {
      if (currentY > 270) {
        pdf.addPage();
        currentY = 20;
      }

      currentX = 10;
      const rowData = [
        format(new Date(entry.date), 'dd/MM/yyyy', { locale: ptBR }),
        entry.source === 'transaction' ? 'Transação' : 'Auxílio/Prebenda',
        entry.category,
        `${formatCurrency(entry.amount)}`,
        entry.paymentMethod.toUpperCase(),
        entry.documentNumber || '-',
        entry.field || 'N/A',
        entry.month || 'N/A',
        entry.description
      ];

      rowData.forEach((data, colIndex) => {
        const maxWidth = colWidths[colIndex] - 2;
        const lines = pdf.splitTextToSize(data, maxWidth);
        pdf.text(lines, currentX, currentY);
        currentX += colWidths[colIndex];
      });

      totalValue += entry.amount;
      currentY += 8;
    });

    // Summary
    currentY += 10;
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(12);
    pdf.text(`${isExit ? 'TOTAL DE SAÍDAS' : 'TOTAL DE ENTRADAS'}: ${formatCurrency(totalValue)}`, 10, currentY);
    currentY += 10;
    pdf.text(`QUANTIDADE DE REGISTROS: ${selectedEntries.size}`, 10, currentY);

    // Footer
    currentY += 20;
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Este recibo comprova as ${isExit ? 'saídas' : 'entradas'} selecionadas no sistema CEDADER.`, pageWidth / 2, currentY, { align: 'center' });
    currentY += 8;
    pdf.text('Documento gerado automaticamente pelo sistema.', pageWidth / 2, currentY, { align: 'center' });

    // Signature
    currentY += 20;
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.text('Assinatura - CEDADER', pageWidth / 2, currentY, { align: 'center' });

    // Add signature line
    currentY += 15;
    const lineWidth = 80;
    const lineStartX = (pageWidth - lineWidth) / 2;
    pdf.line(lineStartX, currentY, lineStartX + lineWidth, currentY);

    // Statistics by payment method
    const paymentMethodStats = selectedEntriesData.reduce((acc, entry) => {
      acc[entry.paymentMethod] = (acc[entry.paymentMethod] || 0) + entry.amount;
      return acc;
    }, {} as Record<string, number>);

    if (Object.keys(paymentMethodStats).length > 0) {
      currentY += 15;
      pdf.setFont('helvetica', 'bold');
      pdf.text('RESUMO POR MÉTODO DE PAGAMENTO:', 10, currentY);
      currentY += 8;

      pdf.setFont('helvetica', 'normal');
      Object.entries(paymentMethodStats).forEach(([method, amount]) => {
        const methodLabel = method === 'pix' ? 'PIX' : method === 'cash' ? 'Dinheiro' : 'Transferência';
        pdf.text(`${methodLabel}: ${formatCurrency(amount)}`, 15, currentY);
        currentY += 6;
      });
    }

    pdf.save(`Recibo_${isExit ? 'Saidas' : 'Entradas'}_${format(new Date(), 'dd-MM-yyyy_HH-mm', { locale: ptBR })}.pdf`);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 flex items-center space-x-3">
            <Receipt className="w-8 h-8 text-indigo-600" />
            <span>{entryTypeFilter === 'exit' ? 'Recibos de Saídas' : 'Recibos de Entradas'}</span>
          </h2>
          <p className="text-indigo-600 mt-1">
            {entryTypeFilter === 'exit'
              ? 'Visualize e gere recibos das saídas (Transações + Auxílio/Prebenda)'
              : 'Visualize e gere recibos das entradas (Transações + Auxílio/Prebenda)'
            }
            {filteredEntries.length !== allEntries.length && (
              <span className="ml-2 text-sm">
                ({filteredEntries.length} de {allEntries.length} registros)
              </span>
            )}
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`px-4 py-2 rounded-lg transition-colors flex items-center space-x-2 ${showFilters || activeFiltersCount > 0
              ? 'bg-indigo-100 text-indigo-700 border border-indigo-300'
              : 'bg-gray-100 text-gray-700 border border-gray-300'
              }`}
          >
            <Filter className="w-4 h-4" />
            <span>Filtros</span>
            {activeFiltersCount > 0 && (
              <span className="bg-indigo-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {activeFiltersCount}
              </span>
            )}
          </button>

          <button
            onClick={generateReceiptsPDF}
            disabled={selectedEntries.size === 0}
            className={`px-4 py-2 rounded-lg transition-colors flex items-center space-x-2 ${selectedEntries.size > 0
              ? 'bg-indigo-600 text-white hover:bg-indigo-700'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
          >
            <Download className="w-4 h-4" />
            <span>Gerar Recibo ({selectedEntries.size})</span>
          </button>

          <button
            onClick={() => window.print()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <Printer className="w-4 h-4" />
            <span>Imprimir</span>
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-indigo-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">{entryTypeFilter === 'exit' ? 'Total de Saídas' : 'Total de Entradas'}</p>
              <p className="text-2xl font-bold text-indigo-600">{allEntries.length}</p>
              {filteredEntries.length !== allEntries.length && (
                <p className="text-xs text-gray-500 mt-1">Filtrado: {filteredEntries.length}</p>
              )}
            </div>
            <div className="p-3 bg-indigo-100 rounded-full">
              {entryTypeFilter === 'exit' ? (
                <ArrowDownCircle className="w-6 h-6 text-indigo-600" />
              ) : (
                <ArrowUpCircle className="w-6 h-6 text-indigo-600" />
              )}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-green-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Valor Total</p>
              <p className="text-2xl font-bold text-green-600">
                {formatCurrency(filteredEntries.reduce((sum, e) => sum + e.amount, 0))}
              </p>
              <p className="text-xs text-gray-500 mt-1">{entryTypeFilter === 'exit' ? 'Saídas filtradas' : 'Entradas filtradas'}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <Receipt className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-purple-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Selecionadas</p>
              <p className="text-2xl font-bold text-purple-600">{selectedEntries.size}</p>
              <p className="text-xs text-gray-500 mt-1">Para recibo</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <CheckCircle className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-orange-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Valor Selecionado</p>
              <p className="text-2xl font-bold text-orange-600">
                {formatCurrency(filteredEntries
                  .filter(e => selectedEntries.has(e.id))
                  .reduce((sum, e) => sum + e.amount, 0))}
              </p>
              <p className="text-xs text-gray-500 mt-1">Para recibo</p>
            </div>
            <div className="p-3 bg-orange-100 rounded-full">
              <FileText className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Advanced Filters Panel */}
      {showFilters && (
        <div className="bg-white rounded-xl shadow-sm p-6 border border-indigo-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
              <Filter className="w-5 h-5 text-indigo-600" />
              <span>Filtros de Entradas</span>
            </h3>
            {activeFiltersCount > 0 && (
              <button
                onClick={clearAllFilters}
                className="text-sm text-red-600 hover:text-red-800 transition-colors flex items-center space-x-1"
              >
                <X className="w-4 h-4" />
                <span>Limpar Filtros</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Entry Type Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tipo de Entrada
              </label>
              <select
                value={entryTypeFilter}
                onChange={(e) => setEntryTypeFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">Todos os Tipos</option>
                <option value="transaction">Entrada (Transação)</option>
                <option value="prebenda">Entrada (Auxílio/Prebenda)</option>
                <option value="exit">Saída</option>
              </select>
            </div>

            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Pesquisar
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Descrição, categoria, campo, nº doc..."
                />
              </div>
            </div>

            {/* Field Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Campo
              </label>
              <select
                value={fieldFilter}
                onChange={(e) => setFieldFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">Todos os Campos</option>
                {availableFields.map((field) => (
                  <option key={field} value={field}>{field}</option>
                ))}
              </select>
            </div>

            {/* Month Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mês
              </label>
              <select
                value={monthFilter}
                onChange={(e) => setMonthFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">Todos os Meses</option>
                {MONTHS.map((month) => (
                  <option key={month} value={month}>{month}</option>
                ))}
              </select>
            </div>

            {/* Year Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ano (2000-2030)
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <select
                  value={yearFilter}
                  onChange={(e) => setYearFilter(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="">Todos os Anos</option>
                  {availableYears.map((year) => (
                    <option key={year} value={year.toString()}>{year}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Active Filters Summary */}
          {activeFiltersCount > 0 && (
            <div className="mt-4 p-3 bg-indigo-50 rounded-lg border border-indigo-200">
              <p className="text-sm text-indigo-800">
                <span className="font-medium">Filtros ativos:</span>
                {searchTerm && <span className="ml-2 px-2 py-1 bg-indigo-100 rounded text-xs">"{searchTerm}"</span>}
                {fieldFilter && <span className="ml-2 px-2 py-1 bg-indigo-100 rounded text-xs">{fieldFilter}</span>}
                {monthFilter && <span className="ml-2 px-2 py-1 bg-indigo-100 rounded text-xs">{monthFilter}</span>}
                {yearFilter && <span className="ml-2 px-2 py-1 bg-indigo-100 rounded text-xs">{yearFilter}</span>}
                {entryTypeFilter && <span className="ml-2 px-2 py-1 bg-indigo-100 rounded text-xs">{entryTypeFilter === 'transaction' ? 'Transação' : 'Auxílio/Prebenda'}</span>}
                {entryTypeFilter && <span className="ml-2 px-2 py-1 bg-indigo-100 rounded text-xs">{entryTypeFilter === 'transaction' ? 'Transação' : entryTypeFilter === 'prebenda' ? 'Auxílio/Prebenda' : 'Saída'}</span>}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Entries Table */}
      <div className="bg-white rounded-xl shadow-sm border border-indigo-100">
        <div className="px-6 py-4 border-b border-indigo-100">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">
              {entryTypeFilter === 'exit' ? 'Saídas Disponíveis para Recibo' : 'Entradas Disponíveis para Recibo'}
              {filteredEntries.length !== allEntries.length && (
                <span className="text-sm font-normal text-gray-600 ml-2">(filtrado)</span>
              )}
            </h3>
            <div className="flex items-center space-x-3">
              <button
                onClick={handleSelectAll}
                className="text-sm text-indigo-600 hover:text-indigo-800 transition-colors"
              >
                {selectedEntries.size === filteredEntries.length ? 'Desmarcar Todas' : 'Selecionar Todas'}
              </button>
              <span className="text-sm text-gray-500">
                {selectedEntries.size} de {filteredEntries.length} selecionadas
              </span>
            </div>
          </div>
        </div>

        {filteredEntries.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            {allEntries.length === 0 ? (
              <>
                <Receipt className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {entryTypeFilter === 'exit' ? 'Nenhuma saída encontrada' : 'Nenhuma entrada encontrada'}
                </h3>
                <p className="text-gray-500">
                  {entryTypeFilter === 'exit'
                    ? 'Não há saídas registradas no sistema para gerar recibos.'
                    : 'Não há entradas registradas no sistema para gerar recibos.'
                  }
                </p>
              </>
            ) : (
              <>
                <Filter className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum resultado encontrado</h3>
                <p className="text-gray-500 mb-4">
                  {entryTypeFilter === 'exit'
                    ? 'Não há saídas que correspondam aos filtros aplicados.'
                    : 'Não há entradas que correspondam aos filtros aplicados.'
                  }
                </p>
                <button
                  onClick={clearAllFilters}
                  className="text-indigo-600 hover:text-indigo-800 transition-colors"
                >
                  Limpar filtros
                </button>
              </>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-indigo-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-indigo-800 uppercase tracking-wider">
                    <input
                      type="checkbox"
                      checked={selectedEntries.size === filteredEntries.length && filteredEntries.length > 0}
                      onChange={handleSelectAll}
                      className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-indigo-800 uppercase tracking-wider">
                    Data
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-indigo-800 uppercase tracking-wider">
                    Tipo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-indigo-800 uppercase tracking-wider">
                    Categoria
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-indigo-800 uppercase tracking-wider">
                    Valor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-indigo-800 uppercase tracking-wider">
                    Método
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-indigo-800 uppercase tracking-wider">
                    Nº Doc
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-indigo-800 uppercase tracking-wider">
                    Campo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-indigo-800 uppercase tracking-wider">
                    Mês
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-indigo-800 uppercase tracking-wider">
                    Descrição
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-indigo-100">
                {filteredEntries.map((entry) => (
                  <tr
                    key={entry.id}
                    className={`hover:bg-indigo-50 transition-colors cursor-pointer ${selectedEntries.has(entry.id) ? 'bg-indigo-50 border-l-4 border-indigo-500' : ''
                      }`}
                    onClick={() => handleSelectEntry(entry.id)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedEntries.has(entry.id)}
                        onChange={() => handleSelectEntry(entry.id)}
                        className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                        onClick={(e) => e.stopPropagation()}
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {format(new Date(entry.date), 'dd/MM/yyyy', { locale: ptBR })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${entry.type === 'entry'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                        }`}>
                        {entry.type === 'entry' ? 'Entrada' : 'Saída'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {entry.category}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-green-600">
                        {formatCurrency(entry.amount)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${entry.paymentMethod === 'pix' ? 'bg-blue-100 text-blue-800' :
                        entry.paymentMethod === 'cash' ? 'bg-green-100 text-green-800' :
                          'bg-purple-100 text-purple-800'
                        }`}>
                        {entry.paymentMethod === 'pix' ? 'PIX' :
                          entry.paymentMethod === 'cash' ? 'Dinheiro' :
                            'Transferência'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {entry.documentNumber ? (
                        <div className="flex items-center space-x-1">
                          <FileText className="w-3 h-3 text-gray-400" />
                          <span className="font-mono text-xs">{entry.documentNumber}</span>
                        </div>
                      ) : (
                        <span className="text-gray-400 text-xs">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${entry.field ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-600'
                        }`}>
                        {entry.field || 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${entry.month ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-600'
                        }`}>
                        {entry.month || 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                      {entry.description}
                      {entry.source === 'prebenda' && entry.pastor && (
                        <div className="text-xs text-purple-600 mt-1">
                          Pastor: {entry.pastor}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-indigo-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
          <Eye className="w-5 h-5 text-indigo-600" />
          <span>Como usar os Recibos</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-900 mb-2">📋 Seleção de Entradas</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Marque as {entryTypeFilter === 'exit' ? 'saídas' : 'entradas'} que deseja incluir no recibo</li>
              <li>• Use "Selecionar Todas" para marcar todas as {entryTypeFilter === 'exit' ? 'saídas' : 'entradas'} filtradas</li>
              <li>• Clique em uma linha para selecionar/desmarcar rapidamente</li>
              <li>• Use os filtros para encontrar {entryTypeFilter === 'exit' ? 'saídas' : 'entradas'} específicas</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 mb-2">📄 Geração do Recibo</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• O recibo inclui todas as {entryTypeFilter === 'exit' ? 'saídas' : 'entradas'} selecionadas</li>
              <li>• Mostra total geral e resumo por método de pagamento</li>
              <li>• Inclui informações de data, usuário e sistema</li>
              <li>• Formato PDF pronto para impressão ou envio</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}