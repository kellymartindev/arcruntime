// Retain the full signup presentation for when the hosted form is ready.
// These branches are chosen at build time; hidden signup copy is not shipped.
export const renderBetaCta = (c, configuration) => configuration.showBetaCta
  ? `<a class="button" href="#join">${c.beta}</a>` : '';

export function renderBetaSection(c, configuration, {mark, esc}) {
  if (configuration.betaSection !== 'full') return `<div class="wrap"><section id="join" class="join join-compact" aria-labelledby="join-title"><p class="section-label">${c.joinLabel}</p><h2 id="join-title">${c.comingSoon}</h2></section></div>`;
  return `<div class="wrap"><section id="join" class="join" aria-labelledby="join-title">${mark('footer-mark')}<p class="section-label">${c.joinLabel}</p><h2 id="join-title">${c.joinTitle}</h2><p>${c.joinIntro}</p><div class="signup-panel"><h3>${configuration.betaFormUrl?c.openTitle:c.closedTitle}</h3><p>${configuration.betaFormUrl?c.openText:c.closedText}</p>${configuration.betaFormUrl?`<a class="button primary" href="${esc(configuration.betaFormUrl)}" referrerpolicy="no-referrer">${c.openAction}<span aria-hidden="true">↗</span></a>`:''}</div><p class="signup-note">${c.signupNote}</p>${configuration.contactEmail?`<a class="contact" href="mailto:${esc(configuration.contactEmail)}">${c.contact}</a>`:''}</section></div>`;
}
