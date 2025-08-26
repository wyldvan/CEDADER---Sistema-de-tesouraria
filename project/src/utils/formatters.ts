/**
 * Formata um número para o padrão de moeda brasileira (BRL).
 * @param {number | string} value O número a ser formatado.
 * @returns {string} O valor formatado como string, ex: "R$ 1.234,56".
 */
export const formatCurrency = (value: number | string): string => {
    // Tenta converter o valor para número, tratando strings como '123.45'
    const numericValue = Number(value);

    // Se não for um número válido, retorna um valor padrão seguro.
    if (isNaN(numericValue)) {
        return "R$ 0,00";
    }

    // Cria um formatador para o local 'pt-BR' com as opções de moeda BRL.
    const formatter = new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
        minimumFractionDigits: 2, // Garante sempre duas casas decimais
    });

    return formatter.format(numericValue);
};

/**
 * Converte uma string de moeda formatada em BRL para um número.
 * Ex: "R$ 1.234,56" -> 1234.56
 * @param {string} formattedValue A string de moeda.
 * @returns {number} O valor numérico.
 */
export const parseCurrency = (formattedValue: string): number => {
    if (typeof formattedValue !== 'string') {
        return 0;
    }
    // Remove o "R$", os pontos de milhar e substitui a vírgula decimal por ponto
    const numericString = formattedValue
        .replace('R$', '')
        .trim()
        .replace(/\./g, '')
        .replace(',', '.');

    const value = parseFloat(numericString);
    return isNaN(value) ? 0 : value;
};

/**
 * Formata o valor de um input em tempo real como moeda brasileira.
 */
export const formatInputAsCurrency = (value: string): string => {
  if (!value) return '';
  const digitsOnly = value.replace(/\D/g, '');
  if (digitsOnly === '') return '';
  const numberValue = parseInt(digitsOnly, 10) / 100;
  return formatCurrency(numberValue);
};

/**
 * Converte uma string de moeda formatada de volta para um número puro.
 */
export const parseFormattedCurrency = (value: string): number => {
  if (!value) return 0;
  const digitsOnly = value.replace(/\D/g, '');
  if (digitsOnly === '') return 0;
  return parseFloat(digitsOnly) / 100;
};