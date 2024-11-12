// import en el lado del cliente... html
// Define el componente personalizado
class InputField extends HTMLElement {
  #value;
  #changeCallback;

  constructor() {
      super();
      this.attachShadow({ mode: 'open' });
      this.#value = null;
      this.#changeCallback = null;
  }

  static get observedAttributes() {
      return ['type', 'key', 'subkey', 'value', 'cols', 'rows', 'minheight', 'theme'];
  }

  get value() {
      return this.#value;
  }

  set value(newValue) {
      this.#value = newValue;
      this.setAttribute('value', newValue);
  }

  set onChange(callback) {
      this.#changeCallback = callback;
      this.render();
  }

  connectedCallback() {
      this.render();
  }

  attributeChangedCallback(name, oldValue, newValue) {
      if (oldValue !== newValue) {
          if (name === 'value') {
              this.#value = newValue;
          }
          this.render();
      }
  }

  render() {
      const type = this.getAttribute('type') || 'text';
      const key = this.getAttribute('key') || '';
      const subKey = this.getAttribute('subkey') || '';
      const value = this.getAttribute('value') || '';
      const cols = this.getAttribute('cols') || '50';
      const rows = this.getAttribute('rows') || '4';
      const minHeight = this.getAttribute('minheight') || '100px';
      const theme = this.getAttribute('theme') || 'dark';

      const styles = `
          :host {
              display: block;
              margin: 10px 0;
          }
          
          /* Variables CSS para temas */
          :host {
              --bg-color: ${theme === 'dark' ? '#2a2a2a' : '#ffffff'};
              --text-color: ${theme === 'dark' ? '#ffffff' : '#333333'};
              --border-color: ${theme === 'dark' ? '#444444' : '#cccccc'};
              --focus-color: ${theme === 'dark' ? '#0099ff' : '#007bff'};
              --placeholder-color: ${theme === 'dark' ? '#888888' : '#999999'};
              --resizer-color: ${theme === 'dark' ? '#666666' : '#cccccc'};
              --resizer-hover-color: ${theme === 'dark' ? '#888888' : '#999999'};
          }
          
          .input-container {
              position: relative;
              width: 100%;
          }

          input, textarea {
              padding: 8px;
              border: 1px solid var(--border-color);
              border-radius: 4px;
              font-size: 14px;
              width: 100%;
              box-sizing: border-box;
              background-color: var(--bg-color);
              color: var(--text-color);
              transition: all 0.2s ease;
          }

          textarea {
              min-height: ${minHeight};
              resize: vertical;
              line-height: 1.5;
              overflow: auto;
              position: relative;
          }

          /* Mejora del redimensionador */
          .textarea-wrapper {
              position: relative;
              width: 100%;
          }

          .textarea-wrapper::after {
              content: '';
              position: absolute;
              right: 0;
              bottom: 0;
              width: 16px;
              height: 16px;
              background: 
                  linear-gradient(135deg, 
                  transparent 0%,
                  transparent 50%,
                  var(--resizer-color) 50%,
                  var(--resizer-color) 100%);
              pointer-events: none;
              opacity: 0.7;
              transition: opacity 0.2s ease;
          }

          .textarea-wrapper:hover::after {
              opacity: 1;
              background: 
                  linear-gradient(135deg, 
                  transparent 0%,
                  transparent 50%,
                  var(--resizer-hover-color) 50%,
                  var(--resizer-hover-color) 100%);
          }

          textarea::-webkit-resizer {
              background: transparent;
          }

          input:focus, textarea:focus {
              outline: none;
              border-color: var(--focus-color);
              box-shadow: 0 0 0 2px ${theme === 'dark' ? 'rgba(0,153,255,.25)' : 'rgba(0,123,255,.25)'};
          }

          ::placeholder {
              color: var(--placeholder-color);
              opacity: 1;
          }

          /* Estilo para cuando está deshabilitado */
          input:disabled, textarea:disabled {
              background-color: ${theme === 'dark' ? '#1a1a1a' : '#f5f5f5'};
              cursor: not-allowed;
              opacity: 0.7;
          }

          /* Estilo para el modo de solo lectura */
          input:read-only, textarea:read-only {
              background-color: ${theme === 'dark' ? '#1a1a1a' : '#f5f5f5'};
              cursor: default;
          }
      `;

      let inputElement;
      const subKeyLabel = subKey ? subKey : type;
      const placeholder = `${key} ${subKeyLabel}`;


      inputElement = `
          <div class="input-container">
              <input 
                  type="${type}"
                  value="${value}"
                  placeholder="${placeholder}"
              />
          </div>
      `;
      

      this.shadowRoot.innerHTML = `
          <style>${styles}</style>
          ${inputElement}
      `;

      const input = this.shadowRoot.querySelector('input, textarea');
      input.addEventListener('input', (e) => {
          const returnValue = type === 'number' ? Number(e.target.value) : e.target.value;
          this.#value = returnValue;
          
          if (this.#changeCallback) {
              this.#changeCallback({
                  key: key,
                  subKey: subKey,
                  value: returnValue,
                  element: this
              });
          }
      });
  }
}

// Registrar el componente
customElements.define('input-field', InputField);

// Registrar el componente
class CustomSelect extends HTMLElement {
  constructor() {
      super();
      this.attachShadow({ mode: 'open' });
      this.options = [];
      this.selectedOption = null;
      this.searchTerm = '';
      this.selectLabel = 'Select'; // Valor por defecto
      this.render();
  }

  connectedCallback() {
      this.setupEventListeners();
      // Comprobar si existe el atributo label
      if (this.hasAttribute('label')) {
          this.setLabel(this.getAttribute('label'));
      }
  }

  // Getter para la propiedad 'value'
  get value() {
      return this.selectedOption ? this.selectedOption.value : null;
  }

  // Setter para la propiedad 'value'
  set value(newValue) {
      this.setValue(newValue);
  }

  setLabel(label) {
      this.selectLabel = label || "Select";
      this.renderLabel(); // Actualizar el label en el DOM
      return this.selectLabel;
  }

  renderLabel() {
      const selectedElement = this.shadowRoot.querySelector('.selected span');
      if (selectedElement && !this.selectedOption) {
          selectedElement.textContent = this.selectLabel;
      }
  }

  setOptions(options) {
      this.options = options;
      this.renderOptions();
  }

  delay(ms) {
      return new Promise(resolve => setTimeout(resolve, ms));
  }

  async setValue(value) {
      try {
          // Esperamos 1 segundo
          await this.delay(1000);

          // Esperamos a que la promesa de options se resuelva
          const options = await this.options;
          if (!options || options.length <= 0 || !options.filter || !options.find) return;

          // Buscamos la opción que tenga el valor que buscamos
          const option = options.find(opt => opt.value === value);
          
          if (option) {
              this.selectedOption = option;
              this.renderSelectedOption();
              return true;
          } else {
              console.warn('Opción no encontrada:', value);
              return false;
          }
      } catch (error) {
          console.error('Error al establecer el valor:', error);
          return false;
      }
  }

  getValue() {
      return this.selectedOption ? this.selectedOption.value : null;
  }

  render() {
      this.shadowRoot.innerHTML = /*html*/`
<style>
  :host {
      --background-color: #333;
      --text-color: #fff;
      --border-color: #555;
      --option-hover-bg: #444;
      --input-bg: #444;
      --input-text-color: #fff;
  }

  .select-wrapper {
      position: relative;
      width: 200px;
  }

  .selected {
      display: flex;
      align-items: center;
      padding: 8px;
      border: 1px solid var(--border-color);
      cursor: pointer;
      background-color: var(--background-color);
      color: var(--text-color);
  }

  .selected img {
      margin-right: 8px;
      width: 24px;
      height: 24px;
  }

  .dropdown {
      display: none;
      position: absolute;
      top: 100%;
      width: 100%;
      border: 1px solid var(--border-color);
      max-height: 200px;
      overflow-y: auto;
      background: var(--background-color);
      z-index: 10;
  }

  .dropdown.open {
      display: block;
  }

  .option {
      display: flex;
      align-items: center;
      padding: 8px;
      cursor: pointer;
      color: var(--text-color);
  }

  .option img {
      margin-right: 8px;
      width: 24px;
      height: 24px;
  }

  .option:hover {
      background-color: var(--option-hover-bg);
  }

  .search {
      padding: 8px;
      border-bottom: 1px solid var(--border-color);
      background-color: var(--input-bg);
  }

  .search input {
      width: 100%;
      padding: 4px;
      background-color: var(--input-bg);
      color: var(--input-text-color);
      border: none;
  }

  .search input::placeholder {
      color: #bbb;
  }
</style>

          <div class="select-wrapper">
              <div class="selected">
                  <img src="" alt="" style="display: none;">
                  <span>${this.selectLabel}</span>
              </div>
              <div class="dropdown">
                  <div class="search">
                      <input type="text" placeholder="Buscar...">
                  </div>
                  <div class="options"></div>
              </div>
          </div>
      `;
  }

  async renderOptions() {
    const optionsContainer = this.shadowRoot.querySelector('.options');
    optionsContainer.innerHTML = '';

    try {
        // Esperamos a que la promesa de options se resuelva
        const options = await this.options;
        if ( options instanceof Promise ) {
          await options;
        }
      if (!options || options.length <= 0 || !options.filter || !options.find) return;
        // Filtramos y renderizamos las opciones después de que la promesa se resuelva
        options
            .filter(option => option.label.toLowerCase().includes(this.searchTerm.toLowerCase()))
            .forEach(option => {
                const optionElement = document.createElement('div');
                optionElement.classList.add('option');
                optionElement.innerHTML = `
                    ${option.image ? `<img src="${option.image}" alt="${option.value}">` : ''}
                    <span>${option.label}</span>
                `;
                optionElement.addEventListener('click', () => this.selectOption(option));
                optionsContainer.appendChild(optionElement);
            });
    } catch (error) {
        console.error('Error al cargar las opciones:', error);
    }
}


  renderSelectedOption() {
      const selectedElement = this.shadowRoot.querySelector('.selected span');
      const selectedImage = this.shadowRoot.querySelector('.selected img');
      
      if (this.selectedOption) {
          selectedElement.textContent = this.selectedOption.label;
          if (this.selectedOption.image) {
              selectedImage.src = this.selectedOption.image;
              selectedImage.style.display = 'block';
          } else {
              selectedImage.style.display = 'none';
          }
      } else {
          selectedElement.textContent = this.selectLabel;
          selectedImage.style.display = 'none';
      }
  }

  setupEventListeners() {
      const selected = this.shadowRoot.querySelector('.selected');
      const dropdown = this.shadowRoot.querySelector('.dropdown');
      const searchInput = this.shadowRoot.querySelector('.search input');

      selected.addEventListener('click', () => {
          dropdown.classList.toggle('open');
      });

      searchInput.addEventListener('input', (e) => {
          this.searchTerm = e.target.value;
          this.renderOptions();
      });
  }

  selectOption(option) {
      this.selectedOption = option;
      this.renderSelectedOption();
      this.shadowRoot.querySelector('.dropdown').classList.remove('open');
      this.dispatchEvent(new CustomEvent('change', { detail: option }));
  }
}

customElements.define('custom-select', CustomSelect);
class CustomMultiSelect extends HTMLElement {
  constructor(config) {
      super();
      this.attachShadow({ mode: 'open' });
      this.options = [];
      this.selectedOptions = [];
      this.searchTerm = '';
      this.render();
      this.config = config;
      this.selectlabel = "Seleccione opciones";
  }

  connectedCallback() {
      this.setupEventListeners();
  }

  // Getter para la propiedad 'value'
  get value() {
      return this.selectedOptions.map(opt => opt.value);
  }

  // Setter para la propiedad 'value'
  set value(newValues) {
      if (Array.isArray(newValues)) {
          this.setValues(newValues);
      }
  }

  setOptions(options) {
      this.options = options;
      this.renderOptions();
  }
  setlabel(label) {
    this.selectlabel = label || "Select";
    return this.selectlabel
  }
  async setValues(values) {
    // si this optios es una promesa o si no es un array, entonces esperamos a que se resuelva
      if ( this.options instanceof Promise ) {
        await this.options;
      }
      // Actualizar las opciones seleccionadas
      this.selectedOptions = this.options.filter(opt => values.includes(opt.value));
      
      // Actualizar la visualización de las opciones seleccionadas en el área superior
      this.renderSelectedOptions();
      
      // Actualizar los checkboxes en el dropdown
      this.updateCheckboxes();

      // Disparar el evento de cambio
      this.dispatchEvent(new CustomEvent('change', { 
          detail: {
              values: this.value,
              selectedOptions: this.selectedOptions
          }
      }));
  }

  updateCheckboxes() {
      // Obtener todas las opciones en el dropdown
      const optionElements = this.shadowRoot.querySelectorAll('.option');
      
      // Actualizar cada opción
      optionElements.forEach(optionElement => {
          const label = optionElement.querySelector('span').textContent;
          const isSelected = this.selectedOptions.some(opt => opt.label === label);
          
          if (isSelected) {
              optionElement.classList.add('selected');
          } else {
              optionElement.classList.remove('selected');
          }
      });
  }

  render() {
      this.shadowRoot.innerHTML = `
      <style>
          :host {
              --background-color: #1a1a1a;
              --text-color: #e0e0e0;
              --border-color: #333;
              --option-hover-bg: #2a2a2a;
              --input-bg: #252525;
              --input-text-color: #e0e0e0;
              --chip-bg: #333;
              --chip-text: #fff;
              --chip-hover: #444;
              --scrollbar-thumb: #444;
              --scrollbar-track: #1a1a1a;
              --checkbox-checked-bg: #4a4a4a;
              --checkbox-border: #555;
          }

          .select-wrapper {
              position: relative;
              width: 300px;
              font-family: system-ui, -apple-system, sans-serif;
          }

          .selected-area {
              min-height: 44px;
              padding: 8px;
              border: 1px solid var(--border-color);
              background-color: var(--background-color);
              color: var(--text-color);
              cursor: pointer;
              border-radius: 4px;
              display: flex;
              flex-wrap: wrap;
              gap: 6px;
              align-items: center;
          }

          .chip {
              background-color: var(--chip-bg);
              color: var(--chip-text);
              padding: 4px 8px;
              border-radius: 16px;
              display: flex;
              align-items: center;
              gap: 4px;
              font-size: 14px;
          }

          .chip img {
              width: 16px;
              height: 16px;
              border-radius: 50%;
          }

          .chip .remove {
              cursor: pointer;
              margin-left: 4px;
              opacity: 0.7;
          }

          .chip .remove:hover {
              opacity: 1;
          }

          .placeholder {
              color: #666;
          }

          .dropdown {
              display: none;
              position: absolute;
              top: 100%;
              left: 0;
              right: 0;
              margin-top: 4px;
              border: 1px solid var(--border-color);
              border-radius: 4px;
              background: var(--background-color);
              z-index: 1000;
              box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
          }

          .dropdown.open {
              display: block;
          }

          .search {
              padding: 8px;
              border-bottom: 1px solid var(--border-color);
          }

          .search input {
              width: 100%;
              padding: 8px;
              background-color: var(--input-bg);
              color: var(--input-text-color);
              border: 1px solid var(--border-color);
              border-radius: 4px;
              outline: none;
          }

          .search input:focus {
              border-color: #505050;
          }

          .options {
              max-height: 200px;
              overflow-y: auto;
              padding: 4px 0;
          }

          .options::-webkit-scrollbar {
              width: 8px;
          }

          .options::-webkit-scrollbar-thumb {
              background: var(--scrollbar-thumb);
              border-radius: 4px;
          }

          .options::-webkit-scrollbar-track {
              background: var(--scrollbar-track);
          }

          .option {
              display: flex;
              align-items: center;
              padding: 8px 12px;
              cursor: pointer;
              color: var(--text-color);
              gap: 8px;
          }

          .option:hover {
              background-color: var(--option-hover-bg);
          }

          .option.selected {
              background-color: var(--checkbox-checked-bg);
          }

          .option img {
              width: 24px;
              height: 24px;
              border-radius: 50%;
          }

          .checkbox {
              width: 16px;
              height: 16px;
              border: 2px solid var(--checkbox-border);
              border-radius: 3px;
              display: flex;
              align-items: center;
              justify-content: center;
              transition: background-color 0.2s;
          }

          .option.selected .checkbox {
              background-color: var(--chip-bg);
              border-color: var(--chip-bg);
          }

          .option.selected .checkbox::after {
              content: "✓";
              color: var(--chip-text);
              font-size: 12px;
          }
      </style>

      <div class="select-wrapper">
          <div class="selected-area">
              <span class="placeholder">${this.selectlabel}</span>
          </div>
          <div class="dropdown">
              <div class="search">
                  <input type="text" placeholder="Buscar...">
              </div>
              <div class="options"></div>
          </div>
      </div>`;
  }

  renderOptions() {
      const optionsContainer = this.shadowRoot.querySelector('.options');
      optionsContainer.innerHTML = '';
      
      this.options
          .filter(option => option.label.toLowerCase().includes(this.searchTerm.toLowerCase()))
          .forEach(option => {
              const optionElement = document.createElement('div');
              optionElement.classList.add('option');
              if (this.selectedOptions.some(selected => selected.value === option.value)) {
                  optionElement.classList.add('selected');
              }
              
              optionElement.innerHTML = `
                  <div class="checkbox"></div>
                  ${option.image ? `<img src="${option.image}" alt="${option.label}">` : ''}
                  <span>${option.label}</span>
              `;
              
              optionElement.addEventListener('click', () => this.toggleOption(option));
              optionsContainer.appendChild(optionElement);
          });
  }

  renderSelectedOptions() {
      const selectedArea = this.shadowRoot.querySelector('.selected-area');
      const placeholder = selectedArea.querySelector('.placeholder');
      
      // Eliminar los chips existentes
      const existingChips = selectedArea.querySelectorAll('.chip');
      existingChips.forEach(chip => chip.remove());

      if (this.selectedOptions.length === 0) {
          placeholder.style.display = 'block';
      } else {
          placeholder.style.display = 'none';
          
          this.selectedOptions.forEach(option => {
              const chip = document.createElement('div');
              chip.classList.add('chip');
              chip.innerHTML = `
                  ${option.image ? `<img src="${option.image}" alt="${option.label}">` : ''}
                  <span>${option.label}</span>
                  <span class="remove">✕</span>
              `;
              
              chip.querySelector('.remove').addEventListener('click', (e) => {
                  e.stopPropagation();
                  this.toggleOption(option);
              });
              
              selectedArea.appendChild(chip);
          });
      }
  }

  setupEventListeners() {
      const selectedArea = this.shadowRoot.querySelector('.selected-area');
      const dropdown = this.shadowRoot.querySelector('.dropdown');
      const searchInput = this.shadowRoot.querySelector('.search input');

      selectedArea.addEventListener('click', () => {
          dropdown.classList.toggle('open');
          if (dropdown.classList.contains('open')) {
              searchInput.focus();
          }
      });

      searchInput.addEventListener('input', (e) => {
          this.searchTerm = e.target.value;
          this.renderOptions();
      });

      document.addEventListener('click', (e) => {
          if (!this.contains(e.target)) {
              dropdown.classList.remove('open');
          }
      });
  }

  toggleOption(option) {
      const index = this.selectedOptions.findIndex(selected => selected.value === option.value);
      
      if (index === -1) {
          this.selectedOptions.push(option);
      } else {
          this.selectedOptions.splice(index, 1);
      }
      
      this.renderSelectedOptions();
      this.renderOptions();
      this.dispatchEvent(new CustomEvent('change', { 
          detail: {
              values: this.value,
              selectedOptions: this.selectedOptions
          }
      }));
  }
}

customElements.define('custom-multi-select', CustomMultiSelect);
class UserProfile extends HTMLElement {
  constructor() {
      super();
      this.attachShadow({ mode: 'open' });
      
      // Singleton instance
      if (!UserProfile.instance) {
          UserProfile.instance = this;
          
          this.state = {
              connected: false,
              username: '',
              imageUrl: 'https://via.placeholder.com/100/1a1a2e',
              language: 'es',
              connectionStatus: 'offline' // nuevo: 'offline', 'online', 'away', 'busy'
          };

          this.translations = {
              es: {
                  connect: 'Conectar',
                  disconnect: 'Desconectar',
                  placeholder: 'Ingresa tu nombre',
                  status: {
                      offline: 'Desconectado',
                      online: 'En línea',
                      away: 'Ausente',
                      busy: 'Ocupado'
                  }
              },
              en: {
                  connect: 'Connect',
                  disconnect: 'Disconnect',
                  placeholder: 'Enter your name',
                  status: {
                      offline: 'Offline',
                      online: 'Online',
                      away: 'Away',
                      busy: 'Busy'
                  }
              },
              fr: {
                  connect: 'Se connecter',
                  disconnect: 'Se déconnecter',
                  placeholder: 'Entrez votre nom',
                  status: {
                      offline: 'Hors ligne',
                      online: 'En ligne',
                      away: 'Absent',
                      busy: 'Occupé'
                  }
              },
              pt: {
                  connect: 'Conectar',
                  disconnect: 'Desconectar',
                  placeholder: 'Insira seu nome',
                  status: {
                      offline: 'Offline',
                      online: 'Online',
                      away: 'Ausente',
                      busy: 'Ocupado'
                  }
                },
          };
          
          this.loadFromLocalStorage();
      }

      // Registro de instancias
      if (!UserProfile.instances) {
          UserProfile.instances = new Set();
      }
      UserProfile.instances.add(this);

      // Cada instancia mantiene sus propios listeners
      this.activeListeners = new Set();

      this.render();
      return this;
  }

    static get observedAttributes() {
        return ['minimal'];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (name === 'minimal') {
            this.render();
        }
    }

    get isMinimal() {
        return this.hasAttribute('minimal');
    }

    static updateAllInstances() {
        UserProfile.instances.forEach(instance => {
            instance.render();
        });
    }

    getStyles() {
        // ... (mismos estilos que antes) ...
        return `
            <style>
                .container {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 20px;
                    padding: 20px;
                    background-color: #1a1a2e;
                    border-radius: 8px;
                    color: #fff;
                }
                 .status-indicator {
                    position: absolute;
                    bottom: 10px;
                    right: 10px;
                    width: 20px;
                    height: 20px;
                    border-radius: 50%;
                    border: 2px solid #1a1a2e;
                    transition: all 0.3s ease;
                }

                .status-indicator[data-status="offline"] {
                    background-color: #808080;
                }

                .status-indicator[data-status="online"] {
                    background-color: #4CAF50;
                }

                .status-indicator[data-status="away"] {
                    background-color: #FFC107;
                }

                .status-indicator[data-status="busy"] {
                    background-color: #f44336;
                }
                /* Estilos para modo minimal */
                :host([minimal]) .container {
                    flex-direction: row;
                    padding: 8px;
                    gap: 10px;
                    background-color: transparent;
                }

                .profile-image {
                    width: 120px;
                    height: 120px;
                    border-radius: 50%;
                    object-fit: cover;
                    border: 3px solid #4d7cff;
                    box-shadow: 0 0 15px rgba(77, 124, 255, 0.3);
                    transition: all 0.3s ease;
                }

                :host([minimal]) .profile-image {
                    width: 36px;
                    height: 36px;
                    border-width: 2px;
                }
                :host([minimal]) .status-indicator {
                    width: 12px;
                    height: 12px;
                    bottom: 0;
                    right: 0;
                    border-width: 1px;
                }

                .profile-image:hover {
                    transform: scale(1.05);
                    border-color: #4d9cff;
                }

                input {
                    width: 100%;
                    padding: 12px;
                    background-color: #162447;
                    border: 2px solid #4d9cff;
                    border-radius: 8px;
                    color: #fff;
                    font-size: 14px;
                    transition: all 0.3s ease;
                    box-sizing: border-box;
                }

                :host([minimal]) input {
                    padding: 6px;
                }

                input:focus {
                    outline: none;
                    border-color: #e94560;
                    box-shadow: 0 0 10px rgba(233, 69, 96, 0.2);
                }

                input::placeholder {
                    color: #8a8a9e;
                }

                input:disabled {
                    background-color: #1f1f3d;
                    border-color: #404060;
                    cursor: not-allowed;
                }

                button {
                    width: 100%;
                    padding: 12px 24px;
                    background: linear-gradient(135deg, #4d7cff 0%, #3b5998 100%);
                    color: white;
                    border: none;
                    border-radius: 8px;
                    font-size: 14px;
                    font-weight: bold;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                }

                :host([minimal]) button {
                    width: auto;
                    padding: 6px 12px;
                    font-size: 12px;
                }

                button:hover {
                    background: linear-gradient(135deg, #5a88ff 0%, #4866ab 100%);
                    transform: translateY(-2px);
                    box-shadow: 0 5px 15px rgba(77, 124, 255, 0.3);
                }

                button:active {
                    transform: translateY(0);
                }

                button.connected {
                    background: linear-gradient(135deg, #e94560 0%, #c23152 100%);
                }

                button.connected:hover {
                    background: linear-gradient(135deg, #f25672 0%, #d4405f 100%);
                }
            .profile-wrapper {
                    position: relative;
                    display: inline-block;
                }
            </style>
        `;
    }

    render() {
      const state = UserProfile.instance.state;
      const currentTranslations = UserProfile.instance.translations[state.language];
      
      this.shadowRoot.innerHTML = `
          ${this.getStyles()}
          <div class="container ${state.connected ? 'connected' : ''}">
              <div class="profile-wrapper">
                  <img 
                      class="profile-image" 
                      src="${state.imageUrl}"
                      alt="Profile"
                  />
                  <div 
                      class="status-indicator" 
                      data-status="${state.connectionStatus}"
                      title="${currentTranslations.status[state.connectionStatus]}"
                  ></div>
              </div>
              <input 
                  type="text"
                  placeholder="${currentTranslations.placeholder}"
                  value="${state.username}"
                  ${state.connected ? 'disabled' : ''}
              />
              <button class="${state.connected ? 'connected' : ''}">
                  ${state.connected ? currentTranslations.disconnect : currentTranslations.connect}
              </button>
          </div>
      `;

      this.setupEventListeners();
  }
    setupEventListeners() {
        // Limpia los listeners anteriores de esta instancia
        this.activeListeners.forEach(({ element, type, handler }) => {
            element.removeEventListener(type, handler);
        });
        this.activeListeners.clear();

        const button = this.shadowRoot.querySelector('button');
        const input = this.shadowRoot.querySelector('input');

        // Los handlers usan la instancia singleton para la lógica
        const buttonHandler = () => {
            if (UserProfile.instance.state.connected) {
                UserProfile.instance.disconnect();
            } else if (input.value.trim()) {
                UserProfile.instance.connect(input.value);
            }
        };

        const inputHandler = (e) => {
            UserProfile.instance.state.username = e.target.value;
        };

        button.addEventListener('click', buttonHandler);
        input.addEventListener('input', inputHandler);

        // Guarda las referencias para limpieza
        this.activeListeners.add({ element: button, type: 'click', handler: buttonHandler });
        this.activeListeners.add({ element: input, type: 'input', handler: inputHandler });
    }

    loadFromLocalStorage() {
        const savedState = localStorage.getItem('userProfileState');
        if (savedState) {
            this.state = { ...this.state, ...JSON.parse(savedState) };
        }
    }

    saveToLocalStorage() {
        localStorage.setItem('userProfileState', JSON.stringify(this.state));
    }

    setConnectionStatus(status) {
      if (this !== UserProfile.instance) return;
      
      if (['offline', 'online', 'away', 'busy'].includes(status)) {
          this.state.connectionStatus = status;
          this.saveToLocalStorage();
          UserProfile.updateAllInstances();
          
          this.dispatchEvent(new CustomEvent('connectionStatusChanged', { 
              detail: { status: this.state.connectionStatus }
          }));
      }
  }
    connect(username) {
      if (this !== UserProfile.instance) return;
      
      this.state.connected = true;
      this.state.username = username;
      this.state.imageUrl = 'https://via.placeholder.com/100/4d7cff';
      this.state.connectionStatus = 'online'; // Automáticamente establece online al conectar
      this.saveToLocalStorage();
      UserProfile.updateAllInstances();
      this.dispatchEvent(new CustomEvent('userConnected', { 
          detail: { username: this.state.username }
      }));
  }


    disconnect() {
      if (this !== UserProfile.instance) return;
      
      this.state.connected = false;
      this.state.imageUrl = 'https://via.placeholder.com/100/1a1a2e';
      this.state.username = '';
      this.state.connectionStatus = 'offline'; // Automáticamente establece offline al desconectar
      this.saveToLocalStorage();
      UserProfile.updateAllInstances();
      this.dispatchEvent(new CustomEvent('userDisconnected'));
  }


    setLanguage(lang) {
        if (this !== UserProfile.instance) return;
        
        if (this.translations[lang]) {
            this.state.language = lang;
            this.saveToLocalStorage();
            UserProfile.updateAllInstances();
        }
    }

    setProfileImage(url) {
        if (this !== UserProfile.instance) return;
        
        this.state.imageUrl = url;
        this.saveToLocalStorage();
        UserProfile.updateAllInstances();
    }

    disconnectedCallback() {
        UserProfile.instances.delete(this);
        
        // Limpia los listeners cuando se remueve el elemento
        this.activeListeners.forEach(({ element, type, handler }) => {
            element.removeEventListener(type, handler);
        });
        
        if (this === UserProfile.instance) {
            UserProfile.instance = null;
        }
    }
}

customElements.define('user-profile', UserProfile);
class ResponsiveNavSidebar extends HTMLElement {
    constructor() {
      super();
      this.attachShadow({ mode: 'open' });
  
      this.shadowRoot.innerHTML = `
          <style>
          :host {
            --sidebar-width: 250px;
            --sidebar-bg: #333;
            --nav-bg: #333;
            --text-color: #fff;
            --nav-height: 60px;
            --hover-bg: rgba(255, 255, 255, 0.1);
            --active-bg: #555;
          }
            .container {
              height: 100%;
            }
              .menu-item {
                .active {
                background-color: var(--active-bg);
                color: var(--active-color);
              }
              }
            /* Estilos para navegación superior fija */
            .top-nav {
              display: none;
              position: fixed;
              top: 0;
              left: 0;
              right: 0;
              height: var(--nav-height);
              background: var(--nav-bg);
              color: var(--text-color);
              z-index: 888;
              padding: auto;
            }
    
            .top-nav-content {
              height: 100%;
              display: flex;
              align-items: center;
              justify-content: space-between;
            }
    
            /* Contenedor de items base en el navbar */
            .nav-base-items {
              display: flex;
              align-items: center;
              gap: 20px;
            }
    
            /* Contenedor de items base en el sidebar */
            .sidebar-base-items {
              margin-bottom: 15px;
            }
    
            /* Estilos para el sidebar */
            .sidebar {
              position: fixed;
              left: 0;
              top: 0;
              width: var(--sidebar-width);
              height: 100vh;
              background: var(--sidebar-bg);
              color: var(--text-color);
              overflow-y: auto;
              z-index: 999;
            }
    
            .sidebar-content {
              padding: 20px;
            }
    
            .menu-btn {
              display: none;
              background: none;
              border: none;
              color: var(--text-color);
              font-size: 24px;
              cursor: pointer;
              padding: 10px;
            }
    
            .content {
              margin-left: var(--sidebar-width);
              padding: 20px;
            }
    
            /* Overlay para cerrar el menú en móvil */
            .overlay {
              display: none;
              position: fixed;
              top: 0;
              left: 0;
              right: 0;
              bottom: 0;
              background: rgba(0, 0, 0, 0.5);
              z-index: 800;
            }
    
            /* Estilos para elementos del menú */
            ::slotted(.menu-item) {
              padding: 12px 15px;
              display: flex;
              align-items: center;
              gap: 10px;
              cursor: pointer;
              transition: background-color 0.2s;
              border-radius: 4px;
              margin: 5px 0;
            }
    
            ::slotted(.menu-item:hover) {
              background: var(--hover-bg);
            }
    
            ::slotted(.base-item) {
              padding: 12px 15px;
              display: flex;
              align-items: center;
              gap: 10px;
              cursor: pointer;
              transition: background-color 0.2s;
              border-radius: 4px;
              margin: 5px 0;
            }
    
            ::slotted(.base-item:hover) {
              background: var(--hover-bg);
            }
    
            /* Media query para modo responsive */
            @media (max-width: 768px) {
              .top-nav {
                display: flex;
              }
    
              .content {
                margin-left: 0;
                padding-top: calc(var(--nav-height) + 20px);
              }
    
              .sidebar {
                transform: translateX(-100%);
                transition: transform 0.3s ease;
              }
    
              .sidebar.active {
                transform: translateX(0);
              }
    
              .menu-btn {
                display: block;
              }
    
              .overlay.active {
                display: block;
              }
    
              /* En móvil, ocultamos los items base del sidebar */
              .sidebar-base-items {
                display: none;
              }
    
              /* Y mostramos los del navbar */
              .nav-base-items {
                display: flex;
              }
            }
    
            @media (min-width: 769px) {
              /* En desktop, ocultamos los items base del navbar */
              .nav-base-items {
                display: none;
              }
    
              /* Y mostramos los del sidebar */
              .sidebar-base-items {
                display: block;
              }
            }
          </style>
    
        
        <div class="container">
          <nav class="top-nav">
            <button class="menu-btn">☰</button>
            <div class="nav-base-items">
              <slot name="nav-base-items"></slot>
            </div>
          </nav>
  
          <div class="overlay"></div>
  
          <div class="sidebar">
            <div class="sidebar-base-items">
              <slot name="sidebar-base-items"></slot>
            </div>
            <hr style="border-color: rgba(255,255,255,0.1); margin: 15px 0;">
            <slot name="menu-items"></slot>
          </div>
  
          <div class="content">
            <slot name="main-content"></slot>
          </div>
        </div>
      `;
  
      this.menuBtn = this.shadowRoot.querySelector('.menu-btn');
      this.sidebar = this.shadowRoot.querySelector('.sidebar');
      this.overlay = this.shadowRoot.querySelector('.overlay');
  
      this.menuBtn.addEventListener('click', () => this.toggleMenu());
      this.overlay.addEventListener('click', () => this.closeMenu());
    }
  
    toggleMenu() {
      this.sidebar.classList.toggle('active');
      this.overlay.classList.toggle('active');
    }
  
    closeMenu() {
      this.sidebar.classList.remove('active');
      this.overlay.classList.remove('active');
    }
  }
  
  customElements.define('responsive-nav-sidebar', ResponsiveNavSidebar);
  class TranslateText extends HTMLElement {
    constructor() {
      super();
      this.attachShadow({ mode: 'open' });
    }
  
    connectedCallback() {
      this.updateContent();
      document.addEventListener('languageChanged', () => this.updateContent());
    }
  
    updateContent() {
      const key = this.getAttribute('key');
      const text = TranslateText.translations[TranslateText.currentLanguage][key] || key;
      this.shadowRoot.textContent = text;
    }
  }
  
  // Definición del componente LanguageSelector mejorado
  class LanguageSelector extends HTMLElement {
    static instances = new Set();
    static STORAGE_KEY = 'selectedLanguage';
    
    // Definición de las etiquetas de idioma
    static languageLabels = {
      es: 'Español',
      en: 'English',
      fr: 'Français',
      pt: 'Português',
    };
  
    constructor() {
      super();
      this.attachShadow({ mode: 'open' });
    }
  
    static get observedAttributes() {
      return ['id'];
    }
  
    connectedCallback() {
      LanguageSelector.instances.add(this);
      
      // Cargar el idioma guardado o usar el predeterminado
      TranslateText.currentLanguage = this.loadStoredLanguage();
      
      this.render();
      
      const select = this.shadowRoot.querySelector('select');
      
      // Establecer el valor inicial desde localStorage
      select.value = TranslateText.currentLanguage;
      
      // Agregar event listener para el cambio
      select.addEventListener('change', (e) => {
        const newLanguage = e.target.value;
        
        // Guardar en localStorage
        this.saveLanguage(newLanguage);
        localStorage.setItem('selectedLanguage', newLanguage);
        // Actualizar todos los selectores
        LanguageSelector.updateAllSelectors(newLanguage, this);
        
        // Actualizar el idioma global
        TranslateText.currentLanguage = newLanguage;
        
        // Disparar evento global de cambio de idioma
        document.dispatchEvent(new Event('languageChanged'));
        
        // Disparar evento personalizado en el selector
        this.dispatchEvent(new CustomEvent('languageChange', {
          detail: {
            language: newLanguage,
            selectorId: this.getAttribute('id'),
            label: LanguageSelector.languageLabels[newLanguage]
          },
          bubbles: true,
          composed: true
        }));
      });
    }
  
    disconnectedCallback() {
      LanguageSelector.instances.delete(this);
    }
  
    // Método para guardar el idioma en localStorage
    saveLanguage(language) {
      try {
        localStorage.setItem(LanguageSelector.STORAGE_KEY, language);
      } catch (e) {
        console.warn('No se pudo guardar el idioma en localStorage:', e);
      }
    }
  
    // Método para cargar el idioma desde localStorage
    loadStoredLanguage() {
      try {
        const storedLanguage = localStorage.getItem(LanguageSelector.STORAGE_KEY);
        return storedLanguage || TranslateText.currentLanguage; // Retorna el almacenado o el predeterminado
      } catch (e) {
        console.warn('No se pudo cargar el idioma desde localStorage:', e);
        return TranslateText.currentLanguage;
      }
    }
  
    static updateAllSelectors(newLanguage, exclude = null) {
      LanguageSelector.instances.forEach(selector => {
        if (selector !== exclude) {
          selector.shadowRoot.querySelector('select').value = newLanguage;
        }
      });
    }
  
    // Método público para obtener el idioma actual
    getValue() {
      return this.shadowRoot.querySelector('select').value;
    }
  
    // Método público para obtener la etiqueta del idioma actual
    getLanguageLabel() {
      const currentLanguage = this.getValue();
      return LanguageSelector.languageLabels[currentLanguage];
    }
  
    render() {
      const style = `
        <style>
          select {
            padding: 8px;
            border-radius: 4px;
            border: 1px solid #ccc;
            font-size: 14px;
          }
        </style>
      `;
  
      const currentId = this.getAttribute('id');
      const selectId = currentId ? `id="${currentId}-select"` : '';
  
      this.shadowRoot.innerHTML = `
        ${style}
        <select ${selectId}>
          ${Object.entries(LanguageSelector.languageLabels).map(([code, label]) => 
            `<option value="${code}">${label}</option>`
          ).join('')}
        </select>
      `;
    }
  }
  
  // Configuración global
  const currentLanguage = localStorage.getItem('selectedLanguage') || navigator.language.split('-')[0] || navigator.userLanguage.split('-')[0] || 'es';
  TranslateText.currentLanguage = currentLanguage;
  if (!localStorage.getItem('selectedLanguage')) localStorage.setItem('selectedLanguage',currentLanguage);
  TranslateText.translations = {
    es: {
      hello: 'Hola',
      world: 'Mundo',
      selectlang: 'Seleccionar idioma',
      currentLang: 'Idioma actual',
      selectedLanguage: 'Idioma seleccionado',
      config: 'configuracion',
      configuration: 'Configuración',
      confirm: 'Confirmar',
      cancel: 'Cancelar',
      save: 'Guardar',
      close: 'Cerrar',
      delete: 'Eliminar',
      add: 'Agregar',
      edit: 'Editar',
      remove: 'Eliminar',
      select: 'Seleccionar',
      home: 'inicio',
      addaction: 'Añadir acción',
      addevent: 'Añadir evento',
      actiontable: 'Tabla de acciones',
      eventtable: 'Tabla de eventos',
      voicesettings: 'Configuración de voz',
      selectvoice: 'Seleccionar voz',
      allowedusers: 'Usuarios permitidos',
      commenttypes: 'Tipos de comentarios',
      commenttypes1: 'cualquier comentario',
      commenttypes2: 'comentarios que empiezan con punto (.)',
      commenttypes3: 'comentarios que empiezan con barra (/)',
      commenttypes4: 'comandos que empiezan con comando:',
      filterwords: 'Filtrar palabras',
    },
    en: {
      hello: 'Hello',
      world: 'World',
      selectlang: 'Select language',
      currentLang: 'Current language',
      selectedLanguage: 'Selected language',
      configuration: 'Configuration',
      config: 'configuration',
      confirm: 'Confirm',
      cancel: 'Cancel',
      save: 'Save',
      close: 'Close',
      delete: 'Delete',
      add: 'Add',
      edit: 'Edit',
      remove: 'Remove',
      select: 'Select',
      home: 'home',
      addaction: 'Add action',
      addevent: 'Add event',
      actiontable: 'Action table',
      eventtable: 'Event table',
      voicesettings: 'Voice settings',
      selectvoice: 'Select voice',
      allowedusers: 'Allowed users',
      commenttypes: 'Comment types',
      commenttypes1: 'Any comment',
      commenttypes2: 'Comments starting with dot (.)',
      commenttypes3: 'Comments starting with slash (/)',
      commenttypes4: 'Comments starting with Command:',
      filterwords: 'Filter words',
    },
    fr: {
      hello: 'Bonjour',
      world: 'Monde',
      selectlang: 'Sélectionner la langue',
      currentLang: 'Langue actuelle',
      selectedLanguage: 'Langue sélectionnée',
      configuration: 'Configuration',
      config: 'configurer',
      confirm: 'Confirmer',
      cancel: 'Annuler',
      save: 'Enregistrer',
      close: 'Fermer',
      delete: 'Supprimer',
      add: 'Ajouter',
      edit: 'Modifier le',
      remove: 'Supprimer',
      select: 'Sélectionner',
      home: 'Accueil',
      addaction: 'Ajouter action',
      addevent: 'Ajouter événement',
      actiontable: 'Tableau d\'actions',
      eventtable: 'Tableau d\'événements',
      voicesettings: 'Paramètres de la voix',
      selectvoice: 'Sélectionner la voix',
      allowedusers: 'Utilisateurs autorisés',
      commenttypes: 'Types de commentaires',
      commenttypes1: 'N\'importe quel commentaire',
      commenttypes2: 'Commentaires commençant par un point (.)',
      commenttypes3: 'Commentaires commençant par un barre (/)',
      commenttypes4: 'Commentaires commençant par un commande :',
      filterwords: 'Filtrer les mots',
    },
    pt: {
      show: 'Mostrar',
      activate: 'ativar',
      texttoread: 'texto a ler',
      addelement:"Insira um elemento...",
      connect: 'Conectar',
      close: 'Fechar',
      selectlang: 'Selecionar idioma',
      currentLang: 'Idioma atual',
      selectedLanguage: 'Idioma selecionado',
      configuration: 'Configuração',
      config: 'configuração',
      confirm: 'Confirmar',
      cancel: 'Cancelar',
      savechanges: 'Salvar alterações',
      save: 'Salvar',
      close: 'Fechar',
      delete: 'Excluir',
      add: 'Adicionar',
      edit: 'Editar',
      remove: 'Remover',
      select: 'Selecionar',
      home: 'home',
      Actions: 'Acções',
      Events: 'Eventos',
      addaction: 'Adicionar ação',
      addevent: 'Adicionar evento',
      actiontable: 'Tabela de ações',
      eventtable: 'Tabela de eventos',
      voicesettings: 'Configurações de voz',
      selectvoice: 'Selecionar voz',
      allowedusers: 'Usuários permitidos',
      commenttypes: 'Tipos de comentários',
      commenttypes1: 'Qualquer comentário',
      commenttypes2: 'Comentários que começam com ponto (.)',
      commenttypes3: 'Comentários que começam com barra (/)',
      commenttypes4: 'Comentários que começam com comando:',
      filterwords: 'Filtrar palavras',
    },
    
  };
  
  // Registro de los componentes
  customElements.define('translate-text', TranslateText);
  customElements.define('language-selector', LanguageSelector);
  class CustomModal extends HTMLElement {
    constructor() {
        super();
        this.isOpen = false;
        this.onOpenCallback = null;
        this.onCloseCallback = null;
        
        // Crear un shadow DOM para evitar conflictos de estilos
        this.attachShadow({ mode: 'open' });
        
        // Crear estructura base del modal
        const template = document.createElement('template');
        template.innerHTML = `
            <style>
       :host {
            display: none;
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: 1000;
            /* Agregamos la transición base */
            opacity: 0;
            transition: opacity 0.5s ease;
        }
        /* Cuando está visible */
        :host([visible]) {
            opacity: 1;
        }
        .modal-content {
            background: #1c1c1c;
            padding: 0.5rem;
            border-radius: 5px;
            position: relative;
            min-width: 300px;
            max-height: 95dvh;
            
            opacity: 0;
        }
        :host([visible]) .modal-content {
            transform: scale(1);
            opacity: 1;
        }
                .modal-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(0, 0, 0, 0.5);
                    display: flex;
                    justify-content: center;
                    align-items: center;
                }
                .close-button {
                    position: absolute;
                    top: 10px;
                    right: 10px;
                    background-color: #dc3545;
                    width: 36px;
                    height: 36px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 14px;
                    padding: 0;
                    border-radius: 25%;
                }
                .close-button:hover {
                    background-color: #c82333;
                }
                .modal-body {
                    margin-top: 20px;
                }
                /* Slot styling */
                ::slotted(*) {
                    max-width: 100%;
                }
            </style>
            <div class="modal-overlay">
                <div class="modal-content">
                    <button class="close-button">&times;</button>
                    <div class="modal-body">
                        <slot></slot>
                    </div>
                </div>
            </div>
        `;

        // Agregar la estructura del modal al shadow DOM
        this.shadowRoot.appendChild(template.content.cloneNode(true));
        
        // Obtener referencias dentro del shadow DOM
        this.overlay = this.shadowRoot.querySelector('.modal-overlay');
        this.closeButton = this.shadowRoot.querySelector('.close-button');
        this.modalBody = this.shadowRoot.querySelector('.modal-body');
        
        this.setupEventListeners();
    }

    connectedCallback() {
        // No necesitamos hacer nada aquí ya que la estructura se crea en el constructor
    }

    setupEventListeners() {
        console.log("created modal 123123123123123")
        this.closeButton.addEventListener('click', () => this.close());
        this.overlay.addEventListener('click', (e) => {
            if (e.target === this.overlay) {
                this.close();
            }
        });
    }

    open(onOpenCallback = null) {
        this.onOpenCallback = onOpenCallback;
        this.style.display = 'block';
        // Forzamos un reflow
        this.offsetHeight;
        this.setAttribute('visible', '');
        this.isOpen = true;
        
        if (this.onOpenCallback) {
            this.onOpenCallback();
        }
    }

    close(onCloseCallback = null) {
        this.onCloseCallback = onCloseCallback;
        this.style.display = 'none';
        this.isOpen = false;
        this.removeAttribute('visible');
        // Esperamos a que termine la animación
        setTimeout(() => {
            this.style.display = 'none';
            this.isOpen = false;
            if (this.onCloseCallback) {
                this.onCloseCallback();
            }
        }, 300); // Mismo tiempo que la transición
    }

    // Método mejorado para agregar contenido
    appendChild(element) {
        // Asegurarse de que el elemento se agregue al light DOM
        super.appendChild(element);
    }

    // Método para limpiar y establecer nuevo contenido
    setContent(content) {
        // Limpiar el contenido actual
        while (this.firstChild) {
            this.removeChild(this.firstChild);
        }

        // Agregar el nuevo contenido
        if (typeof content === 'string') {
            const div = document.createElement('div');
            div.innerHTML = content;
            this.appendChild(div);
        } else if (content instanceof Node) {
            this.appendChild(content);
        }
    }

    getContentContainer() {
        return this;
    }
}

// Registrar el componente
customElements.define('custom-modal', CustomModal);

class CustomButton extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.events = {};  // Almacena los event listeners personalizados
    this.menuItems = [
      { action: 'config', icon: '⚙️', label: 'Config' },
      { action: 'info', icon: 'ℹ️', label: 'Info' }
    ];
    this.render();
  }

  render() {
    this.shadowRoot.innerHTML = /*html*/ `
      <style>
        .button-container {
          display: inline-block;
          position: relative;
          border: none;
          cursor: pointer;
          background-color: var(--button-color, #007bff);
          color: white;
          padding: 0;
          border-radius: 5px;
          overflow: visible; /* Cambiado de hidden a visible */
          word-wrap: break-word;   /* Permite que las palabras largas se rompan */
          text-overflow: ellipsis; /* Mostrar '...' cuando el texto no cabe */
          text-align: center;
          font-size: 16px;
          height: 100%;
          width: 100%;
        }

        .button-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: none;
        }

        .button-text {
          padding: 10px;
        }

        .menu {
          display: none;
        position: absolute;
          bottom: 100%;
          left: 50%;
          transform: translateX(-50%);
          background: #333;
          color: white;
          border-radius: 4px;
          padding: 5px;
          font-size: 12px;
          box-shadow: 0px 0px 5px rgba(0, 0, 0, 0.3);
          z-index: 1000; /* Asegura que esté por encima de otros elementos */
        }

        /* Añadir una flecha al menú */
        .menu::after {
          content: '';
          position: absolute;
          top: 100%;
          left: 50%;
          transform: translateX(-50%);
          border-width: 5px;
          border-style: solid;
          border-color: #333 transparent transparent transparent;
        }

        .menu-icon {
          margin: 0 5px;
          cursor: pointer;
          display: flex;
          align-items: center;
          padding: 2px 5px;
          white-space: nowrap; /* Evita que el texto se rompa */
        }

        .menu-icon:hover {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 3px;
        }

        .menu-icon span {
          margin-left: 5px;
        }

        /* Modificar el comportamiento del hover */
        .button-container:hover .menu {
          display: flex;
          flex-direction: column;
        }
      </style>

      <div class="button-container">
        <img class="button-image" src="" alt="Button Icon" />
        <span class="button-text"><slot></slot></span>
        <div class="menu"></div>
      </div>
    `;

    this.renderMenu();
    this.setupInitialEvents();
  }

  renderMenu() {
    const menu = this.shadowRoot.querySelector('.menu');
    menu.innerHTML = this.menuItems.map(item => `
      <div class="menu-icon" data-action="${item.action}">
        ${item.icon}
        <span>${item.label}</span>
      </div>
    `).join('');
  }

  setupInitialEvents() {
    const buttonContainer = this.shadowRoot.querySelector('.button-container');
    const menu = this.shadowRoot.querySelector('.menu');

    // Detener la propagación de clics en el menú
    menu.addEventListener('click', (event) => {
      event.stopImmediatePropagation();
    });

    // Evento principal del botón
    buttonContainer.addEventListener('click', (event) => {
      if (this.events.click) {
        this.events.click(event);
      } else {
        console.log(`Botón principal ID: ${this.id} ha sido presionado`);
      }
    });

    // Configurar eventos del menú
    this.setupMenuEvents();
  }

  setupMenuEvents() {
    const menuIcons = this.shadowRoot.querySelectorAll('.menu-icon');
    menuIcons.forEach(icon => {
      const action = icon.getAttribute('data-action');
      
      // Eliminar eventos anteriores si existen
      const clone = icon.cloneNode(true);
      icon.parentNode.replaceChild(clone, icon);
      
      // Agregar el nuevo evento
      clone.addEventListener('click', (event) => {
        event.stopImmediatePropagation();
        if (this.events[action]) {
          this.events[action](event);
        } else {
          console.log(`Botón ID: ${this.id} - Acción: ${action}`);
        }
      });
    });
  }

  // Método para agregar o actualizar elementos del menú
  setMenuItem(callback,action, icon, label) {
    const existingItemIndex = this.menuItems.findIndex(item => item.action === action);
    
    if (existingItemIndex !== -1) {
      this.menuItems[existingItemIndex] = { action, icon, label };
    } else {
      this.menuItems.push({ action, icon, label });
    }

    if (callback) {
      this.events[action] = callback;
    }

    this.renderMenu();
    this.setupMenuEvents();
  }

  // Método para remover elementos del menú
  removeMenuItem(action) {
    this.menuItems = this.menuItems.filter(item => item.action !== action);
    delete this.events[action];
    this.renderMenu();
    this.setupMenuEvents();
  }

  // Método para agregar event listeners personalizados
  addCustomEventListener(eventName, callback) {
    this.events[eventName] = callback;
    if (eventName === 'click') return; // Si es el evento principal del botón
    this.setupMenuEvents(); // Actualizar eventos del menú
  }

  // Método para remover event listeners
  removeCustomEventListener(eventName) {
    delete this.events[eventName];
    if (eventName === 'click') return; // Si es el evento principal del botón
    this.setupMenuEvents(); // Actualizar eventos del menú
  }

  static get observedAttributes() {
    return ['color', 'image', 'text'];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (!this.shadowRoot) return;

    switch (name) {
      case 'color':
        this.shadowRoot.querySelector('.button-container').style.setProperty('--button-color', newValue);
        break;
      case 'image':
        const imageElement = this.shadowRoot.querySelector('.button-image');
        const buttonText = this.shadowRoot.querySelector('.button-text');
        imageElement.src = newValue;
        imageElement.style.display = newValue ? 'block' : 'none';
        buttonText.style.display = 'block';
        break;
      case 'text':
        this.textContent = newValue;
        break;
    }
  }

  // Método para establecer propiedades
  setProperties({ color, image, text }) {
    if (color) this.setAttribute('color', color);
    if (image) this.setAttribute('image', image);
    if (text) this.textContent = text;
  }
}

customElements.define('custom-button', CustomButton);
class ZoneRenderer extends HTMLElement {
  constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.elements = []; // Array en lugar de Map
        this.currentPage = 1;
        this.itemsPerPage = 20;
        this.gridSize = 5;
        this.initialize();
    }

    initialize() {
        this.render();
        this.setupEventListeners();
    }

    getTotalPages() {
        return Math.max(1, Math.ceil(Math.max(...Array.from(this.elements.keys()), -1) + 1) / this.itemsPerPage);
    }

    generateGrid() {
      let grid = '';
      const startIndex = (this.currentPage - 1) * this.itemsPerPage;
      
      for (let i = 0; i < this.itemsPerPage; i++) {
          const elementId = startIndex + i;
          const element = this.elements[elementId];
          
          // Puedes añadir una clase diferente si el elemento está vacío
          const isEmpty = !element;
          
          const templategrid = `
              <div class="element-slot ${isEmpty ? 'empty' : ''}" data-id="${elementId}">
                  <div class="element-content">
                      <slot name="element-${elementId}"></slot>
                  </div>
                  <div class="element-id">${elementId}</div>
              </div>
          `;

          grid += templategrid;
      }
      
      return grid;
  }

    render() {
      const totalPages = this.getTotalPages();
      const template = /*html*/ `
          <style>${this.styles}</style>
          <div class="controls">
              <div class="pagination">
                  <button id="prevPage" ${this.currentPage === 1 ? 'disabled' : ''}>←</button>
                  <span>Página ${this.currentPage} de ${totalPages}</span>
                  <button id="nextPage" ${this.currentPage >= totalPages ? 'disabled' : ''}>→</button>
                  <slot name="pagination"></slot>
              </div>
          </div>
          <div class="container">
              ${this.generateGrid()}
          </div>
      `;
      
      this.shadowRoot.innerHTML = template;
      this.setupEventListeners();
  }

    addCustomElement(id, element) {
      // Si el elemento ya existe en el DOM, lo actualizamos
      const existingElement = this.querySelector(`[slot="element-${id}"]`);
      if (existingElement) {
          existingElement.remove();
      }

      // Si es string HTML, creamos un elemento contenedor
      if (typeof element === 'string') {
          const wrapper = document.createElement('div');
          wrapper.innerHTML = element;
          element = wrapper;
      }

      // Asignamos el slot al elemento
      element.slot = `element-${id}`;

      // Añadimos el elemento al array
      // Aseguramos que el array tenga el tamaño necesario
      if (id >= this.elements.length) {
          this.elements.length = id + 1;
      }
      this.elements[id] = element;

      // Añadimos el elemento al DOM
      this.appendChild(element);

      // Actualizamos la vista si es necesario
      if (this.isElementInCurrentPage(id)) {
          this.render();
      }
      return true;
  }

    getElementById(id) {
        return this.querySelector(`[slot="element-${id}"]`);
    }

    updateElementById(id, content) {
        const element = this.getElementById(id);
        if (!element) {
            console.error(`No se encontró elemento con ID: ${id}`);
            return false;
        }

        if (typeof content === 'string') {
            element.innerHTML = content;
        } else if (content instanceof HTMLElement) {
            element.innerHTML = '';
            element.appendChild(content);
        }

        return true;
    }

    // Método auxiliar para calcular el total de páginas
    getTotalPages() {
      // Modificar para contar solo elementos no undefined
      const validElements = this.elements.filter(element => element !== undefined);
      return Math.max(1, Math.ceil(validElements.length / this.itemsPerPage));
    }
  
    initialize() {
      this.render();
      this.setupEventListeners();
    }

    setupEventListeners() {
      const prevButton = this.shadowRoot.getElementById('prevPage');
      const nextButton = this.shadowRoot.getElementById('nextPage');
      
      prevButton.addEventListener('click', () => this.previousPage());
      nextButton.addEventListener('click', () => this.nextPage());
      
      // Configurar drag and drop
      this.setupDragAndDrop();
    }
  

  
    // Método para verificar si un elemento está en la página actual
    isElementInCurrentPage(id) {
      const startIndex = (this.currentPage - 1) * this.itemsPerPage;
      const endIndex = startIndex + this.itemsPerPage;
      return id >= startIndex && id < endIndex;
    }
  
    // Método para obtener la posición disponible más cercana
    getNextAvailablePosition() {
      let position = 0;
      while (this.elements[position] !== undefined) {
          position++;
      }
      return position;
  }
  
    addElement() {
      const nextIndex = this.getNextAvailablePosition();
      const newElement = document.createElement('div');
      newElement.innerHTML = `Elemento ${nextIndex + 1}`;
      newElement.style.padding = '10px';
      
      if (nextIndex >= this.elements.length) {
        this.elements.length = nextIndex + 1;
      }
      this.elements[nextIndex] = newElement;      
      // Calcular si debemos cambiar de página
      const targetPage = Math.ceil((nextIndex + 1) / this.itemsPerPage);
      if (targetPage > this.currentPage) {
        this.currentPage = targetPage;
      }
      
      this.render();
    }
    removeElement(elementId) {
      if (elementId < this.elements.length && elementId >= 0) {
          // Remover el elemento del DOM si existe
          const elementToRemove = this.querySelector(`[slot="element-${elementId}"]`);
          if (elementToRemove) {
              elementToRemove.remove();
          }

          // Eliminar el elemento del array
          this.elements[elementId] = undefined;
          
          // Actualizar la página actual si está vacía
          const totalPages = this.getTotalPages();
          if (this.currentPage > totalPages) {
              this.currentPage = Math.max(1, totalPages);
          }

          this.render();
      }
  }


  
  
    replaceElement(elementId, newElement) {
      if (this.elements[elementId] !== undefined) {
          this.elements[elementId] = newElement;
          this.render();
      }
  }
    previousPage() {
      if (this.currentPage > 1) {
        this.currentPage--;
        this.render();
      }
    }
  
    nextPage() {
      const totalPages = this.getTotalPages();
      if (this.currentPage < totalPages) {
        this.currentPage++;
        this.render();
      }
    }
  

    setupDragAndDrop() {
      const slots = this.shadowRoot.querySelectorAll('.element-slot');
      
      slots.forEach(slot => {
        slot.draggable = true;
        
        slot.addEventListener('dragstart', (e) => {
          e.dataTransfer.setData('text/plain', slot.dataset.id);
          console.log("dragstart")
        });
        
        slot.addEventListener('dragover', (e) => {
          e.preventDefault();
          console.log("dragover")
        });
        
        slot.addEventListener('drop', (e) => {
          e.preventDefault();
          console.log("drop")
          const sourceId = parseInt(e.dataTransfer.getData('text/plain'));
          const targetId = parseInt(slot.dataset.id);
          
          if (sourceId !== targetId) {
            this.swapElements(sourceId, targetId);
            console.log("swap",sourceId,targetId)
          }
        });
      });
    }
    swapElements(sourceId, targetId) {
      console.log("Antes del swap:", {
          sourceId,
          targetId,
          sourceElement: this.elements[sourceId],
          targetElement: this.elements[targetId],
          fullArray: [...this.elements] // Crea una copia para ver todo el array
      });
  
      // Verificar que ambos elementos existen
      if (this.elements[sourceId] === undefined || this.elements[targetId] === undefined) {
          console.error("Uno o ambos elementos no existen");
          return;
      }
  
      // Guardar elementos en variables temporales
      const temp = this.elements[sourceId];
      this.elements[sourceId] = this.elements[targetId];
      this.elements[targetId] = temp;
  
      console.log("Después del swap:", {
          sourceId,
          targetId,
          sourceElement: this.elements[sourceId],
          targetElement: this.elements[targetId],
          fullArray: [...this.elements]
      });
  
      // Actualizar los slots de los elementos
      if (this.elements[sourceId]) {
          this.elements[sourceId].slot = `element-${sourceId}`;
      }
      if (this.elements[targetId]) {
          this.elements[targetId].slot = `element-${targetId}`;
      }
  
      this.render();
  }
  
    // Actualizar estilos para incluir los nuevos elementos
    get styles() {
      return /*css*/ `
        ${super.styles || ''}
        :host {
          display: block;
          width: 100%;
          height: 100%;
        }
        
        .container {
          display: grid;
          grid-template-columns: repeat(${this.gridSize}, 1fr);
          gap: 10px;
          padding: 20px;
          min-height: 500px;
          background: rgba(0, 0, 0, 0.253);
          border-radius: 8px;
        }
        
        .element-slot {
          background: white;
          border: 2px dashed #ccc;
          border-radius: 4px;
          min-height: 100px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        
        .element-slot:hover {
          border-color: #666;
        }
        
        .controls {
          display: flex;
          justify-content: space-between;
          margin-bottom: 20px;
        }
        
        button {
          padding: 8px 16px;
          border: none;
          border-radius: 4px;
          background: #007bff;
          color: white;
          cursor: pointer;
        }
        
        button:hover {
          background: #0056b3;
        }
        
        .pagination {
          display: flex;
          gap: 10px;
          align-items: center;
        }
        .element-slot {
            position: relative;
            background: #1a1a1a;
            border: 2px dashed #3b3939;
            border-radius: 4px;
            min-height: 100px;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: all 0.3s ease;
            padding: 10px;
        }
        
        .element-content {
          width: 100%;
          height: 100%;
          overflow: visible;
        }
        
        .element-id {
          position: absolute;
          top: 5px;
          left: 5px;
          background: rgba(0,0,0,0.1);
          padding: 2px 6px;
          border-radius: 3px;
          font-size: 12px;
        }
        
        .custom-element {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
        }
      `;
    }
  }
  
  // Registrar el componente
  customElements.define('zone-renderer', ZoneRenderer);
  class TabsComponent extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this._panels = new Map();
        this._lastIndex = -1; // Cambiamos _tabCount por _lastIndex para mejor semántica
    }

    connectedCallback() {
        // Crear estructura base del componente
        const wrapper = document.createElement('div');
        wrapper.classList.add('tabs');

        const tabButtons = document.createElement('div');
        tabButtons.classList.add('tab-buttons');

        const tabPanels = document.createElement('div');
        tabPanels.classList.add('tab-panels');

        wrapper.appendChild(tabButtons);
        wrapper.appendChild(tabPanels);

        // Agregar estilos
        const styleSheet = new CSSStyleSheet();
        styleSheet.replaceSync(`
            :host {
                display: block;
                background-color: #1a1a1a;
                color: #ffffff;
                padding: 1rem;
                font-family: Arial, sans-serif;
            }
            .tabs {
                border-radius: 8px;
                overflow: hidden;
            }
            .tab-buttons {
                display: flex;
                background-color: #2d2d2d;
                border-bottom: 2px solid #3d3d3d;
            }
            .tab-button {
                padding: 12px 24px;
                border: none;
                background: none;
                color: #ffffff;
                cursor: pointer;
                font-size: 16px;
                transition: background-color 0.3s;
            }
            .tab-button:hover {
                background-color: #3d3d3d;
            }
            .tab-button.active {
                background-color: #4d4d4d;
                border-bottom: 2px solid #007bff;
            }
            .tab-content {
                display: none;
                padding: 20px;
                background-color: #2d2d2d;
                max-height: 75dvh;
                overflow: auto;
            }
            .tab-content.active {
                display: block;
            }
            ::slotted(*) {
                color: #ffffff;
            }
        `);

        this.shadowRoot.adoptedStyleSheets = [styleSheet];
        this.shadowRoot.appendChild(wrapper);

        // Procesar los tabs iniciales
        this.processTabs();

        // Observar cambios en los hijos
        this._observer = new MutationObserver((mutations) => {
            this.processTabs();
        });
        this._observer.observe(this, { 
            childList: true, 
            subtree: true, 
            attributes: true,
            attributeFilter: ['tab-title', 'slot'] 
        });
    }

    disconnectedCallback() {
        this._observer.disconnect();
    }

    processTabs() {
        const tabButtons = this.shadowRoot.querySelector('.tab-buttons');
        const tabPanels = this.shadowRoot.querySelector('.tab-panels');

        // Limpiar contenido existente manteniendo la estructura
        tabButtons.innerHTML = '';
        tabPanels.innerHTML = '';
        
        // Mantener el Map pero limpiar su contenido
        const oldPanels = new Map(this._panels);
        this._panels.clear();

        // Obtener todos los elementos que tienen un slot asignado
        const elements = Array.from(this.children).filter(child => 
            child.hasAttribute('slot') || child.hasAttribute('tab-title')
        );

        // Si no hay elementos con slot, no hacer nada más
        if (elements.length === 0) {
            this._lastIndex = -1;
            return;
        }

        // Procesar los elementos
        elements.forEach((element) => {
            let slotName = element.getAttribute('slot');
            let index;
            
            // Si tiene slot, extraer el índice
            if (slotName && slotName.startsWith('tab-')) {
                index = parseInt(slotName.replace('tab-', ''));
            } else {
                // Si no tiene slot, asignar el siguiente índice disponible
                index = this._lastIndex + 1;
                slotName = `tab-${index}`;
                element.setAttribute('slot', slotName);
            }

            // Actualizar _lastIndex si es necesario
            this._lastIndex = Math.max(this._lastIndex, index);

            // Crear o reutilizar el botón
            const button = document.createElement('button');
            button.classList.add('tab-button');
            button.textContent = element.getAttribute('tab-title') || `Tab ${index + 1}`;
            if (this._panels.size === 0) button.classList.add('active');

            // Crear contenedor de contenido
            const content = document.createElement('div');
            content.classList.add('tab-content');
            if (this._panels.size === 0) content.classList.add('active');

            // Crear slot
            const slot = document.createElement('slot');
            slot.name = slotName;

            // Almacenar referencia
            this._panels.set(slotName, {
                button,
                content,
                slot,
                panel: element
            });

            // Agregar elementos al DOM
            content.appendChild(slot);
            tabButtons.appendChild(button);
            tabPanels.appendChild(content);

            // Event listener
            button.addEventListener('click', () => this.activateTab(index));
        });
    }

    createTab(title = null, index = null) {
        // Si no se proporciona un índice, usar el siguiente disponible
        if (index === null) {
            index = this._lastIndex + 1;
        }
        this._lastIndex = Math.max(this._lastIndex, index);
        
        const slotName = `tab-${index}`;
        
        // Si el tab ya existe, solo actualizar el título
        if (this._panels.has(slotName)) {
            if (title) {
                this.setTabTitle(index, title);
            }
            return index;
        }

        // Crear elementos del tab
        const button = document.createElement('button');
        button.classList.add('tab-button');
        button.textContent = title || `Tab ${index + 1}`;
        if (this._panels.size === 0) button.classList.add('active');

        const content = document.createElement('div');
        content.classList.add('tab-content');
        if (this._panels.size === 0) content.classList.add('active');

        const slot = document.createElement('slot');
        slot.name = slotName;

        // Almacenar referencia
        this._panels.set(slotName, {
            button,
            content,
            slot,
            panel: null
        });

        // Agregar elementos al DOM
        content.appendChild(slot);
        this.shadowRoot.querySelector('.tab-buttons').appendChild(button);
        this.shadowRoot.querySelector('.tab-panels').appendChild(content);

        // Event listener
        button.addEventListener('click', () => this.activateTab(index));

        return index;
    }

    addContent(index, element) {
        const slotName = `tab-${index}`;
        
        // Si el tab no existe, créalo
        if (!this._panels.has(slotName)) {
            this.createTab(null, index);
        }

        // Asignar slot y agregar elemento
        element.slot = slotName;
        this.appendChild(element);
        
        // Actualizar panel en la referencia
        const panelInfo = this._panels.get(slotName);
        if (panelInfo) {
            panelInfo.panel = element;
        }
    }

    setTabTitle(index, title) {
        const slotName = `tab-${index}`;
        const panelInfo = this._panels.get(slotName);
        
        if (panelInfo) {
            panelInfo.button.textContent = title;
            if (panelInfo.panel) {
                panelInfo.panel.setAttribute('tab-title', title);
            }
        }
    }
    activateTab(index) {
      const slotName = `tab-${index}`;
      this._panels.forEach((panelInfo, key) => {
          const isActive = key === slotName;
          panelInfo.button.classList.toggle('active', isActive);
          panelInfo.content.classList.toggle('active', isActive);
      });
  }
    removeContent(index, element) {
        if (element.parentNode === this) {
            this.removeChild(element);
        }
    }

    getPanel(index) {
        return this._panels.get(`tab-${index}`)?.panel;
    }
}

customElements.define('custom-tabs', TabsComponent);
class CustomSlider extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  static get observedAttributes() {
    return ['id', 'label', 'value', 'min', 'max', 'step', 'unit', 'theme', 'layout'];
  }

  connectedCallback() {
    this.render();
    this.setupListeners();
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue !== newValue) {
      this.render();
    }
  }

  getThemeStyles() {
    const themes = {
      default: `
        input[type="range"] {
          background: #ddd;
        }
        input[type="range"]::-webkit-slider-thumb {
          background: #2196F3;
        }
        input[type="range"]::-webkit-slider-thumb:hover {
          background: #1976D2;
        }
      `,
      dark: `
        input[type="range"] {
          background: #444;
        }
        input[type="range"]::-webkit-slider-thumb {
          background: #9c27b0;
        }
        input[type="range"]::-webkit-slider-thumb:hover {
          background: #7b1fa2;
        }
      `,
      minimal: `
        input[type="range"] {
          background: #e0e0e0;
          height: 4px;
        }
        input[type="range"]::-webkit-slider-thumb {
          background: #424242;
          width: 16px;
          height: 16px;
        }
        input[type="range"]::-webkit-slider-thumb:hover {
          background: #212121;
        }
      `,
      audio: `
        input[type="range"] {
          background: linear-gradient(to right, transparent, #4CAF40, #4CAF50, #4CAF60, #FFC107, #f44336);
          height: 6px;
        }
        input[type="range"]::-webkit-slider-thumb {
          background: #fff;
          border: 2px solid #666;
          width: 18px;
          height: 18px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }
        input[type="range"]::-webkit-slider-thumb:hover {
          background: #f5f5f5;
          border-color: #333;
        }
      `
    };

    return themes[this.getAttribute('theme')] || themes.default;
  }
  getLayoutStyles() {
    const layout = this.getAttribute('layout') || 'vertical';
    
    const layouts = {
      vertical: `
        .slider-container {
          flex-direction: column;
          gap: 0.5rem;
        }
      `,
      horizontal: `
        .slider-container {
          flex-direction: row;
          align-items: center;
          gap: 1rem;
        }
        label {
          min-width: 100px;
        }
        input[type="range"] {
          flex: 1;
        }
        .value-display {
          min-width: 60px;
          text-align: right;
        }
      `,
      stacked: `
        .slider-container {
          flex-direction: column;
          gap: 0.5rem;
        }
        .header-container {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        label {
          margin-right: 1rem;
        }
        input[type="range"] {
          width: 100%;
          margin-top: 0.5rem;
        }
      `
    };

    return layouts[layout] || layouts.vertical;
  }
  formatValue(value) {
    const unit = this.getAttribute('unit') || '%';
    // Si es un número decimal, mostrar solo 1 decimal
    return `${parseFloat(value).toFixed(1)}${unit}`;
  }

  render() {
    const id = this.getAttribute('id');
    const label = this.getAttribute('label') || 'Slider';
    const value = this.getAttribute('value') || 50;
    const min = this.getAttribute('min') || 0;
    const max = this.getAttribute('max') || 100;
    const step = this.getAttribute('step') || 1;
    const layout = this.getAttribute('layout') || 'vertical'; // vertical | horizontal

    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          margin: 0.5rem 0;
          font-family: Arial, sans-serif;
        }
        .slider-container {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        label {
          font-weight: bold;
          user-select: none;
        }
        input[type="range"] {
          width: 100%;
          height: 8px;
          border-radius: 4px;
          outline: none;
          -webkit-appearance: none;
          transition: all 0.2s ease;
        }
        input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          cursor: pointer;
          transition: all 0.15s ease-in-out;
        }
        .value-display {
          font-size: 0.9rem;
          user-select: none;
        }
        ${this.getLayoutStyles()}
        ${this.getThemeStyles()}
      </style>
      ${layout === 'stacked' ? `
        <div class="slider-container">
          <div class="header-container">
            <label for="${id}">${label}</label>
            <span class="value-display">${this.formatValue(value)}</span>
          </div>
          <input 
            type="range" 
            id="${id}"
            value="${value}"
            min="${min}"
            max="${max}"
            step="${step}"
          >
        </div>
      ` : `
        <div class="slider-container">
          <label for="${id}">${label}</label>
          <input 
            type="range" 
            id="${id}"
            value="${value}"
            min="${min}"
            max="${max}"
            step="${step}"
          >
          <span class="value-display">${this.formatValue(value)}</span>
        </div>
      `}
    `;
  }

  setupListeners() {
    const slider = this.shadowRoot.querySelector('input');
    const valueDisplay = this.shadowRoot.querySelector('.value-display');

    slider.addEventListener('input', (e) => {
      valueDisplay.textContent = this.formatValue(e.target.value);
      this.dispatchEvent(new CustomEvent('sliderInput', {
        detail: {
          value: e.target.value,
          label: this.getAttribute('label'),
          id: this.getAttribute('id'),
          formattedValue: this.formatValue(e.target.value)
        },
        bubbles: true,
        composed: true
      }));
    });

    slider.addEventListener('change', (e) => {
      this.dispatchEvent(new CustomEvent('sliderChange', {
        detail: {
          value: e.target.value,
          label: this.getAttribute('label'),
          id: this.getAttribute('id'),
          formattedValue: this.formatValue(e.target.value),
        },
        bubbles: true,
        composed: true
      }));
    });
  }

  setValue(value) {
    const slider = this.shadowRoot.querySelector('input');
    const valueDisplay = this.shadowRoot.querySelector('.value-display');
    slider.value = value;
    valueDisplay.textContent = this.formatValue(value);
  }

  getValue() {
    return this.shadowRoot.querySelector('input').value;
  }
}


// Definición del contenedor de sliders
class SliderContainer extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    this.render();
  }

  render() {
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          padding: 1rem;
        }
        .sliders-wrapper {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        ::slotted(custom-slider) {
          margin: 0.25rem 0;
        }
      </style>
      <div class="sliders-wrapper">
        <slot></slot>
      </div>
    `;
  }

  createSlider(config) {
    const slider = document.createElement('custom-slider');
    
    // Configurar todos los atributos posibles
    const attributes = [
      'id', 'label', 'value', 'min', 'max', 
      'step', 'unit', 'theme', 'layout'
    ];
    
    attributes.forEach(attr => {
      if (config[attr] !== undefined) {
        slider.setAttribute(attr, config[attr]);
      }
    });
    
    this.appendChild(slider);
    return slider;
  }

  removeSlider(id) {
    const slider = this.querySelector(`custom-slider[id="${id}"]`);
    if (slider) {
      slider.remove();
    }
  }
}
customElements.define('custom-slider', CustomSlider);
customElements.define('slider-container', SliderContainer);
class ConnectionStatus extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' }); // Creamos el shadow DOM

    // Generar un ID único para esta instancia
    this.id = `connection-status-${Math.random().toString(36).substring(2, 8)}`;

    // Elementos internos
    this._status = 'disconnected'; // Estado inicial
    this._message = 'Desconectado';

    // Creamos la estructura HTML dentro del shadow DOM
    this.shadowRoot.innerHTML = /*html*/`
      <style>
        :host {
          display: flex;
          align-items: center;
          font-family: Arial, sans-serif;
        }
        .flex {
          display: flex;
        }
        .status-circle {
          width: 1.2rem; /* Ajustamos el tamaño del círculo */
          height: 1.2rem;
          border-radius: 50%;
          background-color: gray; /* Color por defecto */
          margin-right: 10px;
          transition: background-color 0.5s ease; /* Animación para el color */
        }
        .status-text {
          font-size: 16px;
          font-weight: bold;
          transition: color 0.5s ease; /* Animación para el texto */
        }
      </style>
      <div class="flex">
        <div class="status-circle"></div>
        <span class="status-text">${this._message}</span>
      </div>
    `;
  }

  // Observar el atributo 'status' para detectar cambios
  static get observedAttributes() {
    return ['status'];
  }

  // Callback que se llama cuando el atributo cambia
  attributeChangedCallback(name, oldValue, newValue) {
    if (name === 'status') {
      this._status = newValue;
      this._updateStatus();
    }
  }

  // Función que actualiza el estado y el color del círculo
  _updateStatus() {
    const circle = this.shadowRoot.querySelector('.status-circle');
    const text = this.shadowRoot.querySelector('.status-text');
    switch (this._status) {
      case 'disconnected':
        circle.style.backgroundColor = 'gray';
        text.textContent = 'Desconectado';
        text.style.color = 'gray'; // Cambiar color del texto a gris
        break;
      case 'connecting':
        circle.style.backgroundColor = 'yellow';
        text.textContent = 'Conectando...';
        text.style.color = 'orange'; // Cambiar color del texto a amarillo
        break;
      case 'connected':
        circle.style.backgroundColor = 'green';
        text.textContent = 'Conectado';
        text.style.color = 'green'; // Cambiar color del texto a verde
        break;
      default:
        circle.style.backgroundColor = 'gray';
        text.textContent = 'Desconectado';
        text.style.color = 'gray'; // Cambiar color del texto a gris
        break;
    }
  }
}

// Registramos el componente customizado
customElements.define('connection-status', ConnectionStatus);
class CustomColorPicker extends HTMLElement {
  constructor() {
      super();
      this.attachShadow({ mode: 'open' });
      this.selectedColor = '#000000';
      this.render();
  }

  get value() {
      return this.selectedColor;
  }

  set value(newValue) {
      this.selectedColor = newValue;
      this.updateColorPreview();
  }

  render() {
      this.shadowRoot.innerHTML = /*html*/`
          <style>
              :host {
                  display: block;
              }
              
              .color-picker-container {
                  display: flex;
                  align-items: center;
                  gap: 10px;
              }

              .color-preview-input {
                  position: relative;
                  width: 50px;
                  height: 50px;
                  cursor: pointer;
              }

              input[type="color"] {
                  position: absolute;
                  top: 0;
                  left: 0;
                  width: 100%;
                  height: 100%;
                  opacity: 0;
                  cursor: pointer;
              }

              .color-preview {
                  width: 100%;
                  height: 100%;
                  border: 2px solid #ccc;
                  border-radius: 4px;
                  background-color: ${this.selectedColor};
              }

              .color-value {
                  font-family: monospace;
                  padding: 5px 10px;
                  border-radius: 4px;
                  font-size: 14px;
              }
              @media (width < 500px) {
                .color-picker-container {
                  display: grid;
                  width: 100%;
                }
                .color-preview-input{
                  justify-self: center;
                  justify-content: center;
                }
              }
          </style>

          <div class="color-picker-container">
              <div class="color-preview-input">
                  <div class="color-preview"></div>
                  <input type="color" value="${this.selectedColor}">
              </div>
              <span class="color-value">${this.selectedColor}</span>
          </div>
      `;

      this.setupEventListeners();
  }

  setupEventListeners() {
      const colorInput = this.shadowRoot.querySelector('input[type="color"]');
      colorInput.addEventListener('input', (e) => {
          this.selectedColor = e.target.value;
          this.updateColorPreview();
          this.dispatchEvent(new CustomEvent('change', {
              detail: { value: this.selectedColor }
          }));
      });
  }

  updateColorPreview() {
      const preview = this.shadowRoot.querySelector('.color-preview');
      const valueDisplay = this.shadowRoot.querySelector('.color-value');
      const colorInput = this.shadowRoot.querySelector('input[type="color"]');
      
      if (preview && valueDisplay && colorInput) {
          preview.style.backgroundColor = this.selectedColor;
          valueDisplay.textContent = this.selectedColor;
          colorInput.value = this.selectedColor;
      }
  }
}

// Registrar el componente
customElements.define('custom-color-picker', CustomColorPicker);
class Queue {
  constructor() {
    this.items = [];
    this.currentIndex = -1;
  }

  enqueue(element) {
    this.items.push(element);
  }

  isEmpty() {
    return this.items.length === 0;
  }

  getCurrent() {
    if (this.currentIndex >= 0 && this.currentIndex < this.items.length) {
      return this.items[this.currentIndex];
    }
    return null;
  }

  next() {
    if (this.currentIndex < this.items.length - 1) {
      this.currentIndex++;
      return this.getCurrent();
    }
    return null;
  }

  previous() {
    if (this.currentIndex > 0) {
      this.currentIndex--;
      return this.getCurrent();
    }
    return null;
  }

  hasMore() {
    return this.currentIndex < this.items.length - 1;
  }
}

class Controlmedia {
  constructor(audioPlayer) {
    this.audioPlayer = audioPlayer;
    this.songQueue = new Queue();
    this.isPlaying = false;
  }

  nextAudio() {
    this.audioPlayer.pause();
    this.audioPlayer.currentTime = 0;
    if (!this.songQueue.isEmpty() && this.songQueue.next()) {
      this.playNextAudio();
    } else {
      this.isPlaying = false;
    }
  }

  playNextAudio() {
    const audioUrl = this.songQueue.getCurrent();
    if (audioUrl) {
      this.audioPlayer.src = audioUrl;
      this.audioPlayer.load();
      this.audioPlayer.play();
    }
  }

  playPreviousAudio() {
    const audioUrl = this.songQueue.previous();
    if (audioUrl) {
      this.audioPlayer.src = audioUrl;
      this.audioPlayer.load();
      this.audioPlayer.play();
    }
  }

  addSong(audioUrl) {
    if (audioUrl) {
      this.songQueue.enqueue(audioUrl);
      if (!this.isPlaying) {
        this.isPlaying = true;
        this.kickstartPlayer();
      }
    }
  }

  kickstartPlayer() {
    this.songQueue.next(); // Comenzar en la primera canción
    this.isPlaying = true;
    this.playNextAudio();

    this.audioPlayer.onended = () => {
      this.nextAudio();
    };
  }
}

class AudioPlayer extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.audioElement = document.createElement('audio');
    this.controlmedia = new Controlmedia(this.audioElement);
    this.render();
    this.setupEventListeners();
  }

  addToQueue(source) {
    this.controlmedia.addSong(source);
  }

  render() {
    this.shadowRoot.innerHTML = `
      <style>
        .audio-player {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 1rem;
          padding: 1rem;
        }
        .audio-player button {
          background-color: #4CAF50;
          border: none;
          color: white;
          padding: 0.5rem;
          text-align: center;
          text-decoration: none;
          display: inline-block;
          font-size: 1rem;
          cursor: pointer;
        }
        .audio-player input[type="range"] {
          width: 200px;
        }
      </style>
      <div class="audio-player">
        <button id="prev-btn">Prev</button>
        <button id="play-btn">Play</button>
        <button id="next-btn">Next</button>
        <input type="range" id="volume-slider" min="0" max="1" step="0.01" value="0.5">
      </div>
    `;
    this.playBtn = this.shadowRoot.getElementById('play-btn');
    this.prevBtn = this.shadowRoot.getElementById('prev-btn');
    this.nextBtn = this.shadowRoot.getElementById('next-btn');
    this.volumeSlider = this.shadowRoot.getElementById('volume-slider');
  }

  setupEventListeners() {
    this.playBtn.addEventListener('click', () => {
      if (this.audioElement.paused) {
        this.controlmedia.playNextAudio();
      } else {
        this.audioElement.pause();
      }
    });

    this.prevBtn.addEventListener('click', () => {
      this.controlmedia.playPreviousAudio();
    });

    this.nextBtn.addEventListener('click', () => {
      this.controlmedia.nextAudio();
    });

    this.volumeSlider.addEventListener('input', (event) => {
      this.audioElement.volume = event.target.value;
    });
  }
}

customElements.define('audio-player', AudioPlayer);
