import DynamicTable, { EditModal } from '../components/renderfields.js';
import { showAlert } from '../components/message.js';
import {replaceVariables, logger} from '../utils/utils.js';
import { leerMensajes, handleleermensaje } from '../audio/tts.js';
import { voicelistmap } from '../audio/voiceoptions.js';
import { getTranslation, translations } from '../translations.js';
import { filterworddefault } from '../assets/jsondata.js';

const keys = [
    { key: 'chat', text: `uniqueId ${getTranslation('dice')} comment`, check: true },
    { key: 'gift', text:  `uniqueId ${getTranslation('regalo')} repeatcount giftName`, check: true },
    { key: 'follow', text: `uniqueId ${getTranslation('te ah seguido')}`, check: true },
    { key: 'like', text: `uniqueId ${getTranslation('le ah dado like')}`, check: false },
    { key: 'share', text: `uniqueId ${getTranslation('ah compartido')}`, check: false },
    { key: 'subscribe', text: `uniqueId ${getTranslation('se ah suscrito')}`, check: true },
    { key: 'welcome', text:  `uniqueId ${getTranslation('bienvenido')}`, check: false }
];

const createTTSConfig = (labelText,sumaryText='texto a leer') => ({
    type: 'object',
    class: 'input-default',
    label: sumaryText,
    check: {
        class: 'filled-in flex-reverse-column',
        label: getTranslation('activate'),
        type: 'checkbox',
        returnType: 'boolean',
    },
    text: {
        class: 'input-default',
        label: labelText,
        type: 'text',
        returnType: 'string',
    },
});

const { ttsconfig, ttsdata } = keys.reduce((acc, { key, text, check }) => {
    acc.ttsconfig[key] = createTTSConfig(getTranslation('texttoread'),`${getTranslation('config')} ${getTranslation(key)}`);
    acc.ttsdata[key] = { text, check };
    return acc;
}, { ttsconfig: {}, ttsdata: {} });

console.log(ttsconfig);
console.log(ttsdata);

function getTTSdatastore() {
    const ttsdatastore = localStorage.getItem('ttsdatastore');
    if (!ttsdatastore) localStorage.setItem('ttsdatastore', JSON.stringify(ttsdata));
    return ttsdatastore ? JSON.parse(ttsdatastore) : ttsdata;
}
const callbackconfig = { 
    type: 'button',
    label: getTranslation('savechanges'),
    class: 'default-button',
    callback: async (data,modifiedData) => {
    console.log("editcallback", data,modifiedData);
    localStorage.setItem('ttsdatastore', JSON.stringify(modifiedData));
  }
 };
const configelement = new EditModal({...ttsconfig,savebutton:callbackconfig});
const newElement = document.createElement('div');
newElement.textContent = 'Nuevo contenido';
const htmlvoiceevents = configelement.ReturnHtml(getTTSdatastore());

let voicesList = [];

// Función para mapear las voces
function mapVoiceList() {
    if (typeof speechSynthesis === "undefined" || speechSynthesis?.getVoices().length === 0) return [];
    const voices = speechSynthesis.getVoices();
    voicesList = voices.map(voice => ({
        value: voice.name,
        label: `${voice.name} (${voice.lang})`,
    }));
    updateVoiceConfig();
    return voicesList;
}

// Función para actualizar la configuración cuando las voces estén disponibles
function updateVoiceConfig() {
    selectvoiceconfig.voice2.selectvoice.options = voicesList;
}

// Función para verificar las voces
function checkVoices() {
    if (typeof speechSynthesis === "undefined") return;
    if (speechSynthesis.getVoices().length > 0) {
        console.log("speechSynthesis.getVoices()", speechSynthesis.getVoices());
        clearInterval(voiceCheckInterval);
        mapVoiceList();
    }
}

// Configuración inicial con array vacío
const selectvoiceconfig = {
    selectvoiceoption: {
        class: 'radio-default',
        type: 'radio',
        returnType: 'string',
        toggleoptions: true,
        options: [{ value: 'selectvoice1', label: 'Voz1' }, { value: 'selectvoice2', label: 'Voz2' }],
    },
    voice1: {
        class: 'input-default',
        type: 'object',
        dataAssociated: 'selectvoice1',
        open: true,
        selectvoice: {
            class: 'select-default',
            type: 'select2',
            returnType: 'string',
            options: voicelistmap, // Inicialmente vacío
        },
        audioQueue: {
            class: 'input-default',
            label: getTranslation('cola de audio'),
            type: 'checkbox',
            returnType: 'boolean',
        },
    },
    voice2: {
        class: 'input-default',
        type: 'object',
        dataAssociated: 'selectvoice2',
        open: true,
        selectvoice: {
            class: 'select-default',
            type: 'select2',
            returnType: 'string',
            options: voicesList, // Inicialmente vacío
        },
        Randomvoice: {
            class: 'input-default',
            label: getTranslation('random voice'),
            type: 'checkbox',
            returnType: 'boolean',
        },
        randomspeed: {
            class: 'input-default',
            label: getTranslation('random speed'),
            type: 'checkbox',
            returnType: 'boolean',
        },
        randompitch: {
            class: 'input-default',
            label: getTranslation('random pitch'),
            type: 'checkbox',
            returnType: 'boolean',
        },
        defaultspeed: {
            class: 'input-default',
            label: getTranslation('default speed'),
            type: 'slider',
            min: 0.1,
            max: 2,
            returnType: 'number',
        },
        defaultpitch: {
            class: 'input-default',
            label: getTranslation('default pitch'),
            type: 'slider',
            min: 0.1,
            max: 2,
            returnType: 'number',
        },
        volume: {
            class: 'max-width-90p',
            label: getTranslation('speech volume'),
            type: 'slider',
            min: 0,
            max: 1,
            returnType: 'number',
        },
    },
    savebutton: {
        class: 'default-button',
        type: 'button',
        label: getTranslation('savechanges'),
        callback: async (data,modifiedData) => {
            console.log("callbackconfig",data,modifiedData);
            localStorage.setItem('voicedatastore', JSON.stringify(modifiedData));
        },
    }
};

// Configuración de los event listeners
if (typeof speechSynthesis !== "undefined" && speechSynthesis.onvoiceschanged !== undefined) {
    speechSynthesis.onvoiceschanged = mapVoiceList;
    setTimeout(mapVoiceList, 1000);
}

const voiceCheckInterval = setInterval(checkVoices, 100);

const voiceelement = new EditModal(selectvoiceconfig);
const defaultvoicedata = JSON.parse(localStorage.getItem('voicedatastore')) || {
    selectvoiceoption: 'selectvoice1', 
    voice1: {
      selectvoice: 'Conchita',
      audioQueue: true,
    },
    voice2: {
      selectvoice: 'es_ES',
      Randomvoice: false,
      randomspeed: false,
      randompitch: false,
      defaultspeed: 1,
      defaultpitch: 1,
      volume: 1,
    },
};
if (!localStorage.getItem('voicedatastore')) localStorage.setItem('voicedatastore', JSON.stringify(defaultvoicedata));
const htmlvoice = voiceelement.ReturnHtml(defaultvoicedata);

setTimeout(() => {
  if (mapVoiceList().length > 0) {
    voiceelement.updateData(defaultvoicedata);
  }
}, 500);
const testdata = {
    uniqueId: 'testUser',
    comment: 'testComment',
    likeCount: 50,
    repeatCount: 123,
    giftName: 'testgiftName',
    diamondCount: 50,
    followRole: 0,
    userId: 1235646,
    teamMemberLevel: 0,
    subMonth: 0,
}
function Replacetextoread(eventType = 'chat',data) {
    const configtts = getTTSdatastore();
    if (!configtts[eventType] || !configtts[eventType].check) return;
    const textoread = replaceVariables(configtts[eventType].text, data);
    logger.log('speechchat',configtts,textoread,configtts[eventType].text)
    if (existwordinArray(textoread)) { showAlert('info',`${getTranslation('filterword')} ${textoread} `); return; }
    handleleermensaje(textoread);
}
/* setTimeout(() => {
  Replacetextoread('chat',{comment: "hola angelo con 8lo"})
  Replacetextoread('chat',{comment: "este si se lee"})
},3000) */
class ArrayStorageManager {
    constructor(storageKey) {
        this.storageKey = storageKey;
        this.items = this.getAll();
    }
  
    getAll() {
        const stored = localStorage.getItem(this.storageKey);
        return stored ? JSON.parse(stored) : [];
    }
  
    saveToStorage() {
        localStorage.setItem(this.storageKey, JSON.stringify(this.items));
    }
  
    validateInput(item) {
        if (typeof item !== 'string') return false;
        if (item.length <= 1) return false;
        return true;
    }
  
    existInItems(text) {
        const normalizedText = text.toLowerCase();
        return this.items.some(item =>
            item.toLowerCase() === normalizedText
        );
    }
    // Verificar si algún item está contenido en el texto
    containswordInitems(text) {
        const normalizedText = text.toLowerCase();
        return this.items.some(item =>
            normalizedText.includes(item.toLowerCase())
        );
    }

    // Verificar si el texto existe como item o contiene algún item
    containword(text) {
        if (!this.validateInput(text)) return false;
        return this.existInItems(text) || this.containswordInitems(text);
    }
    add(item) {
        if (!this.validateInput(item)) return false;
        if (!this.existInItems(item)) {
            this.items.push(item);
            this.saveToStorage();
            return true;
        }
        return false;
    }
  
    remove(item) {
        const initialLength = this.items.length;
        this.items = this.items.filter(existingItem =>
            existingItem.toLowerCase() !== item.toLowerCase()
        );
        if (this.items.length !== initialLength) {
            this.saveToStorage();
            return true;
        }
        return false;
    }
  }
  
  // Clase para manejar la UI
  class ArrayManagerUI {
    constructor(storageManager) {
        this.manager = storageManager;
    }

    // Retorna solo el HTML
    getHTML() {
        const storageKeyname = this.manager.storageKey;
        return `
            <div class="array-manager-container" data-component="array-manager">
                <h2 class="modal-title">
                    <translate-text key="${storageKeyname}"></translate-text>
                </h2>
                <div class="input-container">
                    <input type="text" class="array-manager-input" placeholder="${getTranslation('addelement')}">
                    <button class="array-manager-add open-modal-btn">${getTranslation('add')}</button>
                    <button class="array-manager-default open-modal-btn">${getTranslation('default')} ${getTranslation(storageKeyname)}</button>
                </div>
                <div class="array-manager-error error-message">
                    El texto debe tener al menos 2 caracteres
                </div>
                <div class="array-manager-items items-container">
                </div>
            </div>
        `;
    }

    // Método para inicializar los event listeners
    initializeEventListeners(containerElement) {
        if (!containerElement) {
            console.error('No se proporcionó un elemento contenedor válido');
            return;
        }

        const input = containerElement.querySelector('.array-manager-input');
        const addButton = containerElement.querySelector('.array-manager-add');
        const defaultButton = containerElement.querySelector('.array-manager-default');
        const errorMessage = containerElement.querySelector('.array-manager-error');
        const itemsContainer = containerElement.querySelector('.array-manager-items');

        // Crear item element handler
        const createItemElement = (text) => {
            const itemDiv = document.createElement('div');
            itemDiv.className = 'item';

            const textSpan = document.createElement('span');
            textSpan.textContent = text;

            const deleteButton = document.createElement('button');
            deleteButton.className = 'delete-btn';
            deleteButton.textContent = '×';
            
            deleteButton.addEventListener('click', () => {
                this.manager.remove(text);
                itemDiv.remove();
            });

            itemDiv.appendChild(textSpan);
            itemDiv.appendChild(deleteButton);
            itemsContainer.appendChild(itemDiv);
        };

        // Add item handler
        const handleAddItem = (text = input.value.trim()) => {
            errorMessage.style.display = 'none';
            
            if (this.manager.validateInput(text)) {
                if (this.manager.add(text)) {
                    createItemElement(text);
                    if (text === input.value.trim()) {
                        input.value = '';
                    }
                }
            } else {
                errorMessage.style.display = 'block';
            }
        };

        // Load existing items
        const loadItems = () => {
            itemsContainer.innerHTML = '';
            this.manager.getAll().forEach(item => {
                createItemElement(item);
            });
        };

        // Add default items handler
        const handleAddDefault = () => {
            filterworddefault.forEach(text => {
                handleAddItem(text);
            });
        };

        // Event Listeners
        addButton.addEventListener('click', () => handleAddItem());
        defaultButton.addEventListener('click', handleAddDefault);
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') handleAddItem();
        });

        // Cargar items existentes
        loadItems();

        // Retornamos los métodos que podrían ser útiles externamente
        return {
            loadItems,
            addItem: handleAddItem,
            addDefault: handleAddDefault
        };
    }
}
  function createAndAppendTabs(htmlString, targetElement) {
    // Crear el elemento de tabs desde el HTML
  }
  // Inicialización
  const manager = new ArrayStorageManager('filterwords');
  const ui = new ArrayManagerUI(manager);
  const htmlContent = `
    <custom-tabs>
      <div tab-title="Pestaña 1">
        <h2>Contenido de la pestaña 1</h2>
        ${ui.getHTML()}
      </div>
      <div tab-title="Pestaña 2">
        <h2>Contenido de la pestaña 2</h2>
        <p>Este es el contenido de la segunda pestaña</p>
      </div>
      <div tab-title="Pestaña 3">
        <h2>Contenido de la pestaña 3</h2>
        <p>Este es el contenido de la tercera pestaña</p>
      </div>
    </custom-tabs>
  `;
  
  // Agregar al elemento con id 'container'
  createAndAppendTabs(htmlContent, '#container123');
  //ui.initializeEventListeners(document.getElementById('container123'));
  function addfilterword(word) {
    manager.add(word);
    ui.loadItems();
  }
  function existwordinArray(word) {
    const response = manager.containword(word);
    //console.log("existwordinArray",response,word)
    return response;
  }
export { Replacetextoread, addfilterword, htmlvoice, htmlvoiceevents}
// asdasd como seria un metodo para hacer un string a json