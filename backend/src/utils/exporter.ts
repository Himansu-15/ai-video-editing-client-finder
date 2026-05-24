import * as XLSX from 'xlsx';

export class Exporter {
  /**
   * Generates a CSV string from an array of leads.
   */
  public static exportToCsv(leads: any[]): string {
    const headers = [
      'Name',
      'Platform',
      'Channel URL',
      'Email',
      'Subscribers',
      'Avg Views',
      'Uploads/Week',
      'Engagement %',
      'AI Score',
      'Score Reason',
      'Outreach Status',
      'Date Found',
    ];

    const rows = leads.map((lead) => [
      escapeCsvValue(lead.name),
      lead.platform,
      lead.url,
      lead.email || 'N/A',
      lead.subscriberCount,
      lead.averageViews,
      lead.uploadFrequency.toFixed(2),
      lead.engagementScore.toFixed(2),
      lead.qualityScore,
      escapeCsvValue(lead.scoreReason),
      lead.outreachStatus,
      new Date(lead.createdAt).toLocaleDateString(),
    ]);

    const csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
    return csvContent;
  }

  /**
   * Generates an Excel workbook buffer from an array of leads.
   */
  public static exportToExcel(leads: any[]): Buffer {
    const data = leads.map((lead) => ({
      Name: lead.name,
      Platform: lead.platform,
      'Channel URL': lead.url,
      Email: lead.email || 'N/A',
      Subscribers: lead.subscriberCount,
      'Avg Views': lead.averageViews,
      'Uploads Per Week': lead.uploadFrequency,
      'Engagement %': lead.engagementScore,
      'AI Score': lead.qualityScore,
      'Score Reason': lead.scoreReason,
      'Outreach Status': lead.outreachStatus,
      'Date Found': new Date(lead.createdAt).toISOString(),
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Leads');

    // Return as buffer
    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
    return buffer;
  }
}

function escapeCsvValue(val: any): string {
  if (val === null || val === undefined) return '';
  const str = String(val);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}
