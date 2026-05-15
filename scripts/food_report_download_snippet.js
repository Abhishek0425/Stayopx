/**
 * food_report_download_snippet.js
 * 
 * Add this button anywhere in your Food Menu tab HTML:
 * 
 *   <button onclick="downloadFoodReport()" class="btn-download-report">
 *     📥 Download Food Report (PDF)
 *   </button>
 *
 * Then include this JS in food_dashboard.js or index.html
 */

async function downloadFoodReport(week) {
  var API    = window.UNILIV_API_BASE || 'http://127.0.0.1:8000';
  var brand  = window._CURRENT_BRAND  || 'uniliv';
  var user   = window._CURRENT_USER   || {};

  // week defaults to 1 if not passed
  week = week || document.getElementById('fmp-week-selector')?.value || '1';

  // Property details — customise per brand
  var propMap = {
    huddle: { name: 'Huddle Stays Nash B Tower', code: '1100170062AO' },
    uniliv: { name: 'Uniliv Property',           code: 'UNILIV001'    },
  };
  var prop = propMap[brand] || propMap['uniliv'];

  var url = API + '/api/food-report/download/?' + new URLSearchParams({
    brand:    brand,
    week:     week,
    property: prop.name,
    code:     prop.code,
  });

  // Show loading state
  var btn = document.getElementById('btn-download-report');
  if (btn) { btn.disabled = true; btn.textContent = '⏳ Generating...'; }

  try {
    var res = await fetch(url, { credentials: 'include' });

    if (!res.ok) {
      var err = await res.json().catch(() => ({}));
      alert('Failed to generate report: ' + (err.error || res.status));
      return;
    }

    // Trigger browser download
    var blob = await res.blob();
    var a    = document.createElement('a');
    a.href   = URL.createObjectURL(blob);

    // Get filename from Content-Disposition header
    var cd   = res.headers.get('Content-Disposition') || '';
    var match = cd.match(/filename="?([^"]+)"?/);
    a.download = match ? match[1] : `Food_Report_Week${week}.pdf`;

    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(a.href);

  } catch (e) {
    alert('Download failed: ' + e.message);
  } finally {
    if (btn) { btn.disabled = false; btn.textContent = '📥 Download Food Report (PDF)'; }
  }
}
