import { htmlvoice, htmlvoiceevents} from './features/speechconfig.js';
import { htmlminecraft } from './features/Minecraftconfig.js';
import { getTranslation, translations } from './translations.js';
const tabs = document.querySelector('custom-tabs');
tabs.addContent(0, htmlvoiceevents); // Agrega al primer tab
tabs.setTabTitle(0,`${getTranslation('chat')}`);
tabs.addContent(1,htmlvoice); // Agrega al segundo tab
tabs.setTabTitle(1,`${getTranslation('voicesettings')}`);
tabs.addContent(2,htmlminecraft); // Agrega al tercer tab
tabs.setTabTitle(2,`${getTranslation('minecraft')}`);