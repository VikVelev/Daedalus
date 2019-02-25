 /* eslint-disable */
/**
  * @author Kai Salmen / https://kaisalmen.de
  * Development repository: https://github.com/kaisalmen/WWOBJLoader
  */

 'use strict';
 module.exports = function(THREE) {
     if ( THREE.LoaderSupport === undefined ) { THREE.LoaderSupport = {} }
 
     /**
      * Validation functions.
      * @class
      */
     THREE.LoaderSupport.Validator = {
         /**
          * If given input is null or undefined, false is returned otherwise true.
          *
          * @param input Can be anything
          * @returns {boolean}
          */
         isValid: function( input ) {
             return ( input !== null && input !== undefined );
         },
         /**
          * If given input is null or undefined, the defaultValue is returned otherwise the given input.
          *
          * @param input Can be anything
          * @param defaultValue Can be anything
          * @returns {*}
          */
         verifyInput: function( input, defaultValue ) {
             return ( input === null || input === undefined ) ? defaultValue : input;
         }
     };
 
 
     /**
      * Callbacks utilized by loaders and builders.
      * @class
      */
     THREE.LoaderSupport.Callbacks = (function () {
 
         let Validator = THREE.LoaderSupport.Validator;
 
         function Callbacks() {
             this.onProgress = null;
             this.onMeshAlter = null;
             this.onLoad = null;
             this.onLoadMaterials = null;
         }
 
         /**
          * Register callback function that is invoked by internal function "announceProgress" to print feedback.
          * @memberOf THREE.LoaderSupport.Callbacks
          *
          * @param {callback} callbackOnProgress Callback function for described functionality
          */
         Callbacks.prototype.setCallbackOnProgress = function ( callbackOnProgress ) {
             this.onProgress = Validator.verifyInput( callbackOnProgress, this.onProgress );
         };
 
         /**
          * Register callback function that is called every time a mesh was loaded.
          * Use {@link THREE.LoaderSupport.LoadedMeshUserOverride} for alteration instructions (geometry, material or disregard mesh).
          * @memberOf THREE.LoaderSupport.Callbacks
          *
          * @param {callback} callbackOnMeshAlter Callback function for described functionality
          */
         Callbacks.prototype.setCallbackOnMeshAlter = function ( callbackOnMeshAlter ) {
             this.onMeshAlter = Validator.verifyInput( callbackOnMeshAlter, this.onMeshAlter );
         };
 
         /**
          * Register callback function that is called once loading of the complete OBJ file is completed.
          * @memberOf THREE.LoaderSupport.Callbacks
          *
          * @param {callback} callbackOnLoad Callback function for described functionality
          */
         Callbacks.prototype.setCallbackOnLoad = function ( callbackOnLoad ) {
             this.onLoad = Validator.verifyInput( callbackOnLoad, this.onLoad );
         };
 
         /**
          * Register callback function that is called when materials have been loaded.
          * @memberOf THREE.LoaderSupport.Callbacks
          *
          * @param {callback} callbackOnLoadMaterials Callback function for described functionality
          */
         Callbacks.prototype.setCallbackOnLoadMaterials = function ( callbackOnLoadMaterials ) {
             this.onLoadMaterials = Validator.verifyInput( callbackOnLoadMaterials, this.onLoadMaterials );
         };
 
         return Callbacks;
     })();
 
 
     /**
      * Object to return by callback onMeshAlter. Used to disregard a certain mesh or to return one to many meshes.
      * @class
      *
      * @param {boolean} disregardMesh=false Tell implementation to completely disregard this mesh
      * @param {boolean} disregardMesh=false Tell implementation that mesh(es) have been altered or added
      */
     THREE.LoaderSupport.LoadedMeshUserOverride = (function () {
 
         function LoadedMeshUserOverride( disregardMesh, alteredMesh ) {
             this.disregardMesh = disregardMesh === true;
             this.alteredMesh = alteredMesh === true;
             this.meshes = [];
         }
 
         /**
          * Add a mesh created within callback.
          *
          * @memberOf THREE.OBJLoader2.LoadedMeshUserOverride
          *
          * @param {THREE.Mesh} mesh
          */
         LoadedMeshUserOverride.prototype.addMesh = function ( mesh ) {
             this.meshes.push( mesh );
             this.alteredMesh = true;
         };
 
         /**
          * Answers if mesh shall be disregarded completely.
          *
          * @returns {boolean}
          */
         LoadedMeshUserOverride.prototype.isDisregardMesh = function () {
             return this.disregardMesh;
         };
 
         /**
          * Answers if new mesh(es) were created.
          *
          * @returns {boolean}
          */
         LoadedMeshUserOverride.prototype.providesAlteredMeshes = function () {
             return this.alteredMesh;
         };
 
         return LoadedMeshUserOverride;
     })();
 
 
     /**
      * A resource description used by {@link THREE.LoaderSupport.PrepData} and others.
      * @class
      *
      * @param {string} url URL to the file
      * @param {string} extension The file extension (type)
      */
     THREE.LoaderSupport.ResourceDescriptor = (function () {
 
         let Validator = THREE.LoaderSupport.Validator;
 
         function ResourceDescriptor( url, extension ) {
             let urlParts = url.split( '/' );
 
             if ( urlParts.length < 2 ) {
 
                 this.path = null;
                 this.name = url;
                 this.url = url;
 
             } else {
 
                 this.path = Validator.verifyInput( urlParts.slice( 0, urlParts.length - 1).join( '/' ) + '/', null );
                 this.name = urlParts[ urlParts.length - 1 ];
                 this.url = url;
 
             }
             this.name = Validator.verifyInput( this.name, 'Unnamed_Resource' );
             this.extension = Validator.verifyInput( extension, 'default' );
             this.extension = this.extension.trim();
             this.content = null;
         }
 
         /**
          * Set the content of this resource
          * @memberOf THREE.LoaderSupport.ResourceDescriptor
          *
          * @param {Object} content The file content as arraybuffer or text
          */
         ResourceDescriptor.prototype.setContent = function ( content ) {
             this.content = Validator.verifyInput( content, null );
         };
 
         return ResourceDescriptor;
     })();
 
 
     /**
      * Configuration instructions to be used by run method.
      * @class
      */
     THREE.LoaderSupport.PrepData = (function () {
 
         let Validator = THREE.LoaderSupport.Validator;
 
         function PrepData( modelName ) {
             this.logging = {
                 enabled: true,
                 debug: false
             };
             this.modelName = Validator.verifyInput( modelName, '' );
             this.resources = [];
             this.callbacks = new THREE.LoaderSupport.Callbacks();
         }
 
         /**
          * Enable or disable logging in general (except warn and error), plus enable or disable debug logging.
          * @memberOf THREE.LoaderSupport.PrepData
          *
          * @param {boolean} enabled True or false.
          * @param {boolean} debug True or false.
          */
         PrepData.prototype.setLogging = function ( enabled, debug ) {
             this.logging.enabled = enabled === true;
             this.logging.debug = debug === true;
         };
 
         /**
          * Returns all callbacks as {@link THREE.LoaderSupport.Callbacks}
          * @memberOf THREE.LoaderSupport.PrepData
          *
          * @returns {THREE.LoaderSupport.Callbacks}
          */
         PrepData.prototype.getCallbacks = function () {
             return this.callbacks;
         };
 
         /**
          * Add a resource description.
          * @memberOf THREE.LoaderSupport.PrepData
          *
          * @param {THREE.LoaderSupport.ResourceDescriptor} Adds a {@link THREE.LoaderSupport.ResourceDescriptor}
          */
         PrepData.prototype.addResource = function ( resource ) {
             this.resources.push( resource );
         };
 
         /**
          * Clones this object and returns it afterwards. Callbacks and resources are not cloned deep (references!).
          * @memberOf THREE.LoaderSupport.PrepData
          *
          * @returns {@link THREE.LoaderSupport.PrepData}
          */
         PrepData.prototype.clone = function () {
             let clone = new THREE.LoaderSupport.PrepData( this.modelName );
             clone.logging.enabled = this.logging.enabled;
             clone.logging.debug = this.logging.debug;
             clone.resources = this.resources;
             clone.callbacks = this.callbacks;
 
             let property, value;
             for ( property in this ) {
 
                 value = this[ property ];
                 if ( ! clone.hasOwnProperty( property ) && typeof this[ property ] !== 'function' ) {
 
                     clone[ property ] = value;
 
                 }
             }
 
             return clone;
         };
 
 
         /**
          * Identify files or content of interest from an Array of {@link THREE.LoaderSupport.ResourceDescriptor}.
          * @memberOf THREE.LoaderSupport.PrepData
          *
          * @param {THREE.LoaderSupport.ResourceDescriptor[]} resources Array of {@link THREE.LoaderSupport.ResourceDescriptor}
          * @param Object fileDesc Object describing which resources are of interest (ext, type (string or UInt8Array) and ignore (boolean))
          * @returns {{}} Object with each "ext" and the corresponding {@link THREE.LoaderSupport.ResourceDescriptor}
          */
         PrepData.prototype.checkResourceDescriptorFiles = function ( resources, fileDesc ) {
             let resource, triple, i, found;
             let result = {};
 
             for ( let index in resources ) {
 
                 resource = resources[ index ];
                 found = false;
                 if ( ! Validator.isValid( resource.name ) ) continue;
                 if ( Validator.isValid( resource.content ) ) {
 
                     for ( i = 0; i < fileDesc.length && !found; i++ ) {
 
                         triple = fileDesc[ i ];
                         if ( resource.extension.toLowerCase() === triple.ext.toLowerCase() ) {
 
                             if ( triple.ignore ) {
 
                                 found = true;
 
                             } else if ( triple.type === "ArrayBuffer" ) {
 
                                 // fast-fail on bad type
                                 if ( ! ( resource.content instanceof ArrayBuffer || resource.content instanceof Uint8Array ) ) throw 'Provided content is not of type ArrayBuffer! Aborting...';
                                 result[ triple.ext ] = resource;
                                 found = true;
 
                             } else if ( triple.type === "String" ) {
 
                                 if ( ! ( typeof( resource.content ) === 'string' || resource.content instanceof String) ) throw 'Provided  content is not of type String! Aborting...';
                                 result[ triple.ext ] = resource;
                                 found = true;
 
                             }
 
                         }
 
                     }
                     if ( !found ) throw 'Unidentified resource "' + resource.name + '": ' + resource.url;
 
                 } else {
 
                     // fast-fail on bad type
                     if ( ! ( typeof( resource.name ) === 'string' || resource.name instanceof String ) ) throw 'Provided file is not properly defined! Aborting...';
                     for ( i = 0; i < fileDesc.length && !found; i++ ) {
 
                         triple = fileDesc[ i ];
                         if ( resource.extension.toLowerCase() === triple.ext.toLowerCase() ) {
 
                             if ( ! triple.ignore ) result[ triple.ext ] = resource;
                             found = true;
 
                         }
 
                     }
                     if ( !found ) throw 'Unidentified resource "' + resource.name + '": ' + resource.url;
 
                 }
             }
 
             return result;
         };
 
         return PrepData;
     })();
 
     /**
      * Builds one or many THREE.Mesh from one raw set of Arraybuffers, materialGroup descriptions and further parameters.
      * Supports vertex, vertexColor, normal, uv and index buffers.
      * @class
      */
     THREE.LoaderSupport.MeshBuilder = (function () {
 
         let LOADER_MESH_BUILDER_VERSION = '1.2.1';
 
         let Validator = THREE.LoaderSupport.Validator;
 
         function MeshBuilder() {
             this.logging = {
                 enabled: true,
                 debug: false
             };
 
             this.callbacks = new THREE.LoaderSupport.Callbacks();
             this.materials = [];
         }
 
         /**
          * Enable or disable logging in general (except warn and error), plus enable or disable debug logging.
          * @memberOf THREE.LoaderSupport.MeshBuilder
          *
          * @param {boolean} enabled True or false.
          * @param {boolean} debug True or false.
          */
         MeshBuilder.prototype.setLogging = function ( enabled, debug ) {
             this.logging.enabled = enabled === true;
             this.logging.debug = debug === true;
         };
 
         /**
          * Initializes the MeshBuilder (currently only default material initialisation).
          * @memberOf THREE.LoaderSupport.MeshBuilder
          *
          */
         MeshBuilder.prototype.init = function () {
             let defaultMaterial = new THREE.MeshStandardMaterial( { color: 0xDCF1FF } );
             defaultMaterial.name = 'defaultMaterial';
 
             let defaultVertexColorMaterial = new THREE.MeshStandardMaterial( { color: 0xDCF1FF } );
             defaultVertexColorMaterial.name = 'defaultVertexColorMaterial';
             defaultVertexColorMaterial.vertexColors = THREE.VertexColors;
 
             let defaultLineMaterial = new THREE.LineBasicMaterial();
             defaultLineMaterial.name = 'defaultLineMaterial';
 
             let defaultPointMaterial = new THREE.PointsMaterial( { size: 1 } );
             defaultPointMaterial.name = 'defaultPointMaterial';
 
             let runtimeMaterials = {};
             runtimeMaterials[ defaultMaterial.name ] = defaultMaterial;
             runtimeMaterials[ defaultVertexColorMaterial.name ] = defaultVertexColorMaterial;
             runtimeMaterials[ defaultLineMaterial.name ] = defaultLineMaterial;
             runtimeMaterials[ defaultPointMaterial.name ] = defaultPointMaterial;
 
             this.updateMaterials(
                 {
                     cmd: 'materialData',
                     materials: {
                         materialCloneInstructions: null,
                         serializedMaterials: null,
                         runtimeMaterials: runtimeMaterials
                     }
                 }
             );
         };
 
         /**
          * Set materials loaded by any supplier of an Array of {@link THREE.Material}.
          * @memberOf THREE.LoaderSupport.MeshBuilder
          *
          * @param {THREE.Material[]} materials Array of {@link THREE.Material}
          */
         MeshBuilder.prototype.setMaterials = function ( materials ) {
             let payload = {
                 cmd: 'materialData',
                 materials: {
                     materialCloneInstructions: null,
                     serializedMaterials: null,
                     runtimeMaterials: Validator.isValid( this.callbacks.onLoadMaterials ) ? this.callbacks.onLoadMaterials( materials ) : materials
                 }
             };
             this.updateMaterials( payload );
         };
 
         MeshBuilder.prototype._setCallbacks = function ( callbacks ) {
             if ( Validator.isValid( callbacks.onProgress ) ) this.callbacks.setCallbackOnProgress( callbacks.onProgress );
             if ( Validator.isValid( callbacks.onMeshAlter ) ) this.callbacks.setCallbackOnMeshAlter( callbacks.onMeshAlter );
             if ( Validator.isValid( callbacks.onLoad ) ) this.callbacks.setCallbackOnLoad( callbacks.onLoad );
             if ( Validator.isValid( callbacks.onLoadMaterials ) ) this.callbacks.setCallbackOnLoadMaterials( callbacks.onLoadMaterials );
         };
 
         /**
          * Delegates processing of the payload (mesh building or material update) to the corresponding functions (BW-compatibility).
          * @memberOf THREE.LoaderSupport.MeshBuilder
          *
          * @param {Object} payload Raw Mesh or Material descriptions.
          * @returns {THREE.Mesh[]} mesh Array of {@link THREE.Mesh} or null in case of material update
          */
         MeshBuilder.prototype.processPayload = function ( payload ) {
             if ( payload.cmd === 'meshData' ) {
 
                 return this.buildMeshes( payload );
 
             } else if ( payload.cmd === 'materialData' ) {
 
                 this.updateMaterials( payload );
                 return null;
 
             }
         };
 
         /**
          * Builds one or multiple meshes from the data described in the payload (buffers, params, material info).
          * @memberOf THREE.LoaderSupport.MeshBuilder
          *
          * @param {Object} meshPayload Raw mesh description (buffers, params, materials) used to build one to many meshes.
          * @returns {THREE.Mesh[]} mesh Array of {@link THREE.Mesh}
          */
         MeshBuilder.prototype.buildMeshes = function ( meshPayload ) {
             let meshName = meshPayload.params.meshName;
 
             let bufferGeometry = new THREE.BufferGeometry();
             bufferGeometry.addAttribute( 'position', new THREE.BufferAttribute( new Float32Array( meshPayload.buffers.vertices ), 3 ) );
             if ( Validator.isValid( meshPayload.buffers.indices ) ) {
 
                 bufferGeometry.setIndex( new THREE.BufferAttribute( new Uint32Array( meshPayload.buffers.indices ), 1 ));
 
             }
             let haveVertexColors = Validator.isValid( meshPayload.buffers.colors );
             if ( haveVertexColors ) {
 
                 bufferGeometry.addAttribute( 'color', new THREE.BufferAttribute( new Float32Array( meshPayload.buffers.colors ), 3 ) );
 
             }
             if ( Validator.isValid( meshPayload.buffers.normals ) ) {
 
                 bufferGeometry.addAttribute( 'normal', new THREE.BufferAttribute( new Float32Array( meshPayload.buffers.normals ), 3 ) );
 
             } else {
 
                 bufferGeometry.computeVertexNormals();
 
             }
             if ( Validator.isValid( meshPayload.buffers.uvs ) ) {
 
                 bufferGeometry.addAttribute( 'uv', new THREE.BufferAttribute( new Float32Array( meshPayload.buffers.uvs ), 2 ) );
 
             }
 
             let material, materialName, key;
             let materialNames = meshPayload.materials.materialNames;
             let createMultiMaterial = meshPayload.materials.multiMaterial;
             let multiMaterials = [];
             for ( key in materialNames ) {
 
                 materialName = materialNames[ key ];
                 material = this.materials[ materialName ];
                 if ( createMultiMaterial ) multiMaterials.push( material );
 
             }
             if ( createMultiMaterial ) {
 
                 material = multiMaterials;
                 let materialGroups = meshPayload.materials.materialGroups;
                 let materialGroup;
                 for ( key in materialGroups ) {
 
                     materialGroup = materialGroups[ key ];
                     bufferGeometry.addGroup( materialGroup.start, materialGroup.count, materialGroup.index );
 
                 }
 
             }
 
             let meshes = [];
             let mesh;
             let callbackOnMeshAlter = this.callbacks.onMeshAlter;
             let callbackOnMeshAlterResult;
             let useOrgMesh = true;
             let geometryType = Validator.verifyInput( meshPayload.geometryType, 0 );
             if ( Validator.isValid( callbackOnMeshAlter ) ) {
 
                 callbackOnMeshAlterResult = callbackOnMeshAlter(
                     {
                         detail: {
                             meshName: meshName,
                             bufferGeometry: bufferGeometry,
                             material: material,
                             geometryType: geometryType
                         }
                     }
                 );
                 if ( Validator.isValid( callbackOnMeshAlterResult ) ) {
 
                     if ( callbackOnMeshAlterResult.isDisregardMesh() ) {
 
                         useOrgMesh = false;
 
                     } else if ( callbackOnMeshAlterResult.providesAlteredMeshes() ) {
 
                         for ( let i in callbackOnMeshAlterResult.meshes ) {
 
                             meshes.push( callbackOnMeshAlterResult.meshes[ i ] );
 
                         }
                         useOrgMesh = false;
 
                     }
 
                 }
 
             }
             if ( useOrgMesh ) {
 
                 if ( meshPayload.computeBoundingSphere ) bufferGeometry.computeBoundingSphere();
                 if ( geometryType === 0 ) {
 
                     mesh = new THREE.Mesh( bufferGeometry, material );
 
                 } else if ( geometryType === 1) {
 
                     mesh = new THREE.LineSegments( bufferGeometry, material );
 
                 } else {
 
                     mesh = new THREE.Points( bufferGeometry, material );
 
                 }
                 mesh.name = meshName;
                 meshes.push( mesh );
 
             }
 
             let progressMessage;
             if ( Validator.isValid( meshes ) && meshes.length > 0 ) {
 
                 let meshNames = [];
                 for ( let i in meshes ) {
 
                     mesh = meshes[ i ];
                     meshNames[ i ] = mesh.name;
 
                 }
                 progressMessage = 'Adding mesh(es) (' + meshNames.length + ': ' + meshNames + ') from input mesh: ' + meshName;
                 progressMessage += ' (' + ( meshPayload.progress.numericalValue * 100 ).toFixed( 2 ) + '%)';
 
             } else {
 
                 progressMessage = 'Not adding mesh: ' + meshName;
                 progressMessage += ' (' + ( meshPayload.progress.numericalValue * 100 ).toFixed( 2 ) + '%)';
 
             }
             let callbackOnProgress = this.callbacks.onProgress;
             if ( Validator.isValid( callbackOnProgress ) ) {
 
                 let event = new CustomEvent( 'MeshBuilderEvent', {
                     detail: {
                         type: 'progress',
                         modelName: meshPayload.params.meshName,
                         text: progressMessage,
                         numericalValue: meshPayload.progress.numericalValue
                     }
                 } );
                 callbackOnProgress( event );
 
             }
 
             return meshes;
         };
 
         /**
          * Updates the materials with contained material objects (sync) or from alteration instructions (async).
          * @memberOf THREE.LoaderSupport.MeshBuilder
          *
          * @param {Object} materialPayload Material update instructions
          */
         MeshBuilder.prototype.updateMaterials = function ( materialPayload ) {
             let material, materialName;
             let materialCloneInstructions = materialPayload.materials.materialCloneInstructions;
             if ( Validator.isValid( materialCloneInstructions ) ) {
 
                 let materialNameOrg = materialCloneInstructions.materialNameOrg;
                 let materialOrg = this.materials[ materialNameOrg ];
 
                 if ( Validator.isValid( materialNameOrg ) ) {
 
                     material = materialOrg.clone();
 
                     materialName = materialCloneInstructions.materialName;
                     material.name = materialName;
 
                     let materialProperties = materialCloneInstructions.materialProperties;
                     for ( let key in materialProperties ) {
 
                         if ( material.hasOwnProperty( key ) && materialProperties.hasOwnProperty( key ) ) material[ key ] = materialProperties[ key ];
 
                     }
                     this.materials[ materialName ] = material;
 
                 } else {
 
                     console.warn( 'Requested material "' + materialNameOrg + '" is not available!' );
 
                 }
             }
 
             let materials = materialPayload.materials.serializedMaterials;
             if ( Validator.isValid( materials ) && Object.keys( materials ).length > 0 ) {
 
                 let loader = new THREE.MaterialLoader();
                 let materialJson;
                 for ( materialName in materials ) {
 
                     materialJson = materials[ materialName ];
                     if ( Validator.isValid( materialJson ) ) {
 
                         material = loader.parse( materialJson );
                         this.materials[ materialName ] = material;
                     }
 
                 }
 
             }
 
             materials = materialPayload.materials.runtimeMaterials;
             if ( Validator.isValid( materials ) && Object.keys( materials ).length > 0 ) {
 
                 for ( materialName in materials ) {
 
                     material = materials[ materialName ];
                     this.materials[ materialName ] = material;
 
                 }
 
             }
         };
 
         /**
          * Returns the mapping object of material name and corresponding jsonified material.
          *
          * @returns {Object} Map of Materials in JSON representation
          */
         MeshBuilder.prototype.getMaterialsJSON = function () {
             let materialsJSON = {};
             let material;
             for ( let materialName in this.materials ) {
 
                 material = this.materials[ materialName ];
                 materialsJSON[ materialName ] = material.toJSON();
             }
 
             return materialsJSON;
         };
 
         /**
          * Returns the mapping object of material name and corresponding material.
          *
          * @returns {Object} Map of {@link THREE.Material}
          */
         MeshBuilder.prototype.getMaterials = function () {
             return this.materials;
         };
 
         return MeshBuilder;
     })();
 
     /**
      * Default implementation of the WorkerRunner responsible for creation and configuration of the parser within the worker.
      *
      * @class
      */
     THREE.LoaderSupport.WorkerRunnerRefImpl = (function () {
 
         function WorkerRunnerRefImpl() {
             let scope = this;
             let scopedRunner = function( event ) {
                 scope.processMessage( event.data );
             };
             self.addEventListener( 'message', scopedRunner, false );
         }
 
         /**
          * Applies values from parameter object via set functions or via direct assignment.
          * @memberOf THREE.LoaderSupport.WorkerRunnerRefImpl
          *
          * @param {Object} parser The parser instance
          * @param {Object} params The parameter object
          */
         WorkerRunnerRefImpl.prototype.applyProperties = function ( parser, params ) {
             let property, funcName, values;
             for ( property in params ) {
                 funcName = 'set' + property.substring( 0, 1 ).toLocaleUpperCase() + property.substring( 1 );
                 values = params[ property ];
 
                 if ( typeof parser[ funcName ] === 'function' ) {
 
                     parser[ funcName ]( values );
 
                 } else if ( parser.hasOwnProperty( property ) ) {
 
                     parser[ property ] = values;
 
                 }
             }
         };
 
         /**
          * Configures the Parser implementation according the supplied configuration object.
          * @memberOf THREE.LoaderSupport.WorkerRunnerRefImpl
          *
          * @param {Object} payload Raw mesh description (buffers, params, materials) used to build one to many meshes.
          */
         WorkerRunnerRefImpl.prototype.processMessage = function ( payload ) {
             if ( payload.cmd === 'run' ) {
 
                 let callbacks = {
                     callbackMeshBuilder: function ( payload ) {
                         self.postMessage( payload );
                     },
                     callbackProgress: function ( text ) {
                         if ( payload.logging.enabled && payload.logging.debug ) console.debug( 'WorkerRunner: progress: ' + text );
                     }
                 };
 
                 // Parser is expected to be named as such
                 let parser = new Parser();
                 if ( typeof parser[ 'setLogging' ] === 'function' ) parser.setLogging( payload.logging.enabled, payload.logging.debug );
                 this.applyProperties( parser, payload.params );
                 this.applyProperties( parser, payload.materials );
                 this.applyProperties( parser, callbacks );
                 parser.workerScope = self;
                 parser.parse( payload.data.input, payload.data.options );
 
                 callbacks.callbackMeshBuilder( {
                     cmd: 'complete',
                     msg: 'WorkerRunner completed run.'
                 } );
 
             } else {
 
                 console.error( 'WorkerRunner: Received unknown command: ' + payload.cmd );
 
             }
         };
 
         return WorkerRunnerRefImpl;
     })();
 
     /**
      * This class provides means to transform existing parser code into a web worker. It defines a simple communication protocol
      * which allows to configure the worker and receive raw mesh data during execution.
      * @class
      */
     THREE.LoaderSupport.WorkerSupport = (function () {
 
         let WORKER_SUPPORT_VERSION = '2.2.0';
 
         let Validator = THREE.LoaderSupport.Validator;
 
         let LoaderWorker = (function () {
 
             function LoaderWorker() {
                 this._reset();
             }
 
             LoaderWorker.prototype._reset = function () {
                 this.logging = {
                     enabled: true,
                     debug: false
                 };
                 this.worker = null;
                 this.runnerImplName = null;
                 this.callbacks = {
                     meshBuilder: null,
                     onLoad: null
                 };
                 this.terminateRequested = false;
                 this.queuedMessage = null;
                 this.started = false;
                 this.forceCopy = false;
             };
 
             LoaderWorker.prototype.setLogging = function ( enabled, debug ) {
                 this.logging.enabled = enabled === true;
                 this.logging.debug = debug === true;
             };
 
             LoaderWorker.prototype.setForceCopy = function ( forceCopy ) {
                 this.forceCopy = forceCopy === true;
             };
 
             LoaderWorker.prototype.initWorker = function ( code, runnerImplName ) {
                 this.runnerImplName = runnerImplName;
                 let blob = new Blob( [ code ], { type: 'application/javascript' } );
                 this.worker = new Worker( window.URL.createObjectURL( blob ) );
                 this.worker.onmessage = this._receiveWorkerMessage;
 
                 // set referemce to this, then processing in worker scope within "_receiveWorkerMessage" can access members
                 this.worker.runtimeRef = this;
 
                 // process stored queuedMessage
                 this._postMessage();
             };
 
             /**
              * Executed in worker scope
              */
             LoaderWorker.prototype._receiveWorkerMessage = function ( e ) {
                 let payload = e.data;
                 switch ( payload.cmd ) {
                     case 'meshData':
                     case 'materialData':
                     case 'imageData':
                         this.runtimeRef.callbacks.meshBuilder( payload );
                         break;
 
                     case 'complete':
                         this.runtimeRef.queuedMessage = null;
                         this.started = false;
                         this.runtimeRef.callbacks.onLoad( payload.msg );
 
                         if ( this.runtimeRef.terminateRequested ) {
 
                             this.runtimeRef._terminate();
 
                         }
                         break;
 
                     case 'error':
                         console.error( 'WorkerSupport [' + this.runtimeRef.runnerImplName + ']: Reported error: ' + payload.msg );
                         this.runtimeRef.queuedMessage = null;
                         this.started = false;
                         this.runtimeRef.callbacks.onLoad( payload.msg );
 
                         if ( this.runtimeRef.terminateRequested ) {
 
                             this.runtimeRef._terminate();
 
                         }
                         break;
 
                     default:
                         console.error( 'WorkerSupport [' + this.runtimeRef.runnerImplName + ']: Received unknown command: ' + payload.cmd );
                         break;
 
                 }
             };
 
             LoaderWorker.prototype.setCallbacks = function ( meshBuilder, onLoad ) {
                 this.callbacks.meshBuilder = Validator.verifyInput( meshBuilder, this.callbacks.meshBuilder );
                 this.callbacks.onLoad = Validator.verifyInput( onLoad, this.callbacks.onLoad );
             };
 
             LoaderWorker.prototype.run = function( payload ) {
                 if ( Validator.isValid( this.queuedMessage ) ) {
 
                     console.warn( 'Already processing message. Rejecting new run instruction' );
                     return;
 
                 } else {
 
                     this.queuedMessage = payload;
                     this.started = true;
 
                 }
                 if ( ! Validator.isValid( this.callbacks.meshBuilder ) ) throw 'Unable to run as no "MeshBuilder" callback is set.';
                 if ( ! Validator.isValid( this.callbacks.onLoad ) ) throw 'Unable to run as no "onLoad" callback is set.';
                 if ( payload.cmd !== 'run' ) payload.cmd = 'run';
                 if ( Validator.isValid( payload.logging ) ) {
 
                     payload.logging.enabled = payload.logging.enabled === true;
                     payload.logging.debug = payload.logging.debug === true;
 
                 } else {
 
                     payload.logging = {
                         enabled: true,
                         debug: false
                     }
 
                 }
                 this._postMessage();
             };
 
             LoaderWorker.prototype._postMessage = function () {
                 if ( Validator.isValid( this.queuedMessage ) && Validator.isValid( this.worker ) ) {
 
                     if ( this.queuedMessage.data.input instanceof ArrayBuffer ) {
 
                         let content;
                         if ( this.forceCopy ) {
 
                             content = this.queuedMessage.data.input.slice( 0 );
 
                         } else {
 
                             content = this.queuedMessage.data.input;
 
                         }
                         this.worker.postMessage( this.queuedMessage, [ content ] );
 
                     } else {
 
                         this.worker.postMessage( this.queuedMessage );
 
                     }
 
                 }
             };
 
             LoaderWorker.prototype.setTerminateRequested = function ( terminateRequested ) {
                 this.terminateRequested = terminateRequested === true;
                 if ( this.terminateRequested && Validator.isValid( this.worker ) && ! Validator.isValid( this.queuedMessage ) && this.started ) {
 
                     this._terminate();
 
                 }
             };
 
             LoaderWorker.prototype._terminate = function () {
                 this.worker.terminate();
                 this._reset();
             };
 
             return LoaderWorker;
 
         })();
 
         function WorkerSupport() {
             this.logging = {
                 enabled: true,
                 debug: false
             };
 
             // check worker support first
             if ( window.Worker === undefined ) throw "This browser does not support web workers!";
             if ( window.Blob === undefined  ) throw "This browser does not support Blob!";
             if ( typeof window.URL.createObjectURL !== 'function'  ) throw "This browser does not support Object creation from URL!";
 
             this.loaderWorker = new LoaderWorker();
         }
 
         /**
          * Enable or disable logging in general (except warn and error), plus enable or disable debug logging.
          * @memberOf THREE.LoaderSupport.WorkerSupport
          *
          * @param {boolean} enabled True or false.
          * @param {boolean} debug True or false.
          */
         WorkerSupport.prototype.setLogging = function ( enabled, debug ) {
             this.logging.enabled = enabled === true;
             this.logging.debug = debug === true;
             this.loaderWorker.setLogging( this.logging.enabled, this.logging.debug );
         };
 
         /**
          * Forces all ArrayBuffers to be transferred to worker to be copied.
          * @memberOf THREE.LoaderSupport.WorkerSupport
          *
          * @param {boolean} forceWorkerDataCopy True or false.
          */
         WorkerSupport.prototype.setForceWorkerDataCopy = function ( forceWorkerDataCopy ) {
             this.loaderWorker.setForceCopy( forceWorkerDataCopy );
         };
 
         /**
          * Validate the status of worker code and the derived worker.
          * @memberOf THREE.LoaderSupport.WorkerSupport
          *
          * @param {Function} functionCodeBuilder Function that is invoked with funcBuildObject and funcBuildSingleton that allows stringification of objects and singletons.
          * @param {String} parserName Name of the Parser object
          * @param {String[]} libLocations URL of libraries that shall be added to worker code relative to libPath
          * @param {String} libPath Base path used for loading libraries
          * @param {THREE.LoaderSupport.WorkerRunnerRefImpl} runnerImpl The default worker parser wrapper implementation (communication and execution). An extended class could be passed here.
          */
         WorkerSupport.prototype.validate = function ( functionCodeBuilder, parserName, libLocations, libPath, runnerImpl ) {
             if ( Validator.isValid( this.loaderWorker.worker ) ) return;
 
             if ( this.logging.enabled ) {
 
                 console.time( 'buildWebWorkerCode' );
 
             }
             if ( Validator.isValid( runnerImpl ) ) {
 
 
             } else {
 
                 runnerImpl = THREE.LoaderSupport.WorkerRunnerRefImpl;
 
             }
 
             let userWorkerCode = functionCodeBuilder( buildObject, buildSingleton );
             userWorkerCode += 'let Parser = '+ parserName +  ';\n\n';
             userWorkerCode += buildSingleton( runnerImpl.name, runnerImpl );
             userWorkerCode += 'new ' + runnerImpl.name + '();\n\n';
 
             let scope = this;
             if ( Validator.isValid( libLocations ) && libLocations.length > 0 ) {
 
                 let libsContent = '';
                 let loadAllLibraries = function ( path, locations ) {
                     if ( locations.length === 0 ) {
 
                         scope.loaderWorker.initWorker( libsContent + userWorkerCode, runnerImpl.name );
                         if ( scope.logging.enabled ) console.timeEnd( 'buildWebWorkerCode' );
 
                     } else {
 
                         let loadedLib = function ( contentAsString ) {
                             libsContent += contentAsString;
                             loadAllLibraries( path, locations );
                         };
 
                         let fileLoader = new THREE.FileLoader();
                         fileLoader.setPath( path );
                         fileLoader.setResponseType( 'text' );
                         fileLoader.load( locations[ 0 ], loadedLib );
                         locations.shift();
 
                     }
                 };
                 loadAllLibraries( libPath, libLocations );
 
             } else {
 
                 this.loaderWorker.initWorker( userWorkerCode, runnerImpl.name );
                 if ( this.logging.enabled ) console.timeEnd( 'buildWebWorkerCode' );
 
             }
         };
 
         /**
          * Specify functions that should be build when new raw mesh data becomes available and when the parser is finished.
          * @memberOf THREE.LoaderSupport.WorkerSupport
          *
          * @param {Function} meshBuilder The mesh builder function. Default is {@link THREE.LoaderSupport.MeshBuilder}.
          * @param {Function} onLoad The function that is called when parsing is complete.
          */
         WorkerSupport.prototype.setCallbacks = function ( meshBuilder, onLoad ) {
             this.loaderWorker.setCallbacks( meshBuilder, onLoad );
         };
 
         /**
          * Runs the parser with the provided configuration.
          * @memberOf THREE.LoaderSupport.WorkerSupport
          *
          * @param {Object} payload Raw mesh description (buffers, params, materials) used to build one to many meshes.
          */
         WorkerSupport.prototype.run = function ( payload ) {
             this.loaderWorker.run( payload );
         };
 
         /**
          * Request termination of worker once parser is finished.
          * @memberOf THREE.LoaderSupport.WorkerSupport
          *
          * @param {boolean} terminateRequested True or false.
          */
         WorkerSupport.prototype.setTerminateRequested = function ( terminateRequested ) {
             this.loaderWorker.setTerminateRequested( terminateRequested );
         };
 
         let buildObject = function ( fullName, object ) {
             let objectString = fullName + ' = {\n';
             let part;
             for ( let name in object ) {
 
                 part = object[ name ];
                 if ( typeof( part ) === 'string' || part instanceof String ) {
 
                     part = part.replace( '\n', '\\n' );
                     part = part.replace( '\r', '\\r' );
                     objectString += '\t' + name + ': "' + part + '",\n';
 
                 } else if ( part instanceof Array ) {
 
                     objectString += '\t' + name + ': [' + part + '],\n';
 
                 } else if ( Number.isInteger( part ) ) {
 
                     objectString += '\t' + name + ': ' + part + ',\n';
 
                 } else if ( typeof part === 'function' ) {
 
                     objectString += '\t' + name + ': ' + part + ',\n';
 
                 }
 
             }
             objectString += '}\n\n';
 
             return objectString;
         };
 
         let buildSingleton = function ( fullName, object, internalName, basePrototypeName, ignoreFunctions ) {
             let objectString = '';
             let objectName = ( Validator.isValid( internalName ) ) ? internalName : object.name;
 
             let funcString, objectPart, constructorString;
             ignoreFunctions = Validator.verifyInput( ignoreFunctions, [] );
             for ( let name in object.prototype ) {
 
                 objectPart = object.prototype[ name ];
                 if ( name === 'constructor' ) {
 
                     funcString = objectPart.toString();
                     funcString = funcString.replace( 'function', '' );
                     constructorString = '\tfunction ' + objectName + funcString + ';\n\n';
 
                 } else if ( typeof objectPart === 'function' ) {
 
                     if ( ignoreFunctions.indexOf( name ) < 0 ) {
 
                         funcString = objectPart.toString();
                         objectString += '\t' + objectName + '.prototype.' + name + ' = ' + funcString + ';\n\n';
 
                     }
 
                 }
 
             }
             objectString += '\treturn ' + objectName + ';\n';
             objectString += '})();\n\n';
 
             let inheritanceBlock = '';
             if ( Validator.isValid( basePrototypeName ) ) {
 
                 inheritanceBlock += '\n';
                 inheritanceBlock += objectName + '.prototype = Object.create( ' + basePrototypeName + '.prototype );\n';
                 inheritanceBlock += objectName + '.constructor = ' + objectName + ';\n';
                 inheritanceBlock += '\n';
             }
             if ( ! Validator.isValid( constructorString ) ) {
 
                 constructorString = fullName + ' = (function () {\n\n';
                 constructorString += inheritanceBlock + '\t' + object.prototype.constructor.toString() + '\n\n';
                 objectString = constructorString + objectString;
 
             } else {
 
                 objectString = fullName + ' = (function () {\n\n' + inheritanceBlock + constructorString + objectString;
 
             }
 
             return objectString;
         };
 
         return WorkerSupport;
 
     })();
 
     /**
      * Orchestrate loading of multiple OBJ files/data from an instruction queue with a configurable amount of workers (1-16).
      * Workflow:
      *   prepareWorkers
      *   enqueueForRun
      *   processQueue
      *   tearDown (to force stop)
      *
      * @class
      *
      * @param {string} classDef Class definition to be used for construction
      */
     THREE.LoaderSupport.WorkerDirector = (function () {
 
         let LOADER_WORKER_DIRECTOR_VERSION = '2.2.1';
 
         let Validator = THREE.LoaderSupport.Validator;
 
         let MAX_WEB_WORKER = 16;
         let MAX_QUEUE_SIZE = 8192;
 
         function WorkerDirector( classDef ) {
             this.logging = {
                 enabled: true,
                 debug: false
             };
 
             this.maxQueueSize = MAX_QUEUE_SIZE ;
             this.maxWebWorkers = MAX_WEB_WORKER;
             this.crossOrigin = null;
 
             if ( ! Validator.isValid( classDef ) ) throw 'Provided invalid classDef: ' + classDef;
 
             this.workerDescription = {
                 classDef: classDef,
                 globalCallbacks: {},
                 workerSupports: {},
                 forceWorkerDataCopy: true
             };
             this.objectsCompleted = 0;
             this.instructionQueue = [];
             this.instructionQueuePointer = 0;
 
             this.callbackOnFinishedProcessing = null;
         }
 
         /**
          * Enable or disable logging in general (except warn and error), plus enable or disable debug logging.
          * @memberOf THREE.LoaderSupport.WorkerDirector
          *
          * @param {boolean} enabled True or false.
          * @param {boolean} debug True or false.
          */
         WorkerDirector.prototype.setLogging = function ( enabled, debug ) {
             this.logging.enabled = enabled === true;
             this.logging.debug = debug === true;
         };
 
         /**
          * Returns the maximum length of the instruction queue.
          * @memberOf THREE.LoaderSupport.WorkerDirector
          *
          * @returns {number}
          */
         WorkerDirector.prototype.getMaxQueueSize = function () {
             return this.maxQueueSize;
         };
 
         /**
          * Returns the maximum number of workers.
          * @memberOf THREE.LoaderSupport.WorkerDirector
          *
          * @returns {number}
          */
         WorkerDirector.prototype.getMaxWebWorkers = function () {
             return this.maxWebWorkers;
         };
 
         /**
          * Sets the CORS string to be used.
          * @memberOf THREE.LoaderSupport.WorkerDirector
          *
          * @param {string} crossOrigin CORS value
          */
         WorkerDirector.prototype.setCrossOrigin = function ( crossOrigin ) {
             this.crossOrigin = crossOrigin;
         };
 
         /**
          * Forces all ArrayBuffers to be transferred to worker to be copied.
          * @memberOf THREE.LoaderSupport.WorkerDirector
          *
          * @param {boolean} forceWorkerDataCopy True or false.
          */
         WorkerDirector.prototype.setForceWorkerDataCopy = function ( forceWorkerDataCopy ) {
             this.workerDescription.forceWorkerDataCopy = forceWorkerDataCopy === true;
         };
 
         /**
          * Create or destroy workers according limits. Set the name and register callbacks for dynamically created web workers.
          * @memberOf THREE.LoaderSupport.WorkerDirector
          *
          * @param {THREE.OBJLoader2.WWOBJLoader2.PrepDataCallbacks} globalCallbacks  Register global callbacks used by all web workers
          * @param {number} maxQueueSize Set the maximum size of the instruction queue (1-1024)
          * @param {number} maxWebWorkers Set the maximum amount of workers (1-16)
          */
         WorkerDirector.prototype.prepareWorkers = function ( globalCallbacks, maxQueueSize, maxWebWorkers ) {
             if ( Validator.isValid( globalCallbacks ) ) this.workerDescription.globalCallbacks = globalCallbacks;
             this.maxQueueSize = Math.min( maxQueueSize, MAX_QUEUE_SIZE );
             this.maxWebWorkers = Math.min( maxWebWorkers, MAX_WEB_WORKER );
             this.maxWebWorkers = Math.min( this.maxWebWorkers, this.maxQueueSize );
             this.objectsCompleted = 0;
             this.instructionQueue = [];
             this.instructionQueuePointer = 0;
 
             for ( let instanceNo = 0; instanceNo < this.maxWebWorkers; instanceNo++ ) {
 
                 let workerSupport = new THREE.LoaderSupport.WorkerSupport();
                 workerSupport.setLogging( this.logging.enabled, this.logging.debug );
                 workerSupport.setForceWorkerDataCopy( this.workerDescription.forceWorkerDataCopy );
                 this.workerDescription.workerSupports[ instanceNo ] = {
                     instanceNo: instanceNo,
                     inUse: false,
                     terminateRequested: false,
                     workerSupport: workerSupport,
                     loader: null
                 };
 
             }
         };
 
         /**
          * Store run instructions in internal instructionQueue.
          * @memberOf THREE.LoaderSupport.WorkerDirector
          *
          * @param {THREE.LoaderSupport.PrepData} prepData
          */
         WorkerDirector.prototype.enqueueForRun = function ( prepData ) {
             if ( this.instructionQueue.length < this.maxQueueSize ) {
                 this.instructionQueue.push( prepData );
             }
         };
 
         /**
          * Returns if any workers are running.
          *
          * @memberOf THREE.LoaderSupport.WorkerDirector
          * @returns {boolean}
          */
         WorkerDirector.prototype.isRunning = function () {
             let wsKeys = Object.keys( this.workerDescription.workerSupports );
             return ( ( this.instructionQueue.length > 0 && this.instructionQueuePointer < this.instructionQueue.length ) || wsKeys.length > 0 );
         };
 
         /**
          * Process the instructionQueue until it is depleted.
          * @memberOf THREE.LoaderSupport.WorkerDirector
          */
         WorkerDirector.prototype.processQueue = function () {
             let prepData, supportDesc;
             for ( let instanceNo in this.workerDescription.workerSupports ) {
 
                 supportDesc = this.workerDescription.workerSupports[ instanceNo ];
                 if ( ! supportDesc.inUse ) {
 
                     if ( this.instructionQueuePointer < this.instructionQueue.length ) {
 
                         prepData = this.instructionQueue[ this.instructionQueuePointer ];
                         this._kickWorkerRun( prepData, supportDesc );
                         this.instructionQueuePointer++;
 
                     } else {
 
                         this._deregister( supportDesc );
 
                     }
 
                 }
 
             }
 
             if ( ! this.isRunning() && this.callbackOnFinishedProcessing !== null ) {
 
                 this.callbackOnFinishedProcessing();
                 this.callbackOnFinishedProcessing = null;
 
             }
         };
 
         WorkerDirector.prototype._kickWorkerRun = function( prepData, supportDesc ) {
             supportDesc.inUse = true;
             supportDesc.workerSupport.setTerminateRequested( supportDesc.terminateRequested );
 
 
             let scope = this;
             let prepDataCallbacks = prepData.getCallbacks();
             let globalCallbacks = this.workerDescription.globalCallbacks;
             let wrapperOnLoad = function ( event ) {
                 if ( Validator.isValid( globalCallbacks.onLoad ) ) globalCallbacks.onLoad( event );
                 if ( Validator.isValid( prepDataCallbacks.onLoad ) ) prepDataCallbacks.onLoad( event );
                 scope.objectsCompleted++;
                 supportDesc.inUse = false;
 
                 scope.processQueue();
             };
 
             let wrapperOnProgress = function ( event ) {
                 if ( Validator.isValid( globalCallbacks.onProgress ) ) globalCallbacks.onProgress( event );
                 if ( Validator.isValid( prepDataCallbacks.onProgress ) ) prepDataCallbacks.onProgress( event );
             };
 
             let wrapperOnMeshAlter = function ( event, override ) {
                 if ( Validator.isValid( globalCallbacks.onMeshAlter ) ) override = globalCallbacks.onMeshAlter( event, override );
                 if ( Validator.isValid( prepDataCallbacks.onMeshAlter ) ) override = globalCallbacks.onMeshAlter( event, override );
                 return override;
             };
 
             let wrapperOnLoadMaterials = function ( materials ) {
                 if ( Validator.isValid( globalCallbacks.onLoadMaterials ) ) materials = globalCallbacks.onLoadMaterials( materials );
                 if ( Validator.isValid( prepDataCallbacks.onLoadMaterials ) ) materials = prepDataCallbacks.onLoadMaterials( materials );
                 return materials;
             };
 
             supportDesc.loader = this._buildLoader( supportDesc.instanceNo );
 
             let updatedCallbacks = new THREE.LoaderSupport.Callbacks();
             updatedCallbacks.setCallbackOnLoad( wrapperOnLoad );
             updatedCallbacks.setCallbackOnProgress( wrapperOnProgress );
             updatedCallbacks.setCallbackOnMeshAlter( wrapperOnMeshAlter );
             updatedCallbacks.setCallbackOnLoadMaterials( wrapperOnLoadMaterials );
             prepData.callbacks = updatedCallbacks;
 
             supportDesc.loader.run( prepData, supportDesc.workerSupport );
         };
 
         WorkerDirector.prototype._buildLoader = function ( instanceNo ) {
             let classDef = this.workerDescription.classDef;
             let loader = Object.create( classDef.prototype );
             classDef.call( loader, THREE.DefaultLoadingManager );
 
             // verify that all required functions are implemented
             if ( ! loader.hasOwnProperty( 'instanceNo' ) ) throw classDef.name + ' has no property "instanceNo".';
             loader.instanceNo = instanceNo;
 
             if ( ! loader.hasOwnProperty( 'workerSupport' ) ) {
 
                 throw classDef.name + ' has no property "workerSupport".';
 
             }
             if ( typeof loader.run !== 'function'  ) throw classDef.name + ' has no function "run".';
             if ( ! loader.hasOwnProperty( 'callbacks' ) || ! Validator.isValid( loader.callbacks ) ) {
 
                 console.warn( classDef.name + ' has an invalid property "callbacks". Will change to "THREE.LoaderSupport.Callbacks"' );
                 loader.callbacks = new THREE.LoaderSupport.Callbacks();
 
             }
 
             return loader;
         };
 
         WorkerDirector.prototype._deregister = function ( supportDesc ) {
             if ( Validator.isValid( supportDesc ) ) {
 
                 supportDesc.workerSupport.setTerminateRequested( true );
 
                 let loaderCallbacks = supportDesc.loader.callbacks;
                 if ( Validator.isValid( loaderCallbacks.onProgress ) ) loaderCallbacks.onProgress( { detail: { text: '' } } );
                 delete this.workerDescription.workerSupports[ supportDesc.instanceNo ];
 
             }
         };
 
         /**
          * Terminate all workers.
          * @memberOf THREE.LoaderSupport.WorkerDirector
          *
          * @param {callback} callbackOnFinishedProcessing Function called once all workers finished processing.
          */
         WorkerDirector.prototype.tearDown = function ( callbackOnFinishedProcessing ) {
 
             this.instructionQueuePointer = this.instructionQueue.length;
             this.callbackOnFinishedProcessing = Validator.verifyInput( callbackOnFinishedProcessing, null );
 
             for ( let name in this.workerDescription.workerSupports ) {
 
                 this.workerDescription.workerSupports[ name ].terminateRequested = true;
 
             }
         };
 
         return WorkerDirector;
 
     })();
 }