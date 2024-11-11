class DynamicRow {
    constructor(data, columns, config, callback) {
      this.HtmlContainer = table;
      this.data = data;
      this.columns = columns;
      this.config = config;
      this.callback = callback.callback;
      this.originalData = { ...data }; // Guardamos los datos originales
      this.modifiedData = JSON.parse(JSON.stringify(data)); // Inicializamos modifiedData con una copia profunda de originalData
    }
  
    renderDivs() {
      const container = document.createElement('div');
      container.classList.add('dynamic-row-container');
  
      this.columns.forEach(async (key) => {
        const typeConfig = this.config[key];
  
  
  
        const value = this.data[key];
        const itemContainer = document.createElement('div');
        itemContainer.classList.add('dynamic-row-item');
        if (typeConfig && typeConfig.hidden) {
          itemContainer.style.display = 'none';
          return;
        }
        if (typeConfig && typeConfig.type === 'object') {
          const objectContainer = document.createElement('details');
          if (typeConfig.open) {
            objectContainer.setAttribute('open', '');
          }
          const summary = document.createElement('summary');
          //console.log("typeConfig summary", typeConfig, key);
          
          summary.textContent = typeConfig.label || `${getTranslation('show')} ${getTranslation(key)}`;
  
          objectContainer.appendChild(summary);
  
          Object.keys(typeConfig).forEach(async (subKey) => {
            if (subKey === 'type' || subKey === 'open') return;
            if(subKey === 'dataAssociated') {
              //console.log("subKey dataAssociated",subKey,typeConfig[subKey])
              // const associated = subKey === 'dataAssociated' ? 'data-associated' : 'data-associated2';
              // objectContainer.setAttribute(associated, typeConfig[subKey]);
              setAttributes(objectContainer, 'data-associated' , typeConfig[subKey]);
  
              return;
            }
            const subConfig = typeConfig[subKey];
            const subValue = value ? value[subKey] : undefined;
            let inputElement = this.createInputElement(key, subKey, subValue, subConfig, itemContainer);
            if (inputElement instanceof Promise){
              inputElement = await inputElement;
            }
            if (inputElement) {
              const wrapper = document.createElement('div');
              wrapper.classList.add('input-wrapper');
  
              if (subConfig.label && subConfig.label !== '' && subConfig.type !== 'checkbox') {
                const label = document.createElement('label');
                label.textContent = subConfig.label;
                wrapper.appendChild(label);
              }
  
              wrapper.appendChild(inputElement);
              objectContainer.appendChild(wrapper);
            }
          });
  
           itemContainer.appendChild(objectContainer);
        } else {
            let inputElement = this.createInputElement(key, null, value, typeConfig,container);
            if (inputElement) {
              if (inputElement instanceof Promise){
                inputElement = await inputElement;
              }
                itemContainer.appendChild(inputElement);
            } else {
              itemContainer.textContent = value !== undefined ? value : '';
            }
          }
        container.appendChild(itemContainer);
      });
  
      // Botones de acción
      const actionContainer = document.createElement('div');
      actionContainer.classList.add('action-container');
  
      const saveButton = document.createElement('button');
      saveButton.textContent  = this.callbacktext || getTranslation('savechanges');
      
      saveButton.className = 'savebutton custombutton';
      saveButton.addEventListener('click', () => {
        this.callback(this.originalData, this.modifiedData);
      });
      if (this.deletecallback) {
  
      const deleteButton = document.createElement('button');
      deleteButton.textContent = this.deletecallbacktext || 'Eliminar';
      deleteButton.className = 'deletebutton custombutton';
      deleteButton.addEventListener('click', () => {
        this.deletecallback(this.originalData, this.modifiedData);
      });
  
      actionContainer.appendChild(deleteButton);
      }
      actionContainer.appendChild(saveButton);
      container.appendChild(actionContainer);
  
      return container;
    }
    
     createInputElement(key, subKey, value, typeConfig, HtmlContainer) {
      if (value === undefined && subKey === 'class' || subKey === 'label') {
        // console.log("createInputElement return", key, subKey, value, typeConfig);
        return null;
      }
      // if (value === undefined) return;
      let inputElement;
  
      // Manejar el tipo de elemento según el typeConfig.type
      switch (typeConfig?.type) {
        case 'slider':
          inputElement = this.createSliderElement(key, subKey, value, typeConfig);
          break;
        case 'checkbox':
          inputElement = this.createCheckboxElement(key, subKey, value, typeConfig);
          break;
        case 'number':
          inputElement = this.createNumberElement(key, subKey, value);
          break;
        case 'number2':
          inputElement = this.createNumberElement2(key, subKey, value);
          break;
        case 'text':
        case 'string':
          inputElement = this.createTextElement(key, subKey, value);
          break;
        case 'text2':
        case 'string2':
          inputElement = this.createTextElement2(key, subKey, value);
          break;
        case 'textarea2':
        case 'textarea':
          inputElement = this.createtexareaElement(key, subKey, value);
          break;
        case 'select':
          inputElement = this.createSelectElement(key, subKey, value, typeConfig, HtmlContainer);
          break;
        case 'select2':
          inputElement = this.createSelect2Element(key, subKey, value, typeConfig, HtmlContainer);
          break;
        case 'multiSelect':
          inputElement = this.createMultiSelectElement(key, subKey, value, typeConfig);
          break;
        case 'color':
          inputElement = this.createColorField(key, subKey, value, typeConfig, HtmlContainer);
          break;
        case 'radio':
          inputElement = this.createRadioElement(key, subKey, value, typeConfig, HtmlContainer);
          break;
        case 'button': 
          console.log("createButtonElement",key, subKey, value, typeConfig, HtmlContainer);
          inputElement = this.createButtonElement(key, subKey, value, typeConfig, HtmlContainer);
          break;
        default:
          // Por defecto, crear un input type="text"
          inputElement = this.createTextElement(key, subKey, value);
      }
  
      // Agregar clase si existe
      if (typeConfig?.class) {
        inputElement.className = typeConfig.class;
      }
      // if (typeConfig.dataAssociated || typeConfig.dataAssociated2) {
      //       const associated = typeConfig.dataAssociated ? 'data-associated' : 'data-associated2';
      //       inputElement.setAttribute(associated, typeConfig.dataAssociated||typeConfig.dataAssociated2);
      // }
      if (typeConfig.dataAssociated) {
        setAttributes(inputElement, 'data-associated' , typeConfig.dataAssociated);
      }
      return inputElement || document.createTextNode('');
    }
    createButtonElement(key, subKey, value, typeConfig, HtmlContainer) {
      const inputElement = document.createElement('button');
      inputElement.type = 'button';
      inputElement.textContent = subKey || key;
      inputElement.className = typeConfig.class;
      inputElement.addEventListener('click', () => console.log('Boton clickado',key,subKey,value,typeConfig,HtmlContainer));
      return inputElement;
    }
    createTextElement2(key, subKey, value) {
      const inputElement = createInputField({
        type: 'text',
        key,
        subKey,
        value,
        cols: '50',
        rows: '4',
        minHeight: '100px',
        onChange: ({value}) => this.updateModifiedData(key, subKey, value)
      });
  
      return inputElement;
    }
    createNumberElement2(key, subKey, value) {
      const inputElement = createInputField({
        type: 'number',
        key,
        subKey,
        value,
        onChange: ({value}) => this.updateModifiedData(key, subKey, value)
      });
  
      return inputElement;
    }
    async createSelectElement(key, subKey, value, typeConfig, HtmlContainer) {
      const divElement = document.createElement('div');
      divElement.classList.add('div-select');
      const selectElement = document.createElement('select');
      selectElement.id = key;
      selectElement.classList.add('select');
      
      // Solución 1: Verificar que options sea un array y esperar si es una promesa
      if (typeConfig.options) {
          let options = typeConfig.options;
          
          // Si options es una promesa, esperamos a que se resuelva
          if (options instanceof Promise) {
              options = await options;
          }
          
          // Verificamos que sea un array antes de usar forEach
          if (Array.isArray(options)) {
              // Usamos un for...of en lugar de forEach para manejar async/await correctamente
              for (const option of options) {
                  const optionElement = document.createElement('option');
                  
                  if (typeof option.value === 'object') {
                      optionElement.value = option.value.index;
                      optionElement.textContent = option.label;
                      optionElement.selected = option.value.index === value;
                  } else {
                      optionElement.value = option.value;
                      optionElement.textContent = option.label;
                      optionElement.selected = option.value === value;
                  }
                  
                  selectElement.appendChild(optionElement);
              }
          } else {
              console.warn('typeConfig.options no es un array:', options);
          }
      }
  
      selectElement.value = value;
  
      if (typeConfig.toggleoptions) {
          setTimeout(() => this.handletoggleoptions(subKey, value, HtmlContainer), 500);
      }
  
      selectElement.addEventListener('change', () => {
          this.updateModifiedData(key, subKey, selectElement.value);
          if (typeConfig.toggleoptions) {
              this.handletoggleoptions(subKey, selectElement.value, HtmlContainer);
          }
      });
  
      const labelElement = document.createElement('label');
      divElement.appendChild(selectElement);
      
      if (typeConfig.label) {
          labelElement.classList.add('label');
          labelElement.setAttribute('for', key);
          divElement.appendChild(labelElement);
      }
  
      return divElement;
  }
  
    createSelect2Element(key, subKey, value, typeConfig, HtmlContainer) { 
      const divElement = document.createElement('div');
      const selectComponent = document.createElement('custom-select');
      selectComponent.setOptions(typeConfig.options);
      selectComponent.setValue(value);  // Establecer valor predeterminado
      if (typeConfig.toggleoptions) setTimeout(this.handletoggleoptions(subKey, value, HtmlContainer), 500);
      // Añadir el evento change
      selectComponent.addEventListener('change', (e) => {
          console.log('Seleccionado:', e.detail);
          console.log('Valor:', selectComponent.getValue());
          console.log('mySelect:', selectComponent.value);
          this.updateModifiedData(key, subKey, selectComponent.value);
          if (typeConfig.toggleoptions) this.handletoggleoptions(subKey, selectComponent.value, HtmlContainer);
          
        });
  
      const labelElement = document.createElement('label');
      divElement.appendChild(selectComponent);
      if (typeConfig.label) {
        selectComponent.setLabel(typeConfig.label);
        labelElement.classList.add('label');
        labelElement.setAttribute('for', key);
        divElement.appendChild(labelElement);
      }
      return divElement
    }
    createRadioElement(key, subKey, value, typeConfig, HtmlContainer) {
      const divElement = document.createElement('div');
      divElement.classList.add('div-radio-group');
      const uniquename = key + '_' + Math.random().toString(36).substring(2, 15);
      console.log("select",typeConfig);
  
      if (typeConfig.options) {
          typeConfig.options.forEach(async (option) => {
              const radioWrapper = document.createElement('div');
              radioWrapper.classList.add('radio-wrapper');
              
              const radioElement = document.createElement('input');
              radioElement.type = 'radio';
              radioElement.name = uniquename;
              radioElement.id = `${key}_${option.value}`; // Unique ID for each radio
              radioElement.value = typeof option.value === 'object' ? option.value.index : option.value;
              radioElement.checked = radioElement.value == value; // Marca como seleccionado si coincide con el valor actual
              
              const labelElement = document.createElement('label');
              labelElement.textContent = option.label;
              labelElement.classList.add('label');
              labelElement.setAttribute('for', radioElement.id);
  
              radioWrapper.appendChild(radioElement);
              radioWrapper.appendChild(labelElement);
              divElement.appendChild(radioWrapper);
  
              // Listener para actualizar el valor seleccionado
              radioElement.addEventListener('change', () => {
                  if (radioElement.checked) {
                      this.updateModifiedData(key, subKey, radioElement.value);
                      if (typeConfig.toggleoptions) {
                          this.handletoggleoptions(subKey, radioElement.value, HtmlContainer);
                      }
                  }
              });
          });
      }
  
      if (typeConfig.toggleoptions) {
          setTimeout(() => {
              this.handletoggleoptions(subKey, value, HtmlContainer);
          }, 500);
      }
  
      return divElement;
    }
  
    createSliderElement(key, subKey, value, typeConfig) {
      const inputElement = document.createElement('input');
      inputElement.type = 'range';
      inputElement.min = typeConfig.min || 0;
      inputElement.max = typeConfig.max || 100;
      inputElement.step = typeConfig.step || inputElement.max / 10;
      inputElement.value = value;
  
      inputElement.addEventListener('input', () => {
        const returnValue = typeConfig.returnType === 'number' ? Number(inputElement.value) : inputElement.value;
        this.updateModifiedData(key, subKey, returnValue);
      });
  
      return inputElement;
    }
  
    createCheckboxElement(key, subKey, value, typeConfig) {
      const wrapper = document.createElement('div');
      wrapper.classList.add('checkbox-wrapper'); // Clase para ajustar el tamaño
  
      const inputElement = document.createElement('input');
      inputElement.type = 'checkbox';
      inputElement.checked = value;
      inputElement.id = `${key}_${subKey}_${Math.random().toString(36).substring(2, 15)}`; // Generar un id único
      inputElement.className = 'checkbox-4';
      const labelElement = document.createElement('label');
      labelElement.setAttribute('for', inputElement.id); // Relacionar el label con el checkbox
      labelElement.textContent = typeConfig.label || subKey; // Texto del label o ajusta según tus necesidades
  
      inputElement.addEventListener('change', () => {
        const returnValue = inputElement.checked;
        this.updateModifiedData(key, subKey, returnValue);
      });
  
      wrapper.appendChild(inputElement);
      wrapper.appendChild(labelElement);
  
      return wrapper;
    }
  
    createNumberElement(key, subKey, value) {
      const inputElement = document.createElement('input');
      inputElement.type = 'number';
      inputElement.value = value;
      const subkeylabel = subKey ? subKey : inputElement.type
      inputElement.placeholder = key + ' ' + subkeylabel ;
  
      inputElement.addEventListener('input', () => {
        const returnValue = Number(inputElement.value);
        this.updateModifiedData(key, subKey, returnValue);
      });
  
      return inputElement;
    }
  
    createTextElement(key, subKey, value) {
      const inputElement = document.createElement('input');
      inputElement.type = 'text';
      inputElement.value = value || '';
      const subkeylabel = subKey ? subKey : inputElement.type
      inputElement.placeholder = key + ' ' +subkeylabel;
  
      inputElement.addEventListener('input', () => {
        const returnValue = inputElement.value;
        this.updateModifiedData(key, subKey, returnValue);
      });
  
      return inputElement;
    }
    createtexareaElement(key, subKey, value) {
      const inputElement = document.createElement('textarea');
      inputElement.value = value || '';
      inputElement.autocomplete = 'on';
      const subkeylabel = subKey ? subKey : inputElement.type
      inputElement.placeholder = key + ' ' +subkeylabel;
      // console.log("createtexareaElement", key, subKey, value);
      inputElement.cols = 50;
      inputElement.addEventListener('input', () => {
        const returnValue = inputElement.value;
        this.updateModifiedData(key, subKey, returnValue);
      });
      return inputElement;
    }
    createMultiSelectElement(key, subKey, value, typeConfig) {
      const fieldConfig = {
        label: typeConfig.label,
        options: typeConfig.options,
        name: key,
      };
      // console.log("createMultiSelectElement", fieldConfig,value);
      const multiSelectField = createMultiSelectField(fieldConfig, (selectedValues) => {
        this.updateModifiedData(key, subKey, selectedValues);
      }, value);
  
      return multiSelectField;
    }
    createColorField(key, subKey, value, typeConfig, HtmlContainer) {
      const fieldConfig = {
        label: typeConfig.label,
        options: typeConfig.options,
        name: key,
      };
      // console.log("createMultiSelectElement", fieldConfig,value);
      const colorField = createColorField(fieldConfig, (selectedColor) => {
        this.updateModifiedData(key, subKey, selectedColor);
      }, value);
      return colorField;
    }
    updateModifiedData(key, subKey, value) {
      if (subKey) {
        if (!this.modifiedData[key]) {
          this.modifiedData[key] = {};
        }
        this.modifiedData[key][subKey] = value;
      } else {
        this.modifiedData[key] = value;
      }
    }
    handletoggleoptions(key, subKey, HtmlContainer, dataAttributes = []) {
      const dataAbase = 'data-associated'
      dataAttributes.push(`${dataAbase}-0`,`${dataAbase}-1`,`${dataAbase}-2`,dataAbase);
      // Crear el selector combinando todos los atributos
      const selector = dataAttributes.map(attr => `[${attr}]`).join(',');
      const fields = HtmlContainer.querySelectorAll(selector);
      
      if (!fields.length) return;
  
      fields.forEach(field => {
          // Verificar si alguno de los atributos coincide con subKey
          const matches = dataAttributes.some(attr => 
              field.getAttribute(attr) === subKey
          );
  
          field.style.display = matches ? 'block' : 'none';
      });
  }
  
    updateData(newData) {
      this.data = { ...newData };
      this.originalData = { ...newData };
      this.modifiedData = JSON.parse(JSON.stringify(newData));
      // Limpiar el contenedor actual donde se están mostrando los divs
      const containerElement = this.HtmlContainer;
      containerElement.innerHTML = ''; // Limpiar el contenido
  
      // Renderizar los nuevos divs
      const newDivs = this.renderDivs();
      containerElement.appendChild(newDivs); // Agregar los nuevos divs al DOM
    }
  
  }
  function createMultiSelectField1(field, onChangeCallback, value) {
    const container = document.createElement('div');
    container.classList.add('input-field', 'col', 's12', 'gap-padding-margin-10');
  
    const label = document.createElement('label');
    label.textContent = field.label;
  
    // Campo de búsqueda
    const searchInput = document.createElement('input');
    searchInput.type = 'text';
    searchInput.placeholder = 'Buscar...';
    searchInput.classList.add('search-input', 'center-text');
  
    // Contenedor de las opciones
    const gridSelect = document.createElement('div');
    gridSelect.classList.add('grid-select');
  
    // Función para renderizar las opciones
    function renderOptions(options) {
      gridSelect.innerHTML = '';  // Limpiar las opciones actuales
      options.forEach(option => {
        const checkbox = document.createElement('label');
        checkbox.classList.add('grid-select__option');
  
        const input = document.createElement('input');
        input.type = 'checkbox';
        input.name = field.name;
        // Guardamos directamente el valor del objeto, no su versión string
        input.value = typeof option.value === 'object' ? option.value.index : option.value;
        input.dataset.id = option.id;
        input.classList.add('filled-in');
  
        // Comprobar si esta opción está seleccionada y marcarla
        if (Array.isArray(value) && value.includes(String(input.value))) {
          input.checked = true; // Marcar como seleccionado
        }
  
        const labelText = document.createElement('span');
        labelText.textContent = option.label;
  
        // Escuchar cambios en los checkboxes y pasar el valor actualizado al callback
        input.addEventListener('change', () => {
          const selectedValues = Array.from(gridSelect.querySelectorAll('input[type="checkbox"]:checked'))
            .map(checkbox => checkbox.value); // Ahora estamos pasando los valores correctos
          onChangeCallback(selectedValues);
        });
  
        checkbox.appendChild(input);
        checkbox.appendChild(labelText);
        gridSelect.appendChild(checkbox);
      });
    }
    console.log("field",field)
    // Inicializar las opciones
    renderOptions(field.options);
  
    // Filtrar opciones en base al texto ingresado en el buscador
    searchInput.addEventListener('input', function () {
      const searchTerm = this.value.toLowerCase();
      const options = gridSelect.querySelectorAll('.grid-select__option');
  
      options.forEach(option => {
        const labelText = option.querySelector('span').textContent.toLowerCase();
        if (labelText.includes(searchTerm)) {
          option.classList.remove('hidden');
        } else {
          option.classList.add('hidden');
        }
      });
    });
  
    container.appendChild(label);
    container.appendChild(searchInput);  // Agregar el campo de búsqueda
    container.appendChild(gridSelect);
  
    return container;
  }
  function createMultiSelectField(field, onChangeCallback, initialValue) {
    // Create container div
    const container = document.createElement('div');
    container.classList.add('input-field', 'col', 's12', 'gap-padding-margin-10');
  
    // Create label if needed
    if (field.label) {
        const label = document.createElement('label');
        label.textContent = field.label;
        container.appendChild(label);
    }
  
    // Create the custom multi-select element
    const multiSelect = document.createElement('custom-multi-select');
    
    // Set the options
    const formattedOptions = field.options.map(option => ({
        value: typeof option.value === 'object' ? option.value.index : option.value,
        label: option.label,
        id: option.id,
        image: option.image // If your options include images
    }));
    
    multiSelect.setOptions(formattedOptions);
    
    // Set initial value if provided
    if (Array.isArray(initialValue)) {
        multiSelect.value = initialValue;
    }
  
    // Set custom label if needed
    if (field.placeholder) {
        multiSelect.setlabel(field.placeholder);
    }
  
    // Add change event listener
    multiSelect.addEventListener('change', (event) => {
        const selectedValues = event.detail.values;
        if (typeof onChangeCallback === 'function') {
            onChangeCallback(selectedValues);
        }
    });
  
    container.appendChild(multiSelect);
    return container;
  }
  function createColorField(field, onChangeCallback, initialValue) {
    const container = document.createElement('div');
    container.classList.add('input-field', 'col', 's12', 'gap-padding-margin-10');
  
    if (field.label) {
        const label = document.createElement('label');
        label.textContent = field.label;
        container.appendChild(label);
    }
  
    const colorPicker = document.createElement('custom-color-picker');
    
    if (initialValue) {
        colorPicker.value = initialValue;
    }
  
    colorPicker.addEventListener('change', (event) => {
        const selectedColor = event.detail.value;
        if (typeof onChangeCallback === 'function') {
            onChangeCallback(selectedColor);
        }
    });
  
    container.appendChild(colorPicker);
    return container;
  }
  function createInputField({
    type = 'text',
    key = '',
    subKey = '',
    value = '',
    cols = '50',
    rows = '4',
    minHeight = '100px',
    onChange = null
  } = {}) {
    const inputField = document.createElement('input-field');
    
    // Establecer atributos
    inputField.setAttribute('type', type);
    inputField.setAttribute('key', key);
    if (subKey) inputField.setAttribute('subkey', subKey);
    if (value) inputField.setAttribute('value', value);
    if (type === 'textarea') {
        inputField.setAttribute('cols', cols);
        inputField.setAttribute('rows', rows);
        inputField.setAttribute('minheight', minHeight);
    }
    
    // Establecer callback si existe
    if (onChange) {
        inputField.onChange = onChange;
    }
    
    return inputField;
  }
  function setAttributes(element, attribute, value) {
    if (typeof value === 'object' && value !== null) {
        // Si es un objeto, itera sobre sus propiedades
        Object.entries(value).forEach(([key, val]) => {
            element.setAttribute(`${attribute}-${key}`, val);
        });
    } else {
        // Si no es un objeto, establece el atributo directamente
        element.setAttribute(attribute, value);
    }
  }
  export class EditModal {
    constructor(containerSelector, callback, config = {}) {
      this.HtmlContainer = document.querySelector(containerSelector) || containerSelector;
      this.config = config;
      this.callback = callback;
      // this.HtmlContainer = document.createElement('div');
      this.columns = this.getOrderedElements(config); // Establece las columnas en el orden deseado
      this.renderelement = new DynamicRow(this.HtmlContainer, {}, this.columns, this.config, this.callback);
    }
    render(data) {
      this.renderelement = new DynamicRow(this.HtmlContainer, data, this.columns, this.config, this.callback);
      const renderhtml = this.renderelement.renderDivs();
      if (!this.HtmlContainer || this.HtmlContainer) console.log(this.HtmlContainer);
      this.HtmlContainer.appendChild(renderhtml);
      console.log("renderhtml", renderhtml);
    }
    ReturnHtml(data){
      this.renderelement = new DynamicRow(this.HtmlContainer, data, this.columns, this.config, this.callback);
      const renderhtml = this.renderelement.renderDivs();
      return renderhtml;
    }
    addRow(data) {
      this.renderelement = new DynamicRow(this.HtmlContainer, data, this.columns, this.config, this.callback);
      const renderhtml = renderelement.renderDivs();
      return renderhtml
    }
    getOrderedElements(config) {
      return Object.keys(config);
    }
    fillEmptyFields(data) {
      const filledData = { ...data }; // Copia los datos recibidos sin modificarlos
  
      this.columns.forEach((key) => {
        const columnConfig = this.config[key];
  
        if (columnConfig && columnConfig.type === 'object') {
          // Si el campo es un objeto, comprobamos cada subcampo
          filledData[key] = data[key] || {}; // Si no existe el objeto en los datos, lo inicializamos
          Object.keys(columnConfig).forEach(subKey => {
            if (subKey !== 'type' && !(subKey in filledData[key])) {
              filledData[key][subKey] = ''; // Añadimos solo los subcampos que faltan
            }
          });
        } else if (!(key in filledData)) {
          // Si el campo no es un objeto y no existe en los datos, lo añadimos vacío
          filledData[key] = '';
        }
      });
  
      return filledData;
    }
    updateData(newData) {
      this.renderelement.updateData(newData)
    }
    updateconfig(newConfig) {
      this.config = newConfig
    }
  }