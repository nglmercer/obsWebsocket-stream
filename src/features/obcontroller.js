import DynamicTable, { EditModal } from '../components/renderfields.js';
import { getTranslation, translations } from '../translations.js';
const container = document.getElementById('container');
const obs = new OBSWebSocket();
const obsconnectdata = {
    ip: {
      class: 'input-default',
      type: 'text',
      returnType: 'string',
      label: 'IP',
    },
    port: {
      class: 'input-default',
      type: 'number',
      returnType: 'number',
      label: 'Puerto',
    },
    auth: {
      class: 'input-default',
      type: 'password',
      returnType: 'string',
      label: 'Contraseña',
    }
}
const defaultobsdata = JSON.parse(localStorage.getItem("defaultobsdata"))|| {
    ip: "localhost",
    port: 4455,
    auth: "change_me",
}
const callbackobs ={
    callback: async (data,modifiedData) => {
        console.log("callbackobs",data,modifiedData);
        localStorage.setItem("defaultobsdata",JSON.stringify(modifiedData));
    },
    callbacktext: getTranslation('connect'),
}
const obsformelement = new EditModal('#ObsModalContainer',callbackobs,obsconnectdata);
const htmlobselement = obsformelement.ReturnHtml(defaultobsdata);
console.log("obsconnectdata",htmlobselement);

class OBSController {
    constructor() {
        this.obs = new OBSWebSocket();
        this.isConnected = false;
    }

    // Connection Methods
    async connect(ip='localhost',port=4455,auth=null) {
        const url = `ws://${ip}:${port}` ||'ws://localhost:4455';
    try {
        if (auth) {
            await this.obs.connect(url, auth);
        } else {
            await this.obs.connect(url);
        }
        this.isConnected = true;
        console.log("Conectado a OBS exitosamente");
    } catch (error) {
        console.error("Error al conectar a OBS:", error);
        this.isConnected = false;
        }
    }

    // Event Handling
    async initializeObsEvents() {
        async function getCurrentProgramSceneName() {
            const { currentProgramSceneName } = await this.obs.call('GetCurrentProgramScene');
            console.log(currentProgramSceneName);
            return currentProgramSceneName;
        }

        function onCurrentSceneChanged(event) {
            console.log('Current scene changed to', event.sceneName);
        }

        this.obs.on('CurrentSceneChanged', onCurrentSceneChanged);

        this.obs.once('ExitStarted', () => {
            console.log('OBS started shutdown');
            this.isConnected = false;
            this.obs.off('CurrentSceneChanged', onCurrentSceneChanged);
        });
    }

    // Getter Methods (Obtain Information)
    async getScenesList() {
        if (!this._checkConnection()) return;
        try {
            const response = await this.obs.call('GetSceneList');
            console.log("Lista de escenas:", response);
            return response;
        } catch (error) {
            this._handleError("obtener la lista de escenas", error);
        }
    }
    async GetSceneItemList(sceneName) {
        if (!this._checkConnection()) return;
        try {
            const response = await this.obs.call('GetSceneItemList', {sceneName});
            console.log("Lista de elementos de la escena:", response);
            return response;
        } catch (error) {
            this._handleError("obtener la lista de elementos de la escena", error);
        }
    }
    async getVersion() {
        if (!this._checkConnection()) return;
        try {
            const response = await this.obs.call('GetVersion');
            console.log("Versión de OBS:", response);
            return response;
        } catch (error) {
            this._handleError("obtener la versión de OBS", error);
        }
    }

    async getStats() {
        if (!this._checkConnection()) return;
        try {
            const response = await this.obs.call('GetStats');
            console.log("Estadísticas del sistema:", response);
            return response;
        } catch (error) {
            this._handleError("obtener estadísticas del sistema", error);
        }
    }

    async getHotkeyList() {
        if (!this._checkConnection()) return;
        try {
            const response = await this.obs.call('GetHotkeyList');
            console.log("Lista de hotkeys:", response);
            return response;
        } catch (error) {
            this._handleError("obtener la lista de hotkeys", error);
        }
    }

    async getProfileList() {
        if (!this._checkConnection()) return;
        try {
            const response = await this.obs.call('GetProfileList');
            console.log("Lista de perfiles:", response);
            return response;
        } catch (error) {
            this._handleError("obtener la lista de perfiles", error);
        }
    }

    async getVideoSettings() {
        if (!this._checkConnection()) return;
        try {
            const response = await this.obs.call('GetVideoSettings');
            console.log("Ajustes de video:", response);
            return response;
        } catch (error) {
            this._handleError("obtener los ajustes de video", error);
        }
    }

    async getRecordDirectory() {
        if (!this._checkConnection()) return;
        try {
            const response = await this.obs.call('GetRecordDirectory');
            console.log("Directorio de grabación:", response);
            return response;
        } catch (error) {
            this._handleError("obtener el directorio de grabación", error);
        }
    }

    async getSourceActive(sourceName) {
        if (!this._checkConnection()) return;
        try {
            const response = await this.obs.call('GetSourceActive', { sourceName });
            console.log(`Estado de actividad de ${sourceName}:`, response);
            return response;
        } catch (error) {
            this._handleError(`obtener el estado de actividad de ${sourceName}`, error);
        }
    }

    async getStreamStatus() {
        if (!this._checkConnection()) return;
        try {
            const response = await this.obs.call('GetStreamStatus');
            console.log("Estado del streaming:", response);
            return response;
        } catch (error) {
            this._handleError("obtener el estado del streaming", error);
        }
    }

    async getRecordStatus() {
        if (!this._checkConnection()) return;
        try {
            const response = await this.obs.call('GetRecordStatus');
            console.log("Estado de grabación:", response);
            return response;
        } catch (error) {
            this._handleError("obtener el estado de grabación", error);
        }
    }

    async getVirtualCamStatus() {
        if (!this._checkConnection()) return;
        try {
            const response = await this.obs.call('GetVirtualCamStatus');
            console.log("Estado de la cámara virtual:", response);
            return response;
        } catch (error) {
            this._handleError("obtener el estado de la cámara virtual", error);
        }
    }

    async getSceneTransitionList() {
        if (!this._checkConnection()) return;
        try {
            const response = await this.obs.call('GetSceneTransitionList');
            console.log("Lista de transiciones:", response);
            return response;
        } catch (error) {
            this._handleError("obtener la lista de transiciones", error);
        }
    }

    async getCurrentSceneTransition() {
        if (!this._checkConnection()) return;
        try {
            const response = await this.obs.call('GetCurrentSceneTransition');
            console.log("Transición actual:", response);
            return response;
        } catch (error) {
            this._handleError("obtener la transición actual", error);
        }
    }

    async getGroupList() {
        if (!this._checkConnection()) return;
        try {
            const response = await this.obs.call('GetGroupList');
            console.log("Lista de grupos:", response);
            return response;
        } catch (error) {
            this._handleError("obtener la lista de grupos", error);
        }
    }

    async getInputList() {
        if (!this._checkConnection()) return;
        try {
            const response = await this.obs.call('GetInputList');
            console.log("Lista de fuentes de entrada:", response);
            return response;
        } catch (error) {
            this._handleError("obtener la lista de fuentes de entrada", error);
        }
    }

    async getAudioSources() {
        if (!this._checkConnection()) return;
        try {
            const response = await this.obs.call('GetSpecialInputs');
            console.log("Lista de fuentes de audio en el mezclador:", response);
            return response;
        } catch (error) {
            this._handleError("obtener las fuentes de audio", error);
        }
    }

    // Setter Methods (Modify State)
    async setCurrentScene(sceneName) {
        if (!this._checkConnection()) return;
        try {
            await this.obs.call('SetCurrentProgramScene', { sceneName });
            console.log(`Cambiado a la escena: ${sceneName}`);
        } catch (error) {
            this._handleError("cambiar de escena", error);
        }
    }

    async SetStreamServiceSettings(settings) {
        if (!this._checkConnection()) return;
        try {
            await this.obs.call('SetStreamServiceSettings', settings);
            console.log("Configuración de stream actualizada");
        } catch (error) {
            this._handleError("actualizar configuración de stream", error);
        }
    }

    async setSourceVisibility(sceneName, sceneItemId, isVisible) {
        if (!this._checkConnection()) return;
        try {
            await this.obs.call('SetSceneItemEnabled', {sceneName, sceneItemId: sceneItemId,
                sceneItemEnabled: isVisible });
            console.log(`Visibilidad de ${sceneName} establecida a: ${isVisible}`);
        } catch (error) {
            this._handleError(`modificar la visibilidad de ${sceneItemId}`, error);
        }
    }
    async createClip(durationSeconds = 30) {
        if (!this._checkConnection()) return;
        
        try {
            // Verificar el estado actual de la grabación
            const recordStatus = await this.getRecordStatus();
            
            // Si ya está grabando, retornamos para evitar interrumpir la grabación existente
            if (recordStatus.outputActive) {
                console.log("Ya existe una grabación en curso");
                return false;
            }

            // Iniciar la grabación
            await this.obs.call('StartRecord');
            console.log("Iniciando grabación del clip...");

            // Esperar la duración especificada
            await new Promise(resolve => setTimeout(resolve, durationSeconds * 1000));

            // Detener la grabación
            await this.obs.call('StopRecord');
            console.log(`Clip de ${durationSeconds} segundos creado exitosamente`);

            // Obtener la ruta del último archivo grabado
            const recordDirectory = await this.getRecordDirectory();
            return {
                success: true,
                duration: durationSeconds,
                directory: recordDirectory
            };

        } catch (error) {
            this._handleError("crear el clip", error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    // Método para configurar y manejar el replay buffer
    async setupReplayBuffer(bufferDuration = 30) {
        if (!this._checkConnection()) return;
        
        try {
            // Verificar si el replay buffer ya está activo
            const replayBufferStatus = await this.obs.call('GetReplayBufferStatus');
            
            if (replayBufferStatus.outputActive) {
                console.log("El replay buffer ya está activo");
                return {
                    success: true,
                    status: 'already_active'
                };
            }
            // Iniciar el replay buffer
            await this.obs.call('StartReplayBuffer');
            console.log(`Replay buffer iniciado con duración de ${bufferDuration} segundos`);
            setTimeout(() => {
                this.obs.call('StopReplayBuffer');
                console.log("Replay buffer detenido");
                resolve(true);
                this.obs.call('SaveReplayBuffer');
            }, bufferDuration * 1000);

            return {
                success: true,
                bufferDuration: bufferDuration
            };

        } catch (error) {
            this._handleError("configurar el replay buffer", error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    // Método para guardar el replay buffer actual
    async saveReplayBuffer() {
        if (!this._checkConnection()) return;
        
        try {
            // Verificar si el replay buffer está activo
            const replayBufferStatus = await this.obs.call('GetReplayBufferStatus');
            
            if (!replayBufferStatus.outputActive) {
                console.log("El replay buffer no está activo");
                return {
                    success: false,
                    error: 'replay_buffer_inactive'
                };
            }

            // Guardar el replay buffer
            await this.obs.call('SaveReplayBuffer');
            console.log("Replay guardado exitosamente");

            return {
                success: true,
                timestamp: new Date().toISOString()
            };

        } catch (error) {
            this._handleError("guardar el replay", error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    async stopReplayBuffer() {
        if (!this._checkConnection()) return;
        
        try {
            await this.obs.call('StopReplayBuffer');
            console.log("Replay buffer detenido");
            return {
                success: true
            };
        } catch (error) {
            this._handleError("detener el replay buffer", error);
            return {
                success: false,
                error: error.message
            };
        }
    }
        /**
     * Establece el volumen de una fuente de audio
     * @param {string} inputName - Nombre de la fuente de audio
     * @param {Object} options - Opciones de volumen
     * @param {number} [options.db] - Volumen en decibelios (dB)
     * @param {number} [options.multiplier] - Multiplicador de volumen (0.0 a 1.0)
     * @param {boolean} [options.smooth=false] - Si se debe hacer una transición suave
     * @param {number} [options.smoothDuration=100] - Duración de la transición en ms
     */
        async setInputVolume(inputName, options = {}) {
            if (!this._checkConnection()) return;
    
            try {
                // Preparar los parámetros para la llamada
                const params = {
                    inputName: inputName
                };
    
                // Si se proporciona dB, usamos ese valor
                if (options.db !== undefined) {
                    params.inputVolumeDb = options.db;
                }
                // Si se proporciona multiplicador, usamos ese valor
                else if (options.multiplier !== undefined) {
                    params.inputVolumeMul = Math.max(0, Math.min(1, options.multiplier));
                }
    
                // Transición suave si se solicita
                if (options.smooth) {
                    // Obtener volumen actual
                    const currentVolume = await this.obs.call('GetInputVolume', { inputName });
                    
                    // Calcular pasos para la transición suave
                    const steps = 10;
                    const duration = options.smoothDuration || 100;
                    const stepTime = duration / steps;
                    
                    let startValue, endValue;
                    if (options.db !== undefined) {
                        startValue = currentVolume.inputVolumeDb;
                        endValue = options.db;
                    } else {
                        startValue = currentVolume.inputVolumeMul;
                        endValue = params.inputVolumeMul;
                    }
    
                    // Realizar la transición suave
                    for (let i = 0; i <= steps; i++) {
                        const progress = i / steps;
                        const currentValue = startValue + (endValue - startValue) * progress;
                        
                        if (options.db !== undefined) {
                            await this.obs.call('SetInputVolume', {
                                inputName,
                                inputVolumeDb: currentValue
                            });
                        } else {
                            await this.obs.call('SetInputVolume', {
                                inputName,
                                inputVolumeMul: currentValue
                            });
                        }
                        
                        await new Promise(resolve => setTimeout(resolve, stepTime));
                    }
                } else {
                    // Cambio directo de volumen
                    await this.obs.call('SetInputVolume', params);
                }
    
                // Obtener el volumen actualizado para confirmar
                const updatedVolume = await this.obs.call('GetInputVolume', { inputName });
                
                console.log(`Volumen de ${inputName} actualizado:`, {
                    decibelios: updatedVolume.inputVolumeDb.toFixed(1) + 'dB',
                    multiplicador: updatedVolume.inputVolumeMul.toFixed(2)
                });
    
                return {
                    success: true,
                    inputName,
                    currentVolume: {
                        db: updatedVolume.inputVolumeDb,
                        multiplier: updatedVolume.inputVolumeMul
                    }
                };
    
            } catch (error) {
                this._handleError(`ajustar el volumen de ${inputName}`, error);
                return {
                    success: false,
                    error: error.message
                };
            }
        }
    
        /**
         * Obtiene el volumen actual de una fuente de audio
         * @param {string} inputName - Nombre de la fuente de audio
         */
        async getInputVolume(inputName) {
            if (!this._checkConnection()) return;
    
            try {
                const response = await this.obs.call('GetInputVolume', { inputName });
                
                console.log(`Volumen actual de ${inputName}:`, {
                    decibelios: response.inputVolumeDb.toFixed(1) + 'dB',
                    multiplicador: response.inputVolumeMul.toFixed(2)
                });
    
                return {
                    success: true,
                    inputName,
                    volume: {
                        db: response.inputVolumeDb,
                        multiplier: response.inputVolumeMul
                    }
                };
    
            } catch (error) {
                this._handleError(`obtener el volumen de ${inputName}`, error);
                return {
                    success: false,
                    error: error.message
                };
            }
        }
        async setAudioMute(inputName, mute) {
            if (!this._checkConnection()) return;
            try {
                await this.obs.call('SetInputMute', {
                    inputName: inputName,
                    inputMuted: mute
                });
                console.log(`${inputName} ${mute ? 'silenciado' : 'desilenciado'}`);
                return true;
            } catch (error) {
                this._handleError(`${mute ? 'silenciar' : 'desilenciar'} ${inputName}`, error);
                return false;
            }
        }
    // Utility Methods
    _checkConnection() {
        if (!this.isConnected) {
            console.error("No conectado a OBS");
            return false;
        }
        return true;
    }

    _handleError(action, error) {
        console.error(`Error al ${action}:`, error);
        return null;
    }
}
// Ejemplo de uso:

const obsController = new OBSController();
await obsController.connect();
const renderer = document.querySelector('zone-renderer');
const arrayobs = {
    "connect": { function: obsController.connect, name: "connect", requiredparams: 3 },
    "getScenesList": { function: obsController.getScenesList, name: "getScenesList", requiredparams: 0 },
    "getVersion": { function: obsController.getVersion, name: "getVersion", requiredparams: 0 },
    "getStats": { function: obsController.getStats, name: "getStats", requiredparams: 0 },
    "getHotkeyList": { function: obsController.getHotkeyList, name: "getHotkeyList", requiredparams: 0 },
    "getProfileList": { function: obsController.getProfileList, name: "getProfileList", requiredparams: 0 },
    "getVideoSettings": { function: obsController.getVideoSettings, name: "getVideoSettings", requiredparams: 0 },
    "getRecordDirectory": { function: obsController.getRecordDirectory, name: "getRecordDirectory", requiredparams: 0 },
    "getSourceActive": { function: obsController.getSourceActive, name: "getSourceActive", requiredparams: 1 },
    "getStreamStatus": { function: obsController.getStreamStatus, name: "getStreamStatus", requiredparams: 0 },
    "getRecordStatus": { function: obsController.getRecordStatus, name: "getRecordStatus", requiredparams: 0 },
    "getVirtualCamStatus": { function: obsController.getVirtualCamStatus, name: "getVirtualCamStatus", requiredparams: 0 },
    "getSceneTransitionList": { function: obsController.getSceneTransitionList, name: "getSceneTransitionList", requiredparams: 0 },
    "getCurrentSceneTransition": { function: obsController.getCurrentSceneTransition, name: "getCurrentSceneTransition", requiredparams: 0 },
    "getGroupList": { function: obsController.getGroupList, name: "getGroupList", requiredparams: 0 },
    "getInputList": { function: obsController.getInputList, name: "getInputList", requiredparams: 0 },
    "getSpecialInputs": { function: obsController.getSpecialInputs, name: "getSpecialInputs", requiredparams: 0 },
    "setCurrentScene": { function: obsController.setCurrentScene, name: "setCurrentScene", requiredparams: 1 },
    //"SetStreamServiceSettings": { function: obsController.SetStreamServiceSettings, name: "SetStreamServiceSettings", requiredparams: 1 },
    "setSourceVisibility": { function: obsController.setSourceVisibility, name: "setSourceVisibility", requiredparams: 2 },
    "createClip": { function: obsController.createClip, name: "createClip", requiredparams: 1 },
    "setupReplayBuffer": { function: obsController.setupReplayBuffer, name: "setupReplayBuffer", requiredparams: 1 },
    "saveReplayBuffer": { function: obsController.saveReplayBuffer, name: "saveReplayBuffer", requiredparams: 0 },
    "stopReplayBuffer": { function: obsController.stopReplayBuffer, name: "stopReplayBuffer", requiredparams: 0 },
    "getReplayBufferStatus": { function: obsController.getReplayBufferStatus, name: "getReplayBufferStatus", requiredparams: 0 },
    "getAudioSources": { function: obsController.getAudioSources, name: "getAudioSources", requiredparams: 0 },
    "setInputVolume": { function: obsController.setInputVolume, name: "setInputVolume", requiredparams: 2 },
    "getInputVolume": { function: obsController.getInputVolume, name: "getInputVolume", requiredparams: 1 },
    "setAudioMute": { function: obsController.setAudioMute, name: "setAudioMute", requiredparams: 2 },
    "checkconnection": { function: obsController._checkConnection, name: "checkconnection", requiredparams: 0 },
}
const mapedarrayobs = Object.entries(arrayobs).map(([key, value]) => ({ value, label: key, requiredparams: value.requiredparams }));
console.log("mapedarrayobs",mapedarrayobs);
async function main() {
    // Obtener lista de escenas
    const scenes = await obsController.getScenesList();
    if (scenes?.scenes) {
        scenes.scenes.forEach(async (scene) => {
            const GetSceneItemList = await obsController.GetSceneItemList(scene.sceneName);
            console.log("GetSceneItemList",GetSceneItemList);
            GetSceneItemList.sceneItems.forEach(async (source) => {
                console.log("sceneItems souce",source);
                const setSourceVisibility = await obsController.setSourceVisibility(scene.sceneName,source.sceneItemId,false);
                console.log("setSourceVisibility",setSourceVisibility,source.sceneItemId,scene.sceneName);
            })
            console.log("Escena:", scene.sceneName);
            const button = document.createElement('custom-button');
            button.id = scene.sceneName;
            button.setAttribute('color', '#000000');
            button.textContent = scene.sceneName;
            renderer.addCustomElement(scene.sceneIndex,button);
            const chartHTML = document.createElement('custom-modal');
            chartHTML.id = "modal";
            document.body.appendChild(chartHTML);
            button.addCustomEventListener('click', (event) => {
                obsController.setCurrentScene(scene.sceneName);
            });
            // 3. Modificar un elemento existente del menú
            button.setMenuItem(
            (event) => { // nuevo callback
            console.log('Nueva configuración');
            chartHTML.open();
            },
            'config', // action
            '🔧', // nuevo icono
            'Configurar', // nuevo texto
            );
            button.setMenuItem(
            (event) => {
            console.log('info elemento');
            chartHTML.open();
            },
            'info','ℹ️', 'Info' 
            );
    
        });
    }
    //await obsController.createClip(30);
    //await obsController.setupReplayBuffer(30); 
    // Obtener la versión de OBS
    const versioninfo = await obsController.getVersion();
    console.log("Version de OBS:", versioninfo?.availableRequests);
    versioninfo.availableRequests.forEach(request => {
        const searchword = 'GetSource';
        if (request.includes(searchword)) {
            console.log(" disponible",searchword, request);
        } else {
            console.log(" no disponible");
        }
    });
    const getInputList = await obsController.getInputList();
    console.log("GetInputList", getInputList);
    if (getInputList?.inputs) {
        getInputList.inputs.forEach(async input => {
            const inputVolume = await obsController.getInputVolume(input.inputName);
            createSlider(inputVolume,input);
            // console.log("inputVolume", inputVolume);
            // const setInputVolume = await obsController.setInputVolume(input.inputName, {
            //     //db: 0, 0db to -inf , -inf to number = -100dB
            //     //multiplier: 1 to 0, 0.0 to 1.0
            //     db: -100,
            // });
            // console.log("setInputVolume", setInputVolume);
        });
    }
    // Obtener estado del streaming
    await obsController.getStreamStatus();
    // audioSources = await obsController.getAudioSources();
    await obsController.getAudioSources();
}
// sourceName is a name of scene
let lastArrayScenes = [];
async function getAllscenes() {
    //return array with scenes, scenes.sceneName || sourceName
    const scenes = await obsController.getScenesList();
    lastArrayScenes = scenes;
    if (lastArrayScenes.length > 0|| scenes) localStorage.setItem("lastArrayScenes",JSON.stringify(scenes.scenes||lastArrayScenes));
    return JSON.parse(localStorage.getItem("lastArrayScenes"));
}
setTimeout(async () => {
    console.log("lastArrayScenes",localStorage.getItem("lastArrayScenes"));
},1000);
async function getSourceActive(sourceName) {
    const response = await obsController.getSourceActive(sourceName);
    return response;
}
async function setCurrentScene(sceneName) {
    const response = await obsController.setCurrentScene(sceneName);    
    return response;
}
async function GetSceneItemList(sceneName) {
    //return array scenes.sceneName || sourceName.sources [{sceneItems: Array(4) [ {…}, {…}, {…}, … ]0: Object { inputKind: "jack_output_capture", sceneItemBlendMode: "OBS_BLEND_NORMAL", sceneItemEnabled: true,}]
    const response = await obsController.GetSceneItemList(sceneName);
    return response;
}
async function setSourceVisibility(sceneName, sceneItemId, isVisible) {
    const setSourceVisibility = await obsController.setSourceVisibility(sceneName, sceneItemId, isVisible);
}
main();
const slidercontainer = document.getElementById('SliderContainer');
async function createSlider(sliderconfig, input) {
    console.log("createSlider",sliderconfig,input);
    const configslider = {
        id: input.inputName,
        label: input.inputName,
        value: sliderconfig.volume.db,
        min: -100,
        max: 0,
        step: 1,
        unit: 'dB',
        theme: 'audio',
        layout: 'stacked',
        // callback: async (value) => {
        //     console.log("callback",value, sliderconfig, input);
        //     // const setInputVolume = await obsController.setInputVolume(input.inputName, {
        //     //     //db: 0, 0db to -inf , -inf to number = -100dB
        //     //     //multiplier: 1 to 0, 0.0 to 1.0
        //     //     db: value,
        //     // });
        //     // console.log("setInputVolume", setInputVolume);
        // }
    }
    slidercontainer.createSlider(configslider);
}
container.addEventListener('sliderChange',async (e) => {
    console.log(`${e.detail.id}: ${e.detail.formattedValue}`,e.detail);
    const SetInputVolume = await obsController.setInputVolume(e.detail.label,{
        db: Number(e.detail.value)
    })
    // Object { value: "-18", label: "Audio Output Capture (PulseAudio)", id: "Audio Output Capture (PulseAudio)", formattedValue: "-18.0dB" }
  });
export { mapedarrayobs, arrayobs,htmlobselement,getAllscenes,getSourceActive,setCurrentScene,GetSceneItemList,setSourceVisibility };
// const sliderCreator = new SliderCreator('sliders-container');

// Request with data
//await obs.call('SetCurrentProgramScene', {sceneName: 'Gameplay'});

// Both together now
// const {inputMuted} = obs.call('ToggleInputMute', {inputName: 'Camera'});
