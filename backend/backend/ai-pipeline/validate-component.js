// validate-component.js
// Checks that AI-generated JSX actually matches what AuraGen needs before
// it's sent anywhere. Catches bad output early instead of breaking the UI.

function validateComponent(code) {
    const errors = [];
  
    // Rule 1: Must be a default export named WizardForm
    if (!/export\s+default\s+function\s+WizardForm/.test(code)) {
      errors.push('Missing "export default function WizardForm" declaration.');
    }
  
    // Rule 2: Must not contain leftover markdown code fences
    if (code.includes('```')) {
      errors.push('Contains leftover markdown code fences (```).');
    }
  
    // Rule 3: Must not be suspiciously short (likely an error or empty response)
    if (code.trim().length < 50) {
      errors.push('Generated code is too short to be a real component.');
    }
  
    // Rule 4: Basic balance check — equal opening/closing curly braces
    const openBraces = (code.match(/{/g) || []).length;
    const closeBraces = (code.match(/}/g) || []).length;
    if (openBraces !== closeBraces) {
      errors.push(`Mismatched braces: ${openBraces} open vs ${closeBraces} close — code is likely incomplete.`);
    }
  
    // Rule 5: Should not call fetch() or any external API directly (security/scope rule)
    if (/fetch\s*\(/.test(code)) {
      errors.push('Contains a fetch() call — components should not call external APIs directly.');
    }
  
    return {
      isValid: errors.length === 0,
      errors,
    };
  }
  
  module.exports = { validateComponent };