import { ZditmDeparturesCard } from './card';
import { ZditmDeparturesCardEditor } from './editor';

customElements.define('zditm-departures-card', ZditmDeparturesCard);
customElements.define('zditm-departures-card-editor', ZditmDeparturesCardEditor);

// Register in the card picker
(window as any).customCards = (window as any).customCards || [];
(window as any).customCards.push({
  type: 'zditm-departures-card',
  name: 'ZDiTM Departures',
  description: 'Tablica odjazdów ZDiTM Szczecin dla wybranego przystanku.',
  preview: true,
  documentationURL: 'https://github.com/GreatAnubis/zditm-departures-card',
});

console.info('%c ZDITM-DEPARTURES-CARD %c 0.1.3 ', 'background:#1565c0;color:#fff', 'background:#333;color:#fff');
