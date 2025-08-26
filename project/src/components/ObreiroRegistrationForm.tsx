import React, { useState } from 'react';
import { useObreiros } from '../hooks/useObreiros';
import { useAuth } from '../contexts/AuthContext';
import { SECTORS } from '../types';
import { Plus, X, Users, MapPin, CreditCard, Building2, User, Heart, Award, Clock } from 'lucide-react';

interface ObreiroRegistrationFormProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ObreiroRegistrationForm({ isOpen, onClose }: ObreiroRegistrationFormProps) {
  const [nomeCompleto, setNomeCompleto] = useState('');
  const [setor, setSetor] = useState('');
  const [campo, setCampo] = useState('');
  const [campoMissionario, setCampoMissionario] = useState('');
  const [tipo, setTipo] = useState<'pastor' | 'missionaria' | 'evangelista' | 'jubilado'>('pastor');
  const [tipoPagamento, setTipoPagamento] = useState<'dinheiro' | 'banco'>('dinheiro');
  const [agencia, setAgencia] = useState('');
  const [contaPoupanca, setContaPoupanca] = useState('');
  const [contaCorrente, setContaCorrente] = useState('');
  const [observacoes, setObservacoes] = useState('');
  
  const { addObreiro } = useObreiros();
  const { user } = useAuth();

  const handleSetorChange = (selectedSetor: string) => {
    setSetor(selectedSetor);
    setCampo(''); // Reset campo when setor changes
  };

  const getFieldsForSetor = (setorName: string) => {
    return SECTORS[setorName as keyof typeof SECTORS] || [];
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!nomeCompleto || !setor || !campo || !tipo) return;

    const pagamento = {
      tipo: tipoPagamento,
      ...(tipoPagamento === 'banco' && {
        banco: {
          agencia: agencia.trim(),
          ...(contaPoupanca && { contaPoupanca: contaPoupanca.trim() }),
          ...(contaCorrente && { contaCorrente: contaCorrente.trim() })
        }
      })
    };

    addObreiro({
      nomeCompleto: nomeCompleto.trim(),
      setor,
      campo,
      campoMissionario: campoMissionario.trim() || undefined,
      tipo,
      pagamento,
      observacoes: observacoes.trim() || undefined,
      createdBy: user?.username || 'unknown'
    });

    // Reset form
    setNomeCompleto('');
    setSetor('');
    setCampo('');
    setCampoMissionario('');
    setTipo('pastor');
    setTipoPagamento('dinheiro');
    setAgencia('');
    setContaPoupanca('');
    setContaCorrente('');
    setObservacoes('');
    onClose();
  };

  if (!isOpen) return null;

  const getTipoIcon = (tipoValue: string) => {
    switch (tipoValue) {
      case 'pastor': return <User className="w-4 h-4" />;
      case 'missionaria': return <Heart className="w-4 h-4" />;
      case 'evangelista': return <Award className="w-4 h-4" />;
      case 'jubilado': return <Clock className="w-4 h-4" />;
      default: return <User className="w-4 h-4" />;
    }
  };

  const getTipoLabel = (tipoValue: string) => {
    switch (tipoValue) {
      case 'pastor': return 'Pastor';
      case 'missionaria': return 'Pastor Missionária';
      case 'evangelista': return 'Evangelista';
      case 'jubilado': return 'Jubilado';
      default: return tipoValue;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-900 flex items-center space-x-2">
              <Users className="w-6 h-6 text-blue-600" />
              <span>Cadastro de Obreiros</span>
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Informações Básicas */}
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <h4 className="text-lg font-medium text-blue-800 mb-4 flex items-center space-x-2">
                <User className="w-5 h-5" />
                <span>Informações Básicas</span>
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nome Completo *
                  </label>
                  <input
                    type="text"
                    value={nomeCompleto}
                    onChange={(e) => setNomeCompleto(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Nome completo do obreiro"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tipo de Obreiro *
                  </label>
                  <select
                    value={tipo}
                    onChange={(e) => setTipo(e.target.value as 'pastor' | 'missionaria' | 'evangelista' | 'jubilado')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="pastor">Pastor</option>
                    <option value="missionaria">Pastor Missionária</option>
                    <option value="evangelista">Evangelista</option>
                    <option value="jubilado">Jubilado</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Campo Missionário
                  </label>
                  <input
                    type="text"
                    value={campoMissionario}
                    onChange={(e) => setCampoMissionario(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Campo missionário específico"
                  />
                </div>
              </div>
            </div>

            {/* Localização */}
            <div className="bg-emerald-50 rounded-lg p-4 border border-emerald-200">
              <h4 className="text-lg font-medium text-emerald-800 mb-4 flex items-center space-x-2">
                <MapPin className="w-5 h-5" />
                <span>Localização</span>
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Setor *
                  </label>
                  <select
                    value={setor}
                    onChange={(e) => handleSetorChange(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    required
                  >
                    <option value="">Selecione um setor</option>
                    {Object.keys(SECTORS).map((setorName) => (
                      <option key={setorName} value={setorName}>{setorName}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Campo *
                  </label>
                  <select
                    value={campo}
                    onChange={(e) => setCampo(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    required
                    disabled={!setor}
                  >
                    <option value="">
                      {setor ? 'Selecione um campo' : 'Primeiro selecione um setor'}
                    </option>
                    {setor && getFieldsForSetor(setor).map((fieldName) => (
                      <option key={fieldName} value={fieldName}>{fieldName}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Setor Information Display */}
              {setor && (
                <div className="mt-4 p-3 bg-emerald-100 rounded-lg border border-emerald-300">
                  <h5 className="text-sm font-medium text-emerald-800 mb-2 flex items-center space-x-1">
                    <MapPin className="w-4 h-4" />
                    <span>{setor}</span>
                  </h5>
                  <div className="text-xs text-emerald-700">
                    <span className="font-medium">Campos disponíveis:</span>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {getFieldsForSetor(setor).map((fieldName) => (
                        <span
                          key={fieldName}
                          className={`px-2 py-1 rounded text-xs ${
                            campo === fieldName
                              ? 'bg-emerald-200 text-emerald-900 font-medium'
                              : 'bg-emerald-50 text-emerald-800'
                          }`}
                        >
                          {fieldName}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Forma de Pagamento */}
            <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
              <h4 className="text-lg font-medium text-orange-800 mb-4 flex items-center space-x-2">
                <CreditCard className="w-5 h-5" />
                <span>Forma de Pagamento</span>
              </h4>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tipo de Pagamento *
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <label className="flex items-center p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                      <input
                        type="radio"
                        value="dinheiro"
                        checked={tipoPagamento === 'dinheiro'}
                        onChange={(e) => setTipoPagamento(e.target.value as 'dinheiro' | 'banco')}
                        className="mr-3"
                      />
                      <CreditCard className="w-4 h-4 mr-2 text-green-600" />
                      <span className="font-medium">Dinheiro</span>
                    </label>
                    
                    <label className="flex items-center p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                      <input
                        type="radio"
                        value="banco"
                        checked={tipoPagamento === 'banco'}
                        onChange={(e) => setTipoPagamento(e.target.value as 'dinheiro' | 'banco')}
                        className="mr-3"
                      />
                      <Building2 className="w-4 h-4 mr-2 text-blue-600" />
                      <span className="font-medium">Banco</span>
                    </label>
                  </div>
                </div>

                {/* Dados Bancários */}
                {tipoPagamento === 'banco' && (
                  <div className="p-4 bg-white rounded-lg border border-orange-300">
                    <h5 className="text-sm font-medium text-orange-800 mb-3 flex items-center space-x-1">
                      <Building2 className="w-4 h-4" />
                      <span>Dados Bancários</span>
                    </h5>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Agência *
                        </label>
                        <input
                          type="text"
                          value={agencia}
                          onChange={(e) => setAgencia(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm"
                          placeholder="0000"
                          required={tipoPagamento === 'banco'}
                        />
                      </div>
                      
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Conta Poupança
                        </label>
                        <input
                          type="text"
                          value={contaPoupanca}
                          onChange={(e) => setContaPoupanca(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm"
                          placeholder="00000-0"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Conta Corrente
                        </label>
                        <input
                          type="text"
                          value={contaCorrente}
                          onChange={(e) => setContaCorrente(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm"
                          placeholder="00000-0"
                        />
                      </div>
                    </div>
                    
                    <p className="text-xs text-orange-700 mt-2">
                      * Preencha pelo menos uma das contas (Poupança ou Corrente)
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Observações */}
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <h4 className="text-lg font-medium text-gray-800 mb-4 flex items-center space-x-2">
                <Users className="w-5 h-5" />
                <span>Observações</span>
              </h4>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Informações Adicionais
                </label>
                <textarea
                  value={observacoes}
                  onChange={(e) => setObservacoes(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={3}
                  placeholder="Informações adicionais sobre o obreiro..."
                />
              </div>
            </div>

            {/* Preview do Tipo Selecionado */}
            <div className="p-4 bg-blue-100 rounded-lg border border-blue-300">
              <h5 className="text-sm font-medium text-blue-800 mb-2 flex items-center space-x-2">
                {getTipoIcon(tipo)}
                <span>Tipo Selecionado: {getTipoLabel(tipo)}</span>
              </h5>
              <p className="text-xs text-blue-700">
                {tipo === 'pastor' && 'Pastor responsável por campo ou congregação'}
                {tipo === 'missionaria' && 'Pastor Missionária dedicada ao trabalho missionário'}
                {tipo === 'evangelista' && 'Evangelista dedicado à evangelização'}
                {tipo === 'jubilado' && 'Obreiro aposentado/jubilado'}
              </p>
            </div>

            {/* Form Actions */}
            <div className="flex space-x-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all flex items-center justify-center space-x-2 font-medium"
              >
                <Plus className="w-5 h-5" />
                <span>Cadastrar Obreiro</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}