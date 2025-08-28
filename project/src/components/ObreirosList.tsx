// project/src/components/ObreirosList.tsx - VERSÃO COM INDENTAÇÃO CORRIGIDA

import { useState, useMemo } from 'react';
import { useObreiros } from '../hooks/useObreiros';
import { useAuth } from '../contexts/AuthContext';
import { ObreiroRegistration, SECTORS } from '../types';
import { format, getYear } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Users, User, Heart, Award, Clock, MapPin, CreditCard, Building2, Edit2, Trash2, Search, Filter, X, Download, Plus } from 'lucide-react';

import { ObreiroRegistrationForm } from './ObreiroRegistrationForm';

export function ObreirosList() {
  const { obreiros, deleteObreiro, getTotalObreiros, getObreirosByTipo, getObreirosByPagamento } = useObreiros();
  const { isAdmin } = useAuth();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingObreiro, setEditingObreiro] = useState<ObreiroRegistration | null>(null);

  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [tipoFilter, setTipoFilter] = useState('');
  const [setorFilter, setSetorFilter] = useState('');
  const [pagamentoFilter, setPagamentoFilter] = useState('');
  const [yearFilter, setYearFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const availableYears = useMemo(() => {
    const years = [];
    for (let year = 2000; year <= 2030; year++) {
      years.push(year);
    }
    return years.reverse();
  }, []);

  const filteredObreiros = useMemo(() => {
    return obreiros
      .filter(o => {
        if (searchTerm) {
          const search = searchTerm.toLowerCase();
          const matchesNome = o.nomeCompleto.toLowerCase().includes(search);
          const matchesCampo = o.campo.toLowerCase().includes(search);
          const matchesSetor = o.setor.toLowerCase().includes(search);
          const matchesCampoMissionario = o.campoMissionario?.toLowerCase().includes(search);
          if (!matchesNome && !matchesCampo && !matchesSetor && !matchesCampoMissionario) return false;
        }
        if (tipoFilter && o.tipo !== tipoFilter) return false;
        if (setorFilter && o.setor !== setorFilter) return false;
        if (pagamentoFilter && o.pagamento.tipo !== pagamentoFilter) return false;
        if (yearFilter && getYear(new Date(o.date)).toString() !== yearFilter) return false;
        return true;
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [obreiros, searchTerm, tipoFilter, setorFilter, pagamentoFilter, yearFilter]);

  const clearAllFilters = () => {
    setSearchTerm('');
    setTipoFilter('');
    setSetorFilter('');
    setPagamentoFilter('');
    setYearFilter('');
  };

  const activeFiltersCount = [searchTerm !== '', tipoFilter !== '', setorFilter !== '', pagamentoFilter !== '', yearFilter !== ''].filter(Boolean).length;

  const getTipoIcon = (tipo: string) => {
    switch (tipo) {
      case 'pastor': return <User className="w-4 h-4 text-blue-600" />;
      case 'missionaria': return <Heart className="w-4 h-4 text-pink-600" />;
      case 'evangelista': return <Award className="w-4 h-4 text-green-600" />;
      case 'jubilado': return <Clock className="w-4 h-4 text-gray-600" />;
      default: return <User className="w-4 h-4 text-gray-600" />;
    }
  };

  const getTipoLabel = (tipo: string) => {
    switch (tipo) {
      case 'pastor': return 'Pastor';
      case 'missionaria': return 'Pastor Missionária';
      case 'evangelista': return 'Evangelista';
      case 'jubilado': return 'Jubilado';
      default: return tipo;
    }
  };

  const obreirosByTipo = getObreirosByTipo();
  const obreirosByPagamento = getObreirosByPagamento();

  const handleOpenForm = (obreiro: ObreiroRegistration | null = null) => {
    setEditingObreiro(obreiro);
    setIsFormOpen(true);
  };

  return (
    <>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div>
            <h3 className="text-xl font-bold text-gray-900 flex items-center space-x-2">
              <Users className="w-6 h-6 text-blue-600" />
              <span>Cadastro de Obreiros</span>
            </h3>
            <p className="text-blue-600">
              Registro completo de obreiros e formas de pagamento
              {filteredObreiros.length !== obreiros.length && (
                <span className="ml-2 text-sm">({filteredObreiros.length} de {obreiros.length} registros)</span>
              )}
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => handleOpenForm()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Cadastrar Obreiro</span>
            </button>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`px-4 py-2 rounded-lg transition-colors flex items-center space-x-2 ${showFilters || activeFiltersCount > 0 ? 'bg-blue-100 text-blue-700 border border-blue-300' : 'bg-gray-100 text-gray-700 border border-gray-300'}`}
            >
              <Filter className="w-4 h-4" />
              <span>Filtros</span>
              {activeFiltersCount > 0 && (<span className="bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">{activeFiltersCount}</span>)}
            </button>

            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2">
              <Download className="w-4 h-4" />
              <span>PDF</span>
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-blue-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total de Obreiros</p>
                <p className="text-2xl font-bold text-blue-600">{getTotalObreiros()}</p>
                {filteredObreiros.length !== obreiros.length && (<p className="text-xs text-gray-500 mt-1">Filtrado: {filteredObreiros.length}</p>)}
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6 border border-green-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pastores</p>
                <p className="text-2xl font-bold text-green-600">{obreirosByTipo.pastor || 0}</p>
                <p className="text-xs text-gray-500 mt-1">Ativos</p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <User className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6 border border-pink-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Missionárias</p>
                <p className="text-2xl font-bold text-pink-600">{obreirosByTipo.missionaria || 0}</p>
                <p className="text-xs text-gray-500 mt-1">Ativas</p>
              </div>
              <div className="p-3 bg-pink-100 rounded-full">
                <Heart className="w-6 h-6 text-pink-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6 border border-orange-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pagamento Banco</p>
                <p className="text-2xl font-bold text-orange-600">{obreirosByPagamento.banco || 0}</p>
                <p className="text-xs text-gray-500 mt-1">Conta bancária</p>
              </div>
              <div className="p-3 bg-orange-100 rounded-full">
                <Building2 className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Advanced Filters Panel */}
        {showFilters && (
          <div className="bg-white rounded-xl shadow-sm p-6 border border-blue-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                <Filter className="w-5 h-5 text-blue-600" />
                <span>Filtros de Obreiros</span>
              </h3>
              {activeFiltersCount > 0 && (
                <button onClick={clearAllFilters} className="text-sm text-red-600 hover:text-red-800 transition-colors flex items-center space-x-1">
                  <X className="w-4 h-4" />
                  <span>Limpar Filtros</span>
                </button>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Pesquisar</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="Nome, campo, setor..." />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
                <select value={tipoFilter} onChange={(e) => setTipoFilter(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                  <option value="">Todos os Tipos</option>
                  <option value="pastor">Pastor</option>
                  <option value="missionaria">Pastor Missionária</option>
                  <option value="evangelista">Evangelista</option>
                  <option value="jubilado">Jubilado</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Setor</label>
                <select value={setorFilter} onChange={(e) => setSetorFilter(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                  <option value="">Todos os Setores</option>
                  {Object.keys(SECTORS).map((setor) => (<option key={setor} value={setor}>{setor}</option>))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Pagamento</label>
                <select value={pagamentoFilter} onChange={(e) => setPagamentoFilter(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                  <option value="">Todos</option>
                  <option value="dinheiro">Dinheiro</option>
                  <option value="banco">Banco</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ano</label>
                <select value={yearFilter} onChange={(e) => setYearFilter(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                  <option value="">Todos os Anos</option>
                  {availableYears.map((year) => (<option key={year} value={year.toString()}>{year}</option>))}
                </select>
              </div>
            </div>
            {activeFiltersCount > 0 && (
              <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-800">
                  <span className="font-medium">Filtros ativos:</span>
                  {searchTerm && <span className="ml-2 px-2 py-1 bg-blue-100 rounded text-xs">"{searchTerm}"</span>}
                  {tipoFilter && <span className="ml-2 px-2 py-1 bg-blue-100 rounded text-xs">{getTipoLabel(tipoFilter)}</span>}
                  {setorFilter && <span className="ml-2 px-2 py-1 bg-blue-100 rounded text-xs">{setorFilter}</span>}
                  {pagamentoFilter && <span className="ml-2 px-2 py-1 bg-blue-100 rounded text-xs">{pagamentoFilter}</span>}
                  {yearFilter && <span className="ml-2 px-2 py-1 bg-blue-100 rounded text-xs">{yearFilter}</span>}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Obreiros Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredObreiros.length === 0 ? (
            <div className="col-span-full bg-white rounded-xl shadow-sm p-12 text-center border border-blue-100">
              {obreiros.length === 0 ? (
                <>
                  <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum obreiro cadastrado</h3>
                  <p className="text-gray-500">Comece cadastrando obreiros usando o botão "Cadastrar Obreiro".</p>
                </>
              ) : (
                <>
                  <Filter className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum resultado encontrado</h3>
                  <p className="text-gray-500 mb-4">Não há obreiros que correspondam aos filtros aplicados.</p>
                  <button onClick={clearAllFilters} className="text-blue-600 hover:text-blue-800 transition-colors">Limpar filtros</button>
                </>
              )}
            </div>
          ) : (
            filteredObreiros.map((obreiro) => (
              <div key={obreiro.id} className="bg-white rounded-xl shadow-sm border border-blue-100 overflow-hidden">
                <div className={`p-4 ${obreiro.tipo === 'pastor' ? 'bg-gradient-to-r from-blue-500 to-blue-600' : obreiro.tipo === 'missionaria' ? 'bg-gradient-to-r from-pink-500 to-pink-600' : obreiro.tipo === 'evangelista' ? 'bg-gradient-to-r from-green-500 to-green-600' : 'bg-gradient-to-r from-gray-500 to-gray-600'} text-white`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                        {getTipoIcon(obreiro.tipo)}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold">{obreiro.nomeCompleto}</h3>
                        <p className="text-sm opacity-90">{getTipoLabel(obreiro.tipo)}</p>
                      </div>
                    </div>
                    {isAdmin() && (
                      <div className="flex items-center space-x-2">
                        <button onClick={() => handleOpenForm(obreiro)} className="p-2 bg-white bg-opacity-20 rounded-lg hover:bg-opacity-30 transition-colors">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            const isConfirmed = window.confirm(`Tem certeza de que deseja excluir o obreiro "${obreiro.nomeCompleto}"? Esta ação não pode ser desfeita.`);
                            if (isConfirmed) {
                              deleteObreiro(obreiro.id);
                            }
                          }}
                          className="p-2 bg-red-500 bg-opacity-80 rounded-lg hover:bg-opacity-100 transition-colors"
                          title={`Excluir ${obreiro.nomeCompleto}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                <div className="p-6 space-y-4">
                  <div className="grid grid-cols-1 gap-3">
                    <div className="flex items-center space-x-2">
                      <MapPin className="w-4 h-4 text-blue-500" />
                      <span className="text-sm text-gray-600">Setor:</span>
                      <span className="text-sm font-medium text-gray-900">{obreiro.setor}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <MapPin className="w-4 h-4 text-green-500" />
                      <span className="text-sm text-gray-600">Campo:</span>
                      <span className="text-sm font-medium text-gray-900">{obreiro.campo}</span>
                    </div>
                    {obreiro.campoMissionario && (
                      <div className="flex items-center space-x-2">
                        <Award className="w-4 h-4 text-purple-500" />
                        <span className="text-sm text-gray-600">Campo Missionário:</span>
                        <span className="text-sm font-medium text-gray-900">{obreiro.campoMissionario}</span>
                      </div>
                    )}
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center space-x-1">
                      <CreditCard className="w-4 h-4 text-orange-500" />
                      <span>Forma de Pagamento</span>
                    </h4>
                    {obreiro.pagamento.tipo === 'dinheiro' ? (
                      <div className="flex items-center space-x-2">
                        <CreditCard className="w-4 h-4 text-green-600" />
                        <span className="text-sm font-medium text-green-800">Dinheiro</span>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <Building2 className="w-4 h-4 text-blue-600" />
                          <span className="text-sm font-medium text-blue-800">Banco</span>
                        </div>
                        <div className="text-xs text-gray-600 space-y-1 ml-6">
                          <p><span className="font-medium">Agência:</span> {obreiro.pagamento.banco?.agencia}</p>
                          {obreiro.pagamento.banco?.contaPoupanca && (<p><span className="font-medium">Poupança:</span> {obreiro.pagamento.banco.contaPoupanca}</p>)}
                          {obreiro.pagamento.banco?.contaCorrente && (<p><span className="font-medium">Corrente:</span> {obreiro.pagamento.banco.contaCorrente}</p>)}
                        </div>
                      </div>
                    )}
                  </div>
                  {obreiro.observacoes && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Observações</h4>
                      <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">{obreiro.observacoes}</p>
                    </div>
                  )}
                  <div className="pt-3 border-t border-gray-200">
                    <p className="text-xs text-gray-500">
                      Cadastrado em {format(new Date(obreiro.date), 'dd/MM/yyyy HH:mm', { locale: ptBR })} por {obreiro.createdBy}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <ObreiroRegistrationForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        editObreiro={editingObreiro}
      />
    </>
  );
}
