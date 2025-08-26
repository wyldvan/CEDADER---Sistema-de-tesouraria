import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Transaction, Registration } from '../types';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const generateTransactionsPDF = async (transactions: Transaction[], title: string) => {
  const pdf = new jsPDF();
  const pageWidth = pdf.internal.pageSize.width;
  
  // Header
  pdf.setFontSize(18);
  pdf.setTextColor(16, 185, 129); // Spring green
  pdf.text('CEDADER - Sistema de Tesouraria', pageWidth / 2, 20, { align: 'center' });
  
  pdf.setFontSize(14);
  pdf.setTextColor(0, 0, 0);
  pdf.text(title, pageWidth / 2, 35, { align: 'center' });
  
  pdf.setFontSize(10);
  pdf.text(`Gerado em: ${format(new Date(), 'dd/MM/yyyy HH:mm', { locale: ptBR })}`, pageWidth / 2, 45, { align: 'center' });
  
  // Table headers - ENHANCED WITH MONTH AND START DATE
  const headers = ['Data', 'Tipo', 'Categoria', 'Valor', 'Pagamento', 'Nº Doc', 'Campo', 'Mês', 'Data Início', 'Descrição'];
  const startY = 60;
  let currentY = startY;
  
  pdf.setFontSize(8);
  pdf.setFont('helvetica', 'bold');
  
  // Adjusted column widths to accommodate new fields
  const colWidths = [18, 14, 24, 18, 16, 16, 20, 16, 18, 35];
  let currentX = 10;
  
  headers.forEach((header, index) => {
    pdf.text(header, currentX, currentY);
    currentX += colWidths[index];
  });
  
  currentY += 10;
  pdf.setFont('helvetica', 'normal');
  
  // Table rows - ENHANCED WITH MONTH AND START DATE
  transactions.forEach((transaction, index) => {
    if (currentY > 270) {
      pdf.addPage();
      currentY = 20;
    }
    
    currentX = 10;
    const rowData = [
      format(new Date(transaction.date), 'dd/MM/yyyy', { locale: ptBR }),
      transaction.type === 'entry' ? 'Entrada' : 'Saída',
      transaction.category,
      `R$ ${transaction.amount.toFixed(2)}`,
      transaction.paymentMethod.toUpperCase(),
      transaction.documentNumber || '-',
      transaction.field || 'N/A',
      transaction.month || 'N/A', // NEW MONTH FIELD
      transaction.startDate ? format(new Date(transaction.startDate), 'dd/MM/yyyy', { locale: ptBR }) : '-', // NEW START DATE FIELD
      transaction.description
    ];
    
    rowData.forEach((data, colIndex) => {
      const maxWidth = colWidths[colIndex] - 2;
      const lines = pdf.splitTextToSize(data, maxWidth);
      pdf.text(lines, currentX, currentY);
      currentX += colWidths[colIndex];
    });
    
    currentY += 8;
  });
  
  // Summary
  const totalEntry = transactions.filter(t => t.type === 'entry').reduce((sum, t) => sum + t.amount, 0);
  const totalExit = transactions.filter(t => t.type === 'exit').reduce((sum, t) => sum + t.amount, 0);
  const balance = totalEntry - totalExit;
  
  currentY += 10;
  pdf.setFont('helvetica', 'bold');
  pdf.text(`Total Entradas: R$ ${totalEntry.toFixed(2)}`, 10, currentY);
  currentY += 8;
  pdf.text(`Total Saídas: R$ ${totalExit.toFixed(2)}`, 10, currentY);
  currentY += 8;
  pdf.setTextColor(balance >= 0 ? 16 : 220, balance >= 0 ? 185 : 53, balance >= 0 ? 129 : 69);
  pdf.text(`Saldo: R$ ${balance.toFixed(2)}`, 10, currentY);
  
  // ENHANCED SUMMARY: Campo Statistics
  currentY += 15;
  pdf.setTextColor(0, 0, 0);
  pdf.setFont('helvetica', 'bold');
  pdf.text('ESTATÍSTICAS POR CAMPO:', 10, currentY);
  currentY += 10;
  
  // Calculate field statistics
  const fieldStats: Record<string, { count: number, total: number, entries: number, exits: number }> = {};
  
  transactions.forEach(t => {
    const field = t.field || 'Sem Campo';
    if (!fieldStats[field]) {
      fieldStats[field] = { count: 0, total: 0, entries: 0, exits: 0 };
    }
    fieldStats[field].count++;
    fieldStats[field].total += t.amount;
    if (t.type === 'entry') {
      fieldStats[field].entries += t.amount;
    } else {
      fieldStats[field].exits += t.amount;
    }
  });
  
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(7);
  
  // Field statistics table headers
  const fieldHeaders = ['Campo', 'Qtd', 'Total', 'Entradas', 'Saídas'];
  const fieldColWidths = [40, 20, 30, 30, 30];
  currentX = 10;
  
  pdf.setFont('helvetica', 'bold');
  fieldHeaders.forEach((header, index) => {
    pdf.text(header, currentX, currentY);
    currentX += fieldColWidths[index];
  });
  
  currentY += 8;
  pdf.setFont('helvetica', 'normal');
  
  // Field statistics data
  Object.entries(fieldStats).forEach(([field, stats]) => {
    if (currentY > 270) {
      pdf.addPage();
      currentY = 20;
    }
    
    currentX = 10;
    const fieldRowData = [
      field,
      stats.count.toString(),
      `R$ ${stats.total.toFixed(2)}`,
      `R$ ${stats.entries.toFixed(2)}`,
      `R$ ${stats.exits.toFixed(2)}`
    ];
    
    fieldRowData.forEach((data, colIndex) => {
      const maxWidth = fieldColWidths[colIndex] - 2;
      const lines = pdf.splitTextToSize(data, maxWidth);
      pdf.text(lines, currentX, currentY);
      currentX += fieldColWidths[colIndex];
    });
    
    currentY += 6;
  });
  
  pdf.save(`${title.replace(/\s+/g, '_')}.pdf`);
};

export const generateRegistrationsPDF = async (registrations: Registration[], title: string) => {
  const pdf = new jsPDF();
  const pageWidth = pdf.internal.pageSize.width;
  
  // Header
  pdf.setFontSize(18);
  pdf.setTextColor(16, 185, 129);
  pdf.text('CEDADER - Sistema de Tesouraria', pageWidth / 2, 20, { align: 'center' });
  
  pdf.setFontSize(14);
  pdf.setTextColor(0, 0, 0);
  pdf.text(title, pageWidth / 2, 35, { align: 'center' });
  
  pdf.setFontSize(10);
  pdf.text(`Gerado em: ${format(new Date(), 'dd/MM/yyyy HH:mm', { locale: ptBR })}`, pageWidth / 2, 45, { align: 'center' });
  
  // Table
  const headers = ['Campo', 'Mês', 'Categoria', 'Valor', 'Data'];
  const startY = 60;
  let currentY = startY;
  
  pdf.setFontSize(8);
  pdf.setFont('helvetica', 'bold');
  
  const colWidths = [40, 25, 50, 25, 25];
  let currentX = 10;
  
  headers.forEach((header, index) => {
    pdf.text(header, currentX, currentY);
    currentX += colWidths[index];
  });
  
  currentY += 10;
  pdf.setFont('helvetica', 'normal');
  
  registrations.forEach((registration) => {
    if (currentY > 270) {
      pdf.addPage();
      currentY = 20;
    }
    
    currentX = 10;
    const rowData = [
      registration.field,
      registration.month,
      registration.category,
      `R$ ${registration.amount.toFixed(2)}`,
      format(new Date(registration.date), 'dd/MM/yyyy', { locale: ptBR })
    ];
    
    rowData.forEach((data, colIndex) => {
      pdf.text(data, currentX, currentY);
      currentX += colWidths[colIndex];
    });
    
    currentY += 8;
  });
  
  const total = registrations.reduce((sum, r) => sum + r.amount, 0);
  currentY += 10;
  pdf.setFont('helvetica', 'bold');
  pdf.text(`Total: R$ ${total.toFixed(2)}`, 10, currentY);
  
  pdf.save(`${title.replace(/\s+/g, '_')}.pdf`);
};

export const generatePrebendaPDF = async (prebendas: any[], title: string) => {
  const pdf = new jsPDF();
  const pageWidth = pdf.internal.pageSize.width;
  
  // Header
  pdf.setFontSize(18);
  pdf.setTextColor(16, 185, 129);
  pdf.text('CEDADER - Sistema de Tesouraria', pageWidth / 2, 20, { align: 'center' });
  
  pdf.setFontSize(14);
  pdf.setTextColor(0, 0, 0);
  pdf.text(title, pageWidth / 2, 35, { align: 'center' });
  
  pdf.setFontSize(10);
  pdf.text(`Gerado em: ${format(new Date(), 'dd/MM/yyyy HH:mm', { locale: ptBR })}`, pageWidth / 2, 45, { align: 'center' });
  
  // Table headers
  const headers = ['Data', 'Tipo', 'Pastor', 'Valor', 'Mês', 'Campo', 'Descrição'];
  const startY = 60;
  let currentY = startY;
  
  pdf.setFontSize(8);
  pdf.setFont('helvetica', 'bold');
  
  const colWidths = [20, 18, 30, 20, 20, 25, 55];
  let currentX = 10;
  
  headers.forEach((header, index) => {
    pdf.text(header, currentX, currentY);
    currentX += colWidths[index];
  });
  
  currentY += 10;
  pdf.setFont('helvetica', 'normal');
  
  // Table rows
  prebendas.forEach((prebenda) => {
    if (currentY > 270) {
      pdf.addPage();
      currentY = 20;
    }
    
    currentX = 10;
    const rowData = [
      format(new Date(prebenda.date), 'dd/MM/yyyy', { locale: ptBR }),
      prebenda.type === 'entry' ? 'Entrada' : 'Saída',
      prebenda.pastor,
      `R$ ${prebenda.amount.toFixed(2)}`,
      prebenda.month,
      prebenda.field || 'N/A',
      prebenda.description
    ];
    
    rowData.forEach((data, colIndex) => {
      const maxWidth = colWidths[colIndex] - 2;
      const lines = pdf.splitTextToSize(data, maxWidth);
      pdf.text(lines, currentX, currentY);
      currentX += colWidths[colIndex];
    });
    
    currentY += 8;
  });
  
  // Summary
  const totalEntry = prebendas.filter(p => p.type === 'entry').reduce((sum, p) => sum + p.amount, 0);
  const totalExit = prebendas.filter(p => p.type === 'exit').reduce((sum, p) => sum + p.amount, 0);
  const balance = totalEntry - totalExit;
  
  currentY += 10;
  pdf.setFont('helvetica', 'bold');
  pdf.text(`Total Entradas: R$ ${totalEntry.toFixed(2)}`, 10, currentY);
  currentY += 8;
  pdf.text(`Total Saídas: R$ ${totalExit.toFixed(2)}`, 10, currentY);
  currentY += 8;
  pdf.setTextColor(balance >= 0 ? 16 : 220, balance >= 0 ? 185 : 53, balance >= 0 ? 129 : 69);
  pdf.text(`Saldo Auxílio e Prebenda: R$ ${balance.toFixed(2)}`, 10, currentY);
  
  pdf.save(`${title.replace(/\s+/g, '_')}.pdf`);
};

export const generateFieldReportPDF = async (
  fieldData: { transactions: Transaction[], registrations: Registration[], prebendas?: any[] }, 
  title: string, 
  fieldName: string
) => {
  const pdf = new jsPDF();
  const pageWidth = pdf.internal.pageSize.width;
  
  // Header
  pdf.setFontSize(18);
  pdf.setTextColor(16, 185, 129);
  pdf.text('CEDADER - Sistema de Tesouraria', pageWidth / 2, 20, { align: 'center' });
  
  pdf.setFontSize(14);
  pdf.setTextColor(0, 0, 0);
  pdf.text(title, pageWidth / 2, 35, { align: 'center' });
  
  pdf.setFontSize(12);
  pdf.setTextColor(16, 185, 129);
  pdf.text(`Campo: ${fieldName}`, pageWidth / 2, 50, { align: 'center' });
  
  pdf.setFontSize(10);
  pdf.setTextColor(0, 0, 0);
  pdf.text(`Gerado em: ${format(new Date(), 'dd/MM/yyyy HH:mm', { locale: ptBR })}`, pageWidth / 2, 60, { align: 'center' });
  
  let currentY = 75;
  // Transactions Section
  if (fieldData.transactions.length > 0) {
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.text('TRANSAÇÕES', 10, currentY);
    currentY += 10;
    
    const headers = ['Data', 'Tipo', 'Categoria', 'Valor', 'Pagamento', 'Nº Doc', 'Mês', 'Data Início'];
    const colWidths = [20, 18, 28, 20, 18, 18, 18, 20];
    
    pdf.setFontSize(8);
    let currentX = 10;
    
    headers.forEach((header, index) => {
      pdf.text(header, currentX, currentY);
      currentX += colWidths[index];
    });
    
    currentY += 8;
    pdf.setFont('helvetica', 'normal');
    
    fieldData.transactions.forEach((transaction) => {
      if (currentY > 270) {
        pdf.addPage();
        currentY = 20;
      }
      
      currentX = 10;
      const rowData = [
        format(new Date(transaction.date), 'dd/MM/yyyy', { locale: ptBR }),
        transaction.type === 'entry' ? 'Entrada' : 'Saída',
        transaction.category,
        `R$ ${transaction.amount.toFixed(2)}`,
        transaction.paymentMethod.toUpperCase(),
        transaction.documentNumber || '-',
        transaction.month || '-',
        transaction.startDate ? format(new Date(transaction.startDate), 'dd/MM/yyyy', { locale: ptBR }) : '-'
      ];
      
      rowData.forEach((data, colIndex) => {
        const maxWidth = colWidths[colIndex] - 2;
        const lines = pdf.splitTextToSize(data, maxWidth);
        pdf.text(lines, currentX, currentY);
        currentX += colWidths[colIndex];
      });
      
      currentY += 8;
    });
    
    currentY += 10;
  }
  
  // Prebendas Section
  if (fieldData.prebendas && fieldData.prebendas.length > 0) {
    if (currentY > 200) {
      pdf.addPage();
      currentY = 20;
    }
    
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.text('PREBENDAS', 10, currentY);
    currentY += 10;
    
    const headers = ['Data', 'Tipo', 'Pastor', 'Valor', 'Mês'];
    const colWidths = [30, 25, 40, 25, 30];
    
    pdf.setFontSize(8);
    let currentX = 10;
    
    headers.forEach((header, index) => {
      pdf.text(header, currentX, currentY);
      currentX += colWidths[index];
    });
    
    currentY += 8;
    pdf.setFont('helvetica', 'normal');
    
    fieldData.prebendas.forEach((prebenda) => {
      if (currentY > 270) {
        pdf.addPage();
        currentY = 20;
      }
      
      currentX = 10;
      const rowData = [
        format(new Date(prebenda.date), 'dd/MM/yyyy', { locale: ptBR }),
        prebenda.type === 'entry' ? 'Entrada' : 'Saída',
        prebenda.pastor,
        `R$ ${prebenda.amount.toFixed(2)}`,
        prebenda.month
      ];
      
      rowData.forEach((data, colIndex) => {
        const maxWidth = colWidths[colIndex] - 2;
        const lines = pdf.splitTextToSize(data, maxWidth);
        pdf.text(lines, currentX, currentY);
        currentX += colWidths[colIndex];
      });
      
      currentY += 8;
    });
    
    currentY += 10;
  }
  
  // Registrations Section
  if (fieldData.registrations.length > 0) {
    if (currentY > 200) {
      pdf.addPage();
      currentY = 20;
    }
    
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.text('REGISTROS', 10, currentY);
    currentY += 10;
    
    const headers = ['Data', 'Mês', 'Categoria', 'Valor'];
    const colWidths = [35, 30, 60, 35];
    
    pdf.setFontSize(8);
    let currentX = 10;
    
    headers.forEach((header, index) => {
      pdf.text(header, currentX, currentY);
      currentX += colWidths[index];
    });
    
    currentY += 8;
    pdf.setFont('helvetica', 'normal');
    
    fieldData.registrations.forEach((registration) => {
      if (currentY > 270) {
        pdf.addPage();
        currentY = 20;
      }
      
      currentX = 10;
      const rowData = [
        format(new Date(registration.date), 'dd/MM/yyyy', { locale: ptBR }),
        registration.month,
        registration.category,
        `R$ ${registration.amount.toFixed(2)}`
      ];
      
      rowData.forEach((data, colIndex) => {
        const maxWidth = colWidths[colIndex] - 2;
        const lines = pdf.splitTextToSize(data, maxWidth);
        pdf.text(lines, currentX, currentY);
        currentX += colWidths[colIndex];
      });
      
      currentY += 8;
    });
  }
  
  pdf.save(`Relatorio_Campo_${fieldName.replace(/\s+/g, '_')}.pdf`);
};

export const generateFinancialGoalsPDF = async (
  progress: any[], 
  goals: any[], 
  summary: any, 
  title: string, 
  year: number
) => {
  const pdf = new jsPDF();
  const pageWidth = pdf.internal.pageSize.width;
  
  // Header
  pdf.setFontSize(18);
  pdf.setTextColor(16, 185, 129);
  pdf.text('CEDADER - Sistema de Tesouraria', pageWidth / 2, 20, { align: 'center' });
  
  pdf.setFontSize(14);
  pdf.setTextColor(0, 0, 0);
  pdf.text(title, pageWidth / 2, 35, { align: 'center' });
  
  pdf.setFontSize(10);
  pdf.text(`Gerado em: ${format(new Date(), 'dd/MM/yyyy HH:mm', { locale: ptBR })}`, pageWidth / 2, 45, { align: 'center' });
  
  let currentY = 60;
  
  // Summary
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'bold');
  pdf.text('RESUMO GERAL', 10, currentY);
  currentY += 15;
  
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  pdf.text(`Metas Ativas: ${summary.totalGoals}`, 10, currentY);
  currentY += 8;
  pdf.text(`Metas Superadas: ${summary.achievedMonthly + summary.achievedAnnual}`, 10, currentY);
  currentY += 8;
  pdf.text(`No Caminho Certo: ${summary.onTrackMonthly + summary.onTrackAnnual}`, 10, currentY);
  currentY += 8;
  pdf.text(`Abaixo da Meta: ${summary.belowMonthly + summary.belowAnnual}`, 10, currentY);
  currentY += 8;
  pdf.text(`Meta Total: R$ ${summary.totalGoalAmount.toFixed(2)}`, 10, currentY);
  currentY += 8;
  pdf.text(`Realizado Total: R$ ${summary.totalActualAmount.toFixed(2)}`, 10, currentY);
  currentY += 20;
  
  // Progress Table
  if (progress.length > 0) {
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.text('PROGRESSO DETALHADO', 10, currentY);
    currentY += 10;
    
    const headers = ['Campo', 'Período', 'Meta', 'Realizado', 'Progresso', 'Status'];
    const colWidths = [35, 20, 25, 25, 20, 25];
    
    pdf.setFontSize(8);
    let currentX = 10;
    
    headers.forEach((header, index) => {
      pdf.text(header, currentX, currentY);
      currentX += colWidths[index];
    });
    
    currentY += 8;
    pdf.setFont('helvetica', 'normal');
    
    progress.slice(0, 50).forEach((item) => {
      if (currentY > 270) {
        pdf.addPage();
        currentY = 20;
      }
      
      currentX = 10;
      const rowData = [
        item.field,
        item.month,
        `R$ ${item.goalAmount.toFixed(2)}`,
        `R$ ${item.actualAmount.toFixed(2)}`,
        `${item.percentage.toFixed(1)}%`,
        item.status === 'exceeded' ? 'Superou' :
        item.status === 'on-track' ? 'No Caminho' : 'Abaixo'
      ];
      
      rowData.forEach((data, colIndex) => {
        const maxWidth = colWidths[colIndex] - 2;
        const lines = pdf.splitTextToSize(data, maxWidth);
        pdf.text(lines, currentX, currentY);
        currentX += colWidths[colIndex];
      });
      
      currentY += 8;
    });
  }
  
  // Goals List
  if (goals.length > 0) {
    if (currentY > 200) {
      pdf.addPage();
      currentY = 20;
    }
    
    currentY += 15;
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.text('METAS CONFIGURADAS', 10, currentY);
    currentY += 10;
    
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'normal');
    
    goals.forEach((goal) => {
      if (currentY > 270) {
        pdf.addPage();
        currentY = 20;
      }
      
      pdf.setFont('helvetica', 'bold');
      pdf.text(`${goal.field}`, 10, currentY);
      currentY += 6;
      
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Meta Anual: R$ ${goal.annualGoal.toFixed(2)}`, 15, currentY);
      currentY += 5;
      pdf.text(`Meses configurados: ${Object.keys(goal.monthlyGoals).length}`, 15, currentY);
      currentY += 5;
      
      if (goal.description) {
        const lines = pdf.splitTextToSize(`Descrição: ${goal.description}`, 180);
        pdf.text(lines, 15, currentY);
        currentY += lines.length * 5;
      }
      
      currentY += 5;
    });
  }
  
  pdf.save(`Metas_Financeiras_${year}.pdf`);
};

export const generateObreirosPDF = async (obreiros: any[], title: string) => {
  const pdf = new jsPDF();
  const pageWidth = pdf.internal.pageSize.width;
  
  // Header
  pdf.setFontSize(18);
  pdf.setTextColor(16, 185, 129);
  pdf.text('CEDADER - Sistema de Tesouraria', pageWidth / 2, 20, { align: 'center' });
  
  pdf.setFontSize(14);
  pdf.setTextColor(0, 0, 0);
  pdf.text(title, pageWidth / 2, 35, { align: 'center' });
  
  pdf.setFontSize(10);
  pdf.text(`Gerado em: ${format(new Date(), 'dd/MM/yyyy HH:mm', { locale: ptBR })}`, pageWidth / 2, 45, { align: 'center' });
  
  // Table headers
  const headers = ['Nome Completo', 'Tipo', 'Setor', 'Campo', 'Campo Missionário', 'Pagamento', 'Dados Bancários'];
  const startY = 60;
  let currentY = startY;
  
  pdf.setFontSize(8);
  pdf.setFont('helvetica', 'bold');
  
  const colWidths = [35, 20, 25, 25, 25, 20, 35];
  let currentX = 10;
  
  headers.forEach((header, index) => {
    pdf.text(header, currentX, currentY);
    currentX += colWidths[index];
  });
  
  currentY += 10;
  pdf.setFont('helvetica', 'normal');
  
  // Table rows
  obreiros.forEach((obreiro) => {
    if (currentY > 270) {
      pdf.addPage();
      currentY = 20;
    }
    
    currentX = 10;
    
    const getTipoLabel = (tipo: string) => {
      switch (tipo) {
        case 'pastor': return 'Pastor';
        case 'missionaria': return 'Missionária';
        case 'evangelista': return 'Evangelista';
        case 'jubilado': return 'Jubilado';
        default: return tipo;
      }
    };
    
    const dadosBancarios = obreiro.pagamento.tipo === 'banco' 
      ? `Ag: ${obreiro.pagamento.banco?.agencia || ''} ${obreiro.pagamento.banco?.contaPoupanca ? `Poup: ${obreiro.pagamento.banco.contaPoupanca}` : ''} ${obreiro.pagamento.banco?.contaCorrente ? `CC: ${obreiro.pagamento.banco.contaCorrente}` : ''}`
      : 'Dinheiro';
    
    const rowData = [
      obreiro.nomeCompleto,
      getTipoLabel(obreiro.tipo),
      obreiro.setor,
      obreiro.campo,
      obreiro.campoMissionario || '-',
      obreiro.pagamento.tipo === 'banco' ? 'Banco' : 'Dinheiro',
      dadosBancarios
    ];
    
    rowData.forEach((data, colIndex) => {
      const maxWidth = colWidths[colIndex] - 2;
      const lines = pdf.splitTextToSize(data, maxWidth);
      pdf.text(lines, currentX, currentY);
      currentX += colWidths[colIndex];
    });
    
    currentY += 8;
  });
  
  // Summary
  const totalObreiros = obreiros.length;
  const obreirosByTipo = obreiros.reduce((acc, o) => {
    acc[o.tipo] = (acc[o.tipo] || 0) + 1;
    return acc;
  }, {});
  
  const obreirosByPagamento = obreiros.reduce((acc, o) => {
    acc[o.pagamento.tipo] = (acc[o.pagamento.tipo] || 0) + 1;
    return acc;
  }, {});
  
  currentY += 15;
  pdf.setFont('helvetica', 'bold');
  pdf.text('RESUMO GERAL', 10, currentY);
  currentY += 10;
  
  pdf.setFont('helvetica', 'normal');
  pdf.text(`Total de Obreiros: ${totalObreiros}`, 10, currentY);
  currentY += 8;
  
  // Summary by type
  pdf.text('Por Tipo:', 10, currentY);
  currentY += 6;
  Object.entries(obreirosByTipo).forEach(([tipo, count]) => {
    const tipoLabel = tipo === 'pastor' ? 'Pastores' : 
                     tipo === 'missionaria' ? 'Missionárias' :
                     tipo === 'evangelista' ? 'Evangelistas' : 'Jubilados';
    pdf.text(`  ${tipoLabel}: ${count}`, 15, currentY);
    currentY += 6;
  });
  
  currentY += 5;
  pdf.text('Por Forma de Pagamento:', 10, currentY);
  currentY += 6;
  Object.entries(obreirosByPagamento).forEach(([pagamento, count]) => {
    const pagamentoLabel = pagamento === 'banco' ? 'Banco' : 'Dinheiro';
    pdf.text(`  ${pagamentoLabel}: ${count}`, 15, currentY);
    currentY += 6;
  });
  
  pdf.save(`${title.replace(/\s+/g, '_')}.pdf`);
};

export const generateChartPDF = async (elementId: string, title: string) => {
  const element = document.getElementById(elementId);
  if (!element) return;
  
  const canvas = await html2canvas(element);
  const imgData = canvas.toDataURL('image/png');
  
  const pdf = new jsPDF();
  const pageWidth = pdf.internal.pageSize.width;
  
  // Header
  pdf.setFontSize(18);
  pdf.setTextColor(16, 185, 129);
  pdf.text('CEDADER - Sistema de Tesouraria', pageWidth / 2, 20, { align: 'center' });
  
  pdf.setFontSize(14);
  pdf.setTextColor(0, 0, 0);
  pdf.text(title, pageWidth / 2, 35, { align: 'center' });
  
  // Chart
  const imgWidth = pageWidth - 20;
  const imgHeight = (canvas.height * imgWidth) / canvas.width;
  pdf.addImage(imgData, 'PNG', 10, 50, imgWidth, imgHeight);
  
  pdf.save(`${title.replace(/\s+/g, '_')}.pdf`);
};