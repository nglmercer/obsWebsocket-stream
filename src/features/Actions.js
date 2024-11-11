import DynamicTable, { EditModal } from '../components/renderfields.js';
import { databases, IndexedDBManager, DBObserver } from '../database/indexdb.js'
import { Counter, TypeofData,ComboTracker, replaceVariables, compareObjects,UserInteractionTracker } from '../utils/utils.js'
import showAlert from '../components/alerts.js';
import { getTranslation, translations } from '../translations.js';
import { sendcommandmc } from './Minecraftconfig.js'
import { Replacetextoread, addfilterword } from './speechconfig.js'
import { mapedarrayobs, getAllscenes,getAllinputs,getSourceActive,setCurrentScene,GetSceneItemList,setSourceVisibility,connectobs } from './obcontroller.js'
const ObserverActions = new DBObserver();
const ActionsManager = new IndexedDBManager(databases.ActionsDB,ObserverActions);


const actionsconfig = {
  nombre: {
    class: 'input-default',
    type: 'text',
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
    number: {
      class: 'input-default',
      type: 'number',
      returnType: 'number',
      dataAssociated: {
        1: 'setInputVolume',
        2: 'createClip',
      }
    },
    toggle: {
      class: 'input-default',
      type: 'checkbox',
      returnType: 'boolean',
      label: 'toggle',
      dataAssociated: {
        1: 'setAudioMute',
        2: 'setSourceVisibility',
      }
    },
  },
  sceneandsource: {
    type: 'object',
    label: 'scene and source',
    inputlist: {
      class: 'select-default',
      type: 'select2',
      label: 'Select input',
      returnType: 'string',
      options: returnlistofinputs(await getAllinputs()),
    },
    scenelist: {
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
    number: 60,
    toggle: true,
  },
  sceneandsource: {
    inputlist: 'Camera',
    scenelist: 'Scene',
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
const table = new DynamicTable('#table-containerAction',tableconfigcallback,actionsconfig);
(async () => {
  const alldata = await ActionsManager.getAllData()
  alldata.forEach((data) => {
    table.addRow(data);
  });
  console.log("alldata render table",alldata);
})  (); 
ObserverActions.subscribe(async (action, data) => {
  if (action === "save") {
    table.clearRows();
    const dataupdate = await ActionsManager.getAllData();
    dataupdate.forEach((data) => {
      table.addRow(data);
    });
  } else if (action === "delete") {
/*     table.clearRows();
    const dataupdate = await ActionsManager.getAllData();
    dataupdate.forEach((data) => {
      table.addRow(data);
    }); */
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