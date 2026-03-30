/**
 * Email Template Builder
 * Compiles template + data → final HTML email
 */

const path = require('path');
const fs = require('fs');

// Template registry
const TEMPLATES = {};

/**
 * Build full email body from template name + data
 */
async function buildBody({ template, lead, unit, subject }) {
  const tpl = getTemplate(template);
  const html = tpl(lead, unit, subject);
  const text = stripHtml(html);
  return { html, text, subject };
}

/**
 * Get template function by name (lazy-loaded)
 */
function getTemplate(name) {
  if (TEMPLATES[name]) return TEMPLATES[name];

  // Try to load from disk
  const tplPath = path.join(__dirname, 'templates', `${name}.js`);
  if (fs.existsSync(tplPath)) {
    const fn = require(tplPath);
    TEMPLATES[name] = fn;
    return fn;
  }

  // Fall back to generic
  return TEMPLATES['generic'] || TEMPLATES['generic'];
}

// ─── Inline Templates ───────────────────────────────────────────

TEMPLATES.intro = (lead, unit, subject) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject || ''}</title>
</head>
<body style="margin:0;padding:0;background:#f6f7f8;font-family:'Helvetica Neue',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f6f7f8;padding:20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 12px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="background:#0A0A0A;padding:20px 30px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="color:#FDE047;font-size:18px;font-weight:bold;font-family:Arial,sans-serif;">MATERIAL SOLUTIONS</td>
                  <td align="right" style="color:#9CA3AF;font-size:12px;font-family:Arial,sans-serif;">Forklift Sales Machine</td>
                </tr>
              </table>
            </td>
          </tr>
          <!-- Hero image / CTA Banner -->
          <tr>
            <td style="background:linear-gradient(135deg,#1A1A1A,#2A2A2A);padding:40px 30px;text-align:center;">
              ${unit?.photos?.[0] ? `<img src="${unit.photos[0]}" alt="${unit.year} ${unit.make} ${unit.model}" width="540" style="max-width:100%;border-radius:8px;border:2px solid #FDE047;display:block;margin:0 auto 20px;">` : ''}
              <h1 style="color:#FDE047;font-size:28px;margin:0 0 10px;font-family:Arial,sans-serif;">${unit?.year || ''} ${unit?.make || ''} ${unit?.model || ''}</h1>
              <p style="color:#ffffff;font-size:32px;font-weight:bold;margin:0 0 15px;font-family:Arial,sans-serif;">$${parseFloat(unit?.asking_price || 0).toLocaleString()}</p>
              ${unit?.hours ? `<p style="color:#9CA3AF;font-size:14px;margin:0;font-family:Arial,sans-serif;">${parseInt(unit.hours).toLocaleString()} hours</p>` : ''}
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:30px;">
              <p style="color:#374151;font-size:16px;line-height:1.6;margin:0 0 20px;font-family:Arial,sans-serif;">
                Hi ${lead?.name?.split(' ')[0] || 'there'},
              </p>
              <p style="color:#374151;font-size:16px;line-height:1.6;margin:0 0 20px;font-family:Arial,sans-serif;">
                Based on your interest, I thought this <strong>${unit?.year} ${unit?.make} ${unit?.model}</strong> might be a great fit. It's currently in stock and available for inspection.
              </p>
              ${unit?.condition ? `<p style="color:#374151;font-size:15px;margin:0 0 20px;font-family:Arial,sans-serif;"><strong>Condition:</strong> ${unit.condition}</p>` : ''}
              <p style="color:#374151;font-size:15px;margin:0 0 30px;font-family:Arial,sans-serif;">
                Would you like to schedule a call or come see it in person? I can also send additional photos and specs.
              </p>
              <!-- CTA -->
              <table cellpadding="0" cellspacing="0" style="margin:0 auto 20px;">
                <tr>
                  <td style="background:#FDE047;border-radius:8px;">
                    <a href="mailto:sales@materialsolutions.com?subject=Interested in ${unit?.year} ${unit?.make} ${unit?.model}" style="display:block;padding:14px 28px;color:#0A0A0A;font-size:16px;font-weight:bold;text-decoration:none;font-family:Arial,sans-serif;">YES, I'M INTERESTED →</a>
                  </td>
                </tr>
              </table>
              <p style="color:#9CA3AF;font-size:13px;text-align:center;margin:0;font-family:Arial,sans-serif;">
                Reply to this email or call <a href="tel:+18005550199" style="color:#F97316;">+1 (800) 555-0199</a>
              </p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background:#F6F7F8;padding:20px 30px;border-top:1px solid #E5E7EB;">
              <p style="color:#9CA3AF;font-size:11px;line-height:1.5;margin:0;font-family:Arial,sans-serif;">
                You're receiving this because you submitted a inquiry on our website.<br>
                <a href="#" style="color:#9CA3AF;font-family:Arial,sans-serif;">Unsubscribe</a> ·
                <a href="#" style="color:#9CA3AF;font-family:Arial,sans-serif;">View in browser</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

TEMPLATES.specs = (lead, unit) => `
<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><title>Spec Sheet</title></head>
<body style="margin:0;padding:0;background:#f6f7f8;font-family:'Helvetica Neue',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f6f7f8;padding:20px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 12px rgba(0,0,0,0.1);">
        <tr><td style="background:#0A0A0A;padding:20px 30px;">
          <p style="color:#FDE047;font-size:18px;font-weight:bold;margin:0;font-family:Arial,sans-serif;">MATERIAL SOLUTIONS — SPEC SHEET</p>
        </td></tr>
        <tr><td style="padding:30px;">
          <h2 style="color:#0A0A0A;font-size:22px;margin:0 0 20px;font-family:Arial,sans-serif;">${unit?.year} ${unit?.make} ${unit?.model}</h2>
          <table width="100%" cellpadding="8" cellspacing="0" style="border:1px solid #E5E7EB;border-radius:8px;overflow:hidden;">
            ${specRow('Asking Price', `$${parseFloat(unit?.asking_price||0).toLocaleString()}`)}
            ${specRow('Hours', unit?.hours ? `${parseInt(unit.hours).toLocaleString()} hrs` : 'N/A')}
            ${specRow('Capacity', unit?.capacity_lbs ? `${parseInt(unit.capacity_lbs).toLocaleString()} lbs` : 'N/A')}
            ${specRow('Mast Type', unit?.mast_type || 'N/A')}
            ${specRow('Power', unit?.power_type || 'N/A')}
            ${specRow('Year', unit?.year || 'N/A')}
            ${unit?.condition ? specRow('Condition', unit.condition) : ''}
          </table>
          <p style="color:#374151;font-size:15px;line-height:1.6;margin:25px 0;font-family:Arial,sans-serif;">
            Let me know if you'd like to see it in person or have any questions!
          </p>
        </td></tr>
        <tr><td style="background:#F6F7F8;padding:20px 30px;border-top:1px solid #E5E7EB;">
          <p style="color:#9CA3AF;font-size:11px;margin:0;font-family:Arial,sans-serif;"><a href="#" style="color:#9CA3AF;">Unsubscribe</a></p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;

TEMPLATES.closing = (lead, unit) => `
<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><title>Quick follow-up</title></head>
<body style="margin:0;padding:0;background:#f6f7f8;font-family:'Helvetica Neue',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f6f7f8;padding:20px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 12px rgba(0,0,0,0.1);">
        <tr><td style="background:#F97316;padding:20px 30px;">
          <p style="color:#ffffff;font-size:16px;font-weight:bold;margin:0;font-family:Arial,sans-serif;">TIME-SENSITIVE: ${unit?.year} ${unit?.make} ${unit?.model}</p>
        </td></tr>
        <tr><td style="padding:30px;">
          <p style="color:#374151;font-size:16px;line-height:1.6;margin:0 0 20px;font-family:Arial,sans-serif;">
            Hi ${lead?.name?.split(' ')[0] || 'there'},
          </p>
          <p style="color:#374151;font-size:16px;line-height:1.6;margin:0 0 20px;font-family:Arial,sans-serif;">
            I wanted to check in — is the <strong>${unit?.year} ${unit?.make} ${unit?.model}</strong> still on your radar? I have a few serious buyers looking, so wanted to give you first dibs.
          </p>
          <p style="color:#374151;font-size:16px;line-height:1.6;margin:0 0 30px;font-family:Arial,sans-serif;">
            If this isn't the right fit, no worries at all — just let me know and I'll stop following up.
          </p>
          <table cellpadding="0" cellspacing="0" style="margin:0 auto;"><tr><td style="background:#F97316;border-radius:8px;">
            <a href="mailto:sales@materialsolutions.com?subject=Still interested in ${unit?.year} ${unit?.make} ${unit?.model}" style="display:block;padding:14px 28px;color:#ffffff;font-size:16px;font-weight:bold;text-decoration:none;font-family:Arial,sans-serif;">YES, STILL INTERESTED</a>
          </td></tr></table>
        </td></tr>
        <tr><td style="background:#F6F7F8;padding:20px 30px;border-top:1px solid #E5E7EB;">
          <p style="color:#9CA3AF;font-size:11px;margin:0;font-family:Arial,sans-serif;"><a href="#" style="color:#9CA3AF;">Unsubscribe</a></p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;

// Hot lead variants use same structure with different accent colors
TEMPLATES.intro_hot = TEMPLATES.intro;
TEMPLATES.specs_hot = TEMPLATES.specs;
TEMPLATES.closing_hot = TEMPLATES.closing;
TEMPLATES.intro_budget = TEMPLATES.intro;
TEMPLATES.specs_budget = TEMPLATES.specs;
TEMPLATES.closing_budget = TEMPLATES.closing;

// ─── Generic fallback ────────────────────────────────────────────
TEMPLATES.generic = (lead, unit, subject = 'Equipment Available') => `
<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>${subject}</title></head>
<body style="margin:0;padding:0;background:#f6f7f8;font-family:Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:20px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:8px;padding:30px;box-shadow:0 2px 8px rgba(0,0,0,0.1);">
        <tr><td style="background:#FDE047;padding:15px 20px;border-radius:6px 6px 0 0;">
          <p style="color:#0A0A0A;font-size:16px;font-weight:bold;margin:0;">MATERIAL SOLUTIONS</p>
        </td></tr>
        <tr><td style="padding:30px 20px;">
          <h1 style="color:#0A0A0A;font-size:24px;margin:0 0 15px;">${unit?.year || ''} ${unit?.make || ''} ${unit?.model || ''}</h1>
          <p style="color:#374151;font-size:15px;line-height:1.6;">Hi ${lead?.name?.split(' ')[0] || 'there'},</p>
          <p style="color:#374151;font-size:15px;line-height:1.6;">$${parseFloat(unit?.asking_price||0).toLocaleString()}</p>
          <p style="color:#374151;font-size:15px;line-height:1.6;margin-top:20px;"><a href="mailto:sales@materialsolutions.com" style="background:#FDE047;color:#0A0A0A;padding:12px 24px;text-decoration:none;border-radius:6px;font-weight:bold;">Reply Now</a></p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;

// ─── Helpers ────────────────────────────────────────────────────

function specRow(label, value) {
  return `
    <tr>
      <td style="background:#F9FAFB;color:#6B7280;font-size:13px;padding:8px 12px;border-bottom:1px solid #E5E7EB;font-family:Arial,sans-serif;">${label}</td>
      <td style="color:#0A0A0A;font-size:13px;padding:8px 12px;border-bottom:1px solid #E5E7EB;font-family:Arial,sans-serif;font-weight:600;">${value}</td>
    </tr>`;
}

function stripHtml(html) {
  return html
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .trim();
}

module.exports = { buildBody, TEMPLATES };
