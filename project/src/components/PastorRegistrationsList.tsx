import { useState, useMemo } from 'react';
import { usePastorRegistrations } from '../hooks/usePastorRegistrations';
import { useRegistrations } from '../hooks/useRegistrations';
import { useObreiros } from '../hooks/useObreiros';
import { useAuth } from '../contexts/AuthContext';
import { ObreiroRegistrationForm } from './ObreiroRegistrationForm';
import { ObreirosList } from './ObreirosList';
import { format, getYear } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { User, Heart, MapPin, Calendar, Phone, FileText, Users, Baby, Edit2, Trash2, Search, Filter, X, Download, BarChart3, TrendingUp, Award, Printer } from 'lucide-react';
import { formatCurrency } from '../utils/formatters';

export function PastorRegistrationsList() {
  const { pastorRegistrations, deletePastorRegistration, getTotalPastors, getTotalChildren } = usePastorRegistrations();
  const { registrations, getTotalRegistrations, getRegistrationsByField } = useRegistrations();
  const { getTotalObreiros } = useObreiros();
  const { isAdmin, canDelete } = useAuth();

  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [fieldFilter, setFieldFilter] = useState('');
  const [yearFilter, setYearFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [activeTab, setActiveTab] = useState<'pastors' | 'financial' | 'obreiros'>('pastors');
  const [showObreiroForm, setShowObreiroForm] = useState(false);

  // Generate year range from 2000 to 2030
  const availableYears = useMemo(() => {
    const years = [];
    for (let year = 2000; year <= 2030; year++) {
      years.push(year);
    }
    return years.reverse(); // Most recent first
  }, []);

  // Get unique fields from registrations
  const availableFields = useMemo(() => {
    const pastorFields = pastorRegistrations.map(r => r.currentField).filter(Boolean);
    const financialFields = registrations.map(r => r.field).filter(Boolean);
    const allFields = [...pastorFields, ...financialFields];
    return [...new Set(allFields)].sort();
  }, [pastorRegistrations, registrations]);

  const filteredRegistrations = useMemo(() => {
    return pastorRegistrations.filter(r => {
      // Search filter (pastor name, spouse name, current field)
      if (searchTerm) {
        const search = searchTerm.toLowerCase();
        const matchesPastor = r.pastorName.toLowerCase().includes(search);
        const matchesSpouse = r.spouseName.toLowerCase().includes(search);
        const matchesField = r.currentField.toLowerCase().includes(search);
        const matchesDescription = r.description.toLowerCase().includes(search);
        if (!matchesPastor && !matchesSpouse && !matchesField && !matchesDescription) return false;
      }

      // Field filter
      if (fieldFilter && r.currentField !== fieldFilter) return false;

      // Year filter (based on registration date)
      if (yearFilter && getYear(new Date(r.date)).toString() !== yearFilter) return false;

      return true;
    }).sort((a, b) => {
      // Sort by registration date (newest first)
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });
  }, [pastorRegistrations, searchTerm, fieldFilter, yearFilter]);

  const filteredFinancialRegistrations = useMemo(() => {
    return registrations.filter(r => {
      // Search filter (field, category, month)
      if (searchTerm) {
        const search = searchTerm.toLowerCase();
        const matchesField = r.field.toLowerCase().includes(search);
        const matchesCategory = r.category.toLowerCase().includes(search);
        const matchesMonth = r.month.toLowerCase().includes(search);
        if (!matchesField && !matchesCategory && !matchesMonth) return false;
      }

      // Field filter
      if (fieldFilter && r.field !== fieldFilter) return false;

      // Year filter (based on registration date)
      if (yearFilter && getYear(new Date(r.date)).toString() !== yearFilter) return false;

      return true;
    }).sort((a, b) => {
      // Sort by registration date (newest first)
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });
  }, [registrations, searchTerm, fieldFilter, yearFilter]);

  const clearAllFilters = () => {
    setSearchTerm('');
    setFieldFilter('');
    setYearFilter('');
  };

  const activeFiltersCount = [
    searchTerm !== '',
    fieldFilter !== '',
    yearFilter !== ''
  ].filter(Boolean).length;

  const calculateAge = (birthDate: string) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }

    return age;
  };

  const registrationsByField = getRegistrationsByField();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center space-x-2">
            <Users className="w-7 h-7 text-emerald-600" />
            <span>Agenda Completa</span>
          </h2>
          <p className="text-emerald-600">
            Cadastro de pastores e agenda financeira
            {((activeTab === 'pastors' && filteredRegistrations.length !== pastorRegistrations.length) ||
              (activeTab === 'financial' && filteredFinancialRegistrations.length !== registrations.length)) && (
                <span className="ml-2 text-sm">
                  ({activeTab === 'pastors' ? filteredRegistrations.length : filteredFinancialRegistrations.length} de {activeTab === 'pastors' ? pastorRegistrations.length : registrations.length} registros)
                </span>
              )}
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`px-4 py-2 rounded-lg transition-colors flex items-center space-x-2 ${showFilters || activeFiltersCount > 0
              ? 'bg-emerald-100 text-emerald-700 border border-emerald-300'
              : 'bg-gray-100 text-gray-700 border border-gray-300'
              }`}
          >
            <Filter className="w-4 h-4" />
            <span>Filtros</span>
            {activeFiltersCount > 0 && (
              <span className="bg-emerald-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {activeFiltersCount}
              </span>
            )}
          </button>

          <button className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors flex items-center space-x-2">
            <Download className="w-4 h-4" />
            <span>PDF</span>
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

      {/* Tab Navigation */}
      <div className="bg-white rounded-xl shadow-sm border border-emerald-100">
        <div className="flex border-b border-emerald-100">
          <button
            onClick={() => setActiveTab('pastors')}
            className={`flex-1 px-4 py-4 text-sm font-medium transition-colors flex items-center justify-center space-x-2 ${activeTab === 'pastors'
              ? 'text-emerald-700 bg-emerald-50 border-b-2 border-emerald-500'
              : 'text-gray-600 hover:text-emerald-600 hover:bg-emerald-50'
              }`}
          >
            <Users className="w-4 h-4" />
            <span>Cadastro de Pastores</span>
            <span className="bg-emerald-100 text-emerald-800 text-xs px-2 py-1 rounded-full">
              {pastorRegistrations.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('financial')}
            className={`flex-1 px-4 py-4 text-sm font-medium transition-colors flex items-center justify-center space-x-2 ${activeTab === 'financial'
              ? 'text-blue-700 bg-blue-50 border-b-2 border-blue-500'
              : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
              }`}
          >
            <FileText className="w-4 h-4" />
            <span>Agenda Financeira</span>
            <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
              {registrations.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('obreiros')}
            className={`flex-1 px-4 py-4 text-sm font-medium transition-colors flex items-center justify-center space-x-2 ${activeTab === 'obreiros'
              ? 'text-purple-700 bg-purple-50 border-b-2 border-purple-500'
              : 'text-gray-600 hover:text-purple-600 hover:bg-purple-50'
              }`}
          >
            <Award className="w-4 h-4" />
            <span>Cadastro de Obreiros</span>
            <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full">
              {getTotalObreiros()}
            </span>
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      {activeTab === 'pastors' ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-emerald-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total de Pastores</p>
                <p className="text-2xl font-bold text-emerald-600">{getTotalPastors()}</p>
                {filteredRegistrations.length !== pastorRegistrations.length && (
                  <p className="text-xs text-gray-500 mt-1">Filtrado: {filteredRegistrations.length}</p>
                )}
              </div>
              <div className="p-3 bg-emerald-100 rounded-full">
                <User className="w-6 h-6 text-emerald-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-emerald-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total de Filhos</p>
                <p className="text-2xl font-bold text-blue-600">{getTotalChildren()}</p>
                <p className="text-xs text-gray-500 mt-1">Todas as famílias</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <Baby className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-emerald-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Campos Ativos</p>
                <p className="text-2xl font-bold text-purple-600">{availableFields.length}</p>
                <p className="text-xs text-gray-500 mt-1">Com pastores</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <MapPin className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-blue-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Registros</p>
                <p className="text-2xl font-bold text-blue-600">{registrations.length}</p>
                {filteredFinancialRegistrations.length !== registrations.length && (
                  <p className="text-xs text-gray-500 mt-1">Filtrado: {filteredFinancialRegistrations.length}</p>
                )}
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <BarChart3 className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-blue-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Valor Total</p>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(getTotalRegistrations())} </p>
                <p className="text-xs text-gray-500 mt-1">Agenda financeira</p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-blue-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Campos com Registros</p>
                <p className="text-2xl font-bold text-purple-600">{Object.keys(registrationsByField).length}</p>
                <p className="text-xs text-gray-500 mt-1">Com valores</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <MapPin className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Advanced Filters Panel */}
      {showFilters && (
        <div className="bg-white rounded-xl shadow-sm p-6 border border-emerald-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
              <Filter className="w-5 h-5 text-emerald-600" />
              <span>Filtros de {activeTab === 'pastors' ? 'Pastores' : 'Agenda Financeira'}</span>
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

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder={activeTab === 'pastors' ? "Pastor, esposa, campo..." : "Campo, categoria, mês..."}
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              >
                <option value="">Todos os Campos</option>
                {availableFields.map((field) => (
                  <option key={field} value={field}>{field}</option>
                ))}
              </select>
            </div>

            {/* Year Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ano de Cadastro
              </label>
              <select
                value={yearFilter}
                onChange={(e) => setYearFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              >
                <option value="">Todos os Anos</option>
                {availableYears.map((year) => (
                  <option key={year} value={year.toString()}>{year}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Active Filters Summary */}
          {activeFiltersCount > 0 && (
            <div className="mt-4 p-3 bg-emerald-50 rounded-lg border border-emerald-200">
              <p className="text-sm text-emerald-800">
                <span className="font-medium">Filtros ativos:</span>
                {searchTerm && <span className="ml-2 px-2 py-1 bg-emerald-100 rounded text-xs">"{searchTerm}"</span>}
                {fieldFilter && <span className="ml-2 px-2 py-1 bg-emerald-100 rounded text-xs">{fieldFilter}</span>}
                {yearFilter && <span className="ml-2 px-2 py-1 bg-emerald-100 rounded text-xs">{yearFilter}</span>}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Content based on active tab */}
      {activeTab === 'pastors' ? (
        /* Pastor Cards */
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredRegistrations.length === 0 ? (
            <div className="col-span-full bg-white rounded-xl shadow-sm p-12 text-center border border-emerald-100">
              {pastorRegistrations.length === 0 ? (
                <>
                  <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum pastor cadastrado</h3>
                  <p className="text-gray-500">
                    Comece cadastrando pastores usando o botão "Cadastrar Pastor".
                  </p>
                </>
              ) : (
                <>
                  <Filter className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum resultado encontrado</h3>
                  <p className="text-gray-500 mb-4">
                    Não há pastores que correspondam aos filtros aplicados.
                  </p>
                  <button
                    onClick={clearAllFilters}
                    className="text-emerald-600 hover:text-emerald-800 transition-colors"
                  >
                    Limpar filtros
                  </button>
                </>
              )}
            </div>
          ) : (
            filteredRegistrations.map((pastor) => (
              <div key={pastor.id} className="bg-white rounded-xl shadow-sm border border-emerald-100 overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-emerald-500 to-green-600 p-4 text-white">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                        <User className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold">{pastor.pastorName}</h3>
                        <p className="text-emerald-100 text-sm">{pastor.currentField}</p>
                      </div>
                    </div>
                    {isAdmin() && (
                      <div className="flex items-center space-x-2">
                        <button className="p-2 bg-white bg-opacity-20 rounded-lg hover:bg-opacity-30 transition-colors">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        {canDelete() && (
                          <button
                            onClick={() => {
                              if (window.confirm(`Tem certeza que deseja excluir o cadastro do pastor "${pastor.pastorName}"? Esta ação não pode ser desfeita.`)) {
                                deletePastorRegistration(pastor.id);
                              }
                            }}
                            className="p-2 bg-red-500 bg-opacity-80 rounded-lg hover:bg-opacity-100 transition-colors"
                            title="Excluir cadastro do pastor"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 space-y-4">
                  {/* Basic Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {pastor.spouseName && (
                      <div className="flex items-center space-x-2">
                        <Heart className="w-4 h-4 text-pink-500" />
                        <span className="text-sm text-gray-600">Esposa:</span>
                        <span className="text-sm font-medium text-gray-900">{pastor.spouseName}</span>
                      </div>
                    )}

                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4 text-blue-500" />
                      <span className="text-sm text-gray-600">Idade:</span>
                      <span className="text-sm font-medium text-gray-900">
                        {calculateAge(pastor.birthDate)} anos
                      </span>
                    </div>

                    {pastor.phone && (
                      <div className="flex items-center space-x-2">
                        <Phone className="w-4 h-4 text-green-500" />
                        <span className="text-sm text-gray-600">Contato:</span>
                        <span className="text-sm font-medium text-gray-900">{pastor.phone}</span>
                      </div>
                    )}

                    {pastor.fieldPeriod && (
                      <div className="flex items-center space-x-2">
                        <MapPin className="w-4 h-4 text-purple-500" />
                        <span className="text-sm text-gray-600">Período:</span>
                        <span className="text-sm font-medium text-gray-900">{pastor.fieldPeriod}</span>
                      </div>
                    )}
                  </div>

                  {/* Children */}
                  {pastor.children.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center space-x-1">
                        <Baby className="w-4 h-4 text-blue-500" />
                        <span>Filhos ({pastor.children.length})</span>
                      </h4>
                      <div className="space-y-1">
                        {pastor.children.map((child) => (
                          <div key={child.id} className="flex items-center justify-between p-2 bg-blue-50 rounded-lg">
                            <span className="text-sm font-medium text-blue-900">{child.name}</span>
                            {child.birthDate && (
                              <span className="text-xs text-blue-700">
                                {calculateAge(child.birthDate)} anos
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Previous Fields */}
                  {pastor.previousFields.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center space-x-1">
                        <MapPin className="w-4 h-4 text-orange-500" />
                        <span>Campos Anteriores</span>
                      </h4>
                      <div className="space-y-1">
                        {pastor.previousFields.map((field) => (
                          <div key={field.id} className="flex items-center justify-between p-2 bg-orange-50 rounded-lg">
                            <span className="text-sm font-medium text-orange-900">{field.fieldName}</span>
                            <span className="text-xs text-orange-700">{field.year}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Description */}
                  {pastor.description && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center space-x-1">
                        <FileText className="w-4 h-4 text-gray-500" />
                        <span>Descrição</span>
                      </h4>
                      <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                        {pastor.description}
                      </p>
                    </div>
                  )}

                  {/* Registration Date */}
                  <div className="pt-3 border-t border-gray-200">
                    <p className="text-xs text-gray-500">
                      Cadastrado em {format(new Date(pastor.date), 'dd/MM/yyyy HH:mm', { locale: ptBR })} por {pastor.createdBy}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        activeTab === 'obreiros' ? (
          <ObreirosList />
        ) : (
          /* Financial Agenda Table */
          <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-blue-100">
            {filteredFinancialRegistrations.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                {registrations.length === 0 ? (
                  <>
                    <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma agenda financeira registrada</h3>
                    <p className="text-gray-500">
                      Comece registrando valores usando o botão "Agenda Financeira".
                    </p>
                  </>
                ) : (
                  <div>
                    <Filter className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum resultado encontrado</h3>
                    <p className="text-gray-500 mb-4">
                      Não há registros que correspondam aos filtros aplicados.
                    </p>
                    <button
                      onClick={clearAllFilters}
                      className="text-blue-600 hover:text-blue-800 transition-colors"
                    >
                      Limpar filtros
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-blue-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-blue-800 uppercase tracking-wider">
                        Data
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-blue-800 uppercase tracking-wider">
                        Campo
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-blue-800 uppercase tracking-wider">
                        Mês
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-blue-800 uppercase tracking-wider">
                        Categoria
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-blue-800 uppercase tracking-wider">
                        Valor
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-blue-800 uppercase tracking-wider">
                        Criado por
                      </th>
                      {isAdmin() && (
                        <th className="px-6 py-3 text-right text-xs font-medium text-blue-800 uppercase tracking-wider">
                          Ações
                        </th>
                      )}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-blue-100">
                    {filteredFinancialRegistrations.map((registration) => (
                      <tr key={registration.id} className="hover:bg-blue-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {format(new Date(registration.date), 'dd/MM/yyyy', { locale: ptBR })}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                            {registration.field}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {registration.month}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {registration.category}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm font-medium text-green-600">
                            {formatCurrency(registration.amount)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {registration.createdBy}
                        </td>
                        {isAdmin() && (
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex items-center justify-end space-x-2">
                              <button className="text-blue-600 hover:text-blue-900 transition-colors">
                                <Edit2 className="w-4 h-4" />
                              </button>
                              {canDelete() && (
                                <button
                                  onClick={() => {
                                    if (window.confirm(`Tem certeza que deseja excluir este registro da agenda financeira? Esta ação não pode ser desfeita.`)) {
                                      // TODO: Implementar deleteRegistration no hook useRegistrations
                                      console.log('Excluir registro:', registration.id);
                                    }
                                  }}
                                  className="text-red-600 hover:text-red-900 transition-colors"
                                  title="Excluir registro da agenda"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )
      )}

      {/* Forms - Only show for admins */}
      {isAdmin() && (
        <ObreiroRegistrationForm
          isOpen={showObreiroForm}
          onClose={() => setShowObreiroForm(false)}
        />
      )}
    </div>
  );
}