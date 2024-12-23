import DynamicTable, { EditModal } from '../components/renderfields.js';
import { databases, IndexedDBManager, DBObserver } from '../database/indexdb.js'
import { Counter, TypeofData,ComboTracker, replaceVariables, compareObjects,UserInteractionTracker } from '../utils/utils.js'
import showAlert from '../components/alerts.js';
import {mapsvgoutline, mapsvgsolid} from "../assets/svg.js"
import { getTranslation, translations } from '../translations.js';
import { sendcommandmc } from './Minecraftconfig.js'
import { Replacetextoread, addfilterword } from './speechconfig.js'
import { mapedarrayobs, getAllscenes,getAllinputs,getSourceActive,setCurrentScene,GetSceneItemList,setSourceVisibility,connectobs, arrayobs,executebykeyasync } from './obcontroller.js'
const ObserverActions = new DBObserver();
const ActionsManager = new IndexedDBManager(databases.ActionsDB,ObserverActions);
function replaceNestedValue(obj, path, newValue) {
  const keys = path.split('.');
  const lastKey = keys.pop();

  // Clonar el objeto original profundamente
  const newObject = JSON.parse(JSON.stringify(obj));
  let current = newObject;

  // Recorrer las claves excepto la última
  for (const key of keys) {
      // Crear el objeto anidado si no existe
      if (!current[key]) current[key] = {};
      current = current[key];
  }

  // Cambiar el valor de la clave final
  current[lastKey] = newValue;

  return newObject;
}
function replaceMultipleValues(obj, replacements) {
  const newObject = JSON.parse(JSON.stringify(obj)); // Clonar el objeto original profundamente

  replacements.forEach(({ path, value }) => {
      const keys = path.split('.');
      const lastKey = keys.pop();
      let current = newObject;

      keys.forEach(key => {
          if (!current[key]) current[key] = {}; // Crear el objeto anidado si no existe
          current = current[key];
      });

      current[lastKey] = value; // Cambiar el valor de la clave final
  });

  return newObject;
}
const actionsconfig = {
  nombre: {
    class: 'input-default',
    type: 'text',
    returnType: 'string',
  },
  color: {
    class: 'input-default',
    label: 'color',
    type: 'color',
    returnType: 'string',
  },
  image: {
    class: 'input-default',
    type: 'select2',
    returnType: 'string',
    options: mapsvgoutline,
  },
  minecraft:{
    type: 'object',
    label: 'Minecraft Comands',
    check: {
      class: 'filled-in',
      label: 'check',
      type: 'checkbox',
      returnType: 'boolean',
    },
    command: {
      class: 'input-default',
      label: '',
      type: 'textarea2',
      returnType: 'string',
    },
  },
  tts: {
    label: 'TTS',
    type: 'object',
    check: {
      class: 'filled-in',
      label: 'check',
      type: 'checkbox',
      returnType: 'boolean',
    },
    text: {
      class: 'input-default',
      type: 'text2',
      returnType: 'string',
    },
  },
  obs: {
    type: 'object',
    check: {
      class: 'filled-in',
      type: 'checkbox',
      returnType: 'boolean',
      label: 'OBS action',
    },
    action: {
      class: 'filled-in',
      type: 'select2',
      returnType: 'string2',
      options: mapedarrayobs,
      toggleoptions: true,
    },
  },
  params: {
    type: 'object',
    label: 'parameters',
    inputName: {
      class: 'select-default',
      type: 'select2',
      label: 'Select input',
      returnType: 'string',
      options: returnlistofinputs(await getAllinputs()),
    },
    db:{
      class: 'input-default',
      label: 'decibelios input',
      type: 'number2',
      returnType: 'number',
    },
    toggle: {
      class: 'input-default',
      type: 'checkbox',
      returnType: 'boolean',
      label: 'toggle',
    },
    duration: {
      class: 'input-default',
      type: 'number2',
      returnType: 'number',
    },
    sceneName: {
      class: 'select-default',
      type: 'select2',
      label: 'Select scene',
      returnType: 'string',
      options: mapgetAllscenesScenenameSceneindex(getAllscenes()),
      toggleoptions: true,
    },
    ...(await returnlistofsources(getAllscenes())), 
  },
  save: {
    class: 'default-button',
    type: 'button',
    label: getTranslation('savechanges'),
    callback: async (data,modifiedData) => {
      console.log("data",data,modifiedData)
      const alldata = await ActionsManager.getAllData()
      const keysToCheck = [
        { key: 'nombre', compare: 'isEqual' },
      ];
      const callbackFunction = (matchingObject, index, results) => {
        console.log(`Objeto coincidente encontrado en el índice ${index}:`, matchingObject, results);
      };
      const primerValor = objeto => Object.values(objeto)[0];
      const primeraKey = objeto => Object.keys(objeto)[0];
    
      const results = compareObjects(modifiedData, alldata, keysToCheck, callbackFunction);
      console.log("results",results)
      if (results.validResults.length >= 1) {
        showAlert('error',`Objeto coincidente, cambie el ${primeraKey(results.coincidentobjects)}:`)
      } else {
        ActionModal.close();
        ActionsManager.saveData(modifiedData)
        showAlert('success','Se ha guardado el evento')
      }
    },
  },
  close: {
    class: 'default-button deletebutton',
    type: 'button',
    label: getTranslation('close'),
    callback: async (data,modifiedData) => {
      console.log("closebutton",data,modifiedData);
      ActionModal.close();
    },
  },
  id: {
    type: 'number',
    returnType: 'number',
    hidden: true,
  }
} 
async function mapgetAllscenesScenenameSceneindex(scenesPromise) {
  // Espera a que la promesa se resuelva antes de proceder
  const scenes = await scenesPromise;
  console.log("mapgetAllscenesScenenameSceneindex",scenes);

  // Ahora que `scenes` es un array, puedes usar `map()`
  return await Promise.all(scenes.map(async (scene) => {
    return {
      value: scene.sceneName,
      label: scene.sceneName,
      sceneIndex: scene.sceneIndex
    };
  }));
}
async function returnlistofsources(sceneNamePromise) {
  const sceneName = await sceneNamePromise;
  console.log("returnlistofsources", sceneName);
  
  // Create an array to store all promises
  const promises = sceneName.map(scene => 
    GetSceneItemList(scene.sceneName).then(sources => {
      const sourcemapoptions = sources.sceneItems.map(source => ({
        value: source.sceneItemId,
        label: source.sourceName,
        sceneIndex: source.sceneIndex
      }));
      
      // Return an object with the scene name as key
      return {
        [scene.sceneName]: {
          class: 'select-default',
          type: 'select2',
          label: [scene.sceneName]+" sources",
          returnType: 'string',
          options: sourcemapoptions,
          dataAssociated:{
            1: [scene.sceneName]
          },
          hidden: true,
        }
      };
    })
  );

  // Wait for all promises to resolve and combine the results
  const results = await Promise.all(promises);
  
  // Combine all objects into a single object
  return Object.assign({}, ...results);
}
async function returnlistofinputs(arrayinputs) {
  console.log("returnlistofinputs",arrayinputs);
  const options = arrayinputs.map(input => ({
    value: input.inputName,
    label: input.inputName,
  }));
  console.log("options",options);
  return options;
}
const ActionModal = document.getElementById('ActionModal');
const Buttonform  = document.getElementById('ActionModalButton');
const testdata = {
  nombre: getTranslation('nombre de la accion'),
  color: "#000000",
  image: "",
  minecraft: {
    check: false,
    command: getTranslation('command_mc'),
  },
  tts: {
    check: false,
    text: getTranslation('texttoread'),
  },
  obs: {
    check: true,
    action: 'setCurrentScene',
  },
  params: {
    inputName: 'Camera',
    sceneName: 'Scene',
    duration: 60,
    toggle: true,
    db: 0,
  },
  id: undefined,
}
const callbackconfig = {
  deletecallback: async (data,modifiedData) => {
    ActionModal.close();
    console.log("deletecallback",data,modifiedData);
    updateDataByIdformmodal(testdata)
  },
  callbacktext: getTranslation('savechanges'),
  deletecallbacktext: getTranslation('close'),
};
const Aformelement = new EditModal(actionsconfig);
const HtmlAformelement = Aformelement.ReturnHtml(testdata);
document.querySelector('#ActionModalContainer').appendChild(HtmlAformelement);
Buttonform.className = 'open-modal-btn';
Buttonform.onclick = () => {
  updateDataByIdformmodal(testdata)
  ActionModal.open();
};
function updateDataByIdformmodal(data = testdata) {
  Aformelement.updateData(data.id,data)
}

/*tabla de Actions para modificar y renderizar todos los datos*/

const tableconfigcallback = {
  callback: async (data,modifiedData) => {
    console.log("callbacktable",data,modifiedData);
    ActionsManager.updateDataById(data.id,modifiedData)
  },
  deletecallback:  async (data,modifiedData) => {
    const index = await table.getRowIndex(data);
    //console.log("callbacktabledelete table.getRowIndex(data)",index,data,modifiedData);
    table.removeRow(index);
    ActionsManager.deleteData(data.id)
  },
}
const renderer = document.getElementById('zone-renderer');
console.log("renderer",renderer)
async function execobsaction(data) {
  if (data.obs && data.obs?.check) {
    //const valueobsaction arrayobs = getValueByKey(data.obs.action,mapedarrayobs);
    //console.log("valueobsaction",valueobsaction,mapedarrayobs)
    const valueobsaction = getValueByKey(data.obs.action,arrayobs);
    console.log("valueobsaction getValueByKey",valueobsaction,data)
    if (valueobsaction.function) {
      const params = valueobsaction.requiredparams
      let paramsarray = []
      params.forEach((param,index) => {
        //console.log("data[param]",data.params[param])
        const value = data.params[param]
        if (value || value >= 0) paramsarray.push(value);
      })
      console.log("params",params,paramsarray)
      if (paramsarray.length > 0) valueobsaction.function(...paramsarray);
      if (paramsarray.length === 0) {
        const response = await executebykeyasync(valueobsaction.name)
        console.log("response",response)
      }
      console.log("valueobsaction.function",valueobsaction.function)
    }
  }
}
function getValueByKey(value, object) {
  return object[value];
}
function tablereemplazebutton(data) {
  let copydata = JSON.parse(JSON.stringify(data));
  copydata.forEach((data) => {
    replaceNestedValue(data.actionsconfig,data.buttonkey,data.callback)
  });
  return copydata;
}
const tablereplacements = [
  {
    path: 'save.callback',
    value: tableconfigcallback.callback
  },
  {
    path: 'close.callback',
    value: tableconfigcallback.deletecallback
  },
  {
    path: 'save.label',
    value: getTranslation('savechanges')
  },
  {
    path: 'close.label',
    value: getTranslation('delete')
  }
]
const table = new DynamicTable('#table-containerAction',replaceMultipleValues(actionsconfig,tablereplacements));
(async () => {
  const alldata = await ActionsManager.getAllData()
  // alldata.forEach((data) => {
  //   table.addRow(data);
  // });
  // envez de foreach usar un for
   for (let i = 0; i < alldata.length; i++) {
     table.addRow(alldata[i]);
    const newbutton = addCustomButton(alldata[i]);
    renderer.addCustomElement(alldata[i].id,newbutton);
  }
  console.log("alldata render table",alldata);
})  (); 
function addCustomButton(data) {
  const button = document.createElement('custom-button');
  button.id = data.id;
  button.setAttribute('color', data.color);
  button.setAttribute('image',data.image);
  button.textContent = data.nombre;
  button.addCustomEventListener('click', (event) => {
    console.log('Botón principal clickeado',event,data);
    if (data && data.obs) {execobsaction(data)}
  });
  
  console.log(data,"alldata[i]")
  button.setMenuItem(
   (event) => { // nuevo callback
     console.log('Nueva configuración',data);
   },
   'info', // action
   '🔧', // nuevo icono
   'info', // nuevo texto
 );

 // 4. Agregar un nuevo elemento al menú
 button.setMenuItem(
   (event) => {
     console.log('config elemento',data);
   },
   'config',
   '🗑️',
   'config',
 );
 return button;
}
ObserverActions.subscribe(async (action, data) => {
  if (action === "save") {
    // table.clearRows();
    // const dataupdate = await ActionsManager.getAllData();
    // dataupdate.forEach((data) => {
    //   table.addRow(data);
    // });
    console.log("dataupdate",action,data)
    table.addRow(data);
    addCustomButton(data);
  } else if (action === "delete") {
/*     table.clearRows();
    const dataupdate = await ActionsManager.getAllData();
    dataupdate.forEach((data) => {
      table.addRow(data);
    }); */
    console.log("dataupdate",action,data)
    renderer.removeElement(data);
  }
  else if (action === "update") {
    // table.clearRows();
    // const dataupdate = await ActionsManager.getAllData();
    // dataupdate.forEach((data) => {
    //   table.addRow(data);
    // });
    const newbuttonchange = addCustomButton(data);
    renderer.addCustomElement(data.id,newbuttonchange);
    showAlert ('info', "Actualizado", "1000");
  }
});
export { actionsconfig,ActionsManager }