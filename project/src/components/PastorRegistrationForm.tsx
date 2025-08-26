import React, { useState } from 'react';
import { usePastorRegistrations } from '../hooks/usePastorRegistrations';
import { useAuth } from '../contexts/AuthContext';
import { FIELDS } from '../types';
import { Child, PreviousField } from '../types';
import { Plus, X, User, Heart, MapPin, Calendar, Phone, FileText, Users, Trash2, Baby } from 'lucide-react';

interface PastorRegistrationFormProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PastorRegistrationForm({ isOpen, onClose }: PastorRegistrationFormProps) {
  const [pastorName, setPastorName] = useState('');
  const [spouseName, setSpouseName] = useState('');
  const [currentField, setCurrentField] = useState('');
  const [fieldPeriod, setFieldPeriod] = useState('');
  const [children, setChildren] = useState<Child[]>([]);
  const [birthDate, setBirthDate] = useState('');
  const [description, setDescription] = useState('');
  const [phone, setPhone] = useState('');
  const [previousFields, setPreviousFields] = useState<PreviousField[]>([]);
  
  const { addPastorRegistration } = usePastorRegistrations();
  const { user } = useAuth();

  const addChild = () => {
    const newChild: Child = {
      id: Date.now().toString(),
      name: '',
      birthDate: ''
    };
    setChildren([...children, newChild]);
  };

  const updateChild = (id: string, field: keyof Child, value: string) => {
    setChildren(children.map(child => 
      child.id === id ? { ...child, [field]: value } : child
    ));
  };

  const removeChild = (id: string) => {
    setChildren(children.filter(child => child.id !== id));
  };

  const addPreviousField = () => {
    const newField: PreviousField = {
      id: Date.now().toString(),
      fieldName: '',
      year: ''
    };
    setPreviousFields([...previousFields, newField]);
  };

  const updatePreviousField = (id: string, field: keyof PreviousField, value: string) => {
    setPreviousFields(previousFields.map(prevField => 
      prevField.id === id ? { ...prevField, [field]: value } : prevField
    ));
  };

  const removePreviousField = (id: string) => {
    setPreviousFields(previousFields.filter(field => field.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!pastorName || !currentField || !birthDate) return;

    addPastorRegistration({
      pastorName,
      spouseName,
      currentField,
      fieldPeriod,
      children: children.filter(child => child.name.trim() !== ''),
      birthDate,
      description,
      phone,
      previousFields: previousFields.filter(field => field.fieldName.trim() !== '' && field.year.trim() !== ''),
      createdBy: user?.username || 'unknown'
    });

    // Reset form
    setPastorName('');
    setSpouseName('');
    setCurrentField('');
    setFieldPeriod('');
    setChildren([]);
    setBirthDate('');
    setDescription('');
    setPhone('');
    setPreviousFields([]);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-900 flex items-center space-x-2">
              <User className="w-6 h-6 text-emerald-600" />
              <span>Cadastro de Pastor</span>
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="bg-emerald-50 rounded-lg p-4 border border-emerald-200">
              <h4 className="text-lg font-medium text-emerald-800 mb-4 flex items-center space-x-2">
                <User className="w-5 h-5" />
                <span>Informações Básicas</span>
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nome do Pastor *
                  </label>
                  <input
                    type="text"
                    value={pastorName}
                    onChange={(e) => setPastorName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    placeholder="Nome completo do pastor"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nome da Esposa
                  </label>
                  <div className="relative">
                    <Heart className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      value={spouseName}
                      onChange={(e) => setSpouseName(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      placeholder="Nome da esposa"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Data de Nascimento *
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="date"
                      value={birthDate}
                      onChange={(e) => setBirthDate(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Celular/WhatsApp
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      placeholder="(95) 99999-9999"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Current Field Information */}
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <h4 className="text-lg font-medium text-blue-800 mb-4 flex items-center space-x-2">
                <MapPin className="w-5 h-5" />
                <span>Campo Atual</span>
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Campo Atual *
                  </label>
                  <select
                    value={currentField}
                    onChange={(e) => setCurrentField(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    required
                  >
                    <option value="">Selecione o campo atual</option>
                    {FIELDS.map((field) => (
                      <option key={field} value={field}>{field}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Período no Campo
                  </label>
                  <input
                    type="text"
                    value={fieldPeriod}
                    onChange={(e) => setFieldPeriod(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    placeholder="Ex: 2020-2024, Desde 2022, etc."
                  />
                </div>
              </div>
            </div>

            {/* Children Section */}
            <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-medium text-purple-800 flex items-center space-x-2">
                  <Baby className="w-5 h-5" />
                  <span>Filhos(as)</span>
                </h4>
                <button
                  type="button"
                  onClick={addChild}
                  className="px-3 py-1 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-1 text-sm"
                >
                  <Plus className="w-4 h-4" />
                  <span>Adicionar Filho(a)</span>
                </button>
              </div>

              {children.length === 0 ? (
                <p className="text-purple-700 text-sm italic">Nenhum filho cadastrado. Clique em "Adicionar Filho(a)" para incluir.</p>
              ) : (
                <div className="space-y-3">
                  {children.map((child, index) => (
                    <div key={child.id} className="grid grid-cols-1 md:grid-cols-3 gap-3 p-3 bg-white rounded-lg border border-purple-200">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Nome do(a) Filho(a) {index + 1}
                        </label>
                        <input
                          type="text"
                          value={child.name}
                          onChange={(e) => updateChild(child.id, 'name', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm"
                          placeholder="Nome completo"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Data de Nascimento
                        </label>
                        <input
                          type="date"
                          value={child.birthDate}
                          onChange={(e) => updateChild(child.id, 'birthDate', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm"
                        />
                      </div>
                      <div className="flex items-end">
                        <button
                          type="button"
                          onClick={() => removeChild(child.id)}
                          className="w-full px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors flex items-center justify-center space-x-1 text-sm"
                        >
                          <Trash2 className="w-4 h-4" />
                          <span>Remover</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Previous Fields Section */}
            <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-medium text-orange-800 flex items-center space-x-2">
                  <MapPin className="w-5 h-5" />
                  <span>Campos que Pastoreou</span>
                </h4>
                <button
                  type="button"
                  onClick={addPreviousField}
                  className="px-3 py-1 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors flex items-center space-x-1 text-sm"
                >
                  <Plus className="w-4 h-4" />
                  <span>Adicionar Campo</span>
                </button>
              </div>

              {previousFields.length === 0 ? (
                <p className="text-orange-700 text-sm italic">Nenhum campo anterior cadastrado. Clique em "Adicionar Campo" para incluir.</p>
              ) : (
                <div className="space-y-3">
                  {previousFields.map((field, index) => (
                    <div key={field.id} className="grid grid-cols-1 md:grid-cols-3 gap-3 p-3 bg-white rounded-lg border border-orange-200">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Campo {index + 1}
                        </label>
                        <select
                          value={field.fieldName}
                          onChange={(e) => updatePreviousField(field.id, 'fieldName', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm"
                        >
                          <option value="">Selecione o campo</option>
                          {FIELDS.map((fieldName) => (
                            <option key={fieldName} value={fieldName}>{fieldName}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Ano que Pastoreou
                        </label>
                        <input
                          type="text"
                          value={field.year}
                          onChange={(e) => updatePreviousField(field.id, 'year', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm"
                          placeholder="Ex: 2018-2020, 2015, etc."
                        />
                      </div>
                      <div className="flex items-end">
                        <button
                          type="button"
                          onClick={() => removePreviousField(field.id)}
                          className="w-full px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors flex items-center justify-center space-x-1 text-sm"
                        >
                          <Trash2 className="w-4 h-4" />
                          <span>Remover</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Description */}
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <h4 className="text-lg font-medium text-gray-800 mb-4 flex items-center space-x-2">
                <FileText className="w-5 h-5" />
                <span>Descrição do Pastor</span>
              </h4>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Informações Adicionais
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  rows={4}
                  placeholder="Informações sobre formação, ministério, características especiais, etc."
                />
              </div>
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
                className="flex-1 px-4 py-3 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-lg hover:from-emerald-600 hover:to-green-700 transition-all flex items-center justify-center space-x-2 font-medium"
              >
                <Plus className="w-5 h-5" />
                <span>Cadastrar Pastor</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}