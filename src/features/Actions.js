import DynamicTable, { EditModal } from '../components/renderfields.js';
import { databases, IndexedDBManager, DBObserver } from '../database/indexdb.js'
import { Counter, TypeofData,ComboTracker, replaceVariables, compareObjects,UserInteractionTracker } from '../utils/utils.js'
import showAlert from '../components/alerts.js';
import { getTranslation, translations } from '../translations.js';
import { sendcommandmc } from './Minecraftconfig.js'
import { Replacetextoread, addfilterword } from './speechconfig.js'
import { mapedarrayobs, getAllscenes,getAllinputs,getSourceActive,setCurrentScene,GetSceneItemList,setSourceVisibility,connectobs, arrayobs,executebykeyasync } from './obcontroller.js'
const ObserverActions = new DBObserver();
const ActionsManager = new IndexedDBManager(databases.ActionsDB,ObserverActions);


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
      type: 'textarea',
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
      type: 'text',
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
      returnType: 'string',
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
      type: 'number',
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
      type: 'number',
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
// async function returnlistofsources(sceneNamePromise) {
//   const sceneName = await sceneNamePromise;
//   console.log("returnlistofsources",sceneName);
//   let arrayofsources = [];
//   for (let i = 0; i < sceneName.length; i++) {
//     console.log("sceneName[i]",sceneName[i]);
//     GetSceneItemList(sceneName[i].sceneName).then((sources) => {
//       console.log("sources",sources);
//       const sourcemapoptions = sources.sceneItems.map((source) => ({
//         value: source.sceneItemId,
//         label: source.sourceName,
//         sceneIndex: source.sceneIndex
//       }));
//       const objectorceobject = objectsorceobject(sourcemapoptions, sceneName[i].sceneName);
//       arrayofsources.push(objectorceobject);
//       console.log("arrayofsources",arrayofsources, objectorceobject);
//     });
//   }
// }
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
const editcallback = async (data,modifiedData) => {
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
}
const deletecallback =  async (data,modifiedData) => {
  ActionModal.close();
  console.log("deletecallback",data,modifiedData);
  updatedataformmodal(testdata)
} 
const callbackconfig = {
  callback: editcallback,
  deletecallback:  deletecallback,
  callbacktext: getTranslation('savechanges'),
  deletecallbacktext: getTranslation('close'),
};
const Aformelement = new EditModal('#ActionModalContainer',callbackconfig,actionsconfig);

Aformelement.render(testdata);
Buttonform.className = 'open-modal-btn';
Buttonform.onclick = () => {
  updatedataformmodal(testdata)
  ActionModal.open();
};
function updatedataformmodal(data = testdata) {
  Aformelement.updateData(data)
  Aformelement.fillEmptyFields(data)
}

/*tabla de Actions para modificar y renderizar todos los datos*/
const callbacktable = async (index,data,modifiedData) => {
  console.log("callbacktable",data,modifiedData);
  ActionsManager.updateData(modifiedData)
}
const callbacktabledelete = async (index,data,modifiedData) => {
  console.log("callbacktabledelete",data,modifiedData);
  table.removeRow(table.getRowIndex(data));
  ActionsManager.deleteData(data.id)
}
const tableconfigcallback = {
  callback: callbacktable,
  deletecallback: callbacktabledelete,
  callbacktext: getTranslation('savechanges'),
  deletecallbacktext: getTranslation('delete'),
}
const renderer = document.querySelector('zone-renderer');
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
function valuebyKeyArrayObj(value,ArrayObj) {
  // Buscar el objeto en el array donde 'value' coincida con el valor buscado
  const result = ArrayObj.find(item => item.value === value);
  return result ? result : undefined; // Si se encuentra, devuelve el objeto; si no, devuelve undefined
}

const table = new DynamicTable('#table-containerAction',tableconfigcallback,actionsconfig);
(async () => {
  const alldata = await ActionsManager.getAllData()
  // alldata.forEach((data) => {
  //   table.addRow(data);
  // });
  // envez de foreach usar un for
   for (let i = 0; i < alldata.length; i++) {
     table.addRow(alldata[i]);
    addCustomButton(alldata[i]);
  }
  console.log("alldata render table",alldata);
})  (); 
function addCustomButton(data) {
  const button = document.createElement('custom-button');
  button.id = data.id;
  button.setAttribute('color', data.color);
  button.textContent = data.nombre;
  renderer.addCustomElement(data.id,button);
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
    showAlert ('info', "Actualizado", "1000");
  }
});
export { actionsconfig,ActionsManager }