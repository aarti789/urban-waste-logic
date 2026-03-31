import { BinRecord, DailyStats, RouteInfo } from '@/types';
import { getZoneSummary } from '@/data/mockData';

function toCSVRow(values: (string | number)[]): string {
  return values.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',');
}

function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function exportCSV(bins: BinRecord[], dailyStats: DailyStats[], routes: RouteInfo[]) {
  const date = new Date().toISOString().split('T')[0];
  const lines: string[] = [];

  // Header
  lines.push('GreenRoute Analytics Report');
  lines.push(`Generated: ${new Date().toLocaleString()}`);
  lines.push('');

  // === Daily Stats ===
  lines.push('=== Daily Collection Stats ===');
  lines.push(toCSVRow(['Date', 'Bins Collected', 'Total Waste (kg)', 'Distance (km)', 'Fuel Used (L)']));
  dailyStats.forEach(d => {
    lines.push(toCSVRow([d.date, d.binsCollected, d.totalWasteKg, d.distanceKm, d.fuelUsed]));
  });
  const totalCollected = dailyStats.reduce((s, d) => s + d.binsCollected, 0);
  const totalWaste = dailyStats.reduce((s, d) => s + d.totalWasteKg, 0);
  const totalDistance = dailyStats.reduce((s, d) => s + d.distanceKm, 0).toFixed(1);
  const totalFuel = dailyStats.reduce((s, d) => s + d.fuelUsed, 0).toFixed(1);
  lines.push(toCSVRow(['TOTAL', totalCollected, totalWaste, totalDistance, totalFuel]));
  lines.push('');

  // === Zone Summary ===
  lines.push('=== Zone Summary ===');
  lines.push(toCSVRow(['Zone', 'Total Bins', 'High Priority', 'Medium Priority', 'Low Priority', 'Avg Fill %', 'Total Waste (kg)']));
  const zoneSummary = getZoneSummary(bins);
  zoneSummary.forEach(z => {
    lines.push(toCSVRow([z.zone, z.total, z.high, z.medium, z.low, z.avgFill, z.totalWaste]));
  });
  lines.push('');

  // === Route Performance ===
  lines.push('=== Route Performance ===');
  lines.push(toCSVRow(['Route ID', 'Truck', 'Zone', 'Distance (km)', 'Fuel Used (L)', 'Fuel Saved (L)', 'Status', 'Bins Count']));
  routes.forEach(r => {
    lines.push(toCSVRow([r.routeId, r.truckNumber, r.zone, r.distanceKm, r.fuelUsed, r.fuelSaved, r.status, r.bins.length]));
  });
  const totalFuelSaved = routes.reduce((s, r) => s + r.fuelSaved, 0).toFixed(1);
  lines.push('');
  lines.push(toCSVRow(['Total Fuel Saved (L)', totalFuelSaved]));
  lines.push('');

  // === Bin Details ===
  lines.push('=== Bin Details ===');
  lines.push(toCSVRow(['Bin ID', 'Location', 'Zone', 'Area Type', 'Fill Level %', 'Priority', 'Waste Type', 'Capacity (kg)', 'Collected']));
  bins.forEach(b => {
    const priorityLabel = b.priority === 3 ? 'High' : b.priority === 2 ? 'Medium' : 'Low';
    lines.push(toCSVRow([b.binId, b.locationName, b.zone, b.areaType, b.fillLevel, priorityLabel, b.wasteType, b.capacity, b.collected ? 'Yes' : 'No']));
  });

  downloadFile(lines.join('\n'), `GreenRoute_Report_${date}.csv`, 'text/csv');
}

export function exportPDF(bins: BinRecord[], dailyStats: DailyStats[], routes: RouteInfo[]) {
  const zoneSummary = getZoneSummary(bins);
  const totalCollected = dailyStats.reduce((s, d) => s + d.binsCollected, 0);
  const totalWaste = dailyStats.reduce((s, d) => s + d.totalWasteKg, 0);
  const totalFuel = dailyStats.reduce((s, d) => s + d.fuelUsed, 0).toFixed(1);
  const totalFuelSaved = routes.reduce((s, r) => s + r.fuelSaved, 0).toFixed(1);
  const avgEfficiency = Math.round((totalCollected / (totalCollected + 15 * dailyStats.length)) * 100);
  const highPriority = bins.filter(b => b.priority === 3).length;
  const completedRoutes = routes.filter(r => r.status === 'completed').length;

  const html = `<!DOCTYPE html>
<html><head><meta charset="utf-8">
<title>GreenRoute Analytics Report</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Segoe UI', Arial, sans-serif; color: #1a1a1a; padding: 40px; font-size: 12px; }
  .header { text-align: center; margin-bottom: 30px; border-bottom: 3px solid #2d8a56; padding-bottom: 20px; }
  .header h1 { color: #2d8a56; font-size: 28px; margin-bottom: 4px; }
  .header p { color: #666; font-size: 13px; }
  .kpi-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 24px; }
  .kpi { background: #f0faf4; border: 1px solid #c6e6d3; border-radius: 8px; padding: 16px; text-align: center; }
  .kpi .value { font-size: 24px; font-weight: 700; color: #2d8a56; }
  .kpi .label { font-size: 11px; color: #666; margin-top: 2px; }
  .section { margin-bottom: 24px; }
  .section h2 { font-size: 15px; color: #2d8a56; margin-bottom: 10px; border-bottom: 1px solid #e0e0e0; padding-bottom: 4px; }
  table { width: 100%; border-collapse: collapse; font-size: 11px; }
  th { background: #2d8a56; color: white; padding: 8px 6px; text-align: left; }
  td { padding: 6px; border-bottom: 1px solid #e8e8e8; }
  tr:nth-child(even) { background: #f9f9f9; }
  .footer { margin-top: 30px; text-align: center; color: #999; font-size: 10px; border-top: 1px solid #e0e0e0; padding-top: 10px; }
  .badge { display: inline-block; padding: 2px 8px; border-radius: 10px; font-size: 10px; font-weight: 600; }
  .badge-high { background: #fee2e2; color: #dc2626; }
  .badge-medium { background: #fef3c7; color: #d97706; }
  .badge-low { background: #dcfce7; color: #16a34a; }
  .badge-completed { background: #dcfce7; color: #16a34a; }
  .badge-in-progress { background: #dbeafe; color: #2563eb; }
  .badge-pending { background: #f3f4f6; color: #6b7280; }
  @media print { body { padding: 20px; } .kpi-grid { grid-template-columns: repeat(4, 1fr); } }
</style>
</head><body>
<div class="header">
  <h1>🌿 GreenRoute Analytics Report</h1>
  <p>Smart Urban Waste Management · Generated ${new Date().toLocaleString()}</p>
</div>

<div class="kpi-grid">
  <div class="kpi"><div class="value">${totalCollected}</div><div class="label">Bins Collected</div></div>
  <div class="kpi"><div class="value">${avgEfficiency}%</div><div class="label">Avg Efficiency</div></div>
  <div class="kpi"><div class="value">${totalFuel} L</div><div class="label">Total Fuel Used</div></div>
  <div class="kpi"><div class="value">${totalFuelSaved} L</div><div class="label">Fuel Saved ✅</div></div>
</div>

<div class="section">
  <h2>📊 Daily Collection Stats (Last ${dailyStats.length} Days)</h2>
  <table>
    <tr><th>Date</th><th>Bins Collected</th><th>Waste (kg)</th><th>Distance (km)</th><th>Fuel (L)</th></tr>
    ${dailyStats.map(d => `<tr><td>${d.date}</td><td>${d.binsCollected}</td><td>${d.totalWasteKg}</td><td>${d.distanceKm}</td><td>${d.fuelUsed}</td></tr>`).join('')}
  </table>
</div>

<div class="section">
  <h2>🗺️ Zone Summary</h2>
  <table>
    <tr><th>Zone</th><th>Total Bins</th><th>High</th><th>Medium</th><th>Low</th><th>Avg Fill %</th><th>Waste (kg)</th></tr>
    ${zoneSummary.map(z => `<tr><td>${z.zone}</td><td>${z.total}</td><td>${z.high}</td><td>${z.medium}</td><td>${z.low}</td><td>${z.avgFill}%</td><td>${z.totalWaste}</td></tr>`).join('')}
  </table>
</div>

<div class="section">
  <h2>🚛 Route Performance</h2>
  <table>
    <tr><th>Route</th><th>Truck</th><th>Zone</th><th>Distance</th><th>Fuel Used</th><th>Fuel Saved</th><th>Bins</th><th>Status</th></tr>
    ${routes.map(r => `<tr><td>${r.routeId}</td><td>${r.truckNumber}</td><td>${r.zone}</td><td>${r.distanceKm} km</td><td>${r.fuelUsed} L</td><td>${r.fuelSaved} L</td><td>${r.bins.length}</td><td><span class="badge badge-${r.status}">${r.status}</span></td></tr>`).join('')}
  </table>
</div>

<div class="section">
  <h2>📋 Summary</h2>
  <p>• <strong>${bins.length}</strong> bins monitored across <strong>${zoneSummary.length}</strong> zones</p>
  <p>• <strong>${highPriority}</strong> bins at high priority requiring immediate attention</p>
  <p>• <strong>${completedRoutes}/${routes.length}</strong> routes completed</p>
  <p>• <strong>${totalFuelSaved} L</strong> fuel saved through route optimization</p>
  <p>• <strong>${totalWaste} kg</strong> total waste processed</p>
</div>

<div class="footer">
  GreenRoute Smart Urban Waste Management System · Confidential Report
</div>
</body></html>`;

  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(html);
    printWindow.document.close();
    setTimeout(() => printWindow.print(), 500);
  }
}
