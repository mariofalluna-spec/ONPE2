import { CMInfo } from '../types';

/**
 * Genera y descarga un archivo Excel (.xls) o CSV (.csv) con los Coordinadores de Mesa (CM)
 */
export function exportarCoordinadoresMesaExcel(
  cms: CMInfo[],
  nombreArchivo: string = 'coordinadores_de_mesa_31_distritos',
  formato: 'xls' | 'csv' = 'xls'
): void {
  if (!cms || cms.length === 0) return;

  const fechaStr = new Date().toLocaleDateString('es-PE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  if (formato === 'csv') {
    // CSV con UTF-8 BOM y delimitador ';' para compatibilidad perfecta con Excel en español
    let csv = '\uFEFFN°;PROVINCIA;DISTRITO;CARGO;APELLIDO PATERNO;NOMBRES;NOMBRE COMPLETO;CELULAR;NUMERO_DIRECTO;LOCAL_ASIGNADO_IE;ENLACE_WHATSAPP\r\n';

    cms.forEach((cm, index) => {
      const num = index + 1;
      const telRaw = cm.telefonoRaw || (cm.telefono ? cm.telefono.replace(/\D/g, '') : '');
      const waLink = telRaw ? `https://wa.me/51${telRaw}` : '';
      csv += `${num};"${cm.provincia}";"${cm.distrito}";"${cm.cargo || 'CM'}";"${cm.apellidoPaterno || ''}";"${cm.nombres || ''}";"${cm.nombreCompleto}";"${cm.telefono}";"${telRaw}";"${cm.localVotacion || ''}";"${waLink}"\r\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    triggerDownload(blob, `${nombreArchivo}.csv`);
    return;
  }

  // Formato XLS (HTML Spreadsheet nativo para Microsoft Excel, Google Sheets y LibreOffice)
  let html = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
<!--[if gte mso 9]>
<xml>
<x:ExcelWorkbook>
<x:ExcelWorksheets>
<x:ExcelWorksheet>
<x:Name>Coordinadores de Mesa</x:Name>
<x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions>
</x:ExcelWorksheet>
</x:ExcelWorksheets>
</x:ExcelWorkbook>
</xml>
<![endif]-->
<style>
  body { font-family: 'Segoe UI', Calibri, Arial, sans-serif; }
  .title { font-size: 16pt; font-weight: bold; color: #0f172a; margin-bottom: 4px; }
  .subtitle { font-size: 10pt; color: #475569; margin-bottom: 12px; }
  th { background-color: #0d9488; color: #ffffff; font-weight: bold; border: 1px solid #0f766e; padding: 8px 10px; font-size: 10pt; }
  td { border: 1px solid #cbd5e1; padding: 6px 10px; font-size: 9.5pt; }
  .center { text-align: center; }
  .phone { mso-number-format:"\\@"; text-align: center; font-weight: bold; color: #0284c7; }
  .badge { font-weight: bold; background-color: #fef3c7; color: #b45309; text-align: center; }
  .even { background-color: #f8fafc; }
</style>
</head>
<body>
<div class="title">DIRECTORIO OFICIAL DE COORDINADORES DE MESA (CM)</div>
<div class="subtitle">Generado el: ${fechaStr} | Total registros: ${cms.length} | Jurisdicción: ODPE Ica (31 Distritos)</div>
<table>
<thead>
<tr>
  <th style="width: 50px;">N°</th>
  <th style="width: 100px;">PROVINCIA</th>
  <th style="width: 150px;">DISTRITO</th>
  <th style="width: 70px;">CARGO</th>
  <th style="width: 140px;">APELLIDO PATERNO</th>
  <th style="width: 160px;">NOMBRES</th>
  <th style="width: 200px;">NOMBRE COMPLETO</th>
  <th style="width: 130px;">CELULAR</th>
  <th style="width: 120px;">NÚMERO DIRECTO</th>
  <th style="width: 220px;">LOCAL ASIGNADO (I.E)</th>
  <th style="width: 140px;">WHATSAPP</th>
</tr>
</thead>
<tbody>
`;

  cms.forEach((cm, index) => {
    const num = index + 1;
    const telRaw = cm.telefonoRaw || (cm.telefono ? cm.telefono.replace(/\D/g, '') : '');
    const waLink = telRaw ? `https://wa.me/51${telRaw}` : '';
    const rowClass = index % 2 === 0 ? '' : 'class="even"';

    html += `<tr ${rowClass}>
  <td class="center">${num}</td>
  <td>${cm.provincia}</td>
  <td><strong>${cm.distrito}</strong></td>
  <td class="badge">${cm.cargo || 'CM'}</td>
  <td>${cm.apellidoPaterno || ''}</td>
  <td>${cm.nombres || ''}</td>
  <td><strong>${cm.nombreCompleto}</strong></td>
  <td class="phone">${cm.telefono}</td>
  <td class="phone">${telRaw}</td>
  <td>${cm.localVotacion || '-'}</td>
  <td class="center"><a href="${waLink}">${telRaw}</a></td>
</tr>\n`;
  });

  html += `</tbody></table></body></html>`;

  const blob = new Blob([html], { type: 'application/vnd.ms-excel;charset=utf-8' });
  triggerDownload(blob, `${nombreArchivo}.xls`);
}

/**
 * Dispara la descarga en el navegador de manera segura en PC y celulares
 */
function triggerDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 300);
}
