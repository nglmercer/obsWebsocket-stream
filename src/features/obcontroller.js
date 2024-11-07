const container = document.getElementById('container');
const obs = new OBSWebSocket();

async function connectObs(url, auth) {
    try {
        let response;
        if (auth) {
            response = await obs.connect(url, auth);
        } else {
            response = await obs.connect(url);
        }
        
        console.log("Conexión exitosa:", response);
        getScenesList();  // Llamada para obtener las escenas después de conectarse
    } catch (error) {
        console.error("Error al conectar a OBS:", error);
    }
}

async function getScenesList() {
    try {
        const scenes = await obs.call('GetSceneList');
        console.log("Lista de escenas:", scenes.scenes); // Imprime la lista de escenas
        scenes.scenes.forEach(scene => {
            console.log("Escena:", scene.sceneName);
        });
    } catch (error) {
        console.error("Error al obtener la lista de escenas:", error);
    }
}

// connectObs('ws://localhost:4455');

// Request without data
  class OBSController1 {
    constructor() {
        this.obs = new OBSWebSocket();
        this.isConnected = false;
    }

    // Método para conectar a OBS
    async connect(url = 'ws://localhost:4455', auth = null) {
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
    
    async initializeObsEvents() {
        async function getCurrentProgramSceneName() {
            const {currentProgramSceneName} = await obs.call('GetCurrentProgramScene');
            console.log(currentProgramSceneName);
            return;
        }
        function onCurrentSceneChanged(event) {
            console.log('Current scene changed to', event.sceneName)
          }
          
          obs.on('CurrentSceneChanged', onCurrentSceneChanged);
          
          obs.once('ExitStarted', () => {
            console.log('OBS started shutdown');
          
            // Just for example, not necessary should you want to reuse this instance by re-connect()
            obs.off('CurrentSceneChanged', onCurrentSceneChanged);
          });
    }
    // Método para obtener la lista de escenas
    async getScenesList() {
        if (!this.isConnected) {
            console.error("No conectado a OBS");
            return;
        }

        try {
            const response = await this.obs.call('GetSceneList');
            console.log("Lista de escenas:", response.scenes);
            return response.scenes; // Devuelve la lista de escenas
        } catch (error) {
            console.error("Error al obtener la lista de escenas:", error);
        }
    }

    // Método para cambiar de escena
    async changeScene(sceneName) {
        if (!this.isConnected) {
            console.error("No conectado a OBS");
            return;
        }

        try {
            await this.obs.call('SetCurrentProgramScene', { sceneName });
            console.log(`Cambiado a la escena: ${sceneName}`);
        } catch (error) {
            console.error("Error al cambiar de escena:", error);
        }
    }

    // Método para obtener la lista de elementos del mezclador de audio
    async getAudioSources() {
        if (!this.isConnected) {
            console.error("No conectado a OBS");
            return;
        }

        try {
            const response = await this.obs.call('GetSpecialInputs');
            console.log("Lista de fuentes de audio en el mezclador:", response);
            return response; // Devuelve la lista de fuentes de audio
        } catch (error) {
            console.error("Error al obtener las fuentes de audio:", error);
        }
    }

    // Método para modificar el volumen de una fuente de audio
    async setAudioVolume(sourceName, volume) {
        if (!this.isConnected) {
            console.error("No conectado a OBS");
            return;
        }

        try {
            await this.obs.call('SetInputVolume', { inputName: sourceName, inputVolume: volume });
            console.log(`Volumen de ${sourceName} cambiado a ${volume}`);
        } catch (error) {
            console.error(`Error al cambiar el volumen de ${sourceName}:`, error);
        }
    }

    // Método para obtener el volumen de una fuente de audio
    async getAudioVolume(sourceName) {
        if (!this.isConnected) {
            console.error("No conectado a OBS");
            return;
        }

        try {
            const response = await this.obs.call('GetInputVolume', { inputName: sourceName });
            console.log(`Volumen actual de ${sourceName}: ${response.inputVolume}`);
            return response.inputVolume; // Devuelve el volumen actual
        } catch (error) {
            console.error(`Error al obtener el volumen de ${sourceName}:`, error);
        }
    }
}

class OBSController {
    constructor() {
        this.obs = new OBSWebSocket();
        this.isConnected = false;
    }

    // Connection Methods
    async connect(url = 'ws://localhost:4455', auth = null) {
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

    async setStreamSettings(settings) {
        if (!this._checkConnection()) return;
        try {
            await this.obs.call('SetStreamSettings', settings);
            console.log("Configuración de stream actualizada");
        } catch (error) {
            this._handleError("actualizar configuración de stream", error);
        }
    }

    async setSourceVisibility(sceneName, sourceName, isVisible) {
        if (!this._checkConnection()) return;
        try {
            await this.obs.call('SetSceneItemEnabled', {
                sceneName,
                sceneItemId: sourceName,
                sceneItemEnabled: isVisible
            });
            console.log(`Visibilidad de ${sourceName} establecida a: ${isVisible}`);
        } catch (error) {
            this._handleError(`modificar la visibilidad de ${sourceName}`, error);
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
const renderer = document.querySelector('zone-renderer');
async function main() {
    await obsController.connect();

    // Obtener lista de escenas
    const scenes = await obsController.getScenesList();
    if (scenes?.scenes.length === 0) {
        scenes.scenes.forEach(scene => {
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
        const searchword = 'udio';
        if (request.includes(searchword)) {
            console.log(" disponible",searchword, request);
        } else {
            console.log(" no disponible");
        }
    });
    const getInputList = await obsController.getInputList();
    console.log("GetInputList", getInputList);
    // Obtener estado del streaming
    await obsController.getStreamStatus();

    // audioSources = await obsController.getAudioSources();
    await obsController.getAudioSources();
}

main();


// Request with data
//await obs.call('SetCurrentProgramScene', {sceneName: 'Gameplay'});

// Both together now
// const {inputMuted} = obs.call('ToggleInputMute', {inputName: 'Camera'});
