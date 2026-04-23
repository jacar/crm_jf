import React, { useState, useEffect } from 'react';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  Title, 
  Tooltip, 
  Legend, 
  ArcElement,
  PointElement,
  LineElement
} from 'chart.js';
import { Bar, Pie, Line } from 'react-chartjs-2';
import { getAnalytics } from '../services/api';
import { Loader2, TrendingUp, Lightbulb, AlertTriangle, Download, FileSpreadsheet, FileText } from 'lucide-react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const Reports = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await getAnalytics();
        setData(res.data);
      } catch (err) {
        console.error('Error fetching analytics:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  const downloadPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.setTextColor(3, 89, 198);
    doc.text('Informe Analítico - Corporación JF', 14, 22);
    
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Generado el: ${new Date().toLocaleString()}`, 14, 30);

    // Gasto Mensual Table
    doc.autoTable({
      startY: 40,
      head: [['Mes', 'Gasto (USD)']],
      body: data.spendingTrend.map(d => [d.month, `$${d.spending}`]),
      theme: 'grid',
      headStyles: { fillColor: [3, 89, 198] }
    });

    // Top Kilometraje Table
    doc.autoTable({
      startY: doc.lastAutoTable.finalY + 10,
      head: [['Placa', 'Kilometraje']],
      body: data.topMileage.map(v => [v.placa, `${v.km_actual} KM`]),
      theme: 'grid',
      headStyles: { fillColor: [127, 1, 179] }
    });

    doc.save('Reporte_CorporacionJF.pdf');
  };

  const downloadCSV = () => {
    const headers = 'Mes,Gasto\n';
    const rows = data.spendingTrend.map(d => `${d.month},${d.spending}`).join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Analiticas_JF.csv';
    a.click();
  };

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: '5rem' }}><Loader2 className="animate-spin" /></div>;

  const barData = {
    labels: data.spendingTrend.map(d => d.month),
    datasets: [
      {
        label: 'Gasto Mensual (USD)',
        data: data.spendingTrend.map(d => d.spending),
        backgroundColor: 'rgba(3, 89, 198, 0.7)',
        borderRadius: 8,
      },
    ],
  };

  const pieData = {
    labels: ['Crítico', 'Advertencia', 'Óptimo'],
    datasets: [
      {
        data: [data.healthStats.critical, data.healthStats.warning, data.healthStats.good],
        backgroundColor: ['#ef4444', '#f59e0b', '#10b981'],
        borderWidth: 0,
      },
    ],
  };

  const lineData = {
    labels: data.topMileage.map(v => v.placa),
    datasets: [
      {
        label: 'Top 5 Kilometraje',
        data: data.topMileage.map(v => v.km_actual),
        borderColor: '#7f01b3',
        backgroundColor: 'rgba(127, 1, 179, 0.1)',
        fill: true,
        tension: 0.4,
      },
    ],
  };

  return (
    <div className="reports-container">
      <header className="header">
        <div>
          <h1>Reportes Analíticos</h1>
          <p style={{ color: 'var(--text-muted)' }}>Métricas clave y sugerencias para la toma de decisiones.</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <button onClick={downloadPDF} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--primary)' }}>
            <FileText size={18} />
            Exportar PDF
          </button>
          <button onClick={downloadCSV} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#10b981' }}>
            <FileSpreadsheet size={18} />
            Exportar CSV
          </button>
        </div>
      </header>

      <div className="grid-2-1" style={{ marginBottom: '2rem' }}>
        <div className="card">
          <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'inherit', gap: '0.5rem' }}>
            <TrendingUp size={20} color="var(--primary)" /> Tendencia de Gastos
          </h3>
          <div style={{ height: '300px' }}>
            <Bar data={barData} options={{ maintainAspectRatio: false }} />
          </div>
        </div>

        <div className="card">
          <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'inherit', gap: '0.5rem' }}>
            <AlertTriangle size={20} color="var(--error)" /> Estado de Salud de la Flota
          </h3>
          <div style={{ height: '300px', width: '100%' }}>
            <Pie data={pieData} options={{ maintainAspectRatio: false }} />
          </div>
        </div>
      </div>

      <div className="grid-2-1">
        <div className="card">
          <h3 style={{ marginBottom: '1.5rem' }}>Top Kilometraje por Placa</h3>
          <div style={{ height: '300px' }}>
            <Line data={lineData} options={{ maintainAspectRatio: false }} />
          </div>
        </div>

        <div className="card" style={{ background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)', color: 'white' }}>
          <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Lightbulb size={24} /> Sugerencias de Optimización
          </h3>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {data.suggestions.map((s, i) => (
              <li key={i} style={{ display: 'flex', gap: '1rem', background: 'rgba(255,255,255,0.1)', padding: '1rem', borderRadius: '12px' }}>
                <span style={{ fontWeight: 800, fontSize: '1.25rem', opacity: 0.5 }}>0{i+1}</span>
                <p>{s}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Reports;